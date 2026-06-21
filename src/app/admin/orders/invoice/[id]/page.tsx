"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { useStore } from "@/store";
import { Order } from "@/types";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import InvoiceView from "@/components/admin/orders/InvoiceView";

export default function OrderInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { orders } = useStore() as any;

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && id && orders.length > 0) {
      const foundOrder = orders.find((o: Order) => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [mounted, id, orders]);

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-955">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading invoice details...</span>
      </div>
    );
  }

  if (mounted && !order) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-955 flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Invoice Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We couldn't find the order with ID #{id} to generate an invoice.
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
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-955 transition-colors duration-300 print:bg-white print:p-0 print:min-h-0">
      {/* Breadcrumb - Hidden on print */}
      <div className="space-y-1 print:hidden">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Sales", href: "/admin/orders" },
            { label: "Orders", href: "/admin/orders" },
            { label: `Invoice #${order?.id}` },
          ]}
        />
        <div className="pt-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Order Invoice</h1>
          <p className="text-sm text-gray-505 dark:text-gray-400">
            Generate and export custom customer invoice billing
          </p>
        </div>
      </div>

      {/* Invoice Layout */}
      {order && <InvoiceView order={order} />}
    </div>
  );
}
