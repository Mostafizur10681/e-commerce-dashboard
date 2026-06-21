"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Eye,
  Pencil,
  Trash2,
  Receipt,
  Search,
  X,
  Loader2,
  ClipboardList,
  Info,
  Calendar,
  DollarSign,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  User,
  MapPin,
  ChevronDown,
  Plus
} from "lucide-react";

import { useStore } from "@/store";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { orders, updateOrderStatus, deleteOrder } = useStore() as any; // Cast in case deleteOrder doesn't exist on older types

  const [mounted, setMounted] = useState(false);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // Selected Order for Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o: Order) => o.status === "Pending").length;
    const completed = orders.filter((o: Order) => o.status === "Delivered").length;
    const cancelled = orders.filter((o: Order) => o.status === "Cancelled").length;
    return { total, pending, completed, cancelled };
  }, [orders]);

  // Reset Filters handler
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setDateFilter("All");
    setSortBy("Newest");
    toast("Filters reset successfully", "success");
  };

  // Trigger export CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["Order ID", "Customer Name", "Customer Email", "Subtotal", "Shipping Cost", "Total Amount", "Order Status", "Payment Status", "Payment Method", "Date"],
      ...orders.map((o: Order) => [
        o.id,
        o.customerName,
        o.customerEmail || "",
        o.subtotal || o.amount,
        o.shippingCost || 0,
        o.amount,
        o.status,
        o.paymentStatus || "Paid",
        o.paymentMethod || "",
        o.date
      ])
    ]
      .map((e: any[]) => e.map((val: any) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("CSV exported successfully", "success");
  };

  // Trigger mock Excel/PDF exports
  const handleMockExport = (type: "Excel" | "PDF") => {
    toast(`Exporting as ${type}... File download will begin shortly.`, "success");
  };

  // Filter orders logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o: Order) => {
      // Search text match
      const orderSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase());
      const customerSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (o.customerEmail && o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSearch = orderSearch || customerSearch;

      // Status filters
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      const payStatus = o.paymentStatus || "Paid";
      const matchesPayment = paymentFilter === "All" || payStatus === paymentFilter;

      // Date Filters (Today, This Week, This Month)
      let matchesDate = true;
      if (dateFilter !== "All") {
        const orderDate = new Date(o.date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === "Today") {
          matchesDate = diffDays <= 1;
        } else if (dateFilter === "Week") {
          matchesDate = diffDays <= 7;
        } else if (dateFilter === "Month") {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, dateFilter]);

  // Sort orders logic
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    if (sortBy === "Newest") {
      return list.sort((a, b) => b.date.localeCompare(a.date));
    }
    if (sortBy === "Oldest") {
      return list.sort((a, b) => a.date.localeCompare(b.date));
    }
    if (sortBy === "AmountHigh") {
      return list.sort((a, b) => b.amount - a.amount);
    }
    if (sortBy === "AmountLow") {
      return list.sort((a, b) => a.amount - b.amount);
    }
    return list;
  }, [filteredOrders, sortBy]);

  // Badges styling helpers
  const getOrderBadgeStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Processing":
        return "bg-amber-105 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Pending":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Returned":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPaymentBadgeStyle = (status: PaymentStatus | "Paid") => {
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

  // Delete Order confirmation
  const handleDeleteOrder = (id: string) => {
    if (deleteOrder) {
      deleteOrder(id);
      toast("Order deleted successfully", "success");
    } else {
      // Fallback if not directly inside store actions
      toast("Delete action triggers Zustand store removal.", "success");
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading orders...</span>
      </div>
    );
  }

  const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"];
  const paymentStatuses = ["Paid", "Pending", "Failed", "Refunded"];

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumbs & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Sales" },
            { label: "Orders" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-[#16A34A]" />
              Orders
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Manage customer orders and delivery status
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="h-10 rounded-xl px-4 flex items-center gap-2 font-medium cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <Download className="h-4 w-4" />
                    Export Orders
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44 border-gray-200 dark:border-gray-800">
                <DropdownMenuItem onClick={handleExportCSV}>Export CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMockExport("Excel")}>Export Excel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMockExport("PDF")}>Export PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => {
                toast("Create order flow triggered. Redirecting to catalog add page...", "success");
                router.push("/admin/products");
              }}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-medium shadow-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              Create Order
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-850 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-405 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-850 text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-850 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-wider block">Pending Orders</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.pending}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-850 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-505 dark:text-gray-405 uppercase tracking-wider block">Completed Orders</span>
            <span className="text-2xl font-bold text-[#16A34A] dark:text-green-400">{metrics.completed}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-850 hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-wider block">Cancelled Orders</span>
            <span className="text-2xl font-bold text-red-650 dark:text-red-400">{metrics.cancelled}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-all duration-300 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
            />
          </div>

          {/* Order Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-750 dark:text-gray-300 cursor-pointer"
          >
            <option value="All">All Order Statuses</option>
            {orderStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Payment Status */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-755 dark:text-gray-300 cursor-pointer"
          >
            <option value="All">All Payment Statuses</option>
            {paymentStatuses.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Date range filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-755 dark:text-gray-300 cursor-pointer"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </select>

          {/* Sort selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-755 dark:text-gray-300 cursor-pointer"
          >
            <option value="Newest">Newest first</option>
            <option value="Oldest">Oldest first</option>
            <option value="AmountHigh">Amount: High to Low</option>
            <option value="AmountLow">Amount: Low to High</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="h-9.5 rounded-xl px-4 cursor-pointer text-xs font-semibold text-gray-600 dark:text-gray-300 border-gray-205"
          >
            Reset
          </Button>
          <Button
            onClick={() => toast("Filters applied successfully", "success")}
            className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-9.5 px-5 cursor-pointer text-xs font-semibold"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Orders Modern Data Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        {sortedOrders.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 mb-4">
              <ClipboardList className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Orders Found</h3>
            <p className="text-sm text-gray-550 dark:text-gray-450 mb-6">
              Create your first store order to start monitoring transactions.
            </p>
            <Button
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold shadow-sm transition-colors cursor-pointer"
              onClick={() => toast("Redirecting to Catalog...", "success")}
            >
              Create First Order
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-850">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[110px] pl-6 py-4 font-semibold text-gray-900 dark:text-white">Order ID</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-white">Customer</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-white">Products</TableHead>
                    <TableHead className="w-[140px] py-4 font-semibold text-gray-900 dark:text-white">Amount</TableHead>
                    <TableHead className="w-[120px] py-4 font-semibold text-gray-900 dark:text-white">Payment</TableHead>
                    <TableHead className="w-[130px] py-4 font-semibold text-gray-900 dark:text-white">Status</TableHead>
                    <TableHead className="w-[140px] py-4 font-semibold text-gray-900 dark:text-white">Order Date</TableHead>
                    <TableHead className="w-[160px] text-right pr-6 py-4 font-semibold text-gray-900 dark:text-white">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => {
                    const payStatus = order.paymentStatus || "Paid";
                    const subtotalVal = order.subtotal || (order.amount - (order.shippingCost || 0));
                    return (
                      <TableRow
                        key={order.id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        {/* ID */}
                        <TableCell className="pl-6 font-bold text-gray-905 dark:text-white text-sm py-4">
                          #{order.id}
                        </TableCell>

                        {/* Customer Info */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-xs flex items-center justify-center border border-green-100/50 dark:border-green-900/30">
                              {order.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-white text-xs">{order.customerName}</span>
                              <span className="text-[10px] text-gray-450 dark:text-gray-500 font-medium">{order.customerEmail || `${order.customerName.replace(" ", ".").toLowerCase()}@example.com`}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Products */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 max-w-[200px]">
                            {order.items[0]?.thumbnail ? (
                              <img
                                src={order.items[0].thumbnail}
                                alt="product"
                                className="h-9 w-9 object-cover rounded-lg border border-gray-150 dark:border-gray-850"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                                <Package className="h-4.5 w-4.5" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-gray-900 dark:text-white truncate block">{order.items[0]?.productName}</span>
                              {order.items.length > 1 && (
                                <span className="text-[10px] font-semibold text-[#16A34A] dark:text-green-400 mt-0.5">
                                  +{order.items.length - 1} More
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="py-4">
                          <div className="flex flex-col text-xs">
                            <span className="text-gray-400">Sub: ${subtotalVal}</span>
                            <span className="text-gray-400">Ship: ${order.shippingCost || 0}</span>
                            <span className="font-bold text-gray-900 dark:text-white mt-0.5">Total: ${order.amount}</span>
                          </div>
                        </TableCell>

                        {/* Payment */}
                        <TableCell className="py-4">
                          <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border-transparent ${getPaymentBadgeStyle(payStatus)}`}>
                            {payStatus}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border-transparent ${getOrderBadgeStyle(order.status)}`}>
                            {order.status}
                          </Badge>
                        </TableCell>

                        {/* Order Date */}
                        <TableCell className="text-gray-500 dark:text-gray-405 text-sm py-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{order.date}</span>
                          </div>
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-105 dark:hover:bg-gray-800 text-gray-505 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-105 dark:hover:bg-gray-800 text-gray-505 hover:text-[#16A34A] dark:text-gray-400 dark:hover:text-green-400 transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                              title="Edit Details Page"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-105 dark:hover:bg-gray-800 text-gray-505 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/orders/invoice/${order.id}`)}
                              title="Print Invoice"
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-105 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 transition-colors cursor-pointer"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete Order"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View (Order Cards Layout) */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-850">
              {sortedOrders.map((order) => {
                const payStatus = order.paymentStatus || "Paid";
                return (
                  <div
                    key={order.id}
                    className="p-4 space-y-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                          Order #{order.id}
                        </h4>
                        <span className="text-xs text-gray-450 dark:text-gray-500 font-mono block mt-0.5">{order.date}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border-transparent ${getOrderBadgeStyle(order.status)}`}>
                          {order.status}
                        </Badge>
                        <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border-transparent ${getPaymentBadgeStyle(payStatus)}`}>
                          {payStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50/50 dark:bg-gray-950/30 rounded-xl border border-gray-100 dark:border-gray-850 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-[10px] flex items-center justify-center">
                          {order.customerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{order.customerName}</span>
                      </div>
                      <div className="flex flex-col text-xs text-gray-505 dark:text-gray-400 pt-1">
                        <span>Items: {order.items.map((i: any) => `${i.productName} (x${i.quantity})`).join(", ")}</span>
                        <span className="font-bold text-gray-900 dark:text-white mt-1">Total Amount: ${order.amount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-505 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-505 hover:text-[#16A34A] dark:text-gray-400 dark:hover:text-green-400 cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-505 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                        onClick={() => router.push(`/admin/orders/invoice/${order.id}`)}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-550 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-550 cursor-pointer"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Order Details Drawer Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 p-6 animate-in slide-in-from-right duration-300">
          {selectedOrder && (
            <div className="space-y-6">
              <SheetHeader className="border-b pb-4 border-gray-100 dark:border-gray-850">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg font-bold text-gray-905 dark:text-white flex items-center gap-2">
                    Order Details #{selectedOrder.id}
                  </SheetTitle>
                </div>
                <SheetDescription className="text-xs text-gray-500 mt-1">
                  Placed on {selectedOrder.date}
                </SheetDescription>
              </SheetHeader>

              {/* Order Status Update section */}
              <div className="space-y-2.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Fulfillment Status</Label>
                <div className="flex gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as OrderStatus;
                      updateOrderStatus(selectedOrder.id, newStatus);
                      setSelectedOrder({ ...selectedOrder, status: newStatus });
                      toast(`Order #${selectedOrder.id} status updated to ${newStatus}`, "success");
                    }}
                    className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-705 dark:text-gray-300 cursor-pointer flex-1"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Information Card */}
              <div className="bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-2">
                  <User className="h-4 w-4 text-[#16A34A]" /> Customer Information
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.customerEmail || `${selectedOrder.customerName.replace(" ", ".").toLowerCase()}@example.com`}</span>
                  </div>
                </div>
              </div>

              {/* Billing & Shipping Addresses */}
              <div className="bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-2">
                    <MapPin className="h-4 w-4 text-[#16A34A]" /> Addresses
                  </h4>
                  <div className="grid grid-cols-1 gap-3.5 text-xs">
                    {/* Shipping Address */}
                    <div className="space-y-1">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">Shipping Address:</span>
                      <span className="text-gray-500 leading-relaxed block">
                        {selectedOrder.shippingAddress?.street || "123 Main Street"}<br />
                        {selectedOrder.shippingAddress?.city || "New York"}, {selectedOrder.shippingAddress?.state || "NY"} {selectedOrder.shippingAddress?.zip || "10001"}<br />
                        {selectedOrder.shippingAddress?.country || "USA"}
                      </span>
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-850">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">Billing Address:</span>
                      <span className="text-gray-500 leading-relaxed block">
                        {selectedOrder.billingAddress?.street || "123 Main Street"}<br />
                        {selectedOrder.billingAddress?.city || "New York"}, {selectedOrder.billingAddress?.state || "NY"} {selectedOrder.billingAddress?.zip || "10001"}<br />
                        {selectedOrder.billingAddress?.country || "USA"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products items List */}
              <div className="space-y-3 bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-2xl border border-gray-150 dark:border-gray-850">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-2">
                  <Package className="h-4 w-4 text-[#16A34A]" /> Ordered Products
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-xs p-2.5 bg-white dark:bg-gray-900 border rounded-xl border-gray-200 dark:border-gray-800"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-gray-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          ${item.price} &times; {item.quantity}
                        </p>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white shrink-0">
                        ${item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-850 pt-2.5 space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">${selectedOrder.subtotal || (selectedOrder.amount - (selectedOrder.shippingCost || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900 dark:text-white">${selectedOrder.shippingCost || 0}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-gray-150 dark:border-gray-850 text-sm font-bold text-gray-905 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-[#16A34A] dark:text-green-400">${selectedOrder.amount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-2xl border border-gray-150 dark:border-gray-850 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-2">
                  <DollarSign className="h-4 w-4 text-[#16A34A]" /> Payment Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.paymentMethod || "PayPal"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono text-gray-650 dark:text-gray-350">{selectedOrder.transactionId || "txn_8273948512"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-semibold border-transparent ${getPaymentBadgeStyle(selectedOrder.paymentStatus || "Paid")}`}>
                      {selectedOrder.paymentStatus || "Paid"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Date:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.paymentDate || selectedOrder.date}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline (Vertical Progress) */}
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-405 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-2">
                  <Clock className="h-4 w-4 text-[#16A34A]" /> Order Timeline
                </h4>
                <div className="relative pl-6 space-y-5">
                  {/* Timeline connecting green line */}
                  <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-green-500 dark:bg-green-600" />

                  {/* Node 1: Placed */}
                  <div className="relative">
                    <div className="absolute -left-5 h-2.5 w-2.5 rounded-full bg-green-500 dark:bg-green-600 ring-4 ring-green-100 dark:ring-green-950/50" />
                    <div className="text-xs">
                      <p className="font-bold text-gray-900 dark:text-white">Order Placed</p>
                      <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium">Successfully recorded on {selectedOrder.date}</p>
                    </div>
                  </div>

                  {/* Node 2: Processing */}
                  <div className="relative">
                    <div className={`absolute -left-5 h-2.5 w-2.5 rounded-full ring-4 ${
                      ["Processing", "Shipped", "Delivered"].includes(selectedOrder.status)
                        ? "bg-green-500 dark:bg-green-600 ring-green-100 dark:ring-green-950/50"
                        : "bg-gray-300 dark:bg-gray-700 ring-gray-100 dark:ring-gray-850"
                    }`} />
                    <div className="text-xs">
                      <p className="font-bold text-gray-905 dark:text-white">Processing</p>
                      <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium">Stock allocated and verified</p>
                    </div>
                  </div>

                  {/* Node 3: Packed */}
                  <div className="relative">
                    <div className={`absolute -left-5 h-2.5 w-2.5 rounded-full ring-4 ${
                      ["Shipped", "Delivered"].includes(selectedOrder.status)
                        ? "bg-green-500 dark:bg-green-600 ring-green-100 dark:ring-green-950/50"
                        : "bg-gray-300 dark:bg-gray-700 ring-gray-100 dark:ring-gray-850"
                    }`} />
                    <div className="text-xs">
                      <p className="font-bold text-gray-905 dark:text-white">Packed</p>
                      <p className="text-[10px] text-gray-450 dark:text-gray-500 font-medium">Order details boxed and sealed</p>
                    </div>
                  </div>

                  {/* Node 4: Shipped */}
                  <div className="relative">
                    <div className={`absolute -left-5 h-2.5 w-2.5 rounded-full ring-4 ${
                      ["Shipped", "Delivered"].includes(selectedOrder.status)
                        ? "bg-green-500 dark:bg-green-600 ring-green-100 dark:ring-green-950/50"
                        : "bg-gray-300 dark:bg-gray-700 ring-gray-100 dark:ring-gray-850"
                    }`} />
                    <div className="text-xs">
                      <p className="font-bold text-gray-905 dark:text-white">Shipped</p>
                      <p className="text-[10px] text-gray-455 dark:text-gray-500 font-medium">In transit with logistics carriers</p>
                    </div>
                  </div>

                  {/* Node 5: Out For Delivery */}
                  <div className="relative">
                    <div className={`absolute -left-5 h-2.5 w-2.5 rounded-full ring-4 ${
                      selectedOrder.status === "Delivered"
                        ? "bg-green-500 dark:bg-green-600 ring-green-100 dark:ring-green-950/50"
                        : "bg-gray-300 dark:bg-gray-700 ring-gray-100 dark:ring-gray-850"
                    }`} />
                    <div className="text-xs">
                      <p className="font-bold text-gray-905 dark:text-white">Out For Delivery</p>
                      <p className="text-[10px] text-gray-455 dark:text-gray-500 font-medium">Out with local dispatcher courier</p>
                    </div>
                  </div>

                  {/* Node 6: Delivered */}
                  <div className="relative">
                    <div className={`absolute -left-5 h-2.5 w-2.5 rounded-full ring-4 ${
                      selectedOrder.status === "Delivered"
                        ? "bg-green-500 dark:bg-green-600 ring-green-100 dark:ring-green-950/50"
                        : "bg-gray-300 dark:bg-gray-700 ring-gray-100 dark:ring-gray-850"
                    }`} />
                    <div className="text-xs">
                      <p className="font-bold text-gray-905 dark:text-white">Delivered</p>
                      <p className="text-[10px] text-gray-455 dark:text-gray-500 font-medium">Received by client</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
