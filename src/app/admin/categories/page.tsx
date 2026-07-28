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
  FolderOpen,
  Image as ImageIcon
} from "lucide-react";

import { useStore } from "@/store";
import { Category } from "@/types";
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

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteCategory: storeDeleteCategory } = useStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action Dialog/Modal States
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced data loading
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/categories?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data.categories || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading categories");
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
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("Failed to delete category");
      }

      // Sync Zustand store
      storeDeleteCategory(deletingCategory.id);

      toast("Category deleted successfully", "success");

      setDeletingCategory(null);
      // If we are on a page that is now empty, go back a page
      const isLastItemOnPage = categories.length === 1;
      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchCategories();
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to delete category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#16A34A]" />
            Category List
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, search, and manage your product categories.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/categories/add")}
          className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-4 flex items-center justify-center gap-1.5 font-medium shadow-sm shadow-[#16A34A]/10 transition-colors cursor-pointer self-stretch sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Category
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories by name, ID or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full sm:w-44 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        {error ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold mb-1">Could not load categories</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchCategories} variant="outline" className="rounded-xl border-gray-200">
              Try Again
            </Button>
          </div>
        ) : loading && categories.length === 0 ? (
          /* Skeletal Table Load */
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse shrink-0" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex-1" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-24 shrink-0" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-32 shrink-0" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-gray-400 mb-4">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No categories found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {searchTerm || statusFilter !== "All"
                ? "No categories matches your active search queries or filters."
                : "Create classification groups for your catalog to start organizing products."}
            </p>
            {(searchTerm || statusFilter !== "All") && (
              <Button
                variant="outline"
                className="rounded-xl border-gray-200"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full min-w-[800px]">
                <TableHeader>
                  <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                    <TableHead className="w-[120px] font-semibold text-gray-650 dark:text-gray-400 pl-6 py-4">ID</TableHead>
                    <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Category Name</TableHead>
                    <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Description</TableHead>
                    <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Created Date</TableHead>
                    <TableHead className="w-[140px] text-right font-semibold text-gray-650 dark:text-gray-400 pr-6 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const isActive = category.status !== "Inactive";
                    return (
                      <TableRow
                        key={category.id}
                        className="border-b border-gray-250 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                      >
                        {/* ID */}
                        <TableCell className="font-medium text-gray-500 dark:text-gray-450 text-xs pl-6 py-3.5">
                          {category.id}
                        </TableCell>

                        {/* Image + Name */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-850 flex items-center justify-center">
                              {category.imageUrl ? (
                                <img
                                  src={category.imageUrl}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e2e8f0'/><text x='50' y='55' font-family='sans-serif' font-size='30' fill='%2364748b' text-anchor='middle'>📂</text></svg>";
                                  }}
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {category.name}
                            </span>
                          </div>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="max-w-[240px] truncate text-gray-550 dark:text-gray-400 text-sm py-3.5">
                          {category.description || <span className="text-gray-400 italic">No description</span>}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5">
                          <Badge
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border border-transparent ${
                              isActive
                                ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                                : "bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {category.status || "Active"}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-gray-550 dark:text-gray-400 text-sm py-3.5">
                          {category.createdDate ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span>{category.createdDate}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-[#16A34A] dark:hover:text-[#16A34A] hover:bg-gray-55 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => setViewingCategory(category)}
                              title="View Details"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-55 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => router.push(`/admin/categories/edit/${category.id}`)}
                              title="Edit Category"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-650 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                              onClick={() => setDeletingCategory(category)}
                              title="Delete Category"
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
            <div className="block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/50 dark:bg-gray-950/20">
              {categories.map((category) => {
                const isActive = category.status !== "Inactive";
                return (
                  <div
                    key={category.id}
                    className="p-4 space-y-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-850 flex items-center justify-center">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e2e8f0'/><text x='50' y='55' font-family='sans-serif' font-size='30' fill='%2364748b' text-anchor='middle'>📂</text></svg>";
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {category.name}
                          </h4>
                          <span className="text-xs text-gray-450 dark:text-gray-500 block truncate">ID: {category.id}</span>
                        </div>
                      </div>
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${
                          isActive
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {category.status || "Active"}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-550 dark:text-gray-400 line-clamp-2 min-h-[32px] leading-relaxed">
                      {category.description || <span className="text-gray-450 italic">No description</span>}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>{category.createdDate || "No Date"}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-[#16A34A] dark:hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setViewingCategory(category)}
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => router.push(`/admin/categories/edit/${category.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-650 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                        onClick={() => setDeletingCategory(category)}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Panel */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/40">
                <span className="text-xs font-semibold text-gray-550 dark:text-gray-450 uppercase tracking-wider">
                  Page {currentPage} of {totalPages} ({total} total items)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 cursor-pointer text-gray-700 dark:text-gray-300"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-0.5" />
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNo = idx + 1;
                    return (
                      <Button
                        key={pageNo}
                        variant={currentPage === pageNo ? "default" : "outline"}
                        size="sm"
                        className={`h-9 w-9 rounded-xl cursor-pointer ${
                          currentPage === pageNo
                            ? "bg-[#16A34A] hover:bg-green-700 text-white border-transparent"
                            : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => handlePageChange(pageNo)}
                      >
                        {pageNo}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 cursor-pointer text-gray-700 dark:text-gray-300"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Details Modal */}
      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent className="max-w-md w-[calc(100vw-32px)] sm:w-full rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#16A34A]" />
              Category Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Detailed metadata and catalog properties.
            </DialogDescription>
          </DialogHeader>

          {viewingCategory && (
            <div className="space-y-4">
              {/* Image Preview Block */}
              <div className="relative aspect-video rounded-xl bg-gray-50 dark:bg-gray-950 overflow-hidden border border-gray-100 dark:border-gray-850 flex items-center justify-center">
                {viewingCategory.imageUrl ? (
                  <img
                    src={viewingCategory.imageUrl}
                    alt={viewingCategory.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23e2e8f0'/><text x='50' y='55' font-family='sans-serif' font-size='30' fill='%2364748b' text-anchor='middle'>📂</text></svg>";
                    }}
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                )}
              </div>

              {/* Data Rows */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Category Name</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{viewingCategory.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Category ID</span>
                  <span className="text-sm font-mono text-gray-600 dark:text-gray-300">{viewingCategory.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                  <Badge
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      viewingCategory.status !== "Inactive"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {viewingCategory.status || "Active"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Created Date</span>
                  <span className="text-sm text-gray-750 dark:text-gray-350">{viewingCategory.createdDate || "-"}</span>
                </div>

                {/* Description Text block */}
                <div className="py-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">Description</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950/40 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                    {viewingCategory.description || <span className="italic text-gray-450">No description provided.</span>}
                  </p>
                </div>

                {/* SEO Block */}
                {(viewingCategory.seoTitle || viewingCategory.seoDescription) && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-2">
                      <FileText className="h-3.5 w-3.5" />
                      SEO Options
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {viewingCategory.seoTitle && (
                        <div>
                          <strong className="text-gray-500">SEO Title:</strong>{" "}
                          <span className="text-gray-750 dark:text-gray-300">{viewingCategory.seoTitle}</span>
                        </div>
                      )}
                      {viewingCategory.seoDescription && (
                        <div>
                          <strong className="text-gray-500">SEO Desc:</strong>{" "}
                          <span className="text-gray-750 dark:text-gray-300">{viewingCategory.seoDescription}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <Button
              className="rounded-xl border-gray-200 h-9.5 px-4 cursor-pointer"
              variant="outline"
              onClick={() => setViewingCategory(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent className="max-w-md w-[calc(100vw-32px)] sm:w-full rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone. Removing category{" "}
              <strong className="text-gray-900 dark:text-white">&quot;{deletingCategory?.name}&quot;</strong> may affect
              products categorized under it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <AlertDialogCancel className="rounded-xl border-gray-200 h-10 px-4 cursor-pointer" variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-4 flex items-center justify-center cursor-pointer border-transparent shadow-sm hover:shadow-md"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
