"use client";

// frontend/src/app/providers.tsx
// SessionProvider wrapper — must be 'use client'

import { SessionProvider } from "next-auth/react";
import SessionHeartbeat from "@/components/SessionHeartbeat";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionHeartbeat />
      {children}
    </SessionProvider>
  );
}