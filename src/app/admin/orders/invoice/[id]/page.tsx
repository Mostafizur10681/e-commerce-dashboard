"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import InvoiceView from "@/components/admin/orders/InvoiceView";

export default function OrderInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && id) {
      fetchOrder();
    }
  }, [mounted, id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(false);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/orders/${id}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch order");
      const json = await res.json();
      setOrder(json.data || json);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-955">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading invoice details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-955 flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Invoice Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We couldn&apos;t find the order with ID #{id} to generate an invoice.
          </p>
          <Button
            onClick={() => router.push("/admin/orders")}
            className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold cursor-pointer"
          >
            Back to Orders List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-black transition-colors duration-300 print:bg-white print:p-0 print:min-h-0">
      {/* Breadcrumb - Hidden on print */}
      <div className="space-y-1 print:hidden">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Sales", href: "/admin/orders" },
            { label: "Orders", href: "/admin/orders" },
            { label: `Invoice #${order?.order_number || order?.id}` },
          ]}
        />
        <div className="pt-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Order Invoice</h1>
          <p className="text-sm text-gray-505 dark:text-gray-505">
            Generate and export custom customer invoice billing
          </p>
        </div>
      </div>

      {/* Invoice Layout */}
      {order && <InvoiceView order={order} />}
    </div>
  );
}
