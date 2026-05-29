"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavourite = exports.addFavourite = exports.getFavourites = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
// GET /api/favourites
const getFavourites = async (req, res) => {
    const favourites = await prisma_1.default.favourite.findMany({
        where: { parentId: req.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            school: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    city: true,
                    state: true,
                    board: true,
                    schoolType: true,
                    medium: true,
                    classesFrom: true,
                    classesTo: true,
                    tuitionFeeMonthly: true,
                    logoUrl: true,
                    _count: { select: { facilities: true } },
                },
            },
        },
    });
    res.json(favourites);
};
exports.getFavourites = getFavourites;
// POST /api/favourites
const addFavourite = async (req, res) => {
    const { schoolId } = req.body;
    if (!schoolId) {
        throw new AppError_1.AppError(400, "schoolId is required");
    }
    const favourite = await prisma_1.default.favourite.upsert({
        where: {
            parentId_schoolId: {
                parentId: req.user.id,
                schoolId,
            },
        },
        update: {},
        create: {
            parentId: req.user.id,
            schoolId,
        },
    });
    res.status(200).json(favourite);
};
exports.addFavourite = addFavourite;
// DELETE /api/favourites?schoolId=xxx
const removeFavourite = async (req, res) => {
    const { schoolId } = req.query;
    if (!schoolId) {
        throw new AppError_1.AppError(400, "schoolId is required");
    }
    const existing = await prisma_1.default.favourite.findUnique({
        where: {
            parentId_schoolId: {
                parentId: req.user.id,
                schoolId: schoolId,
            },
        },
    });
    if (!existing) {
        throw new AppError_1.AppError(404, "Favourite not found");
    }
    await prisma_1.default.favourite.delete({
        where: {
            parentId_schoolId: {
                parentId: req.user.id,
                schoolId: schoolId,
            },
        },
    });
    res.json({ message: "Favourite removed successfully" });
};
exports.removeFavourite = removeFavourite;
