import { Router } from "express";
import {
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../controllers/favourite.controller";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Legacy favourites routes — kept for backward compatibility.
 * New code should use /api/parent/favourites (richer response shape).
 * These routes add a Deprecation header on every response.
 * Future: remove these once frontend fully migrated to /api/parent/*.
 */
const router = Router();

router.use(auth, requireRole("PARENT"));

router.get("/", asyncHandler(getFavourites));
router.post("/", asyncHandler(addFavourite));
router.delete("/", asyncHandler(removeFavourite));

export default router;
