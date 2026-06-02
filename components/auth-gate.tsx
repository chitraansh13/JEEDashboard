"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/components/app-state-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, currentUser } = useAppState();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser && pathname !== "/login" && pathname !== "/signup") {
      router.replace("/login");
    }
  }, [currentUser, pathname, ready, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg))]">
        <div className="glass-card w-full max-w-md rounded-[28px] p-8">
          <div className="mb-4 h-6 w-40 animate-pulse rounded-full bg-white/40 dark:bg-white/10" />
          <div className="h-24 animate-pulse rounded-[24px] bg-white/40 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (!currentUser) return null;
  return <>{children}</>;
}
