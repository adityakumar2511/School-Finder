"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentInquiries = exports.removeParentFavourite = exports.addParentFavourite = exports.getParentFavourites = exports.updateParentProfile = exports.getParentProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const favourites_1 = require("../lib/favourites");
const pagination_1 = require("../lib/pagination");
const schools_1 = require("../lib/queries/schools");
function mapFavouriteSchool(favourite) {
    return {
        favouriteId: favourite.id,
        savedAt: favourite.createdAt,
        school: (0, schools_1.mapSchoolListItem)(favourite.school),
    };
}
// GET /api/parent/profile
const getParentProfile = async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw AppError_1.Errors.NotFound("User");
    }
    res.json({ data: user });
};
exports.getParentProfile = getParentProfile;
// PATCH /api/parent/profile
const updateParentProfile = async (req, res) => {
    const { name, phone, image } = req.body;
    if (name !== undefined && typeof name === "string" && name.trim().length < 1) {
        throw AppError_1.Errors.BadRequest("Name is required");
    }
    const user = await prisma_1.default.user.update({
        where: { id: req.user.id },
        data: {
            ...(name !== undefined ? { name: name.trim() } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(image !== undefined ? { image } : {}),
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            role: true,
            createdAt: true,
        },
    });
    res.json({ success: true, data: user });
};
exports.updateParentProfile = updateParentProfile;
// GET /api/parent/favourites
const getParentFavourites = async (req, res) => {
    const { page, limit } = (0, favourites_1.parseFavouritesPagination)(req.query);
    const { rows, pagination } = await (0, favourites_1.getFavouritesForUser)(req.user.id, page, limit);
    res.json({
        data: rows.map(mapFavouriteSchool),
        schools: rows.map((row) => (0, schools_1.mapSchoolListItem)(row.school)),
        pagination,
    });
};
exports.getParentFavourites = getParentFavourites;
// POST /api/parent/favourites
const addParentFavourite = async (req, res) => {
    const { schoolId } = req.body;
    if (!schoolId) {
        throw AppError_1.Errors.BadRequest("schoolId is required");
    }
    const favourite = await (0, favourites_1.addFavouriteForUser)(req.user.id, schoolId);
    res.status(200).json({ data: favourite });
};
exports.addParentFavourite = addParentFavourite;
// DELETE /api/parent/favourites?schoolId=
const removeParentFavourite = async (req, res) => {
    const schoolId = String(req.query.schoolId ?? "").trim();
    if (!schoolId) {
        throw AppError_1.Errors.BadRequest("schoolId is required");
    }
    const removed = await (0, favourites_1.removeFavouriteForUser)(req.user.id, schoolId);
    if (removed === 0) {
        throw AppError_1.Errors.NotFound("Favourite");
    }
    res.json({ success: true, message: "Favourite removed successfully" });
};
exports.removeParentFavourite = removeParentFavourite;
// GET /api/parent/inquiries
const getParentInquiries = async (req, res) => {
    const page = (0, pagination_1.parsePage)(req.query.page);
    const limit = (0, pagination_1.parseLimit)(req.query.limit, 10, 50);
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
                        id: true,
                        name: true,
                        slug: true,
                        city: true,
                        board: true,
                        logoUrl: true,
                    },
                },
            },
        }),
        prisma_1.default.inquiry.count({ where }),
    ]);
    res.json({
        data: inquiries,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    });
};
exports.getParentInquiries = getParentInquiries;
