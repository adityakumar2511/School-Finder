import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../lib/prisma";

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body as {
    name: string;
    email: string;
    phone: string;
    message: string;
  };

  await prisma.contactSubmission.create({
    data: { name, email, phone, message },
  });

  res.status(201).json({
    success: true,
    message: "Your message has been received. We'll be in touch soon.",
  });
});