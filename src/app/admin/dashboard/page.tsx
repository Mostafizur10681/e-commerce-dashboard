"use client"

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, FolderHeart, Users, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";

import { useStore } from "@/store";
import { StatsCard } from "@/components/admin/StatsCard";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { Button, buttonVariants } from "@/components/ui/button";
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

export default function DashboardPage() {
  const { orders, products, customers } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const totalCustomersCount = customers.length;

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50" variant="outline">Delivered</Badge>;
      case "Shipped":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-50" variant="outline">Shipped</Badge>;
      case "Processing":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-50" variant="outline">Processing</Badge>;
      case "Pending":
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-50" variant="outline">Pending</Badge>;
      case "Cancelled":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 hover:bg-rose-50" variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Mock Top Products
  const topProducts = [
    {
      name: "iPhone 15 Pro Max",
      revenue: "$47,960",
      salesCount: 40,
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%236366f1'/></svg>",
    },
    {
      name: "Wireless ANC Headphones",
      revenue: "$27,920",
      salesCount: 80,
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%233b82f6'/></svg>",
    },
    {
      name: "Ergonomic Office Chair",
      revenue: "$7,485",
      salesCount: 15,
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2310b981'/></svg>",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">E-commerce Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here is a summary of your store performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 gap-1.5 p-2 font-semibold">
            <TrendingUp className="h-4 w-4" /> Live Tracking
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: "+14.2%", isPositive: true }}
          description="from previous month"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrdersCount}
          icon={ShoppingBag}
          trend={{ value: "+8.4%", isPositive: true }}
          description="from previous month"
        />
        <StatsCard
          title="Total Products"
          value={totalProductsCount}
          icon={FolderHeart}
          description="items currently active"
        />
        <StatsCard
          title="Total Customers"
          value={totalCustomersCount}
          icon={Users}
          trend={{ value: "+21.1%", isPositive: true }}
          description="new registrants this week"
        />
      </div>

      {/* Charts Grid */}
      <DashboardCharts />

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
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1"
              )}
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
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
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold text-gray-900 dark:text-white pl-6">
                      #{order.id}
                    </TableCell>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell className="font-semibold">${order.amount}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right pr-6 text-gray-500 dark:text-gray-400 text-xs font-mono">
                      {order.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products Cards */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
            <CardDescription>Products generating highest revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-3 py-1.5 border-b border-gray-150 dark:border-gray-800 last:border-0 last:pb-0">
                <div
                  className="h-10 w-10 rounded-lg overflow-hidden shrink-0"
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
