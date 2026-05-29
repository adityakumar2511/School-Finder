"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../generated/prisma");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;
const useSsl = process.env.NODE_ENV === "production" &&
    connectionString &&
    !connectionString.includes("localhost");
const pool = globalForPrisma.pool ??
    new pg_1.Pool({
        connectionString,
        ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
        max: process.env.NODE_ENV === "production" ? 10 : 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = globalForPrisma.prisma ??
    new prisma_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pool = pool;
}
exports.default = prisma;
