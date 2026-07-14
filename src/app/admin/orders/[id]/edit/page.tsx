"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface Order {
  id: number;
  order_number: string;
  total: string;
  status: string;
  payment_status: string;
  customer_name: string;
}

interface StatusOption {
  id: string;
  name: string;
  status: string; // Active/Inactive
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState("pending");
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Dynamic status options
  const [orderStatuses, setOrderStatuses] = useState<StatusOption[]>([]);
  const [paymentStatusesList, setPaymentStatusesList] = useState<StatusOption[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStatuses = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const [orderRes, paymentRes] = await Promise.all([
        fetch("/api/order-statuses?all=true", { headers }),
        fetch("/api/payment-statuses?all=true", { headers }),
      ]);

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        // Filter only Active statuses for options selection
        const activeOrders = (orderData.orderStatuses || []).filter(
          (o: any) => o.status === "Active"
        );
        setOrderStatuses(activeOrders);
      }

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        // Filter only Active statuses for options selection
        const activePayments = (paymentData.paymentStatuses || []).filter(
          (p: any) => p.status === "Active"
        );
        setPaymentStatusesList(activePayments);
      }
    } catch (err) {
      console.error("Error fetching dynamic statuses:", err);
    }
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/orders/${id}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch order details");
      const json = await res.json();
      const fetched = json.data || json;
      setOrder(fetched);
      setStatus(fetched.status);
      setPaymentStatus(fetched.payment_status);
    } catch (err) {
      console.error(err);
      toast("Error loading order details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && id) {
      fetchOrderDetails();
      fetchStatuses();
    }
  }, [mounted, id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: status,
          payment_status: paymentStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      toast("Order updated successfully", "success");
      router.push("/admin/orders");
    } catch (err) {
      console.error(err);
      toast("Failed to update order", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-55 dark:bg-slate-950 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500">Loading Order Details...</span>
      </div>
    );
  }

  if (mounted && !order) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Order Not Found</h2>
        <Button
          onClick={() => router.push("/admin/orders")}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl mt-4"
        >
          Back to Orders List
        </Button>
      </div>
    );
  }

  // Helper to ensure lowercase matching if backend expects lowercase, while supporting direct mapping.
  // We can standardise the values by keeping whatever case the dynamic option name/slug defines.
  // Usually storing the slug or name is correct. Let's store the lowercase slug or name.
  // In our seeder, slugs are like 'order-placed', 'processing', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'.
  // But wait, the existing code maps them:
  // e.g. status: 'pending', 'processing', 'completed', 'cancelled'
  // and payment_status: 'paid', 'failed', 'refunded', 'pending'.
  // Let's use the slug or lowercase name to match existing backend data. Storing the name exactly or the slug is great.
  // Let's look at the database. Order.php has status and payment_status. Let's use name/slug or lowercase of name.
  // Let's offer the value as name, and if matching, we will make sure we can select it correctly.

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Orders", href: "/admin/orders" },
            { label: `Edit Order` },
          ]}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:text-green-600 transition-all cursor-pointer shadow-sm text-gray-755 dark:text-slate-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Order</h1>
            <p className="text-sm text-gray-505 dark:text-slate-400">Order number: {order?.order_number}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 block">Order Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 border border-gray-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-green-500 text-gray-700 dark:text-slate-400 cursor-pointer capitalize"
            >
              {orderStatuses.length > 0 ? (
                orderStatuses.map((opt) => (
                  <option key={opt.id} value={opt.name.toLowerCase()}>
                    {opt.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 block">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full h-11 border border-gray-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-green-500 text-gray-700 dark:text-slate-400 cursor-pointer capitalize"
            >
              {paymentStatusesList.length > 0 ? (
                paymentStatusesList.map((opt) => (
                  <option key={opt.id} value={opt.name.toLowerCase()}>
                    {opt.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </>
              )}
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/orders")}
              className="rounded-xl h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-semibold cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
