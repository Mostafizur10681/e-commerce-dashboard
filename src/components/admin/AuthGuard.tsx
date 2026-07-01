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
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      try {
        const response = await originalFetch(input, init);
        
        if (response.status === 401) {
          let url = "";
          if (typeof input === "string") {
            url = input;
          } else if (input instanceof URL) {
            url = input.href;
          } else if (input && typeof input === "object" && "url" in input) {
            url = (input as Request).url;
          }

          const isAuthApi = url.includes("/login") || url.includes("/register");
          const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";

          if (!isAuthApi && !isAuthPage) {
            useStore.getState().logout();
            router.push("/login?session_expired=1");
          }
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

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
