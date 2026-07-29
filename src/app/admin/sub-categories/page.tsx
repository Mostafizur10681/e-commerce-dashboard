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
  AlertTriangle,
  FolderOpen,
  Image as ImageIcon
} from "lucide-react";

import { SubCategory } from "@/types";
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

export default function SubCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewingSubCategory, setViewingSubCategory] = useState<SubCategory | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/sub-categories?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load sub categories");
      const data = await res.json();
      setSubCategories(data.subCategories || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading sub categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSubCategories();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!deletingSubCategory) return;
    try {
      setIsDeleting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/sub-categories/${deletingSubCategory.id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to delete sub category");

      toast("Sub category deleted successfully", "success");
      setDeletingSubCategory(null);
      fetchSubCategories();
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to delete sub category", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#16A34A]" />
            Sub Category List
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, search, and manage your sub-categories stored in the sub_categories database table.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/sub-categories/add")}
          className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-4 flex items-center justify-center gap-1.5 font-medium shadow-sm shadow-[#16A34A]/10 transition-colors cursor-pointer self-stretch sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Sub Category
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search sub categories by name, main category, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
          />
        </div>

        {/* Status Filter */}
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
            <h3 className="text-base font-semibold mb-1">Could not load sub categories</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchSubCategories} variant="outline" className="rounded-xl border-gray-200">
              Try Again
            </Button>
          </div>
        ) : loading && subCategories.length === 0 ? (
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse shrink-0" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex-1" />
              </div>
            ))}
          </div>
        ) : subCategories.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-gray-400 mb-4">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No sub categories found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Create sub categories to organize your product inventory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[800px]">
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                  <TableHead className="w-[80px] font-semibold text-gray-650 dark:text-gray-400 pl-6 py-4">ID</TableHead>
                  <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Sub Category Name</TableHead>
                  <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Main Category</TableHead>
                  <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Description</TableHead>
                  <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Status</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold text-gray-650 dark:text-gray-400 pr-6 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCategories.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-500 dark:text-gray-400 text-xs pl-6 py-3.5">
                      {item.id}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-200 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 font-medium text-gray-800 dark:text-gray-200 text-sm">
                      <Badge className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50">
                        {item.categoryName || item.categoryId}
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-[240px] truncate text-gray-500 text-sm py-3.5">
                      {item.description || <span className="italic text-gray-400">No description</span>}
                    </TableCell>

                    <TableCell className="py-3.5">
                      <Badge className={item.status === "Inactive" ? "bg-gray-100 text-gray-600" : "bg-emerald-50 text-emerald-700"}>
                        {item.status || "Active"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-6 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingSubCategory(item)}
                          className="h-8 w-8 text-gray-500 hover:text-gray-900 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/sub-categories/edit/${item.id}`)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingSubCategory(item)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AlertDialog open={!!deletingSubCategory} onOpenChange={(open) => !open && setDeletingSubCategory(null)}>
        <AlertDialogContent className="rounded-2xl border-gray-200 dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this Sub Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove <strong>"{deletingSubCategory?.name}"</strong> from your database table sub_categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Sub Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Modal */}
      <Dialog open={!!viewingSubCategory} onOpenChange={(open) => !open && setViewingSubCategory(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Sub Category Details</DialogTitle>
          </DialogHeader>
          {viewingSubCategory && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                {viewingSubCategory.imageUrl && (
                  <img src={viewingSubCategory.imageUrl} alt={viewingSubCategory.name} className="h-16 w-16 rounded-xl object-cover" />
                )}
                <div>
                  <h3 className="font-bold text-lg">{viewingSubCategory.name}</h3>
                  <p className="text-xs text-gray-500">Main Category: {viewingSubCategory.categoryName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{viewingSubCategory.description || "No description provided."}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
