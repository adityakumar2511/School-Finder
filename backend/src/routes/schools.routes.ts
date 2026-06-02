import { Router } from "express";

import {

  getSchools,

  searchSchools,

  getSchool,

  createSchool,

  updateSchool,

  deleteSchool,

  getMySchool,

  addSchoolImage,

  deleteSchoolImage,

} from "../controllers/schools.controller";

import { auth } from "../middleware/auth";

import { requireRole } from "../middleware/roleCheck";

import { validate } from "../middleware/validate";

import {

  createSchoolBodySchema,

  updateSchoolBodySchema,

} from "../validators/school.validator";

import { asyncHandler } from "../utils/asyncHandler";



const router = Router();



router.get("/", asyncHandler(getSchools));

router.get("/search", asyncHandler(searchSchools));

router.post(
  "/my-school/images",
  auth,
  requireRole("SCHOOL_ADMIN"),
  asyncHandler(addSchoolImage)
);

router.delete(
  "/images/:id",
  auth,
  requireRole("SCHOOL_ADMIN"),
  asyncHandler(deleteSchoolImage)
);



router.get(

  "/my-school",

  auth,

  requireRole("SCHOOL_ADMIN"),

  asyncHandler(getMySchool)

);



router.get("/:slug", asyncHandler(getSchool));



router.post(

  "/",

  auth,

  requireRole("SCHOOL_ADMIN"),

  validate(createSchoolBodySchema),

  asyncHandler(createSchool)

);



router.patch(

  "/:id",

  auth,

  validate(updateSchoolBodySchema),

  asyncHandler(updateSchool)

);



router.delete(

  "/:id",

  auth,

  requireRole("ADMIN"),

  asyncHandler(deleteSchool)

);



export default router;

