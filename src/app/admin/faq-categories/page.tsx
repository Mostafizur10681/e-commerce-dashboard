"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  AlertTriangle,
  FolderOpen
} from "lucide-react";

import { FAQCategory } from "@/types";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

export default function FAQCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action Dialog/Modal States
  const [viewingCategory, setViewingCategory] = useState<FAQCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<FAQCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/faq-categories?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load FAQ categories");
      const data = await res.json();
      setCategories(data.faqCategories || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading FAQ categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/faq-categories/${deletingCategory.id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Failed to delete FAQ category");
      }

      toast("FAQ category deleted successfully", "success");
      setDeletingCategory(null);
      
      const isLastItemOnPage = categories.length === 1;
      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchCategories();
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to delete FAQ category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Panel */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "FAQ Categories" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-green-600 dark:text-green-500" />
              FAQ Categories
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Manage category classifications for the Frequently Asked Questions.
            </p>
          </div>
          <Link
            href="/admin/faq-categories/add"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 px-5 flex items-center justify-center gap-2 font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer focus:ring-2 focus:ring-green-500"
          >
            <Plus className="h-4.5 w-4.5" />
            Add FAQ Category
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm dark:shadow-none space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder="Search by category name, slug or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full md:w-48 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-gray-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 animate-pulse rounded" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <div className="h-8 bg-gray-100 dark:bg-slate-800/60 rounded-lg animate-pulse col-span-2" />
                <div className="h-8 bg-gray-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                <div className="h-8 bg-gray-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                <div className="h-8 bg-gray-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Failed to Load</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{error}</p>
            <Button onClick={fetchCategories} variant="outline" className="rounded-xl h-10 px-5">
              Try Again
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 text-green-500 mb-4">
              <FolderOpen className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">No FAQ Categories Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Create category records to classify FAQ questions.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold shadow-sm transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={() => router.push("/admin/faq-categories/add")}
            >
              Add First FAQ Category
            </Button>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[800px] w-full">
                <TableHeader className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px] py-4 pl-6 font-semibold text-gray-900 dark:text-slate-100">ID</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100">Name</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100">Slug</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100">Description</TableHead>
                    <TableHead className="w-[120px] py-4 font-semibold text-gray-900 dark:text-slate-100">Status</TableHead>
                    <TableHead className="w-[180px] text-right pr-6 py-4 font-semibold text-gray-900 dark:text-slate-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow
                      key={category.id}
                      className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <TableCell className="font-bold text-gray-500 dark:text-slate-500 text-xs py-4 pl-6">
                        #{category.id}
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-gray-900 dark:text-slate-100 text-sm">
                        {category.name}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500 dark:text-slate-400 text-sm font-mono">
                        {category.slug}
                      </TableCell>
                      <TableCell className="py-4 text-gray-500 dark:text-slate-400 text-sm max-w-xs truncate" title={category.description}>
                        {category.description || <span className="text-gray-300 dark:text-slate-700 italic">No description</span>}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${
                            category.status === "Active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingCategory(category)}
                            className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                            title="Quick View Details"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/faq-categories/edit/${category.id}`)}
                            className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 cursor-pointer"
                            title="Edit Category"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCategory(category)}
                            className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 cursor-pointer"
                            title="Delete Category"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  Showing Page <span className="font-bold text-gray-900 dark:text-slate-100">{currentPage}</span> of{" "}
                  <span className="font-bold text-gray-900 dark:text-slate-100">{totalPages}</span> ({total} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="h-8.5 rounded-lg px-3 flex items-center gap-1 text-xs font-semibold border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
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

      {/* Details View Dialog Modal */}
      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none">
          {viewingCategory && (
            <div className="space-y-5 text-sm">
              <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-100">
                      {viewingCategory.name}
                    </DialogTitle>
                    <Badge
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border-transparent ${
                        viewingCategory.status === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {viewingCategory.status}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs font-mono text-gray-400 dark:text-slate-500">
                    Slug: {viewingCategory.slug}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">Description</span>
                  <div className="bg-gray-50 dark:bg-slate-950/40 p-4 rounded-xl border dark:border-slate-800 text-gray-705 dark:text-slate-300 min-h-20 whitespace-pre-line leading-relaxed">
                    {viewingCategory.description || <span className="text-gray-300 dark:text-slate-700 italic">No description provided</span>}
                  </div>
                </div>
                {viewingCategory.createdDate && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Created Date: <span className="font-semibold text-gray-800 dark:text-slate-200">{viewingCategory.createdDate}</span></span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <Button
                  onClick={() => setViewingCategory(null)}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl px-5 h-9.5 text-xs font-semibold cursor-pointer"
                >
                  Close View
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-5.5 w-5.5 text-red-500" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              This will permanently delete the FAQ Category{" "}
              <strong className="text-gray-900 dark:text-slate-100 font-bold">&quot;{deletingCategory?.name}&quot;</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl h-10 px-5 border-gray-300 dark:border-slate-700 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <Button
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-650 text-white rounded-xl h-10 px-6 font-semibold cursor-pointer border-transparent shadow-sm flex items-center gap-1.5"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Category
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
