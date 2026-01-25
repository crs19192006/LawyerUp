"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthRole, useAuth } from "../lib/auth";

type ProtectedRouteProps = {
  allowedRole?: AuthRole;
  children: ReactNode;
};

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    // Login routes are public; do not redirect unauthenticated users away.
    if (pathname?.startsWith("/login")) {
      return;
    }
    if (!currentUser) {
      router.push("/");
      return;
    }
    if (allowedRole && currentUser.role !== allowedRole) {
      router.push("/");
    }
  }, [allowedRole, currentUser, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading session...
      </div>
    );
  }
  if (!currentUser) {
    // Public login routes remain visible even without a session.
    if (pathname?.startsWith("/login")) {
      return <>{children}</>;
    }
    return null;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
