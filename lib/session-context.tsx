"use client";

import { createContext, use } from "react";
import type { auth } from "./auth";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

const SessionContext = createContext<Promise<Session>>(Promise.resolve(null));

export function SessionProvider({
  sessionPromise,
  children,
}: {
  sessionPromise: Promise<Session>;
  children: React.ReactNode;
}) {
  return <SessionContext value={sessionPromise}>{children}</SessionContext>;
}

// Unwrapped with `use` rather than mirrored into state: state would settle at a
// different time than the Suspense boundaries below hydrate, mismatching SSR.
export function useSession() {
  return use(use(SessionContext));
}
