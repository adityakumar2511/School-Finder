import { Response } from "express";
import prisma from "../lib/prisma";
import type { InquiryStatus } from "../../generated/prisma";
import { AuthRequest } from "../middleware/auth";
import { Errors } from "../utils/AppError";

const VALID_STATUSES: InquiryStatus[] = ["NEW", "CONTACTED", "INTERESTED", "CONVERTED", "CLOSED"];

const DUPLICATE_WINDOW_MS = 15 * 24 * 60 * 60 * 1000;

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
    throw Errors.NotFound("School");
  }

  if (role === "SCHOOL_ADMIN" && school.ownerId !== userId) {
    throw Errors.Forbidden(
      "You do not have permission to access inquiries for this school"
    );
  }

  return school;
}

function buildInquiryWhere(schoolId: string, status?: string, search?: string) {
  const where: {
    schoolId: string;
    status?: InquiryStatus;
    OR?: Array<{
      parent: {
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      };
    }>;
  } = { schoolId };

  if (status && VALID_STATUSES.includes(status as InquiryStatus)) {
    where.status = status as InquiryStatus;
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
    throw Errors.BadRequest("schoolId and message are required");
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school || school.status !== "APPROVED") {
    throw Errors.NotFound("School");
  }

  const parentId = req.user!.id;
  const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);

  const existing = await prisma.inquiry.findFirst({
    where: {
      schoolId,
      parentId,
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true },
  });

  if (existing) {
    if (existing.status !== "NEW") {
      const messageMap: Record<string, string> = {
        CONTACTED: "The school has already contacted you regarding your inquiry.",
        INTERESTED: "Your inquiry is being actively followed up by the school.",
        CONVERTED: "Your admission process is already in progress with this school.",
        CLOSED: "Your inquiry has been closed by the school.",
      };

      res.status(409).json({
        success: false,
        code: "INQUIRY_EXISTS",
        message: messageMap[existing.status] ?? "An inquiry already exists for this school.",
        existingStatus: existing.status,
        existingInquiryId: existing.id,
      });
      return;
    }

    await prisma.inquiry.delete({ where: { id: existing.id } });
  }

  const inquiry = await prisma.inquiry.create({
    data: { schoolId, parentId, message },
  });

  res.status(201).json({ success: true, data: inquiry });
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
    INTERESTED: 0,
    CONVERTED: 0,
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
    throw Errors.BadRequest("Invalid status");
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { school: { select: { ownerId: true } } },
  });

  if (!inquiry) {
    throw Errors.NotFound("Inquiry");
  }

  if (
    req.user!.role === "SCHOOL_ADMIN" &&
    inquiry.school.ownerId !== req.user!.id
  ) {
    throw Errors.Forbidden("You do not have permission to update this inquiry");
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