// frontend/src/app/api/auth/[...nextauth]/route.ts
// NextAuth v5 App Router handler — exports GET and POST

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;