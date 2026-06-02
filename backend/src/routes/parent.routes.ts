import { Router } from "express";
import {
  addParentFavourite,
  getParentFavourites,
  getParentInquiries,
  getParentProfile,
  removeParentFavourite,
  updateParentProfile,
} from "../controllers/parent.controller";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(auth, requireRole("PARENT"));

router.get("/profile", asyncHandler(getParentProfile));
router.patch("/profile", asyncHandler(updateParentProfile));
router.get("/favourites", asyncHandler(getParentFavourites));
router.post("/favourites", asyncHandler(addParentFavourite));
router.delete("/favourites", asyncHandler(removeParentFavourite));
router.get("/inquiries", asyncHandler(getParentInquiries));

export default router;
