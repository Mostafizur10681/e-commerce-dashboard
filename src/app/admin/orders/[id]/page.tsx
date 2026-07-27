"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  XCircle,
  Package,
  User,
  MapPin,
  Trash2,
  Loader2,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  attributes?: Record<string, string> | any;
  product?: {
    id: number;
    name: string;
    images?: { image_path: string }[];
  };
}

interface Order {
  id: number;
  order_number: string;
  total: string;
  shipping_amount?: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  division: string;
  district: string;
  thana: string;
  address: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/orders/${id}`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch order details");
      const json = await res.json();
      setOrder(json.data || json);
    } catch (err) {
      console.error(err);
      toast("Error loading order details", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatuses = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch("/api/order-statuses?all=true", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch order statuses");
      const json = await res.json();
      const activeStatuses = (json.orderStatuses || json || []).filter((s: any) => s.status === "Active");
      setAvailableStatuses(activeStatuses);
    } catch (err) {
      console.error("Failed to load order statuses:", err);
    }
  };

  useEffect(() => {
    if (mounted && id) {
      fetchOrderDetails();
      fetchOrderStatuses();
    }
  }, [mounted, id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast(`Order status updated to ${newStatus}`, "success");
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error(err);
      toast("Failed to update order status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (confirm(`Are you sure you want to delete order ${order.order_number}?`)) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/orders/${order.id}`, {
          method: "DELETE",
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to delete order");
        toast("Order deleted successfully", "success");
        router.push("/admin/orders");
      } catch (err) {
        console.error(err);
        toast("Failed to delete order", "error");
      }
    }
  };

  if (!mounted || loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-955 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500">Loading order details...</span>
      </div>
    );
  }

  if (mounted && !order) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Order Not Found</h2>
          <p className="text-sm text-gray-505 dark:text-slate-400">
            We couldn't find the order with ID #{id}.
          </p>
          <Button
            onClick={() => router.push("/admin/orders")}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold cursor-pointer"
          >
            Back to Orders List
          </Button>
        </div>
      </div>
    );
  }

  const currentOrder = order!;

  const getOrderBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "processing":
      case "packed":
      case "shipped":
      case "out-for-delivery":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
      case "order-placed":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPaymentBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "refunded":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-850 dark:text-gray-400";
    }
  };

  const statusesToRender = [...(availableStatuses.length > 0 ? availableStatuses : [
    { slug: "pending", name: "Pending" },
    { slug: "processing", name: "Processing" },
    { slug: "completed", name: "Completed" },
    { slug: "cancelled", name: "Cancelled" }
  ])];

  if (currentOrder && !statusesToRender.some(s => s.slug.toLowerCase() === currentOrder.status.toLowerCase())) {
    statusesToRender.push({
      slug: currentOrder.status.toLowerCase(),
      name: currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)
    });
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header & Navigation */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Orders", href: "/admin/orders" },
            { label: `Order Details` },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/orders")}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:text-green-600 transition-all cursor-pointer shadow-sm text-gray-750 dark:text-slate-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Order details
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Number: {currentOrder.order_number}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDelete}
              className="h-10 rounded-xl px-4 flex items-center gap-2 font-medium cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <Trash2 className="h-4.5 w-4.5" />
              Delete Order
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Columns (8/12 width) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Fulfillment</span>
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border-transparent ${getOrderBadgeStyle(currentOrder.status)}`}>
                  {currentOrder.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Payment Status</span>
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border-transparent ${getPaymentBadgeStyle(currentOrder.payment_status)}`}>
                  {currentOrder.payment_status}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Total Amount</span>
                <span className="text-xl font-extrabold text-green-600 dark:text-green-400 block">৳{Number(currentOrder.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-450 dark:text-slate-400 font-medium block">Date &amp; Time</span>
                <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                  <Calendar className="h-4.5 w-4.5 text-green-600" />
                  {new Date(currentOrder.created_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-455 dark:text-slate-400 font-medium block">Payment Method</span>
                <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                  <CreditCard className="h-4.5 w-4.5 text-green-600" />
                  Cash on Delivery
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products Section */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Ordered Products
              </h2>
              <Badge className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-full px-2.5 py-0.5 text-xs font-semibold border-none">
                {currentOrder.items.length} {currentOrder.items.length === 1 ? "Item" : "Items"}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-55 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    <th className="pl-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Product</th>
                    <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 text-center">Price</th>
                    <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 text-center">Quantity</th>
                    <th className="pr-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {currentOrder.items.map((item, idx) => {
                    const thumbnail = item.product?.images?.[0]?.image_path;
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={item.product?.name}
                                className="h-12 w-12 object-cover rounded-xl border border-gray-150 dark:border-slate-800"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-gray-900 dark:text-slate-100 text-sm block leading-tight">
                                {item.product?.name || `Product #${item.product_id}`}
                              </span>
                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {Object.entries(item.attributes).map(([key, val]: [string, any]) => (
                                    <Badge
                                      key={key}
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-350 border-gray-200 dark:border-slate-700 capitalize font-medium"
                                    >
                                      {key}: {val}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-semibold text-gray-900 dark:text-slate-100 text-sm">৳{Number(item.price).toFixed(2)}</td>
                        <td className="py-4 text-center font-bold text-gray-900 dark:text-slate-100 text-sm">{item.quantity}</td>
                        <td className="pr-6 py-4 text-right font-extrabold text-gray-900 dark:text-slate-100 text-sm">৳{Number(Number(item.price) * item.quantity).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations Panel */}
            <div className="p-6 bg-gray-55/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">
                    ৳{(Number(currentOrder.total) - Number(currentOrder.shipping_amount || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-slate-400">
                  <span>Shipping Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">
                    ৳{Number(currentOrder.shipping_amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-slate-800 pt-3 flex justify-between font-extrabold text-base text-gray-900 dark:text-slate-100">
                  <span>Order Total</span>
                  <span className="text-green-600 dark:text-green-400 text-lg">৳{Number(currentOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns (4/12 width) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions / Order Status Update */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Update Order Status
            </h3>
            <div className="space-y-2">
              <select
                value={currentOrder.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="w-full h-11 border border-gray-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-green-500 text-gray-700 dark:text-slate-400 cursor-pointer disabled:opacity-50"
              >
                {statusesToRender.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
              <User className="h-4.5 w-4.5 text-green-600" />
              Customer Details
            </h3>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-bold text-sm flex items-center justify-center border border-green-100/50 dark:border-green-900/30">
                {currentOrder.customer_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 dark:text-slate-100 text-sm truncate">{currentOrder.customer_name}</span>
                <span className="text-xs text-gray-450 dark:text-gray-500 truncate">{currentOrder.customer_email || 'No email provided'}</span>
              </div>
            </div>

            <div className="border-t border-gray-55 dark:border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Phone:</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{currentOrder.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-2.5">
                <MapPin className="h-4.5 w-4.5 text-green-600" />
                Shipping Details
              </h3>
              <div className="text-xs text-gray-505 dark:text-slate-500 space-y-1 leading-relaxed">
                <p className="font-semibold text-gray-900 dark:text-slate-100">{currentOrder.customer_name}</p>
                <p>{currentOrder.address}</p>
                <p>{currentOrder.thana}, {currentOrder.district}, {currentOrder.division}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
