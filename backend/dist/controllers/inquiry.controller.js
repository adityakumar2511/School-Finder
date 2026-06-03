"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInquiryStatus = exports.getSchoolInquiries = exports.getMyInquiries = exports.createInquiry = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const VALID_STATUSES = ["NEW", "CONTACTED", "CLOSED"];
async function assertSchoolInquiryAccess(schoolId, userId, role) {
    const school = await prisma_1.default.school.findUnique({
        where: { id: schoolId },
        select: { id: true, ownerId: true },
    });
    if (!school) {
        throw AppError_1.Errors.NotFound("School");
    }
    if (role === "SCHOOL_ADMIN" && school.ownerId !== userId) {
        throw AppError_1.Errors.Forbidden("You do not have permission to access inquiries for this school");
    }
    return school;
}
function buildInquiryWhere(schoolId, status, search) {
    const where = { schoolId };
    if (status && VALID_STATUSES.includes(status)) {
        where.status = status;
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
const createInquiry = async (req, res) => {
    const { schoolId, message } = req.body;
    if (!schoolId || !message) {
        throw AppError_1.Errors.BadRequest("schoolId and message are required");
    }
    const school = await prisma_1.default.school.findUnique({ where: { id: schoolId } });
    if (!school || school.status !== "APPROVED") {
        throw AppError_1.Errors.NotFound("School");
    }
    const inquiry = await prisma_1.default.inquiry.create({
        data: {
            schoolId,
            parentId: req.user.id,
            message,
        },
    });
    res.status(201).json(inquiry);
};
exports.createInquiry = createInquiry;
// GET /api/inquiries/my
const getMyInquiries = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const where = { parentId: req.user.id };
    const [inquiries, total] = await Promise.all([
        prisma_1.default.inquiry.findMany({
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
        prisma_1.default.inquiry.count({ where }),
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
exports.getMyInquiries = getMyInquiries;
// GET /api/inquiries/school/:schoolId
const getSchoolInquiries = async (req, res) => {
    const schoolId = String(req.params.schoolId);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    await assertSchoolInquiryAccess(schoolId, req.user.id, req.user.role);
    const where = buildInquiryWhere(schoolId, status, search);
    const [inquiries, total, stats] = await Promise.all([
        prisma_1.default.inquiry.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                parent: { select: { name: true, email: true, phone: true } },
            },
        }),
        prisma_1.default.inquiry.count({ where }),
        prisma_1.default.inquiry.groupBy({
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
exports.getSchoolInquiries = getSchoolInquiries;
// PATCH /api/inquiries/:id/status
const updateInquiryStatus = async (req, res) => {
    const id = String(req.params.id);
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
        throw AppError_1.Errors.BadRequest("Invalid status");
    }
    const inquiry = await prisma_1.default.inquiry.findUnique({
        where: { id },
        include: { school: { select: { ownerId: true } } },
    });
    if (!inquiry) {
        throw AppError_1.Errors.NotFound("Inquiry");
    }
    if (req.user.role === "SCHOOL_ADMIN" &&
        inquiry.school.ownerId !== req.user.id) {
        throw AppError_1.Errors.Forbidden("You do not have permission to update this inquiry");
    }
    const updated = await prisma_1.default.inquiry.update({
        where: { id },
        data: { status },
        include: {
            parent: { select: { name: true, email: true, phone: true } },
        },
    });
    res.json(updated);
};
exports.updateInquiryStatus = updateInquiryStatus;
