import dotenv from "dotenv";

dotenv.config();

import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

const main = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Missing required environment variables: ADMIN_EMAIL and ADMIN_PASSWORD"
    );
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log("Admin already exists, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS || "12")
  );

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN",
      name: "Platform Administrator",
    },
  });

  console.log(`Admin user created successfully. Email: ${email}`);
};

main()
  .catch((error: unknown) => {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
