"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  X,
  Loader2,
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
  Phone,
  MessageSquare,
  FileText,
  CheckCircle2,
  User,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mutate } from "swr";

import { ContactMessage } from "@/types";
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

const editMessageSchema = z.object({
  status: z.enum(["Unread", "Read", "Replied"]),
  adminNote: z.string().optional().or(z.literal("")),
});

type EditMessageFormValues = z.infer<typeof editMessageSchema>;

export default function MessagesPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Data Fetching & Filters States
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortFilter, setSortFilter] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [limit] = useState(10);

  // Statistics State
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    today: 0,
  });

  // Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ContactMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);
  const [quickViewMessage, setQuickViewMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch messages from API
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const url = `/api/messages?q=${encodeURIComponent(
        searchTerm
      )}&status=${statusFilter}&date=${dateFilter}&sort=${sortFilter}&page=${currentPage}&limit=${limit}`;
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalMessages(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
      toast("Error loading messages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchMessages();
    }
  }, [mounted, searchTerm, statusFilter, dateFilter, sortFilter, currentPage]);

  const form = useForm<EditMessageFormValues>({
    resolver: zodResolver(editMessageSchema),
    defaultValues: {
      status: "Unread",
      adminNote: "",
    },
  });

  // Handle Edit Open State
  useEffect(() => {
    if (editingMessage) {
      form.reset({
        status: editingMessage.status as any,
        adminNote: editingMessage.adminNote || "",
      });
    }
  }, [editingMessage, isEditOpen, form]);

  const handleOpenQuickView = async (msg: ContactMessage) => {
    setQuickViewMessage(msg);
    if (msg.status === "Unread") {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`/api/messages/${msg.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ status: "Read" }),
        });
        if (res.ok) {
          // Refresh list and notify SWR dropdown layout to update
          fetchMessages();
          mutate("/api/messages?limit=5");
        }
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
  };

  useEffect(() => {
    const checkQueryParam = async () => {
      if (!mounted) return;
      const params = new URLSearchParams(window.location.search);
      const msgId = params.get("id");
      if (msgId) {
        const found = messages.find((m) => m.id === msgId);
        if (found) {
          handleOpenQuickView(found);
          const newUrl = window.location.pathname;
          window.history.replaceState({ path: newUrl }, "", newUrl);
        } else if (messages.length > 0) {
          try {
            const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const res = await fetch(`/api/messages/${msgId}`, { headers });
            if (res.ok) {
              const msg = await res.json();
              handleOpenQuickView(msg);
              const newUrl = window.location.pathname;
              window.history.replaceState({ path: newUrl }, "", newUrl);
            }
          } catch (e) {
            console.error("Error fetching message from query param:", e);
          }
        }
      }
    };
    checkQueryParam();
  }, [mounted, messages]);

  const onSubmit = async (values: EditMessageFormValues) => {
    if (!editingMessage) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/messages/${editingMessage.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update message");
      
      toast("Message updated successfully", "success");
      setIsEditOpen(false);
      setEditingMessage(null);
      fetchMessages();
      mutate("/api/messages?limit=5");
    } catch (err) {
      console.error(err);
      toast("Failed to update message details", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMessage) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/messages/${deletingMessage.id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Failed to delete message");
      
      toast("Message deleted successfully", "success");
      setDeletingMessage(null);
      // Adjust page if deleting last item
      if (messages.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchMessages();
      }
      mutate("/api/messages?limit=5");
    } catch (err) {
      console.error(err);
      toast("Failed to delete message", "error");
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
    if (messages.length === 0) {
      toast("No messages to export", "error");
      return;
    }

    const csvContent = [
      ["Message ID", "Customer Name", "Email Address", "Phone Number", "Subject", "Message Details", "Status", "Admin Notes", "Submitted Date"],
      ...messages.map((m) => [
        m.id,
        m.name,
        m.email,
        m.phone || "",
        m.subject,
        m.message,
        m.status,
        m.adminNote || "",
        m.createdAt || ""
      ])
    ]
      .map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `messages_export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Messages exported successfully", "success");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Unread":
      case "unread":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Read":
      case "read":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Replied":
      case "replied":
        return "bg-purple-100 text-purple-750 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400";
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins} min ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
      return new Date(isoString).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return isoString;
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-955 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Loading Messages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header section with Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Messages" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-500" />
              Messages
            </h1>
            <p className="text-sm text-gray-505 dark:text-slate-400">
              Manage customer inquiries and contact requests
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-10 rounded-xl px-4 flex items-center gap-2 font-medium cursor-pointer border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors duration-200 shadow-sm"
            >
              <Download className="h-4.5 w-4.5" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Messages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-green-600 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Total Messages
            </p>
            <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 flex items-center justify-center">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.total}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            Cumulative received inquiries
          </p>
        </div>

        {/* Unread Messages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-blue-500 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Unread Messages
            </p>
            <div className="h-8 w-8 rounded-lg bg-blue-550/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mail className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.unread}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            Pending response
          </p>
        </div>

        {/* Read Messages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-green-500 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Read Messages
            </p>
            <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.read}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            Inquiries already reviewed
          </p>
        </div>

        {/* Today's Messages */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-l-4 border-l-amber-500 border-y border-r border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none p-5 transition-all duration-200">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Today's Messages
            </p>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight mt-3">{stats.today}</div>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-1.5 font-medium">
            Received today
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
              placeholder="Search by customer name, email, or subject..."
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
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
              <option value="Replied">Replied</option>
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
            </select>

            {/* Reset Filters button */}
            {(searchTerm || statusFilter !== "All" || dateFilter !== "All Time" || sortFilter !== "newest") && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="h-10 rounded-xl px-3 flex items-center gap-1.5 text-xs text-gray-505 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors border border-dashed border-gray-300 dark:border-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Data Table Wrapper Card */}
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
                <div className="h-10 bg-gray-100 dark:bg-slate-805/60 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-805 text-green-550 mb-4 border border-transparent dark:border-slate-700">
              <Mail className="h-8 w-8 text-green-555" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-101 mb-1">No Messages Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              When users submit contact inquiries, they will appear here in chronological order.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-4 pl-6 font-semibold text-gray-900 dark:text-slate-100">Customer Name</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-105">Email Address</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-105">Subject</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-105">Message Preview</TableHead>
                    <TableHead className="w-[120px] py-4 font-semibold text-gray-900 dark:text-slate-105">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-105">Date</TableHead>
                    <TableHead className="w-[150px] text-right pr-6 py-4 font-semibold text-gray-900 dark:text-slate-105">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => {
                    const isUnread = msg.status === "Unread";
                    return (
                      <TableRow
                        key={msg.id}
                        className={`border-b border-gray-200 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800/60 transition-all duration-200 ${isUnread ? "bg-blue-50/10 dark:bg-blue-950/5" : ""}`}
                      >
                        <TableCell className="py-4 pl-6 font-semibold text-gray-900 dark:text-slate-100 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-xs flex items-center justify-center border border-green-100/50 dark:border-green-900/30 shadow-xs">
                              {msg.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className={isUnread ? "font-extrabold" : "font-semibold"}>{msg.name}</span>
                              <span className="text-xs text-gray-400 dark:text-slate-500 block md:hidden xl:block">{msg.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-gray-600 dark:text-slate-300 text-sm font-medium">
                          {msg.email}
                        </TableCell>
                        <TableCell className={`py-4 text-sm ${isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-slate-350"}`}>
                          {msg.subject}
                        </TableCell>
                        <TableCell className="py-4 text-gray-500 dark:text-slate-400 text-xs max-w-xs truncate">
                          {msg.message.length > 60 ? `${msg.message.substring(0, 60)}...` : msg.message}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${getStatusBadgeColor(msg.status)}`}>
                            {msg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-gray-505 dark:text-slate-400 text-xs font-mono">
                          <div className="flex items-center gap-1.5" title={msg.createdAt}>
                            <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-slate-550" />
                            {getRelativeTime(msg.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenQuickView(msg)}
                              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
                              title="Quick View Details"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingMessage(msg);
                                setIsEditOpen(true);
                              }}
                              className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 cursor-pointer"
                              title="Edit/Annotate Message"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingMessage(msg)}
                              className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200 cursor-pointer"
                              title="Delete Message"
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

            {/* Mobile View Card Grid Layout */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {messages.map((msg) => {
                const isUnread = msg.status === "Unread";
                return (
                  <div key={msg.id} className={`p-4 space-y-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200 ${isUnread ? "bg-blue-50/5 dark:bg-blue-950/5" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-xs flex items-center justify-center border border-green-100/50">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className={`text-sm text-gray-900 dark:text-slate-100 ${isUnread ? "font-extrabold" : "font-semibold"}`}>{msg.name}</h4>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 block font-mono mt-0.5">{msg.id.toUpperCase()}</span>
                        </div>
                      </div>
                      <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-bold border-transparent ${getStatusBadgeColor(msg.status)}`}>
                        {msg.status}
                      </Badge>
                    </div>

                    <div className="p-3 bg-gray-50/50 dark:bg-slate-950/30 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" /> {msg.email}</p>
                      {msg.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" /> {msg.phone}</p>}
                      <p className={`font-semibold ${isUnread ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-slate-300"}`}>Subject: {msg.subject}</p>
                      <p className="italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-100 dark:border-slate-800 mt-1 max-h-16 overflow-y-auto">
                        {msg.message}
                      </p>
                      <div className="flex justify-between pt-1 font-mono text-[10px] border-t border-gray-100 dark:border-slate-800 mt-1">
                        <span>Date: {getRelativeTime(msg.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenQuickView(msg)}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-205 transition-colors duration-200"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingMessage(msg);
                          setIsEditOpen(true);
                        }}
                        className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-405 dark:hover:text-green-300 transition-colors duration-200"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingMessage(msg)}
                        className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-750 dark:text-red-405 dark:hover:text-red-550 transition-colors duration-200"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls at Bottom */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Showing Page <span className="font-bold text-gray-900 dark:text-slate-100">{currentPage}</span> of{" "}
                  <span className="font-bold text-gray-900 dark:text-slate-105">{totalPages}</span> ({totalMessages} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-205 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-205 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Quick View Modal */}
      <Dialog open={!!quickViewMessage} onOpenChange={(open) => !open && setQuickViewMessage(null)}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200 max-h-[90vh] overflow-y-auto">
          {quickViewMessage && (
            <div className="space-y-5 text-sm">
              <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-base flex items-center justify-center border border-green-100/50">
                    {quickViewMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105">
                      {quickViewMessage.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Customer Inquiry details
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-505 dark:text-slate-400">Message ID:</span>
                  <span className="font-mono font-bold text-gray-905 dark:text-slate-100 text-xs">{quickViewMessage.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-505 dark:text-slate-400 flex items-center gap-1"><Mail className="h-4 w-4 text-gray-400" /> Email:</span>
                  <span className="font-semibold text-gray-905 dark:text-slate-100">{quickViewMessage.email}</span>
                </div>
                {quickViewMessage.phone && (
                  <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                    <span className="text-gray-505 dark:text-slate-400 flex items-center gap-1"><Phone className="h-4 w-4 text-gray-400" /> Phone:</span>
                    <span className="font-semibold text-gray-905 dark:text-slate-100 font-mono text-xs">{quickViewMessage.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-550 dark:text-slate-400 flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-400" /> Received Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100" title={quickViewMessage.createdAt}>
                    {new Date(quickViewMessage.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800/50 pb-2">
                  <span className="text-gray-550 dark:text-slate-400">Status:</span>
                  <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${getStatusBadgeColor(quickViewMessage.status)}`}>
                    {quickViewMessage.status}
                  </Badge>
                </div>
                
                <div className="pb-1 pt-2 space-y-1">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">Subject:</span>
                  <p className="font-bold text-gray-900 dark:text-slate-100 text-sm leading-snug">
                    {quickViewMessage.subject}
                  </p>
                </div>

                <div className="pb-1 pt-1 space-y-1">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">Message Details:</span>
                  <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl text-xs text-gray-800 dark:text-slate-300 border border-gray-150 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                    {quickViewMessage.message}
                  </div>
                </div>

                {quickViewMessage.adminNote && (
                  <div className="pb-1 pt-2 space-y-1">
                    <span className="text-gray-500 dark:text-slate-455 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider"><FileText className="h-3.5 w-3.5 text-gray-400" /> Admin Notes:</span>
                    <p className="bg-amber-50/30 dark:bg-amber-950/10 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 border border-amber-100/50 dark:border-amber-900/20 italic leading-relaxed">
                      {quickViewMessage.adminNote}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <Button
                  onClick={() => setQuickViewMessage(null)}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl px-5 h-9.5 text-xs font-semibold cursor-pointer"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200">
          <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105">
              Edit Message Annotations
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-550 dark:text-slate-400 mt-1">
              Update the inquiry status or add internal admin notes below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Message Status</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="Unread">Unread</option>
                        <option value="Read">Read</option>
                        <option value="Replied">Replied</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin Note */}
              <FormField
                control={form.control}
                name="adminNote"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Admin Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add annotations, follow-up remarks, or reply details..."
                        {...field}
                        className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500 min-h-[100px] text-sm"
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
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl h-10 px-5 cursor-pointer border-gray-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold cursor-pointer shadow-sm dark:border-none"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingMessage} onOpenChange={(open) => !open && setDeletingMessage(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105 flex items-center gap-2">
              <AlertCircle className="h-5.5 w-5.5 text-red-500" />
              Delete Message
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              Are you sure you want to delete this message? This action cannot be undone. This will permanently delete the inquiry from{" "}
              <strong className="text-gray-900 dark:text-slate-100 font-bold">&quot;{deletingMessage?.name}&quot;</strong>.
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
