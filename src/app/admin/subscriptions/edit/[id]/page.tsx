"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditSubscriptionRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/subscriptions");
  }, [router]);

  return (
    <div className="flex h-96 items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Redirecting to Subscriptions...</div>
    </div>
  );
}
