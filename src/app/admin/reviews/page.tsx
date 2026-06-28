"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Trash2,
  Check,
  X,
  Loader2,
  MessageSquare,
  AlertCircle,
  Search,
  Plus,
  Eye,
  Edit2,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Inbox,
  Clock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Review } from "@/types";
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

const reviewSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  productName: z.string().min(2, "Product name is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  status: z.enum(["Approved", "Pending", "Rejected"]),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ReviewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Data Fetching & Filter States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [limit] = useState(10);

  // Dialog & Selection States
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [quickViewReview, setQuickViewReview] = useState<Review | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Metrics Summary
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    pending: 0,
    approved: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch reviews from API
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/reviews?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&rating=${ratingFilter}&page=${currentPage}&limit=${limit}`;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
      setTotalReviews(data.total || 0);

      // Fetch summary from all reviews in JSON if possible
      const fullRes = await fetch(`/api/reviews?limit=1000`, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (fullRes.ok) {
        const fullData = await fullRes.json();
        const list: Review[] = fullData.reviews || [];
        const totalCount = list.length;
        const avg = totalCount > 0 ? parseFloat((list.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1)) : 0;
        const pendingCount = list.filter(r => r.status === "Pending").length;
        const approvedCount = list.filter(r => r.status === "Approved").length;
        setStats({ total: totalCount, average: avg, pending: pendingCount, approved: approvedCount });
      }
    } catch (err) {
      console.error(err);
      toast("Error loading reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchReviews();
    }
  }, [mounted, searchTerm, statusFilter, ratingFilter, currentPage]);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customerName: "",
      productName: "",
      rating: 5,
      comment: "",
      status: "Pending",
    },
  });

  // Handle Form open for Edit
  useEffect(() => {
    if (editingReview) {
      form.reset({
        customerName: editingReview.customerName,
        productName: editingReview.productName,
        rating: editingReview.rating,
        comment: editingReview.comment,
        status: editingReview.status || "Pending",
      });
    }
  }, [editingReview, isFormOpen, form]);

  const onSubmit = async (values: ReviewFormValues) => {
    if (!editingReview) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update review");
      toast("Review updated successfully", "success");
      setIsFormOpen(false);
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast("Failed to update review", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/reviews/${deletingReview.id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete review");
      toast("Review deleted successfully", "success");
      setDeletingReview(null);
      if (reviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
      toast("Failed to delete review", "error");
    }
  };

  const handleStatusChange = async (id: string, newStatus: "Approved" | "Rejected") => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast(`Review status set to ${newStatus}`, "success");
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast("Failed to update status", "error");
    }
  };

  const handleBulkSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(reviews.map((r) => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleBulkSelectRow = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, id]);
    } else {
      setSelectedReviews((prev) => prev.filter((item) => item !== id));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-slate-700"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 min-h-screen p-6 overflow-x-hidden bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header section with Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Reviews" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-505" />
              Reviews Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Moderate and manage customer testimonials and product feedback
            </p>
          </div>
          <Link
            href="/admin/reviews/add"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 px-5 flex items-center justify-center gap-2 font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer focus:ring-2 focus:ring-green-500"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Review
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Reviews */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Total Reviews</span>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Average Rating Summary Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-505 dark:text-slate-405 uppercase tracking-wider block">Average Rating</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.average}</span>
              <span className="text-xs text-yellow-500 font-bold">/ 5.0 ⭐</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 text-yellow-550 dark:text-yellow-405 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pending}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Approved Reviews */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Approved Reviews</span>
            <span className="text-2xl font-extrabold text-green-650 dark:text-green-400">{stats.approved}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center">
            <ThumbsUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 transition-all duration-200 space-y-4 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-6">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-405 dark:text-slate-500" />
            <Input
              placeholder="Search by reviewer, product, or keywords..."
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
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-650 dark:text-slate-500 dark:hover:text-slate-350"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status select filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 md:col-span-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer transition-colors duration-200"
          >
            <option value="All">All Moderation Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 md:col-span-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer transition-colors duration-200"
          >
            <option value="All">All Star Ratings</option>
            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
            <option value="4">4 Stars ⭐⭐⭐⭐</option>
            <option value="3">3 Stars ⭐⭐⭐</option>
            <option value="2">2 Stars ⭐⭐</option>
            <option value="1">1 Star ⭐</option>
          </select>
        </div>
      </div>

      {/* Reviews Table Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden transition-all duration-200">
        {loading ? (
          /* Loading Skeleton State */
          <div className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-gray-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 animate-pulse rounded" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse col-span-2" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 text-green-500 mb-4 border border-transparent dark:border-slate-700">
              <Inbox className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">No Reviews Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Create customer product review logs manually or wait for store orders.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold shadow-sm transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={() => router.push("/admin/reviews/add")}
            >
              Add First Review
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <Table className="min-w-[900px] w-full">
                <TableHeader className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] pl-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.length === reviews.length}
                        onChange={(e) => handleBulkSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-green-600 dark:text-green-505 focus:ring-green-500 cursor-pointer"
                      />
                    </TableHead>
                    <TableHead className="w-[100px] py-4 font-semibold text-gray-905 dark:text-slate-100">ID</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-905 dark:text-slate-105">Customer Name</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-905 dark:text-slate-105">Product Name</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-905 dark:text-slate-105">Rating</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-905 dark:text-slate-105 max-w-xs">Comment</TableHead>
                    <TableHead className="w-[120px] py-4 font-semibold text-gray-905 dark:text-slate-105">Status</TableHead>
                    <TableHead className="w-[130px] py-4 font-semibold text-gray-905 dark:text-slate-105">Created Date</TableHead>
                    <TableHead className="w-[180px] text-right pr-6 py-4 font-semibold text-gray-905 dark:text-slate-105">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => {
                    const statusClass =
                      review.status === "Approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : review.status === "Rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

                    return (
                      <TableRow
                        key={review.id}
                        className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800/60 transition-all duration-200"
                      >
                        <TableCell className="pl-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review.id)}
                            onChange={(e) => handleBulkSelectRow(e.target.checked, review.id)}
                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-green-600 dark:text-green-500 focus:ring-green-500 cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-bold text-gray-500 dark:text-slate-500 text-xs py-4">
                          {review.id.toUpperCase()}
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-gray-905 dark:text-slate-100 text-sm">
                          {review.customerName}
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-gray-600 dark:text-slate-350 text-sm">
                          {review.productName}
                        </TableCell>
                        <TableCell className="py-4">
                          {renderStars(review.rating)}
                        </TableCell>
                        <TableCell className="py-4 text-gray-500 dark:text-slate-400 text-sm max-w-xs truncate" title={review.comment}>
                          {review.comment}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${statusClass}`}>
                            {review.status || "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-gray-550 dark:text-slate-405 text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />
                            {review.date}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {review.status === "Pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStatusChange(review.id, "Approved")}
                                  className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-650 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 cursor-pointer"
                                  title="Approve Review"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStatusChange(review.id, "Rejected")}
                                  className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200 cursor-pointer"
                                  title="Reject Review"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setQuickViewReview(review)}
                              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
                              title="Quick View Comment"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingReview(review);
                                setIsFormOpen(true);
                              }}
                              className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 cursor-pointer"
                              title="Edit Review Details"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingReview(review)}
                              className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-705 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200 cursor-pointer"
                              title="Delete Review"
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

            {/* Mobile View Card Layout */}
            <div className="block lg:hidden divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {reviews.map((review) => {
                const statusClass =
                  review.status === "Approved"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : review.status === "Rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-705 dark:bg-amber-900/30 dark:text-amber-400";

                return (
                  <div key={review.id} className="p-4 space-y-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{review.customerName}</h4>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold block mt-0.5">{review.productName}</span>
                      </div>
                      <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-bold border-transparent ${statusClass}`}>
                        {review.status || "Pending"}
                      </Badge>
                    </div>

                    <div className="p-3 bg-gray-50/50 dark:bg-slate-950/30 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-450 dark:text-slate-500 font-mono">ID: {review.id.toUpperCase()}</span>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-350 leading-relaxed italic">&ldquo;{review.comment}&rdquo;</p>
                      {review.imageUrl && (
                        <img
                          src={review.imageUrl}
                          alt="Review Attach"
                          className="h-16 w-16 object-cover rounded-lg border dark:border-slate-800 mt-2"
                        />
                      )}
                      <div className="text-[10px] text-gray-450 dark:text-slate-500 font-semibold pt-1.5 border-t border-gray-100 dark:border-slate-800 flex justify-between">
                        <span>Posted on: {review.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                      {review.status === "Pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(review.id, "Approved")}
                            className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-650 dark:hover:text-green-400 cursor-pointer"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(review.id, "Rejected")}
                            className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:hover:text-red-400 cursor-pointer"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuickViewReview(review)}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-405 cursor-pointer"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingReview(review);
                          setIsFormOpen(true);
                        }}
                        className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 dark:text-green-405 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingReview(review)}
                        className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-505 dark:hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Showing Page <span className="font-bold text-gray-900 dark:text-slate-105">{currentPage}</span> of{" "}
                  <span className="font-bold text-gray-900 dark:text-slate-105">{totalPages}</span> ({totalReviews} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Quick View Comment Modal (Eye Action) */}
      <Dialog open={!!quickViewReview} onOpenChange={(open) => !open && setQuickViewReview(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none">
          {quickViewReview && (
            <div className="space-y-5 text-sm">
              <DialogHeader className="border-b pb-4 border-gray-105 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-base font-bold text-gray-900 dark:text-slate-105">
                      Review by {quickViewReview.customerName}
                    </DialogTitle>
                    {renderStars(quickViewReview.rating)}
                  </div>
                  <DialogDescription className="text-xs text-gray-450 dark:text-slate-500">
                    Product: <span className="font-semibold text-gray-800 dark:text-slate-300">{quickViewReview.productName}</span>
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-3.5">
                <div className="bg-gray-50 dark:bg-slate-950/40 p-4 rounded-xl border dark:border-slate-800 leading-relaxed italic text-gray-700 dark:text-slate-300">
                  &ldquo;{quickViewReview.comment}&rdquo;
                </div>
                {quickViewReview.imageUrl && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-gray-450 block font-semibold">Attached Image:</span>
                    <img
                      src={quickViewReview.imageUrl}
                      alt="Customer Attachment"
                      className="max-h-48 rounded-xl object-contain border dark:border-slate-800 bg-black/5"
                    />
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-505 dark:text-slate-400 border-t dark:border-slate-800 pt-3">
                  <span>Status: <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-bold border-transparent ${quickViewReview.status === "Approved"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : quickViewReview.status === "Rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>{quickViewReview.status || "Pending"}</Badge></span>
                  <span>Posted Date: <span className="font-semibold">{quickViewReview.date}</span></span>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <Button
                  onClick={() => setQuickViewReview(null)}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl px-5 h-9.5 text-xs font-semibold cursor-pointer"
                >
                  Close View
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Review Form Dialog Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-205 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
          <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Edit Review Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Modify the reviewer info, rating value, or moderate the review comments.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              {/* Customer Name */}
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-705 dark:text-slate-300">Customer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Name */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-705 dark:text-slate-300">Product Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="iPhone 15 Pro Max"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-750 dark:text-slate-300 block mb-1">Rating (1-5 Stars)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => field.onChange(star)}
                            className="p-1 hover:scale-115 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`h-6 w-6 ${star <= field.value ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-slate-700"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-705 dark:text-slate-300">Review Comment</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Write customer review content..."
                        className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
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
                    <FormLabel className="text-xs font-semibold text-gray-705 dark:text-slate-300">Moderation Status</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
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
                  Save Review
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Review Alert Confirmation Dialog */}
      <AlertDialog open={!!deletingReview} onOpenChange={(open) => !open && setDeletingReview(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5.5 w-5.5 text-red-500" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              This action cannot be undone. This will permanently delete the review left by{" "}
              <strong className="text-gray-900 dark:text-slate-100 font-bold">&quot;{deletingReview?.customerName}&quot;</strong>.
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
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
