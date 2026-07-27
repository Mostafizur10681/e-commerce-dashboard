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
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

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
  const [sortBy, setSortBy] = useState("Newest");
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
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/attributes?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load attributes");
      const data = await res.json();
      setAttributes(data.attributes || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
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
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/attributes/${deletingAttribute.id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
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

  // Helper for Attribute Icon
  const getAttributeIcon = (name: string) => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes("color")) return "🎨";
    if (lowercase.includes("size")) return "📏";
    if (lowercase.includes("brand")) return "🏷️";
    if (lowercase.includes("material")) return "🧶";
    if (lowercase.includes("style")) return "✨";
    return "⚙️";
  };

  // Client-side sorting
  const sortedAttributes = React.useMemo(() => {
    const items = [...attributes];
    if (sortBy === "Newest") {
      return items.sort((a, b) => (b.createdDate || "").localeCompare(a.createdDate || ""));
    }
    if (sortBy === "Oldest") {
      return items.sort((a, b) => (a.createdDate || "").localeCompare(b.createdDate || ""));
    }
    if (sortBy === "A-Z") {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "Z-A") {
      return items.sort((a, b) => b.name.localeCompare(a.name));
    }
    return items;
  }, [attributes, sortBy]);

  const startIndex = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header Row */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Attributes" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-6 w-6 text-[#16A34A]" />
              Attributes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage product attributes and values
            </p>
          </div>

        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-300">
        {/* LEFT: Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search attributes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
          />
        </div>

        {/* CENTER: Status & Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
              }}
              className="h-10 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
            </select>
          </div>
        </div>

        {/* RIGHT: Add Button */}
        <Button
          onClick={() => router.push("/admin/attributes/add")}
          className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-medium shadow-sm transition-all duration-200 lg:self-auto self-start cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Attribute
        </Button>
      </div>

      {/* Table / Cards Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
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
            <div className="h-8 bg-gray-100 dark:bg-gray-850 rounded-lg animate-pulse w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-10 bg-gray-50 dark:bg-gray-850 rounded-lg animate-pulse w-12" />
                <div className="h-6 bg-gray-55 dark:bg-gray-850 rounded-lg animate-pulse w-1/4" />
                <div className="h-6 bg-gray-55 dark:bg-gray-850 rounded-lg animate-pulse flex-1" />
                <div className="h-6 bg-gray-55 dark:bg-gray-850 rounded-lg animate-pulse w-24 shrink-0" />
                <div className="h-6 bg-gray-55 dark:bg-gray-850 rounded-lg animate-pulse w-32 shrink-0" />
              </div>
            ))}
          </div>
        ) : attributes.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-md mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 mb-4">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No attributes found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create your first attribute to get started.
            </p>
            <Button
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-6 font-medium shadow-sm transition-colors cursor-pointer"
              onClick={() => router.push("/admin/attributes/add")}
            >
              Create Attribute
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-850">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[80px] font-semibold text-gray-900 dark:text-white pl-6 py-4">Image</TableHead>
                    <TableHead className="w-[200px] font-semibold text-gray-900 dark:text-white py-4">Attribute Name</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Attribute Values</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-white py-4">Status</TableHead>
                    <TableHead className="w-[160px] font-semibold text-gray-900 dark:text-white py-4">Created Date</TableHead>
                    <TableHead className="w-[140px] text-right font-semibold text-gray-900 dark:text-white pr-6 py-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAttributes.map((attribute) => {
                    const isActive = attribute.status !== "Inactive";
                    return (
                      <TableRow
                        key={attribute.id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        {/* Image */}
                        <TableCell className="pl-6 py-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 text-lg border border-green-100/50 dark:border-green-900/30">
                            {getAttributeIcon(attribute.name)}
                          </div>
                        </TableCell>

                        {/* Attribute Name */}
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {attribute.name}
                            </span>
                          </div>
                        </TableCell>

                        {/* Attribute Values */}
                        <TableCell className="py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs md:max-w-md lg:max-w-lg">
                            {attribute.values.slice(0, 5).map((v, i) => (
                              <Badge
                                key={i}
                                className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-transparent rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                              >
                                {v}
                              </Badge>
                            ))}
                            {attribute.values.length > 5 && (
                              <Badge
                                className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                              >
                                +{attribute.values.length - 5} More
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          <Badge
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border border-transparent ${isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                          >
                            {attribute.status || "Active"}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-gray-500 dark:text-gray-400 text-sm py-4">
                          {attribute.createdDate ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span>{attribute.createdDate}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                              onClick={() => setViewingAttribute(attribute)}
                              title="View"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-650 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/attributes/edit/${attribute.id}`)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 transition-colors cursor-pointer"
                              onClick={() => setDeletingAttribute(attribute)}
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

            {/* Mobile View (Card layout) */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-850">
              {sortedAttributes.map((attribute) => {
                const isActive = attribute.status !== "Inactive";
                return (
                  <div
                    key={attribute.id}
                    className="p-4 space-y-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 text-lg border border-green-100/50 dark:border-green-900/30">
                          {getAttributeIcon(attribute.name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                            {attribute.name}
                          </h4>
                          <span className="text-xs text-gray-450 dark:text-gray-500 block">ID: {attribute.id}</span>
                        </div>
                      </div>
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                      >
                        {attribute.status || "Active"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>{attribute.createdDate || "No Date"}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Attribute Values:</span>
                      <div className="flex flex-wrap gap-2">
                        {attribute.values.slice(0, 5).map((v, i) => (
                          <Badge
                            key={i}
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-transparent rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                          >
                            {v}
                          </Badge>
                        ))}
                        {attribute.values.length > 5 && (
                          <Badge
                            className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                          >
                            +{attribute.values.length - 5} More
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                        onClick={() => setViewingAttribute(attribute)}
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 cursor-pointer"
                        onClick={() => router.push(`/admin/attributes/edit/${attribute.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 cursor-pointer"
                        onClick={() => setDeletingAttribute(attribute)}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Footer with Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/40 gap-4">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Showing {startIndex} to {endIndex} of {total} entries
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
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
                        className={`h-9 w-9 rounded-xl cursor-pointer font-semibold transition-all ${currentPage === pageNo
                            ? "bg-[#16A34A] hover:bg-green-700 text-white border-transparent"
                            : "border-gray-200 dark:border-gray-850 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Attribute Details Dialog */}
      <Dialog open={!!viewingAttribute} onOpenChange={(open) => !open && setViewingAttribute(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in duration-200">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Sliders className="h-5 w-5 text-[#16A34A]" />
              Attribute Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
              Read-only details of the selected custom attribute specification.
            </DialogDescription>
          </DialogHeader>

          {viewingAttribute && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-850">
                <span className="text-xs font-semibold text-gray-500 uppercase">Attribute Name</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{viewingAttribute.name}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-850">
                <span className="text-xs font-semibold text-gray-500 uppercase">Attribute ID</span>
                <span className="text-sm font-mono text-gray-650 dark:text-gray-350">{viewingAttribute.id}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-850">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                <Badge
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${viewingAttribute.status !== "Inactive"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                >
                  {viewingAttribute.status || "Active"}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-850">
                <span className="text-xs font-semibold text-gray-500 uppercase">Created Date</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{viewingAttribute.createdDate || "-"}</span>
              </div>

              {/* Values Block */}
              <div className="py-2.5">
                <span className="text-xs font-semibold text-gray-505 dark:text-gray-400 uppercase block mb-2 flex items-center gap-1.5">
                  <Tags className="h-4 w-4 text-gray-400" />
                  Attribute Values List
                </span>
                <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-850">
                  {viewingAttribute.values.length > 0 ? (
                    viewingAttribute.values.map((v, i) => (
                      <Badge
                        key={i}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200"
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
              className="rounded-xl border-gray-205 h-9.5 px-4 cursor-pointer"
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
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone. Removing attribute{" "}
              <strong className="text-gray-900 dark:text-white">&quot;{deletingAttribute?.name}&quot;</strong> may affect
              products configured with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2 justify-end">
            <AlertDialogCancel className="rounded-xl border-gray-200 h-10 px-4 cursor-pointer" variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-650 hover:bg-red-750 text-white rounded-xl h-10 px-4 flex items-center justify-center cursor-pointer border-transparent shadow-sm hover:shadow-md"
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
