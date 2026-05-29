"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const main = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        console.error("Missing required environment variables: ADMIN_EMAIL and ADMIN_PASSWORD");
        process.exit(1);
    }
    const existingAdmin = await prisma_1.default.user.findFirst({
        where: { role: "ADMIN" },
    });
    if (existingAdmin) {
        console.log("Admin already exists, skipping.");
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, parseInt(process.env.BCRYPT_ROUNDS || "12"));
    await prisma_1.default.user.create({
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
    .catch((error) => {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
