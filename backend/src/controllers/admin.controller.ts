import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { Errors, AppError } from "../utils/AppError";
import { writeAuditLog } from "../lib/auditLog";
import {
  ACCOUNT_DISABLED_PHONE,
  isAccountDisabled,
} from "../lib/account-status";
import {
  buildPaginationMeta,
  DEFAULT_ADMIN_PAGE_LIMIT,
  paginatedResponse,
  parseLimit,
  parsePage,
} from "../lib/pagination";
import {
  buildCacheKey,
  CACHE_TTL,
  invalidateSchoolCache,
  withCache,
} from "../lib/cache";
import { adminSchoolListSelect, buildAdminSchoolWhere, schoolDetailSelect  } from "../lib/queries/schools";
import type { AddAdminInput } from "../validators/auth.validator";

// ── Audit log helper ───────────────────────────────────────────────────────────
// Add this after imports, before any exported function
// async function writeAuditLog(params: {
//   actorId: string;
//   actorEmail: string;
//   action: string;
//   targetType: string;
//   targetId: string;
//   metadata?: Record<string, unknown>;
// }) {
//   try {
//     await prisma.adminAuditLog.create({
//       data: {
//         actorId: params.actorId,
//         actorEmail: params.actorEmail,
//         action: params.action,
//         targetType: params.targetType,
//         targetId: params.targetId,
//         metadata: params.metadata ? JSON.stringify(params.metadata) : null,
//       },
//     });
//   } catch (err) {
//     // Audit log failure should never crash the main operation
//     console.error("[AuditLog] Failed to write audit log:", err);
//   }
// }

const VALID_ROLES = ["PARENT", "SCHOOL_ADMIN", "ADMIN"] as const;
type RoleValue = (typeof VALID_ROLES)[number];

const generateSlug = async (name: string): Promise<string> => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  if (!base) {
    throw Errors.BadRequest("School name is required");
  }

  let slug = base;
  let count = 1;

  while (await prisma.school.findUnique({ where: { slug } })) {
    slug = `${base}-${count}`;
    count++;
  }

  return slug;
};

// GET /api/admin/stats
export const getStats = async (_req: AuthRequest, res: Response) => {
  const cacheKey = buildCacheKey("admin:stats", {});

  const stats = await withCache(cacheKey, CACHE_TTL.ADMIN_STATS, async () => {
    const [
      totalSchools,
      pendingSchools,
      approvedSchools,
      rejectedSchools,
      totalInquiries,
      totalUsers,
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { status: "PENDING" } }),
      prisma.school.count({ where: { status: "APPROVED" } }),
      prisma.school.count({ where: { status: "REJECTED" } }),
      prisma.inquiry.count(),
      prisma.user.count(),
    ]);

    return {
      totalSchools,
      pendingSchools,
      approvedSchools,
      rejectedSchools,
      totalInquiries,
      totalUsers,
    };
  });

  res.json({ stats });
};

// GET /api/admin/schools
export const getAdminSchools = async (req: AuthRequest, res: Response) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit, DEFAULT_ADMIN_PAGE_LIMIT);
  const skip = (page - 1) * limit;

  const where = buildAdminSchoolWhere({
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
    state: req.query.state as string | undefined,
    city: req.query.city as string | undefined,
  });

  const [rows, total] = await Promise.all([
    prisma.school.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: adminSchoolListSelect,
    }),
    prisma.school.count({ where }),
  ]);

  const pagination = buildPaginationMeta(total, page, limit);
  res.json(paginatedResponse(rows, pagination, "schools"));
};

// GET /api/admin/schools/states
export const getAdminStates = async (_req: AuthRequest, res: Response) => {
  const cacheKey = buildCacheKey("admin:schools:states", {});

  const states = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, () =>
    prisma.school.findMany({
      where: { state: { not: "" } },
      select: { state: true },
      distinct: ["state"],
      orderBy: { state: "asc" },
    })
  );

  res.json({ data: states.map((s) => s.state).filter(Boolean) });
};

// GET /api/admin/schools/cities?state=xxx
export const getAdminCities = async (req: AuthRequest, res: Response) => {
  const state = (req.query.state as string | undefined)?.trim();

  const cacheKey = buildCacheKey("admin:schools:cities", { state: state || "" });

  const cities = await withCache(cacheKey, CACHE_TTL.SCHOOL_LIST, () =>
    prisma.school.findMany({
      where: {
        city: { not: "" },
        ...(state ? { state: { equals: state, mode: "insensitive" } } : {}),
      },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    })
  );

  res.json({ data: cities.map((c) => c.city).filter(Boolean) });
};

// PATCH /api/admin/schools/:id/approve
export const approveSchoolById = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();

  const school = await prisma.school.update({
    where: { id },
    data: {
      status: "APPROVED",
      rejectionReason: null,
    },
  });

  invalidateSchoolCache();

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "SCHOOL_APPROVE",
    targetType: "SCHOOL",
    targetId: id,
    metadata: { schoolName: school.name },
  });

  res.json({ message: "School approved successfully", school });
};

// PATCH /api/admin/schools/:id/reject
export const rejectSchoolById = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  const { reason } = req.body;

  const school = await prisma.school.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason:
        typeof reason === "string" && reason.trim()
          ? reason.trim()
          : "Rejected by administrator",
    },
  });

  invalidateSchoolCache();

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "SCHOOL_REJECT",
    targetType: "SCHOOL",
    targetId: id,
    metadata: { reason: school.rejectionReason, schoolName: school.name },
  });

  res.json({ message: "School rejected successfully", school });
};

// GET /api/admin/users
export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit, DEFAULT_ADMIN_PAGE_LIMIT);
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;

  const where: Record<string, unknown> = {};

  if (role && VALID_ROLES.includes(role as RoleValue)) {
    where.role = role;
  }

  const term = search?.trim();
  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        adminAccessLevel: true,
        isSuperAdmin: true,  // ← yeh add karo
      },
    }),
    prisma.user.count({ where }),
  ]);

  const data = rows.map((user) => ({
    ...user,
    accountStatus: isAccountDisabled(user.phone) ? "disabled" : "active",
  }));

  const pagination = buildPaginationMeta(total, page, limit);
  res.json(paginatedResponse(data, pagination, "users"));
};

// GET /api/admin/inquiries
export const getAdminInquiries = async (req: AuthRequest, res: Response) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit, DEFAULT_ADMIN_PAGE_LIMIT);
  const skip = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const schoolId = (req.query.schoolId as string | undefined)?.trim();

  const where: Record<string, unknown> = {};

  if (status && ["NEW", "CONTACTED", "CLOSED"].includes(status)) {
    where.status = status;
  }

  if (schoolId) {
    where.schoolId = schoolId;
  }

  const term = search?.trim();
  if (term) {
    where.OR = [
      { message: { contains: term, mode: "insensitive" } },
      { school: { name: { contains: term, mode: "insensitive" } } },
      { parent: { name: { contains: term, mode: "insensitive" } } },
      { parent: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        message: true,
        status: true,
        createdAt: true,
        school: { select: { id: true, name: true } },
        parent: { select: { name: true, email: true } },
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  const pagination = buildPaginationMeta(total, page, limit);
  res.json(paginatedResponse(rows, pagination, "inquiries"));
};

// PATCH /api/admin/users/:id/role
// PATCH /api/admin/users/:id/role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const targetId = String(req.params.id).trim();
  const { role } = req.body as { role?: string };

  if (!role || !VALID_ROLES.includes(role as RoleValue)) {
    throw Errors.BadRequest("Invalid role");
  }

  if (targetId === req.user!.id && role !== "ADMIN") {
    throw Errors.Forbidden("You cannot demote your own admin account");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, email: true, isSuperAdmin: true },
  });

  if (!target) {
    throw Errors.NotFound("User");
  }

  // §0 — super admin immune (middleware also blocks, this is defense in depth)
  if (target.isSuperAdmin) {
    throw Errors.Forbidden("Super admin role cannot be changed");
  }

  if (target.role === "SCHOOL_ADMIN" && role === "PARENT") {
    throw Errors.BadRequest("SCHOOL_ADMIN accounts cannot be converted to PARENT");
  }

  if (target.role === "PARENT" && role === "SCHOOL_ADMIN") {
    throw Errors.BadRequest("PARENT accounts cannot be converted to SCHOOL_ADMIN");
  }

  if (target.role !== "ADMIN" && role === "ADMIN") {
    throw Errors.BadRequest("Use the Add Admin flow to grant administrator access");
  }

  if (target.id === req.user!.id && target.role === "ADMIN" && role !== "ADMIN") {
    throw Errors.Forbidden("You cannot demote your own admin account");
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (target.role === "ADMIN" && role !== "ADMIN" && adminCount <= 1) {
    throw Errors.Forbidden("Cannot remove the last administrator");
  }

  const previousRole = target.role;

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: role as RoleValue },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "ROLE_CHANGE",
    targetType: "USER",
    targetId: targetId,
    metadata: { from: previousRole, to: role, targetEmail: target.email },
  });

  res.json({
    message: "User role updated",
    user: {
      ...updated,
      accountStatus: isAccountDisabled(updated.phone) ? "disabled" : "active",
    },
  });
};

// PATCH /api/admin/users/:id/status
// PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  const targetId = String(req.params.id).trim();
  const { status } = req.body as { status?: string };

  if (!status || !["active", "disabled"].includes(status)) {
    throw Errors.BadRequest("Invalid status. Use active or disabled.");
  }

  if (targetId === req.user!.id) {
    throw Errors.Forbidden("You cannot change your own account status");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, email: true, isSuperAdmin: true, phone: true },
  });

  if (!target) {
    throw Errors.NotFound("User");
  }

  // §0 — super admin immune (middleware also blocks, this is defense in depth)
  if (target.isSuperAdmin) {
    throw Errors.Forbidden("Super admin account status cannot be changed");
  }

  if (target.role === "ADMIN" && status === "disabled") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", phone: { not: ACCOUNT_DISABLED_PHONE } },
    });
    if (adminCount <= 1) {
      throw Errors.Forbidden("Cannot disable the last active administrator");
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: {
      phone: status === "disabled" ? ACCOUNT_DISABLED_PHONE : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  });

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "STATUS_CHANGE",
    targetType: "USER",
    targetId: targetId,
    metadata: { status, targetEmail: target.email },
  });

  res.json({
    message: status === "disabled" ? "Account disabled" : "Account enabled",
    user: {
      ...updated,
      accountStatus: status,
    },
  });
};

// DELETE /api/admin/users/:id  — §2
// PARENT: delete user (Inquiry + Favourite cascade via schema)
// SCHOOL_ADMIN: delete owned School first (all school cascades), then User
// ADMIN: delete user (blocked if last admin or self)
// DELETE /api/admin/users/:id  — §2 + §0
export const deleteUserDirect = async (req: AuthRequest, res: Response) => {
  const targetId = String(req.params.id).trim();

  if (targetId === req.user!.id) {
    throw Errors.Forbidden("You cannot delete your own account");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      role: true,
      email: true,
      isSuperAdmin: true,
      ownedSchools: { select: { id: true }, take: 1 },
    },
  });

  if (!target) {
    throw Errors.NotFound("User");
  }

  // §0 — super admin is immune (middleware blockIfSuperAdminTarget also catches
  // this, but double-checking here as defense in depth)
  if (target.isSuperAdmin) {
    throw Errors.Forbidden("Super admin account cannot be deleted");
  }

  // Block deleting last admin
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw Errors.Forbidden("Cannot delete the last administrator");
    }
  }

  if (target.role === "SCHOOL_ADMIN" && target.ownedSchools.length > 0) {
    await prisma.$transaction([
      prisma.school.delete({ where: { id: target.ownedSchools[0].id } }),
      prisma.user.delete({ where: { id: targetId } }),
    ]);
    invalidateSchoolCache();
  } else {
    await prisma.user.delete({ where: { id: targetId } });
  }

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "USER_DELETE",
    targetType: "USER",
    targetId: targetId,
    metadata: { deletedRole: target.role, deletedEmail: target.email },
  });

  res.json({ message: "User deleted successfully", deletedId: targetId });
};

// POST /api/admin/add-school
export const addSchoolDirect = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw Errors.Unauthorized("Authentication required");
  }

  const { ownerEmail, ownerName, ownerPassword, name, phone } = req.body;

  if (!ownerEmail || !name || !phone) {
    throw Errors.BadRequest("ownerEmail, name, and phone are required");
  }

  const existingUserWithSchool = await prisma.user.findUnique({
    where: { email: ownerEmail },
    include: { ownedSchools: { select: { id: true }, take: 1 } },
  });

  if (existingUserWithSchool) {
    if (existingUserWithSchool.role === "ADMIN") {
      throw Errors.BadRequest("Cannot assign a platform admin as school owner");
    }
    if (
      existingUserWithSchool.role === "SCHOOL_ADMIN" &&
      existingUserWithSchool.ownedSchools.length > 0
    ) {
      throw Errors.Conflict("This email is already associated with a school");
    }
  }

  let owner = existingUserWithSchool;

  if (owner && owner.role === "PARENT") {
    owner = await prisma.user.update({
      where: { id: owner.id },
      data: { role: "SCHOOL_ADMIN" },
      include: { ownedSchools: { select: { id: true }, take: 1 } },
    });
  }

  if (!owner) {
    const passwordToHash =
      ownerPassword?.trim() || Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(
      passwordToHash,
      parseInt(process.env.BCRYPT_ROUNDS || "12", 10)
    );

    owner = await prisma.user.create({
      data: {
        name: ownerName || ownerEmail.split("@")[0],
        email: ownerEmail,
        password: hashedPassword,
        role: "SCHOOL_ADMIN",
        phone,
      },
      include: { ownedSchools: { select: { id: true }, take: 1 } },
    });
  }

  if (!owner) {
    throw new AppError("Failed to resolve school owner", 500, "INTERNAL_ERROR");
  }

  const slug = await generateSlug(name.trim());

  const school = await prisma.school.create({
    data: {
      name: name.trim(),
      slug,
      phone,
      address: "",
      city: "",
      state: "",
      board: "OTHER",
      schoolType: "CO_ED",
      medium: "ENGLISH",
      classesFrom: 1,
      classesTo: 12,
      description: null,
      pincode: null,
      email: null,
      website: null,
      logoUrl: null,
      admissionFee: null,
      tuitionFeeMonthly: null,
      totalAnnualFee: null,
      transportFee: null,
      hostelFee: null,
      totalStudents: null,
      establishedYear: null,
      status: "APPROVED",
      ownerId: owner.id,
    },
  });

  invalidateSchoolCache();

  res.status(201).json({
    message: "School added successfully",
    school: {
      id: school.id,
      name: school.name,
      slug: school.slug,
      status: school.status,
    },
  });
};

// GET /api/admin/check-owner?email=xxx
export const checkOwnerEmail = async (req: AuthRequest, res: Response) => {
  const email = (req.query.email as string)?.trim().toLowerCase();

  if (!email) {
    throw Errors.BadRequest("Email is required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      role: true,
      ownedSchools: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!user) {
    return res.json({ exists: false });
  }

  if (user.role !== "SCHOOL_ADMIN") {
    return res.json({
      exists: true,
      role: user.role,
      hasSchool: false,
      school: null,
    });
  }

  const school = user.ownedSchools[0] ?? null;

  return res.json({
    exists: true,
    role: user.role,
    name: user.name,
    hasSchool: school !== null,
    school,
  });
};

// GET /api/admin/schools/:id
export const getAdminSchoolById = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  if (!id) throw Errors.BadRequest("Invalid school identifier");

  const school = await prisma.school.findUnique({
    where: { id },
    select: {
      ...schoolDetailSelect,
      customFields: true,
      boardResults: { orderBy: { year: "desc" } },
      scholarships: true,
      faqs: true,
      downloads: true,
    },
  });

  if (!school) throw Errors.NotFound("School");

  res.json({ data: school });
};

// POST /api/admin/add-parent
export const addParentDirect = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw Errors.Unauthorized("Authentication required");
  }

  const { name, email, phone, password } = req.body;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw Errors.Conflict("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  );

  const parent = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "PARENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    message: "Parent account created successfully",
    user: parent,
  });
};

// POST /api/admin/add-admin
export const addAdminDirect = async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw Errors.Unauthorized("Authentication required");
  }

  const { name, email, password, adminAccessLevel } = req.body as AddAdminInput;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw Errors.Conflict("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  );

  const admin = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "ADMIN",
      adminAccessLevel,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      adminAccessLevel: true,
      createdAt: true,
    },
  });

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "ADMIN_CREATE",
    targetType: "ADMIN",
    targetId: admin.id,
    metadata: { adminAccessLevel, targetEmail: email },
  });

  res.status(201).json({
    message: "Admin account created successfully",
    user: admin,
  });
};

// PATCH /api/admin/schools/:id/visibility — §4
// Body: { isVisible?: boolean } — agar diya hai to explicit set karta hai,
// nahi diya to current value flip karta hai.
export const toggleSchoolVisibility = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  const { isVisible } = req.body as { isVisible?: boolean };

  const school = await prisma.school.findUnique({
    where: { id },
    select: { id: true, isVisible: true, name: true },
  });

  if (!school) {
    throw Errors.NotFound("School");
  }

  const nextValue =
    typeof isVisible === "boolean" ? isVisible : !school.isVisible;

  const updated = await prisma.school.update({
    where: { id },
    data: { isVisible: nextValue },
    select: { id: true, name: true, isVisible: true },
  });

  invalidateSchoolCache();

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: "SCHOOL_VISIBILITY_TOGGLE",
    targetType: "SCHOOL",
    targetId: id,
    metadata: { isVisible: updated.isVisible, schoolName: updated.name },
  });

  res.json({
    message: updated.isVisible
      ? "School listing is now visible to the public"
      : "School listing has been hidden from public view",
    school: updated,
  });
};



// POST /api/admin/approve (legacy)
export const approveSchool = async (req: AuthRequest, res: Response) => {
  const { schoolId } = req.body;

  if (!schoolId) {
    throw Errors.BadRequest("schoolId is required");
  }

  req.params = { id: schoolId };
  return approveSchoolById(req, res);
};

// POST /api/admin/reject (legacy)
export const rejectSchool = async (req: AuthRequest, res: Response) => {
  const { schoolId, reason } = req.body;

  if (!schoolId) {
    throw Errors.BadRequest("schoolId is required");
  }

  req.params = { id: schoolId };
  req.body = { reason };
  return rejectSchoolById(req, res);
};


// PATCH /api/admin/schools/:id/featured
export const setSchoolFeatured = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id).trim();
  const { featured, featuredUntil } = req.body as {
    featured: boolean;
    featuredUntil?: string;
  };

  if (typeof featured !== "boolean") {
    throw Errors.BadRequest("featured (boolean) is required");
  }

  const school = await prisma.school.findUnique({
    where: { id },
    select: { id: true, name: true, status: true },
  });

  if (!school) throw Errors.NotFound("School");

  if (featured && school.status !== "APPROVED") {
    throw Errors.BadRequest("Only APPROVED schools can be featured");
  }

  const until = featured && featuredUntil ? new Date(featuredUntil) : null;

  if (until && isNaN(until.getTime())) {
    throw Errors.BadRequest("Invalid featuredUntil date");
  }

  const updated = await prisma.school.update({
    where: { id },
    data: {
      isFeatured: featured,
      featuredUntil: until,
    },
    select: { id: true, name: true, isFeatured: true, featuredUntil: true },
  });

  invalidateSchoolCache();

  await writeAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    action: featured ? "SCHOOL_FEATURED" : "SCHOOL_UNFEATURED",
    targetType: "SCHOOL",
    targetId: id,
    metadata: { featuredUntil: until?.toISOString(), schoolName: school.name },
  });

  res.json({
    message: featured
      ? `School marked as featured until ${until?.toLocaleDateString() ?? "indefinitely"}`
      : "School removed from featured listings",
    school: updated,
  });
};