"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  Map,
  ArrowUpDown
} from "lucide-react";

import { Division } from "@/types";
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
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function DivisionsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("division_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const fetchDivisions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/divisions?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`;
      
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      
      if (!res.ok) throw new Error("Failed to load divisions");
      const json = await res.json();
      
      if (json.success && json.data) {
        setDivisions(json.data.data || []);
        setTotal(json.data.total || 0);
        setTotalPages(json.data.last_page || 1);
      } else {
        throw new Error(json.message || "Failed to load divisions");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading divisions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDivisions();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, currentPage, sortBy, sortOrder]);



  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 min-h-screen p-0 sm:p-2 lg:p-4 bg-gray-55 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Locations" },
              { label: "Divisions" },
            ]}
          />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2 pt-1">
            <Map className="h-6 w-6 text-[#16A34A]" />
            Division List
          </h1>
          <p className="text-sm text-gray-505 dark:text-gray-400">
            Manage administrative divisions of Bangladesh.
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/locations/divisions/add")}
          className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 font-medium shadow-sm shadow-[#16A34A]/10 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Division
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs transition-colors">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search divisions by name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 border-gray-200 dark:border-slate-800 dark:bg-slate-950/50 rounded-xl focus-visible:ring-[#16A34A]"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 border border-gray-305 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer transition-colors duration-200"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">All Statuses</option>
              <option value="Active" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Active</option>
              <option value="Inactive" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">Inactive</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchDivisions}
            className="h-10 w-10 border-gray-200 dark:border-slate-800 dark:text-gray-300 dark:bg-slate-950 rounded-xl hover:bg-gray-55 dark:hover:bg-slate-800 cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#16A34A]' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {error ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold mb-1 text-gray-900 dark:text-white">Could not load divisions</h3>
            <p className="text-sm text-gray-505 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchDivisions} variant="outline" className="rounded-xl border-gray-200 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer">
              Try Again
            </Button>
          </div>
        ) : loading && divisions.length === 0 ? (
          /* Skeletal Table Load */
          <div className="p-6 space-y-4">
            <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse flex-1" />
                <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse w-24 shrink-0" />
                <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse w-32 shrink-0" />
              </div>
            ))}
          </div>
        ) : divisions.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800/40 text-gray-400 dark:text-gray-500 mb-4">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No divisions found</h3>
            <p className="text-sm text-gray-505 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {searchTerm || statusFilter !== "All"
                ? "No divisions matches your search criteria or filters."
                : "Create divisions to start configuring your platform locations."}
            </p>
            {(searchTerm || statusFilter !== "All") && (
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
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
            <div className="hidden lg:block w-full overflow-x-auto">
              <Table className="min-w-[700px] w-full">
                <TableHeader className="bg-gray-50/50 dark:bg-slate-950/20 sticky top-0 z-10">
                  <TableRow className="border-b border-gray-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[80px] font-semibold text-gray-700 dark:text-gray-300 pl-6 py-4">SL</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 cursor-pointer select-none" onClick={() => toggleSort("division_name")}>
                      <div className="flex items-center gap-1">
                        Division Name (English)
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Division Name (Bangla)</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 cursor-pointer select-none" onClick={() => toggleSort("division_code")}>
                      <div className="flex items-center gap-1">
                        Division Code
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">Created Date</TableHead>
                    <TableHead className="w-[140px] text-right font-semibold text-gray-700 dark:text-gray-300 pr-6 py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.map((item, index) => {
                    const sl = (currentPage - 1) * pageSize + index + 1;
                    const isActive = item.status === true || item.status === 1;
                    const createdDate = item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "-";
                    
                    return (
                      <TableRow
                        key={item.id}
                        className="border-b border-gray-100 dark:border-slate-800/80 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        {/* SL */}
                        <TableCell className="font-medium text-gray-505 dark:text-gray-400 text-xs pl-6 py-3.5">
                          {sl}
                        </TableCell>

                        {/* Division Name (EN) */}
                        <TableCell className="font-semibold text-gray-900 dark:text-white text-sm py-3.5">
                          {item.division_name}
                        </TableCell>

                        {/* Division Name (BN) */}
                        <TableCell className="text-gray-700 dark:text-gray-300 text-sm py-3.5">
                          {item.division_name_bn || <span className="text-gray-400 italic">N/A</span>}
                        </TableCell>

                        {/* Code */}
                        <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400 py-3.5">
                          <span className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {item.division_code}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5">
                          <StatusBadge status={isActive ? 'active' : 'inactive'} />
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-gray-505 dark:text-gray-400 text-sm py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>{createdDate}</span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-[#16A34A] dark:hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                              onClick={() => router.push(`/admin/locations/divisions/${item.id}`)}
                              title="View Details"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8.5 w-8.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-gray-55 dark:hover:bg-slate-800 cursor-pointer"
                              onClick={() => router.push(`/admin/locations/divisions/edit/${item.id}`)}
                              title="Edit Division"
                            >
                              <Pencil className="h-4 w-4" />
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
              {divisions.map((item, index) => {
                const sl = (currentPage - 1) * pageSize + index + 1;
                const isActive = item.status === true || item.status === 1;
                const createdDate = item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "-";
                
                return (
                  <div
                    key={item.id}
                    className="p-4 space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">SL No. #{sl}</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{item.division_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Code</span>
                        <span className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-350 bg-gray-105 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          {item.division_code}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 border-t border-b border-gray-100 dark:border-slate-850 flex justify-between items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-400 block">Bangla Name</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {item.division_name_bn || <span className="text-gray-400 italic">N/A</span>}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-405 block">Status</span>
                        <StatusBadge status={isActive ? 'active' : 'inactive'} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-450 dark:text-slate-500 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{createdDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8.5 w-8.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[#16A34A] dark:hover:text-[#16A34A] hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                          onClick={() => router.push(`/admin/locations/divisions/${item.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8.5 w-8.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-gray-55 dark:hover:bg-slate-800 cursor-pointer"
                          onClick={() => router.push(`/admin/locations/divisions/edit/${item.id}`)}
                          title="Edit Division"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination Section */}
        {!error && divisions.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
            <div className="text-xs text-gray-505 dark:text-gray-450 font-medium">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{divisions.length}</span> of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{total}</span> entries
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-8.5 w-8.5 rounded-lg border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrent ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8.5 min-w-8.5 rounded-lg text-xs font-semibold px-2 cursor-pointer ${
                      isCurrent
                        ? "bg-[#16A34A] hover:bg-green-700 text-white shadow-xs"
                        : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-gray-300"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-8.5 w-8.5 rounded-lg border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
