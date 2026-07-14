"use client"

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock JSON Data for charts
const revenueData = [
  { name: "Jan", Revenue: 4000, Expenses: 2400 },
  { name: "Feb", Revenue: 5000, Expenses: 2800 },
  { name: "Mar", Revenue: 6200, Expenses: 3100 },
  { name: "Apr", Revenue: 5800, Expenses: 2900 },
  { name: "May", Revenue: 7500, Expenses: 4000 },
  { name: "Jun", Revenue: 9000, Expenses: 4800 },
];

const salesData = [
  { name: "Mon", Sales: 12 },
  { name: "Tue", Sales: 19 },
  { name: "Wed", Sales: 15 },
  { name: "Thu", Sales: 25 },
  { name: "Fri", Sales: 32 },
  { name: "Sat", Sales: 45 },
  { name: "Sun", Sales: 38 },
];

const ordersTrendData = [
  { name: "Jun 10", Orders: 5 },
  { name: "Jun 11", Orders: 8 },
  { name: "Jun 12", Orders: 12 },
  { name: "Jun 13", Orders: 10 },
  { name: "Jun 14", Orders: 15 },
  { name: "Jun 15", Orders: 22 },
  { name: "Jun 16", Orders: 30 },
];

interface DashboardChartsProps {
  revenueData?: any[];
  salesData?: any[];
  ordersTrendData?: any[];
}

export function DashboardCharts({
  revenueData: propRevenueData,
  salesData: propSalesData,
  ordersTrendData: propOrdersTrendData,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const revenueChartData = propRevenueData || revenueData;
  const salesChartData = propSalesData || salesData;
  const ordersChartData = propOrdersTrendData || ordersTrendData;

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-[350px] w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-[350px] w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-[350px] w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Revenue Overview (Line Chart) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
          <CardDescription>Monthly income vs expenditure flow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  formatter={(value) => [`$${value}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="Revenue" stroke="#16A34A" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Expenses" stroke="#4ADE80" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Analytics (Bar Chart) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Sales Analytics</CardTitle>
          <CardDescription>Weekly sales volume per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="Sales" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Orders Trend (Area Chart) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Orders Trend</CardTitle>
          <CardDescription>Transaction counts progression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ordersChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Area type="monotone" dataKey="Orders" stroke="#16A34A" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
