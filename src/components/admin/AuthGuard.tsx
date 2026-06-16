"use client"

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isHydrated, hydrate } = useStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated) {
      const isLoginOrRegister = pathname === "/login" || pathname === "/register";
      
      if (!currentUser && !isLoginOrRegister) {
        router.push("/login");
      } else if (currentUser && isLoginOrRegister) {
        router.push("/admin/dashboard");
      }
    }
  }, [currentUser, isHydrated, pathname, router]);

  // Prevent flash of page before hydration or check complete
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground">Loading admin session...</p>
        </div>
      </div>
    );
  }

  // Redirecting...
  const isLoginOrRegister = pathname === "/login" || pathname === "/register";
  if (!currentUser && !isLoginOrRegister) {
    return null;
  }
  if (currentUser && isLoginOrRegister) {
    return null;
  }

  return <>{children}</>;
}
