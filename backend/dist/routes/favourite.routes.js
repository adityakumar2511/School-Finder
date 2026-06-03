"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favourite_controller_1 = require("../controllers/favourite.controller");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const asyncHandler_1 = require("../utils/asyncHandler");
/**
 * Legacy favourites routes — kept for backward compatibility.
 * New code should use /api/parent/favourites (richer response shape).
 * These routes add a Deprecation header on every response.
 * Future: remove these once frontend fully migrated to /api/parent/*.
 */
const router = (0, express_1.Router)();
router.use(auth_1.auth, (0, roleCheck_1.requireRole)("PARENT"));
router.get("/", (0, asyncHandler_1.asyncHandler)(favourite_controller_1.getFavourites));
router.post("/", (0, asyncHandler_1.asyncHandler)(favourite_controller_1.addFavourite));
router.delete("/", (0, asyncHandler_1.asyncHandler)(favourite_controller_1.removeFavourite));
exports.default = router;
