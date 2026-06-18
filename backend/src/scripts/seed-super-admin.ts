/**
 * One-time seed script to promote an existing ADMIN user to Super Admin.
 * Run from backend/: npx ts-node src/scripts/seed-super-admin.ts
 *
 * Required env vars:
 * TARGET_SUPER_ADMIN_EMAIL=you@example.com
 * TARGET_SUPER_ADMIN_PASSWORD=yourStrongPassword
 */

import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  const email = process.env.TARGET_SUPER_ADMIN_EMAIL?.trim();
  const password = process.env.TARGET_SUPER_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    console.error("❌  TARGET_SUPER_ADMIN_EMAIL aur TARGET_SUPER_ADMIN_PASSWORD dono set karo.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌  Password kam se kam 8 characters ka hona chahiye.");
    process.exit(1);
  }

  // Check if super admin already exists
  const existing = await prisma.user.findFirst({ where: { isSuperAdmin: true } });
  if (existing) {
    console.error(`❌  Super admin already exists: ${existing.email}`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  // upsert — create karo agar nahi hai, update karo agar hai
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      isSuperAdmin: true,
      role: "ADMIN",
      adminAccessLevel: "FULL_ACCESS",
      password: hashed,
    },
    create: {
      email,
      name: "Super Admin",
      password: hashed,
      role: "ADMIN",
      adminAccessLevel: "FULL_ACCESS",
      isSuperAdmin: true,
    },
  });

  console.log(`✅  Super admin ready: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });