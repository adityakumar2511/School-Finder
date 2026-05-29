import { Router } from "express";
import {
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../controllers/favourite.controller";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(auth, requireRole("PARENT"));

router.get("/", asyncHandler(getFavourites));
router.post("/", asyncHandler(addFavourite));
router.delete("/", asyncHandler(removeFavourite));

export default router;
