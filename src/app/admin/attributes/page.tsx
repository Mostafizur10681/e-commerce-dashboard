"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Inbox,
  Tags
} from "lucide-react";

import { useStore } from "@/store";
import { Attribute } from "@/types";
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

export default function AttributesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteAttribute: storeDeleteAttribute } = useStore();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Dialogs States
  const [viewingAttribute, setViewingAttribute] = useState<Attribute | null>(null);
  const [deletingAttribute, setDeletingAttribute] = useState<Attribute | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/attributes?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load attributes");
      const data = await res.json();
      setAttributes(data.attributes);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading attributes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAttributes();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!deletingAttribute) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/attributes/${deletingAttribute.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete attribute");
      }

      // Sync Zustand store
      storeDeleteAttribute(deletingAttribute.id);

      toast("Attribute deleted successfully", "success");

      setDeletingAttribute(null);
      
      const isLastItemOnPage = attributes.length === 1;
      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchAttributes();
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to delete attribute", "error");
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
            <Sliders className="h-6 w-6 text-[#16A34A]" />
            Attributes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure product attributes like size, color, brands, and variations.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/attributes/add")}
          className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 font-medium shadow-sm shadow-[#16A34A]/10 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New
        </Button>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search attributes by name or values..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-700 dark:text-gray-300"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        {error ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold mb-1">Could not load attributes</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchAttributes} variant="outline" className="rounded-xl border-gray-200">
              Try Again
            </Button>
          </div>
        ) : loading && attributes.length === 0 ? (
          /* Table Skeleton */
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-1/4" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex-1" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-24 shrink-0" />
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse w-32 shrink-0" />
              </div>
            ))}
          </div>
        ) : attributes.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-gray-400 mb-4">
              <Inbox className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No attributes found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {searchTerm || statusFilter !== "All"
                ? "No attributes matches your search queries or filters."
                : "Create attributes configurations to enable custom product options and variations."}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-800 hover:bg-transparent">
                  <TableHead className="w-[120px] font-semibold text-gray-650 dark:text-gray-400 pl-6 py-4">ID</TableHead>
                  <TableHead className="w-[180px] font-semibold text-gray-650 dark:text-gray-400 py-4">Attribute Name</TableHead>
                  <TableHead className="font-semibold text-gray-650 dark:text-gray-400 py-4">Values</TableHead>
                  <TableHead className="w-[130px] font-semibold text-gray-650 dark:text-gray-400 py-4">Status</TableHead>
                  <TableHead className="w-[160px] font-semibold text-gray-650 dark:text-gray-400 py-4">Created Date</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold text-gray-650 dark:text-gray-400 pr-6 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map((attribute) => {
                  const isActive = attribute.status !== "Inactive";
                  return (
                    <TableRow
                      key={attribute.id}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      {/* ID */}
                      <TableCell className="font-medium text-gray-500 dark:text-gray-450 text-xs pl-6 py-3.5">
                        {attribute.id}
                      </TableCell>

                      {/* Name */}
                      <TableCell className="font-semibold text-gray-900 dark:text-white text-sm py-3.5">
                        {attribute.name}
                      </TableCell>

                      {/* Values */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {attribute.values.map((v, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="rounded-lg px-2 py-0.5 text-xs font-medium bg-gray-50 dark:bg-gray-850 border-gray-250 dark:border-gray-750 text-gray-650 dark:text-gray-300"
                            >
                              {v}
                            </Badge>
                          ))}
                        </div>
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
                          {attribute.status || "Active"}
                        </Badge>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="text-gray-550 dark:text-gray-400 text-sm py-3.5">
                        {attribute.createdDate ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{attribute.createdDate}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-[#16A34A] dark:hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => setViewingAttribute(attribute)}
                            title="View Details"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => router.push(`/admin/attributes/edit/${attribute.id}`)}
                            title="Edit Attribute"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-650 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                            onClick={() => setDeletingAttribute(attribute)}
                            title="Delete Attribute"
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

            {/* Pagination */}
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
          </div>
        )}
      </div>

      {/* Attribute Details Dialog */}
      <Dialog open={!!viewingAttribute} onOpenChange={(open) => !open && setViewingAttribute(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in duration-200">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#16A34A]" />
              Attribute Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Read-only details of the selected custom attribute specification.
            </DialogDescription>
          </DialogHeader>

          {viewingAttribute && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-105 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-500 uppercase">Attribute Name</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{viewingAttribute.name}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-105 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-500 uppercase">Attribute ID</span>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-300">{viewingAttribute.id}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-105 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                <Badge
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${
                    viewingAttribute.status !== "Inactive"
                      ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {viewingAttribute.status || "Active"}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-105 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-500 uppercase">Created Date</span>
                <span className="text-sm text-gray-750 dark:text-gray-350">{viewingAttribute.createdDate || "-"}</span>
              </div>

              {/* Values Block */}
              <div className="py-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase block mb-2 flex items-center gap-1.5">
                  <Tags className="h-4 w-4 text-gray-400" />
                  Attribute Values List
                </span>
                <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-950/40 p-4 rounded-2xl border border-gray-150 dark:border-gray-850">
                  {viewingAttribute.values.length > 0 ? (
                    viewingAttribute.values.map((v, i) => (
                      <Badge
                        key={i}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-850 dark:text-gray-200"
                      >
                        {v}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm italic text-gray-400">No values configured.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <Button
              className="rounded-xl border-gray-200 h-9.5 px-4 cursor-pointer"
              variant="outline"
              onClick={() => setViewingAttribute(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingAttribute} onOpenChange={(open) => !open && setDeletingAttribute(null)}>
        <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone. Removing attribute{" "}
              <strong className="text-gray-900 dark:text-white">&quot;{deletingAttribute?.name}&quot;</strong> may affect
              products configured with it.
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
                "Delete Attribute"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
