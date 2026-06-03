"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavourite = exports.addFavourite = exports.getFavourites = exports.LEGACY_FAVOURITES_DEPRECATION = void 0;
exports.setLegacyFavouritesDeprecationHeader = setLegacyFavouritesDeprecationHeader;
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const favourites_1 = require("../lib/favourites");
exports.LEGACY_FAVOURITES_DEPRECATION = "Use /api/parent/favourites instead";
function setLegacyFavouritesDeprecationHeader(res) {
    res.setHeader("Deprecation", exports.LEGACY_FAVOURITES_DEPRECATION);
}
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
    setLegacyFavouritesDeprecationHeader(res);
    res.json(favourites);
};
exports.getFavourites = getFavourites;
// POST /api/favourites
const addFavourite = async (req, res) => {
    const { schoolId } = req.body;
    if (!schoolId) {
        throw AppError_1.Errors.BadRequest("schoolId is required");
    }
    const favourite = await (0, favourites_1.addFavouriteForUser)(req.user.id, schoolId);
    setLegacyFavouritesDeprecationHeader(res);
    res.status(200).json(favourite);
};
exports.addFavourite = addFavourite;
// DELETE /api/favourites?schoolId=xxx
const removeFavourite = async (req, res) => {
    const { schoolId } = req.query;
    if (!schoolId) {
        throw AppError_1.Errors.BadRequest("schoolId is required");
    }
    const removed = await (0, favourites_1.removeFavouriteForUser)(req.user.id, schoolId);
    if (removed === 0) {
        throw AppError_1.Errors.NotFound("Favourite");
    }
    setLegacyFavouritesDeprecationHeader(res);
    res.json({ message: "Favourite removed successfully" });
};
exports.removeFavourite = removeFavourite;
