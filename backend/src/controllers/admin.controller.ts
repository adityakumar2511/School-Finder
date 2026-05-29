import { Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
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
import { adminSchoolListSelect } from "../lib/queries/schools";

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
    throw new AppError(400, "School name is required");
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

  res.json({
    stats: {
      totalSchools,
      pendingSchools,
      approvedSchools,
      rejectedSchools,
      totalInquiries,
      totalUsers,
    },
  });
};

// GET /api/admin/schools
export const getAdminSchools = async (req: AuthRequest, res: Response) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit, DEFAULT_ADMIN_PAGE_LIMIT);
  const skip = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = {};

  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    where.status = status;
  }

  const term = search?.trim();
  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { owner: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

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

  res.json({ message: "School rejected successfully", school });
};

// POST /api/admin/approve (legacy)
export const approveSchool = async (req: AuthRequest, res: Response) => {
  const { schoolId } = req.body;

  if (!schoolId) {
    throw new AppError(400, "schoolId is required");
  }

  req.params = { id: schoolId };
  return approveSchoolById(req, res);
};

// POST /api/admin/reject (legacy)
export const rejectSchool = async (req: AuthRequest, res: Response) => {
  const { schoolId, reason } = req.body;

  if (!schoolId) {
    throw new AppError(400, "schoolId is required");
  }

  req.params = { id: schoolId };
  req.body = { reason };
  return rejectSchoolById(req, res);
};

// GET /api/admin/users
export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit, DEFAULT_ADMIN_PAGE_LIMIT);
  const skip = (page - 1) * limit;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = {};
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

  const where: Record<string, unknown> = {};

  if (status && ["NEW", "CONTACTED", "CLOSED"].includes(status)) {
    where.status = status;
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
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const targetId = String(req.params.id).trim();
  const { role } = req.body as { role?: string };

  if (!role || !VALID_ROLES.includes(role as RoleValue)) {
    throw new AppError(400, "Invalid role");
  }

  if (targetId === req.user!.id && role !== "ADMIN") {
    throw new AppError(403, "You cannot demote your own admin account");
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });

  if (!target) {
    throw new AppError(404, "User not found");
  }

  if (target.id === req.user!.id && target.role === "ADMIN" && role !== "ADMIN") {
    throw new AppError(403, "You cannot demote your own admin account");
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

  if (target.role === "ADMIN" && role !== "ADMIN" && adminCount <= 1) {
    throw new AppError(403, "Cannot remove the last administrator");
  }

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

  res.json({
    message: "User role updated",
    user: {
      ...updated,
      accountStatus: isAccountDisabled(updated.phone) ? "disabled" : "active",
    },
  });
};

// PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  const targetId = String(req.params.id).trim();
  const { status } = req.body as { status?: string };

  if (!status || !["active", "disabled"].includes(status)) {
    throw new AppError(400, "Invalid status. Use active or disabled.");
  }

  if (targetId === req.user!.id) {
    throw new AppError(403, "You cannot change your own account status");
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });

  if (!target) {
    throw new AppError(404, "User not found");
  }

  if (target.role === "ADMIN" && status === "disabled") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", phone: { not: ACCOUNT_DISABLED_PHONE } },
    });

    if (adminCount <= 1) {
      throw new AppError(403, "Cannot disable the last active administrator");
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

  res.json({
    message: status === "disabled" ? "Account disabled" : "Account enabled",
    user: {
      ...updated,
      accountStatus: status,
    },
  });
};

// POST /api/admin/add-school
export const addSchoolDirect = async (req: AuthRequest, res: Response) => {
  const {
    ownerEmail,
    ownerName,
    name,
    city,
    state,
    address,
    pincode,
    board,
    schoolType,
    medium,
    classesFrom,
    classesTo,
    phone,
    email,
    website,
    logoUrl,
    admissionFee,
    tuitionFeeMonthly,
    totalAnnualFee,
    transportFee,
    hostelFee,
    description,
    totalStudents,
    establishedYear,
  } = req.body;

  if (!ownerEmail || !name) {
    throw new AppError(400, "ownerEmail and school name are required");
  }

  let owner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (!owner) {
    const tempPassword = await bcrypt.hash(
      Math.random().toString(36).slice(-8),
      parseInt(process.env.BCRYPT_ROUNDS || "12", 10)
    );

    owner = await prisma.user.create({
      data: {
        name: ownerName || ownerEmail.split("@")[0],
        email: ownerEmail,
        password: tempPassword,
        role: "SCHOOL_ADMIN",
      },
    });
  }

  const slug = await generateSlug(name);

  const school = await prisma.school.create({
    data: {
      name,
      slug,
      description,
      address,
      city,
      state,
      pincode,
      board,
      schoolType,
      medium,
      classesFrom: parseInt(classesFrom, 10),
      classesTo: parseInt(classesTo, 10),
      phone,
      email,
      website,
      logoUrl,
      admissionFee: admissionFee ? parseFloat(admissionFee) : null,
      tuitionFeeMonthly: tuitionFeeMonthly ? parseFloat(tuitionFeeMonthly) : null,
      totalAnnualFee: totalAnnualFee ? parseFloat(totalAnnualFee) : null,
      transportFee: transportFee ? parseFloat(transportFee) : null,
      hostelFee: hostelFee ? parseFloat(hostelFee) : null,
      totalStudents: totalStudents ? parseInt(totalStudents, 10) : null,
      establishedYear: establishedYear ? parseInt(establishedYear, 10) : null,
      status: "APPROVED",
      ownerId: owner.id,
    },
  });

  res.status(201).json({
    message: "School added successfully",
    school,
  });
};
