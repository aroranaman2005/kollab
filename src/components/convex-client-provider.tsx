"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// Renamed to SessionClientProvider — wraps the app with NextAuth session context.
// Previously this was ConvexClientProvider using Convex + @convex-dev/auth.
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
