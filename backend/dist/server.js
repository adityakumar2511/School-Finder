"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const schools_routes_1 = __importDefault(require("./routes/schools.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const inquiry_routes_1 = __importDefault(require("./routes/inquiry.routes"));
const favourite_routes_1 = __importDefault(require("./routes/favourite.routes"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const errorHandler_1 = require("./middleware/errorHandler");
const security_1 = require("./middleware/security");
const production_1 = require("./config/production");
const app = (0, express_1.default)();
(0, security_1.applySecurityMiddleware)(app);
app.use(express_1.default.json({
    limit: "2mb",
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: "2mb",
}));
app.use(security_1.generalRateLimiter);
app.get("/health", async (_req, res) => {
    const timestamp = new Date().toISOString();
    const base = {
        status: "ok",
        service: "schoolfinder-api",
        timestamp,
        environment: process.env.NODE_ENV ?? "development",
        version: process.env.npm_package_version ?? "1.0.0",
    };
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.json({
            ...base,
            database: "connected",
        });
    }
    catch {
        res.status(503).json({
            ...base,
            status: "degraded",
            database: "disconnected",
            message: "Database connection unavailable",
        });
    }
});
app.get("/ready", (_req, res) => {
    res.json({ ready: true, timestamp: new Date().toISOString() });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/schools", schools_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/inquiries", inquiry_routes_1.default);
app.use("/api/favourites", favourite_routes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const PORT = Number(process.env.PORT) || 4000;
const host = (0, production_1.getListenHost)();
(0, production_1.logProductionWarnings)();
const server = app.listen(PORT, host, () => {
    if ((0, production_1.isProduction)()) {
        console.log(`SchoolFinder API listening on port ${PORT} (production)`);
    }
    else {
        console.log(`Server running on http://localhost:${PORT}`);
    }
});
server.on("error", (error) => {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
});
exports.default = app;
