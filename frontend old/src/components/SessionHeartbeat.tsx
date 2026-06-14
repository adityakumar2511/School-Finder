"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { storeParentBackendToken } from "@/lib/parent-token";

const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000;

export default function SessionHeartbeat() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      return;
    }

    if (typeof session.backendAccessToken === "string" && session.backendAccessToken.length > 0) {
      storeParentBackendToken(session.backendAccessToken);
    }

    const ping = () => {
      void fetch("/api/auth/session", { cache: "no-store" }).catch(() => {});
    };

    ping();

    const intervalId = window.setInterval(ping, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [session, status]);

  return null;
}
