"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favouriteSchoolSelect = void 0;
exports.addFavouriteForUser = addFavouriteForUser;
exports.removeFavouriteForUser = removeFavouriteForUser;
exports.getFavouritesForUser = getFavouritesForUser;
exports.parseFavouritesPagination = parseFavouritesPagination;
const prisma_1 = __importDefault(require("./prisma"));
const AppError_1 = require("../utils/AppError");
const pagination_1 = require("./pagination");
const schools_1 = require("./queries/schools");
exports.favouriteSchoolSelect = {
    ...schools_1.schoolListSelect,
};
async function addFavouriteForUser(parentId, schoolId) {
    const school = await prisma_1.default.school.findUnique({
        where: { id: schoolId },
        select: { id: true, status: true },
    });
    if (!school) {
        throw AppError_1.Errors.NotFound("School");
    }
    if (school.status !== "APPROVED") {
        throw AppError_1.Errors.BadRequest("Cannot favourite an unapproved school");
    }
    return prisma_1.default.favourite.upsert({
        where: {
            parentId_schoolId: { parentId, schoolId },
        },
        create: { parentId, schoolId },
        update: {},
        select: { id: true, schoolId: true, createdAt: true },
    });
}
async function removeFavouriteForUser(parentId, schoolId) {
    const result = await prisma_1.default.favourite.deleteMany({
        where: { parentId, schoolId },
    });
    return result.count;
}
async function getFavouritesForUser(parentId, page, limit) {
    const skip = (page - 1) * limit;
    const where = { parentId };
    const [rows, total] = await Promise.all([
        prisma_1.default.favourite.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                school: { select: exports.favouriteSchoolSelect },
            },
        }),
        prisma_1.default.favourite.count({ where }),
    ]);
    return {
        rows,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    };
}
function parseFavouritesPagination(query) {
    const page = (0, pagination_1.parsePage)(query.page);
    const limit = (0, pagination_1.parseLimit)(query.limit, 6, 50);
    return { page, limit };
}
