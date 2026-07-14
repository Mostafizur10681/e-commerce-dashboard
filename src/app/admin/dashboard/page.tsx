"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, FolderHeart, Users, ArrowUpRight, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";

import { StatsCard } from "@/components/admin/StatsCard";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

interface DashboardData {
  stats: {
    total_revenue: number;
    total_orders: number;
    total_products: number;
    total_customers: number;
  };
  recent_orders: Array<{
    id: number;
    order_number: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: string;
    date: string;
  }>;
  top_products: Array<{
    name: string;
    revenue: string;
    salesCount: number;
    image: string;
  }>;
  charts: {
    revenue_data: any[];
    sales_data: any[];
    orders_trend_data: any[];
  };
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch("/api/dashboard", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to load dashboard statistics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchDashboardData();
    }
  }, [mounted]);

  if (!mounted || loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <h1 className="text-2xl font-bold tracking-tight">Loading Dashboard Metrics...</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-gray-150 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-[350px] w-full animate-pulse rounded-2xl bg-gray-150 dark:bg-slate-800" />
      </div>
    );
  }

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "delivered":
      case "completed":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50" variant="outline">Delivered</Badge>;
      case "shipped":
      case "packed":
      case "out-for-delivery":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-50" variant="outline">{status}</Badge>;
      case "processing":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-50" variant="outline">Processing</Badge>;
      case "pending":
      case "order placed":
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-50" variant="outline">{status}</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 hover:bg-rose-50" variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">E-commerce Dashboard</h1>
          <p className="text-sm text-slate-505 dark:text-slate-400">
            Welcome back! Here is a summary of your store performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800 gap-1.5 p-2 font-semibold">
            <TrendingUp className="h-4 w-4" /> Live Tracking
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`৳${data.stats.total_revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "+14.2%", isPositive: true }}
          description="from previous month"
        />
        <StatsCard
          title="Total Orders"
          value={data.stats.total_orders}
          icon={ShoppingBag}
          trend={{ value: "+8.4%", isPositive: true }}
          description="from previous month"
        />
        <StatsCard
          title="Total Products"
          value={data.stats.total_products}
          icon={FolderHeart}
          description="items currently active"
        />
        <StatsCard
          title="Total Customers"
          value={data.stats.total_customers}
          icon={Users}
          trend={{ value: "+21.1%", isPositive: true }}
          description="new registrants this week"
        />
      </div>

      {/* Charts Grid */}
      <DashboardCharts
        revenueData={data.charts.revenue_data}
        salesData={data.charts.sales_data}
        ordersTrendData={data.charts.orders_trend_data}
      />

      {/* Bottom Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
              <CardDescription>Latest transactions recorded</CardDescription>
            </div>
            <Link
              href="/admin/orders"
              className={cn(
                "text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1"
              )}
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold text-gray-900 dark:text-white pl-6">
                        #{order.id}
                      </TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="font-semibold">৳{order.amount}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right pr-6 text-gray-500 dark:text-gray-400 text-xs font-mono">
                        {order.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Cards */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
            <CardDescription>Products generating highest revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.top_products.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No sales recorded yet.</div>
            ) : (
              data.top_products.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 py-1.5 border-b border-gray-150 dark:border-gray-800 last:border-0 last:pb-0">
                  <div
                    className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 flex items-center justify-center bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: product.image }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {product.salesCount} Sales
                    </p>
                  </div>
                  <div className="text-right font-bold text-sm text-primary dark:text-primary-400">
                    {product.revenue}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
