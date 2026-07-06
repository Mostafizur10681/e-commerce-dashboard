"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  X,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types based on backend OrderResource
interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: string;
  product?: {
    id: number;
    name: string;
    image_path?: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  total: string;
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

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Data Fetching States
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 15;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/orders?page=${currentPage}&per_page=${limit}`;
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      
      // The Laravel success wrapper makes the actual array nested at data.data.data
      let fetchedOrders = data.data?.data || data.data || [];
      if (!Array.isArray(fetchedOrders)) {
        fetchedOrders = [];
      }

      // Client-side filtering if API doesn't support it directly
      if (statusFilter !== "All") {
        fetchedOrders = fetchedOrders.filter((o: Order) => o.status.toLowerCase() === statusFilter.toLowerCase());
      }
      if (searchTerm) {
        fetchedOrders = fetchedOrders.filter((o: Order) => 
          o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.customer_phone.includes(searchTerm)
        );
      }

      setOrders(fetchedOrders);
      setTotalPages(data.data?.meta?.last_page || data.meta?.last_page || 1);
      setTotalOrders(data.data?.meta?.total || data.meta?.total || fetchedOrders.length);
    } catch (err) {
      console.error(err);
      toast("Error loading orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchOrders();
    }
  }, [mounted, currentPage]);

  // Handle re-fetch on filter change without relying on API search if it's client side
  useEffect(() => {
      if (mounted) fetchOrders();
  }, [searchTerm, statusFilter]);


  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      toast(`Order status updated to ${newStatus}`, "success");
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      fetchOrders();
    } catch(err) {
      toast("Failed to update order status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-955 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Loading Orders...</span>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-transparent font-bold">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-transparent font-bold">Processing</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-transparent font-bold">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent font-bold">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Orders" }]} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-500" />
              Order Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Manage customer orders and their statuses.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order number, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-650">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-full md:w-48 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 text-sm outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-905 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
             <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
             <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
             <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 text-green-500 mb-4 border border-transparent dark:border-slate-700">
              <Package className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold mb-1">No Orders Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">No orders match your current filters or there are no orders in the system.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="py-4 pl-6 font-semibold">Order ID</TableHead>
                    <TableHead className="py-4 font-semibold">Customer</TableHead>
                    <TableHead className="py-4 font-semibold">Date</TableHead>
                    <TableHead className="py-4 font-semibold text-center">Total</TableHead>
                    <TableHead className="py-4 font-semibold">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60">
                      <TableCell className="py-4 pl-6 font-bold text-gray-600 dark:text-slate-400 text-sm">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600 dark:text-slate-300">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 text-center font-bold text-sm">
                        ৳{Number(order.total).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6 space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
                          title="View Order Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
                          className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                          title="Edit Order"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
