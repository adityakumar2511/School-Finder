import express from "express";
import compression from "compression";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";

dotenv.config();

const SENTRY_DSN = process.env.SENTRY_DSN?.trim();

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    beforeSend(event) {
      if (event.request?.headers) {
        const headers = { ...event.request.headers };

        delete headers.authorization;
        delete headers.Authorization;
        delete headers.cookie;
        delete headers.Cookie;

        event.request.headers = headers;
      }

      return event;
    },
  });
}

import authRoutes from "./routes/auth.routes";
import schoolRoutes from "./routes/schools.routes";
import adminRoutes from "./routes/admin.routes";
import inquiryRoutes from "./routes/inquiry.routes";
import favouriteRoutes from "./routes/favourite.routes";
import parentRoutes from "./routes/parent.routes";
import contactRoutes from "./routes/contact.routes";
import prisma from "./lib/prisma";
import { tokenBlacklist } from "./lib/tokenBlacklist";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import {
  applySecurityMiddleware,
  generalRateLimiter,
} from "./middleware/security";
import { validateStartupEnv } from "./config/production";

const app = express();

applySecurityMiddleware(app);

app.use(
  compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(generalRateLimiter);

app.get("/health", async (_req, res) => {
  const timestamp = new Date().toISOString();

  const base = {
    status: "ok" as const,
    service: "schoolfinder-api",
    timestamp,
    environment: process.env.NODE_ENV ?? "development",
    version: process.env.npm_package_version ?? "1.0.0",
    blacklistSize: tokenBlacklist.size(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      ...base,
      database: "connected",
    });
  } catch (error) {
    Sentry.captureException(error);

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

app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/contact", contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

validateStartupEnv();

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  Sentry.captureException(error);
  console.error("[Server] Failed to start:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  Sentry.captureException(reason);
  console.error("[UnhandledRejection]", reason);
});

process.on("uncaughtException", async (err: Error) => {
  Sentry.captureException(err);
  console.error("[UncaughtException]", err.message, err.stack);

  if (process.env.NODE_ENV === "production") {
    await Sentry.flush(2000);
    process.exit(1);
  }
});

export default app;