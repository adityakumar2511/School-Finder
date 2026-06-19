import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitContact } from "../controllers/contact.controller";
import { validate } from "../middleware/validate";
import { contactSchema } from "../validators/contact.validator";

const router = Router();

const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many messages. Please try again later.",
  },
});

router.post("/", contactRateLimiter, validate(contactSchema), submitContact);

export default router;