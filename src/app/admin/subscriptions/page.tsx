"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  X,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  FileText,
  CheckCircle2,
  UserX,
  RotateCcw
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Subscription } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const subscriberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  status: z.enum(["Active", "Subscribed", "Unsubscribed", "Pending"]),
  source: z.enum(["Website", "Checkout", "Newsletter Popup", "Manual"]),
  notes: z.string().optional().or(z.literal("")),
});

type SubscriberFormValues = z.infer<typeof subscriberSchema>;

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Data Fetching & Filters States
  const [subscribers, setSubscribers] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortFilter, setSortFilter] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [limit] = useState(10);

  // Statistics State
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    newThisMonth: 0,
  });

  // Selection & Modals States
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscription | null>(null);
  const [deletingSubscriber, setDeletingSubscriber] = useState<Subscription | null>(null);
  const [quickViewSubscriber, setQuickViewSubscriber] = useState<Subscription | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch subscribers from API
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const url = `/api/subscriptions?q=${encodeURIComponent(
        searchTerm
      )}&status=${statusFilter}&date=${dateFilter}&sort=${sortFilter}&page=${currentPage}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      const data = await res.json();
      setSubscribers(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalSubscribers(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
      toast("Error loading subscribers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchSubscribers();
    }
  }, [mounted, searchTerm, statusFilter, dateFilter, sortFilter, currentPage]);

  const form = useForm<SubscriberFormValues>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "Subscribed",
      source: "Manual",
      notes: "",
    },
  });

  // Handle Form open for Edit vs Add
  useEffect(() => {
    if (editingSubscriber) {
      form.reset({
        name: editingSubscriber.name,
        email: editingSubscriber.email,
        status: editingSubscriber.status as any,
        source: editingSubscriber.source as any,
        notes: editingSubscriber.notes || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        status: "Subscribed",
        source: "Manual",
        notes: "",
      });
    }
  }, [editingSubscriber, isFormOpen, form]);

  const onSubmit = async (values: SubscriberFormValues) => {
    try {
      if (editingSubscriber) {
        const res = await fetch(`/api/subscriptions/${editingSubscriber.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Failed to update subscriber");
        toast("Subscriber profile updated successfully", "success");
      } else {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("Failed to create subscriber");
        toast("New subscriber added successfully", "success");
      }
      setIsFormOpen(false);
      setEditingSubscriber(null);
      fetchSubscribers();
    } catch (err) {
      console.error(err);
      toast("Failed to save subscriber details", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubscriber) return;
    try {
      const res = await fetch(`/api/subscriptions/${deletingSubscriber.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete subscriber");
      toast("Subscriber profile deleted successfully", "success");
      setDeletingSubscriber(null);
      // Adjust page if deleting last item
      if (subscribers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchSubscribers();
      }
    } catch (err) {
      console.error(err);
      toast("Failed to delete subscriber", "error");
    }
  };

  const handleBulkSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubscribers(subscribers.map((s) => s.id));
    } else {
      setSelectedSubscribers([]);
    }
  };

  const handleBulkSelectRow = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedSubscribers((prev) => [...prev, id]);
    } else {
      setSelectedSubscribers((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDateFilter("All Time");
    setSortFilter("newest");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast("No subscriber records to export", "error");
      return;
    }

    const csvContent = [
      ["Subscriber ID", "Name", "Email", "Subscription Date", "Status", "Source", "Last Activity", "Notes"],
      ...subscribers.map((s) => [
        s.id,
        s.name,
        s.email,
        s.subscriptionDate || "",
        s.status,
        s.source,
        s.lastActivity || "",
        s.notes || ""
      ])
    ]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Subscribers list exported successfully", "success");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Subscribed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Unsubscribed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400";
      case "Pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400";
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-955 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Loading Directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header section with Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Marketing" },
            { label: "Subscriptions" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600 dark:text-green-500" />
              Subscriptions
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Manage newsletter and marketing subscribers
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-10 rounded-xl px-4 flex items-center gap-2 font-medium cursor-pointer border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors duration-200 shadow-sm dark:shadow-none"
            >
              <Download className="h-4.5 w-4.5" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingSubscriber(null);
                setIsFormOpen(true);
              }}
              className="bg-green-650 hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer focus:ring-2 focus:ring-green-500 dark:bg-green-505 dark:hover:bg-green-600 dark:border-none"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Subscriber
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Subscribers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-green-600 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Total Subscribers
            </p>
            <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 flex items-center justify-center">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.total}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            All registered profiles
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Active Subscribers
            </p>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.active}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            Subscribed and Active status
          </p>
        </div>

        {/* Unsubscribed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-red-500 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Unsubscribed
            </p>
            <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 flex items-center justify-center">
              <UserX className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.unsubscribed}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            Opted out of marketing
          </p>
        </div>

        {/* New This Month */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-amber-500 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              New This Month
            </p>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.newThisMonth}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            Joined in {new Date().toLocaleString("default", { month: "long" })}
          </p>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800 p-4 transition-all duration-200 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder="Search subscribers by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-650 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status select filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full sm:w-44 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer transition-colors duration-200"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Subscribed">Subscribed</option>
              <option value="Unsubscribed">Unsubscribed</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Date select filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full sm:w-44 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer transition-colors duration-200"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>

            {/* Sort select filter */}
            <select
              value={sortFilter}
              onChange={(e) => {
                setSortFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full sm:w-44 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer transition-colors duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="last_activity">Last Active</option>
            </select>

            {/* Reset Filters button */}
            {(searchTerm || statusFilter !== "All" || dateFilter !== "All Time" || sortFilter !== "newest") && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="h-10 rounded-xl px-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors border border-dashed border-gray-300 dark:border-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subscriptions Data Table Wrapper Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden transition-all duration-200">
        {loading ? (
          /* Loading Skeleton State */
          <div className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-gray-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 animate-pulse rounded" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse col-span-2" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 text-green-500 mb-4 border border-transparent dark:border-slate-700">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">No Subscribers Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Create subscriber profiles to monitor and manage user newsletter subscriptions.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold shadow-sm transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={() => {
                setEditingSubscriber(null);
                setIsFormOpen(true);
              }}
            >
              Add First Subscriber
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop View Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] pl-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.length === subscribers.length}
                        onChange={(e) => handleBulkSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-green-605 dark:text-green-500 focus:ring-green-500 cursor-pointer"
                      />
                    </TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100">Subscriber</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-105">Email Address</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-105">Subscription Date</TableHead>
                    <TableHead className="w-[120px] py-4 font-semibold text-gray-900 dark:text-slate-105">Status</TableHead>
                    <TableHead className="w-[130px] py-4 font-semibold text-gray-900 dark:text-slate-105">Source</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-105">Last Activity</TableHead>
                    <TableHead className="w-[150px] text-right pr-6 py-4 font-semibold text-gray-900 dark:text-slate-105">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="border-b border-gray-205 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800/60 transition-all duration-200"
                    >
                      <TableCell className="pl-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(sub.id)}
                          onChange={(e) => handleBulkSelectRow(e.target.checked, sub.id)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-green-600 dark:text-green-500 focus:ring-green-500 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-gray-900 dark:text-slate-100 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-xs flex items-center justify-center border border-green-100/50 dark:border-green-900/30 shadow-xs">
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-slate-100">{sub.name}</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500 block md:hidden xl:block">{sub.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-gray-600 dark:text-slate-300 text-sm font-medium">
                        {sub.email}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500 dark:text-slate-400 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                          {sub.subscriptionDate}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${getStatusBadgeColor(sub.status)}`}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-gray-650 dark:text-slate-350 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                          {sub.source}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-gray-500 dark:text-slate-400 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                          {sub.lastActivity}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuickViewSubscriber(sub)}
                            className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
                            title="Quick View Details"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSubscriber(sub);
                              setIsFormOpen(true);
                            }}
                            className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 cursor-pointer"
                            title="Edit Subscriber"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingSubscriber(sub)}
                            className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200 cursor-pointer"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View Card Grid Layout */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {subscribers.map((sub) => (
                <div key={sub.id} className="p-4 space-y-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-xs flex items-center justify-center border border-green-100/50">
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{sub.name}</h4>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 block font-mono mt-0.5">{sub.id.toUpperCase()}</span>
                      </div>
                    </div>
                    <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-bold border-transparent ${getStatusBadgeColor(sub.status)}`}>
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="p-3 bg-gray-50/50 dark:bg-slate-955/30 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2 text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                    <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" /> {sub.email}</p>
                    <p className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" /> Source: {sub.source}</p>
                    <div className="flex justify-between pt-1 font-semibold text-gray-900 dark:text-slate-200 border-t border-gray-100 dark:border-slate-800 mt-1 font-mono text-[10px]">
                      <span>Subbed: {sub.subscriptionDate}</span>
                      <span>Active: {sub.lastActivity}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800 font-medium">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuickViewSubscriber(sub)}
                      className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer transition-colors duration-200"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSubscriber(sub);
                        setIsFormOpen(true);
                      }}
                      className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-450 dark:hover:text-green-300 cursor-pointer transition-colors duration-200"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingSubscriber(sub)}
                      className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-750 dark:text-red-450 dark:hover:text-red-500 cursor-pointer transition-colors duration-200"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls at Bottom */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Showing Page <span className="font-bold text-gray-900 dark:text-slate-100">{currentPage}</span> of{" "}
                  <span className="font-bold text-gray-900 dark:text-slate-105">{totalPages}</span> ({totalSubscribers} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-205 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-205 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Subscriber Quick View Modal */}
      <Dialog open={!!quickViewSubscriber} onOpenChange={(open) => !open && setQuickViewSubscriber(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200 max-h-[90vh] overflow-y-auto">
          {quickViewSubscriber && (
            <div className="space-y-5 text-sm">
              <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-base flex items-center justify-center border border-green-100/50">
                    {quickViewSubscriber.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105">
                      {quickViewSubscriber.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-505 dark:text-slate-400 mt-0.5">
                      Subscriber Profile Details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-500 dark:text-slate-400">Subscriber ID:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-slate-100 text-xs">{quickViewSubscriber.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Mail className="h-4 w-4 text-gray-400" /> Email:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{quickViewSubscriber.email}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Globe className="h-4 w-4 text-gray-400" /> Signup Source:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{quickViewSubscriber.source}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-400" /> Subscription Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{quickViewSubscriber.subscriptionDate}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Clock className="h-4 w-4 text-gray-400" /> Last Activity Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100 font-mono text-xs">{quickViewSubscriber.lastActivity}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-500 dark:text-slate-400">Subscription Status:</span>
                  <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${getStatusBadgeColor(quickViewSubscriber.status)}`}>
                    {quickViewSubscriber.status}
                  </Badge>
                </div>
                {quickViewSubscriber.notes && (
                  <div className="border-b border-gray-50 dark:border-slate-800/50 pb-3 pt-1 space-y-1">
                    <span className="text-gray-505 dark:text-slate-400 flex items-center gap-1.5"><FileText className="h-4 w-4 text-gray-400" /> Notes:</span>
                    <p className="bg-gray-50 dark:bg-slate-950 p-2.5 rounded-xl text-xs text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800 italic leading-relaxed">
                      {quickViewSubscriber.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Activity History Timeline */}
              {quickViewSubscriber.activityHistory && quickViewSubscriber.activityHistory.length > 0 && (
                <div className="space-y-3 pt-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    Activity History
                  </h4>
                  <div className="relative pl-4 border-l border-gray-200 dark:border-slate-800 space-y-4 ml-1">
                    {quickViewSubscriber.activityHistory.map((act, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-green-600 border-2 border-white dark:border-slate-900" />
                        <div className="text-xs">
                          <span className="font-mono text-gray-405 dark:text-slate-500 mr-2 font-bold">{act.date}</span>
                          <span className="text-gray-700 dark:text-slate-200 font-semibold">{act.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <Button
                  onClick={() => setQuickViewSubscriber(null)}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl px-5 h-9.5 text-xs font-semibold cursor-pointer"
                >
                  Close Profile
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Subscriber Form Dialog (Add vs Edit) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200">
          <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105">
              {editingSubscriber ? "Edit Subscriber Profile" : "Add Subscriber"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Provide the subscriber details below. Click save when complete.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Subscriber Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Diana Prince"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="diana@paradiseisland.gov"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Subscription Status</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Subscribed">Subscribed</option>
                        <option value="Unsubscribed">Unsubscribed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Signup Source</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="Website">Website</option>
                        <option value="Checkout">Checkout</option>
                        <option value="Newsletter Popup">Newsletter Popup</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Notes / Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add details or context for this subscriber..."
                        {...field}
                        className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500 min-h-[80px] text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6 gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl h-10 px-5 cursor-pointer border-gray-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold cursor-pointer shadow-sm dark:border-none"
                >
                  {editingSubscriber ? "Save" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingSubscriber} onOpenChange={(open) => !open && setDeletingSubscriber(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105 flex items-center gap-2">
              <AlertCircle className="h-5.5 w-5.5 text-red-500" />
              Delete Subscriber
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete this subscriber? This action cannot be undone. This will permanently delete the subscriber profile for{" "}
              <strong className="text-gray-900 dark:text-slate-100 font-bold">&quot;{deletingSubscriber?.name}&quot;</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl h-10 px-5 border-gray-350 dark:border-slate-700 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-750 text-white rounded-xl h-10 px-6 font-semibold cursor-pointer border-transparent shadow-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
