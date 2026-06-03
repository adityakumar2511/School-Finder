"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parent_controller_1 = require("../controllers/parent.controller");
const auth_1 = require("../middleware/auth");
const roleCheck_1 = require("../middleware/roleCheck");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.use(auth_1.auth, (0, roleCheck_1.requireRole)("PARENT"));
router.get("/profile", (0, asyncHandler_1.asyncHandler)(parent_controller_1.getParentProfile));
router.patch("/profile", (0, asyncHandler_1.asyncHandler)(parent_controller_1.updateParentProfile));
// Preferred favourites API — use this for all new frontend code.
// Richer response shape includes full school details and pagination.
router.get("/favourites", (0, asyncHandler_1.asyncHandler)(parent_controller_1.getParentFavourites));
router.post("/favourites", (0, asyncHandler_1.asyncHandler)(parent_controller_1.addParentFavourite));
router.delete("/favourites", (0, asyncHandler_1.asyncHandler)(parent_controller_1.removeParentFavourite));
router.get("/inquiries", (0, asyncHandler_1.asyncHandler)(parent_controller_1.getParentInquiries));
exports.default = router;
