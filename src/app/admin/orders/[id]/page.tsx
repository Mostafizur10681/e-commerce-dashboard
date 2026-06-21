"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  User,
  MapPin,
  DollarSign,
  Receipt,
  Trash2,
  Loader2,
  ShoppingBag,
  CreditCard,
  Building,
  ChevronRight,
  Printer
} from "lucide-react";

import { useStore } from "@/store";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { orders, updateOrderStatus, deleteOrder } = useStore() as any;

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
        <span className="text-sm font-semibold text-gray-500">Loading order details...</span>
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We couldn't find the order with ID #{id}. It may have been deleted or the ID is incorrect.
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

  const currentOrder = order!;

  const getOrderBadgeStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Processing":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Pending":
        return "bg-slate-100 text-slate-700 dark:bg-slate-805 dark:text-slate-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Returned":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPaymentBadgeStyle = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Refunded":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-850 dark:text-gray-400";
    }
  };

  const handleStatusChange = (newStatus: OrderStatus | "Returned") => {
    updateOrderStatus(currentOrder.id, newStatus);
    setOrder({ ...currentOrder, status: newStatus });
    toast(`Order #${currentOrder.id} status updated to ${newStatus}`, "success");
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete order #${currentOrder.id}?`)) {
      if (deleteOrder) {
        deleteOrder(currentOrder.id);
        toast("Order deleted successfully", "success");
        router.push("/admin/orders");
      } else {
        toast("Store delete action is simulated.", "success");
      }
    }
  };

  const handleViewInvoice = () => {
    router.push(`/admin/orders/invoice/${currentOrder.id}`);
  };

  const subtotalVal = currentOrder.subtotal || (currentOrder.amount - (currentOrder.shippingCost || 0));
  const shippingVal = currentOrder.shippingCost || 0;
  const totalVal = currentOrder.amount;
  const payStatus = currentOrder.paymentStatus || "Paid";

  const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];

  const getStepStatus = (stepKey: string) => {
    const status = currentOrder.status;
    if (status === "Cancelled") return "cancelled";
    if (status === "Returned") return "returned";

    switch (stepKey) {
      case "Placed":
        return "completed";
      case "Processing":
        return ["Processing", "Shipped", "Delivered"].includes(status) ? "completed" : "pending";
      case "Packed":
        return ["Shipped", "Delivered"].includes(status) ? "completed" : "pending";
      case "Shipped":
        return ["Shipped", "Delivered"].includes(status) ? "completed" : "pending";
      case "Out For Delivery":
        return status === "Delivered" ? "completed" : "pending";
      case "Delivered":
        return status === "Delivered" ? "completed" : "pending";
      default:
        return "pending";
    }
  };

  const steps = [
    { key: "Placed", label: "Order Placed", desc: `Successfully recorded on ${currentOrder.date}` },
    { key: "Processing", label: "Processing", desc: "Stock allocated and verified" },
    { key: "Packed", label: "Packed", desc: "Order details boxed and sealed" },
    { key: "Shipped", label: "Shipped", desc: "In transit with logistics carriers" },
    { key: "Out For Delivery", label: "Out For Delivery", desc: "Out with local dispatcher courier" },
    { key: "Delivered", label: "Delivered", desc: "Received by client" }
  ];

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-955 transition-colors duration-300">
      {/* Header & Navigation */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Sales", href: "/admin/orders" },
            { label: "Orders", href: "/admin/orders" },
            { label: `Order #${currentOrder.id}` },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/orders")}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:text-[#16A34A] hover:bg-green-50 dark:hover:bg-green-950/20 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Order #{currentOrder.id}
              </h1>
              <p className="text-sm text-gray-505 dark:text-gray-400">
                Placed on {currentOrder.date}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleViewInvoice}
              className="h-10 rounded-xl px-4 flex items-center gap-2 font-medium cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
            >
              <Receipt className="h-4.5 w-4.5" />
              Invoice
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="h-10 rounded-xl px-4 flex items-center gap-2 font-medium cursor-pointer text-red-655 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <Trash2 className="h-4.5 w-4.5" />
              Delete Order
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Columns (8/12 width on lg) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Summary & Stats Banner */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Fulfillment</span>
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border-transparent ${getOrderBadgeStyle(currentOrder.status)}`}>
                  {currentOrder.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Payment Status</span>
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border-transparent ${getPaymentBadgeStyle(payStatus)}`}>
                  {payStatus}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Total Amount</span>
                <span className="text-xl font-extrabold text-[#16A34A] dark:text-green-400 block">${totalVal}</span>
              </div>
            </div>

            {/* General Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-450 dark:text-gray-400 font-medium block">Date &amp; Time</span>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                  <Calendar className="h-4.5 w-4.5 text-[#16A34A]" />
                  {currentOrder.date}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-450 dark:text-gray-400 font-medium block">Payment Method</span>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
                  <CreditCard className="h-4.5 w-4.5 text-[#16A34A]" />
                  {currentOrder.paymentMethod || "PayPal"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-455 dark:text-gray-400 font-medium block">Transaction ID</span>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold font-mono">
                  {currentOrder.transactionId || "txn_8273948512"}
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-[#16A34A]" />
                Ordered Products
              </h2>
              <Badge className="bg-green-50 text-[#16A34A] dark:bg-green-950/20 dark:text-green-400 rounded-full px-2.5 py-0.5 text-xs font-semibold border-none">
                {currentOrder.items.length} {currentOrder.items.length === 1 ? "Item" : "Items"}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-850">
                    <th className="pl-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Product</th>
                    <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Price</th>
                    <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Quantity</th>
                    <th className="pr-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.productName}
                              className="h-12 w-12 object-cover rounded-xl border border-gray-150 dark:border-gray-800"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm block leading-tight">
                              {item.productName}
                            </span>
                            <span className="text-[10px] text-gray-450 dark:text-gray-500 mt-1 block">SKU: SKU-{currentOrder.id.slice(-4)}-{idx}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-semibold text-gray-900 dark:text-white text-sm">
                        ${item.price}
                      </td>
                      <td className="py-4 text-center font-bold text-gray-900 dark:text-white text-sm">
                        {item.quantity}
                      </td>
                      <td className="pr-6 py-4 text-right font-extrabold text-gray-900 dark:text-white text-sm">
                        ${item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Panel */}
            <div className="p-6 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-450">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${subtotalVal}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-455">
                  <span>Shipping Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${shippingVal}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-extrabold text-base text-gray-900 dark:text-white">
                  <span>Order Total</span>
                  <span className="text-[#16A34A] dark:text-green-400 text-lg">${totalVal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-3">
              <DollarSign className="h-5 w-5 text-[#16A34A]" />
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{currentOrder.paymentMethod || "Credit Card (Stripe)"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{currentOrder.transactionId || "ch_3M4oZc2eZvKYlo2C1"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">Status:</span>
                  <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border-transparent ${getPaymentBadgeStyle(payStatus)}`}>
                    {payStatus}
                  </Badge>
                </div>
                <div className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{currentOrder.paymentDate || currentOrder.date}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns (4/12 width on lg) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Actions / Order Status Update */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Update Order Status
            </h3>
            <div className="space-y-2">
              <select
                value={currentOrder.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className="w-full h-11 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {orderStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-450 dark:text-gray-500">
                Updating the order status will notify the logisitcs API and trigger updates in customer tracking.
              </p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-3">
              <Clock className="h-4.5 w-4.5 text-[#16A34A]" />
              Status Timeline
            </h3>

            <div className="space-y-1">
              {steps.map((step, idx) => {
                const stepStatus = getStepStatus(step.key);
                const isLast = idx === steps.length - 1;
                const nextStepStatus = !isLast ? getStepStatus(steps[idx + 1].key) : "pending";
                const isLineCompleted = stepStatus === "completed" && nextStepStatus === "completed";

                return (
                  <div key={step.key} className="flex gap-4 relative">
                    {!isLast && (
                      <div className={`absolute left-2.5 top-5 bottom-0 w-0.5 ${
                        isLineCompleted ? "bg-[#16A34A]" : "bg-gray-200 dark:bg-gray-800"
                      }`} />
                    )}
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                      {stepStatus === "completed" ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#16A34A] ring-4 ring-green-100 dark:ring-green-950/50" />
                      ) : stepStatus === "cancelled" ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-red-100 dark:ring-red-950/50" />
                      ) : stepStatus === "returned" ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-purple-100 dark:ring-purple-950/50" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700 ring-4 ring-gray-100 dark:ring-gray-850" />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className={`text-xs font-bold ${
                        stepStatus === "completed"
                          ? "text-gray-900 dark:text-white"
                          : stepStatus === "cancelled"
                          ? "text-red-500 font-extrabold"
                          : stepStatus === "returned"
                          ? "text-purple-500 font-extrabold"
                          : "text-gray-400"
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-450 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-3">
              <User className="h-4.5 w-4.5 text-[#16A34A]" />
              Customer Details
            </h3>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-sm flex items-center justify-center border border-green-100/50 dark:border-green-900/30">
                {currentOrder.customerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 dark:text-white text-sm truncate">{currentOrder.customerName}</span>
                <span className="text-xs text-gray-450 dark:text-gray-500 truncate">{currentOrder.customerEmail || `${currentOrder.customerName.replace(" ", ".").toLowerCase()}@example.com`}</span>
              </div>
            </div>

            <div className="border-t border-gray-50 dark:border-gray-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Total Orders Placed:</span>
                <span className="font-semibold text-gray-900 dark:text-white">12 Orders</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Customer Since:</span>
                <span className="font-semibold text-gray-900 dark:text-white">Jan 2024</span>
              </div>
            </div>
          </div>

          {/* Shipping & Billing Details Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 space-y-5">
            {/* Shipping Address */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2.5">
                <MapPin className="h-4.5 w-4.5 text-[#16A34A]" />
                Shipping Details
              </h3>
              <div className="text-xs text-gray-505 dark:text-gray-400 space-y-1 leading-relaxed">
                <p className="font-semibold text-gray-900 dark:text-white">{currentOrder.customerName}</p>
                <p>{currentOrder.shippingAddress?.street || "123 Main Street"}</p>
                <p>{currentOrder.shippingAddress?.city || "New York"}, {currentOrder.shippingAddress?.state || "NY"} {currentOrder.shippingAddress?.zip || "10001"}</p>
                <p>{currentOrder.shippingAddress?.country || "USA"}</p>
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2.5">
                <Building className="h-4.5 w-4.5 text-[#16A34A]" />
                Billing Details
              </h3>
              <div className="text-xs text-gray-505 dark:text-gray-400 space-y-1 leading-relaxed">
                <p className="font-semibold text-gray-900 dark:text-white">{currentOrder.customerName}</p>
                <p>{currentOrder.billingAddress?.street || "123 Main Street"}</p>
                <p>{currentOrder.billingAddress?.city || "New York"}, {currentOrder.billingAddress?.state || "NY"} {currentOrder.billingAddress?.zip || "10001"}</p>
                <p>{currentOrder.billingAddress?.country || "USA"}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
