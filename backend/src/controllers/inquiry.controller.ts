import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";

const VALID_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
type InquiryStatusValue = (typeof VALID_STATUSES)[number];

async function assertSchoolInquiryAccess(
  schoolId: string,
  userId: string,
  role: string
) {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, ownerId: true },
  });

  if (!school) {
    throw new AppError(404, "School not found");
  }

  if (role === "SCHOOL_ADMIN" && school.ownerId !== userId) {
    throw new AppError(
      403,
      "You do not have permission to access inquiries for this school"
    );
  }

  return school;
}

function buildInquiryWhere(
  schoolId: string,
  status?: string,
  search?: string
) {
  const where: {
    schoolId: string;
    status?: InquiryStatusValue;
    OR?: Array<{
      parent: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      };
    }>;
  } = { schoolId };

  if (status && VALID_STATUSES.includes(status as InquiryStatusValue)) {
    where.status = status as InquiryStatusValue;
  }

  const term = search?.trim();
  if (term) {
    where.OR = [
      { parent: { name: { contains: term, mode: "insensitive" } } },
      { parent: { email: { contains: term, mode: "insensitive" } } },
    ];
  }

  return where;
}

// POST /api/inquiries
export const createInquiry = async (req: AuthRequest, res: Response) => {
  const { schoolId, message } = req.body;

  if (!schoolId || !message) {
    throw new AppError(400, "schoolId and message are required");
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school || school.status !== "APPROVED") {
    throw new AppError(404, "School not found");
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      schoolId,
      parentId: req.user!.id,
      message,
    },
  });

  res.status(201).json(inquiry);
};

// GET /api/inquiries/my
export const getMyInquiries = async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );
  const skip = (page - 1) * limit;

  const where = { parentId: req.user!.id };

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        school: {
          select: {
            name: true,
            city: true,
            logoUrl: true,
          },
        },
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  res.json({
    data: inquiries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

// GET /api/inquiries/school/:schoolId
export const getSchoolInquiries = async (req: AuthRequest, res: Response) => {
  const schoolId = String(req.params.schoolId);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );
  const skip = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  await assertSchoolInquiryAccess(schoolId, req.user!.id, req.user!.role);

  const where = buildInquiryWhere(schoolId, status, search);

  const [inquiries, total, stats] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        parent: { select: { name: true, email: true, phone: true } },
      },
    }),
    prisma.inquiry.count({ where }),
    prisma.inquiry.groupBy({
      by: ["status"],
      where: { schoolId },
      _count: { status: true },
    }),
  ]);

  const statusCounts = {
    total: stats.reduce((sum, row) => sum + row._count.status, 0),
    NEW: 0,
    CONTACTED: 0,
    CLOSED: 0,
  };

  for (const row of stats) {
    statusCounts[row.status] = row._count.status;
  }

  res.json({
    inquiries,
    stats: statusCounts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
};

// PATCH /api/inquiries/:id/status
export const updateInquiryStatus = async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(400, "Invalid status");
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { school: { select: { ownerId: true } } },
  });

  if (!inquiry) {
    throw new AppError(404, "Inquiry not found");
  }

  if (
    req.user!.role === "SCHOOL_ADMIN" &&
    inquiry.school.ownerId !== req.user!.id
  ) {
    throw new AppError(403, "You do not have permission to update this inquiry");
  }

  const updated = await prisma.inquiry.update({
    where: { id },
    data: { status },
    include: {
      parent: { select: { name: true, email: true, phone: true } },
    },
  });

  res.json(updated);
};
