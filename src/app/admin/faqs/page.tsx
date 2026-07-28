"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  RotateCcw,
  ArrowUpDown
} from "lucide-react";

import { useStore } from "@/store";
import { FAQ } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function FaqsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteFaq } = useStore();

  const [mounted, setMounted] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortFilter, setSortFilter] = useState("display_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [limit] = useState(10);

  // Deleting State
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/faqs?q=${encodeURIComponent(
        searchTerm
      )}&status=${statusFilter}&category=${categoryFilter}&sort=${sortFilter}&page=${currentPage}&limit=${limit}`;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch FAQs");
      const data = await res.json();
      setFaqs(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalFaqs(data.total || 0);
    } catch (err) {
      console.error("Error loading FAQs:", err);
      toast("Error loading FAQs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchFaqs();
    }
  }, [mounted, searchTerm, statusFilter, categoryFilter, sortFilter, currentPage]);

  const handleDeleteConfirm = async () => {
    if (deletingFaq) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/faqs/${deletingFaq.id}`, {
          method: "DELETE",
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to delete FAQ");
        
        // Sync local store
        deleteFaq(deletingFaq.id);
        toast("FAQ deleted successfully", "success");
        setDeletingFaq(null);
        
        // Refresh local view
        if (faqs.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchFaqs();
        }
      } catch (err) {
        console.error(err);
        toast("Failed to delete FAQ", "error");
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSortFilter("display_asc");
    setCurrentPage(1);
  };

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-55 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-0 sm:p-2 lg:p-4 bg-gray-55 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "FAQs" },
            { label: "FAQ List" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#16A34A]" />
              FAQ List
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Manage frequently asked questions displayed on the customer-facing website.
            </p>
          </div>
        </div>
      </div>

      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-205 dark:border-gray-800 p-4 flex flex-col gap-4 transition-all duration-300">
        {/* Top Row: Search & Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 border-gray-250 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
            />
          </div>
          <Button
            onClick={() => router.push("/admin/faqs/add")}
            className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-medium shadow-sm transition-all duration-200 cursor-pointer border-transparent self-start sm:self-auto shrink-0 animate-in fade-in"
          >
            <Plus className="h-4.5 w-4.5" />
            Add FAQ
          </Button>
        </div>

        {/* Bottom Row: Status, Category, Sort & Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5 border-t border-gray-100 dark:border-gray-800/60 items-end">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 border border-gray-300 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer w-full transition-colors duration-200"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">All Statuses</option>
              <option value="active" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Active</option>
              <option value="inactive" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 border border-gray-300 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer w-full transition-colors duration-200"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">All Categories</option>
              <option value="Orders" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Orders</option>
              <option value="Shipping" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Shipping</option>
              <option value="Returns & Refunds" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Returns & Refunds</option>
              <option value="Payments" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Payments</option>
              <option value="Accounts" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Accounts</option>
              <option value="Products" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Products</option>
              <option value="General Questions" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">General Questions</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sort by</span>
            <select
              value={sortFilter}
              onChange={(e) => {
                setSortFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 border border-gray-300 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer w-full transition-colors duration-200"
            >
              <option value="display_asc" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Display Order (Asc)</option>
              <option value="display_desc" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Display Order (Desc)</option>
              <option value="question_asc" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Question A-Z</option>
              <option value="newest" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Newest First</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== "All" || categoryFilter !== "All" || sortFilter !== "display_asc") && (
            <div className="sm:col-span-3 flex justify-start pt-1">
              <Button
                variant="ghost"
                onClick={handleResetFilters}
                className="h-9 rounded-xl px-3 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors border border-dashed border-gray-300 dark:border-gray-800 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Data Display Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading FAQs...</span>
          </div>
        ) : faqs.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-55 dark:bg-gray-800 text-gray-400 mb-4">
              <HelpCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No FAQs found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-450 mb-6">
              Create your first FAQ entry to get started.
            </p>
            <Button
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-6 font-medium shadow-sm transition-colors cursor-pointer border-transparent"
              onClick={() => router.push("/admin/faqs/add")}
            >
              Add FAQ
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full min-w-[800px]">
                <TableHeader className="bg-gray-105 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-850">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-900 dark:text-white pl-6 py-4">Question</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4 w-[160px]">Category</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4 max-w-xs">Answer Preview</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-white py-4">Display Order</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-white py-4">Status</TableHead>
                    <TableHead className="w-[160px] font-semibold text-gray-900 dark:text-white py-4">Created Date</TableHead>
                    <TableHead className="w-[140px] text-right font-semibold text-gray-900 dark:text-white pr-6 py-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => {
                    const status = faq.status || "active";
                    const isActive = status.toLowerCase() === "active";
                    const answerPreview = faq.answer.length > 80 ? `${faq.answer.substring(0, 80)}...` : faq.answer;
                    return (
                      <TableRow
                        key={faq.id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200"
                      >
                        {/* Question */}
                        <TableCell className="pl-6 py-4 font-bold text-gray-900 dark:text-white text-sm">
                          <div className="max-w-[220px] truncate" title={faq.question}>
                            {faq.question}
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell className="py-4">
                          <Badge className="rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border border-transparent bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                            {faq.category || "General Questions"}
                          </Badge>
                        </TableCell>

                        {/* Answer Preview */}
                        <TableCell className="py-4 text-gray-500 dark:text-gray-400 text-xs">
                          <div className="max-w-[280px] truncate" title={faq.answer}>
                            {answerPreview}
                          </div>
                        </TableCell>

                        {/* Display Order */}
                        <TableCell className="py-4 text-gray-700 dark:text-gray-300 font-medium font-mono text-sm">
                          {faq.displayOrder}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          <Badge
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border border-transparent ${isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-gray-505 dark:text-gray-400 text-xs py-4">
                          {faq.createdAt ? (
                            <div className="flex items-center gap-1.5 font-mono">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span>{new Date(faq.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                          ) : (
                            <span className="text-gray-450">-</span>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/faqs/view/${faq.id}`)}
                              title="View"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-[#16A34A] dark:text-gray-400 dark:hover:text-green-400 transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/faqs/edit/${faq.id}`)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-105 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-550 transition-colors cursor-pointer"
                              onClick={() => setDeletingFaq(faq)}
                              title="Delete"
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

            {/* Mobile/Tablet View (Card grid layout) */}
            <div className="block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-55/50 dark:bg-slate-900/10">
              {faqs.map((faq) => {
                const status = faq.status || "active";
                const isActive = status.toLowerCase() === "active";
                return (
                  <div
                    key={faq.id}
                    className="p-4 space-y-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">
                          {faq.question}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">Display Order: {faq.displayOrder}</span>
                          <span className="text-[10px] text-gray-300 dark:text-gray-800">•</span>
                          <Badge className="rounded-full px-2 py-0.2 text-[9px] font-semibold border border-transparent bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                            {faq.category || "General Questions"}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border border-transparent shrink-0 ${isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-450"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic bg-gray-50/50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                      {faq.answer.length > 120 ? `${faq.answer.substring(0, 120)}...` : faq.answer}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-850">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>{faq.createdAt ? new Date(faq.createdAt).toLocaleDateString() : "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                          onClick={() => router.push(`/admin/faqs/view/${faq.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-[#16A34A] dark:text-gray-400 dark:hover:text-green-400 cursor-pointer"
                          onClick={() => router.push(`/admin/faqs/edit/${faq.id}`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-550 cursor-pointer"
                          onClick={() => setDeletingFaq(faq)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls at Bottom */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Showing Page <span className="font-bold text-gray-900 dark:text-slate-100">{currentPage}</span> of{" "}
                  <span className="font-bold text-gray-900 dark:text-slate-105">{totalPages}</span> ({totalFaqs} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-205 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-205 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingFaq} onOpenChange={(open) => !open && setDeletingFaq(null)}>
        <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2 justify-end">
            <AlertDialogCancel className="rounded-xl border-gray-200 h-10 px-5 cursor-pointer" variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-750 text-white rounded-xl h-10 px-5 flex items-center justify-center cursor-pointer border-transparent shadow-sm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
