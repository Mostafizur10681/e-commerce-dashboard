"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Search,
  X,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  ToggleLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentStatus {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "Active" | "Inactive";
  createdDate: string;
}

export default function PaymentStatusPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Lists & Filters
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Dialog Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Forms & Selected item states
  const [selectedItem, setSelectedItem] = useState<PaymentStatus | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/payment-statuses?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${pageSize}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load payment statuses");
      const data = await res.json();
      setPaymentStatuses(data.paymentStatuses || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error(err);
      toast(err.message || "An error occurred while loading payment statuses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      const handler = setTimeout(() => {
        fetchStatuses();
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [mounted, searchTerm, statusFilter, currentPage]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      description: "",
      status: "Active",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: PaymentStatus) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      status: item.status,
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (item: PaymentStatus) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (item: PaymentStatus) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch("/api/payment-statuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status === "Active",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment status");
      }

      toast("Payment status created successfully", "success");
      setIsAddOpen(false);
      fetchStatuses();
    } catch (err: any) {
      toast(err.message || "Failed to create payment status", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!formData.name.trim()) {
      toast("Name is required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/payment-statuses/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status === "Active",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update payment status");
      }

      toast("Payment status updated successfully", "success");
      setIsEditOpen(false);
      fetchStatuses();
    } catch (err: any) {
      toast(err.message || "Failed to update payment status", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/payment-statuses/${selectedItem.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete payment status");
      }

      toast("Payment status deleted successfully", "success");
      setIsDeleteOpen(false);
      const isLastItemOnPage = paymentStatuses.length === 1;
      if (isLastItemOnPage && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        fetchStatuses();
      }
    } catch (err: any) {
      toast(err.message || "Failed to delete payment status", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (item: PaymentStatus) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const nextStatus = item.status === "Active" ? "Inactive" : "Active";
      const res = await fetch(`/api/payment-statuses/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: nextStatus === "Active",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast(`Payment status marked as ${nextStatus}`, "success");
      fetchStatuses();
    } catch (err: any) {
      toast(err.message || "Failed to toggle status", "error");
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-55 dark:bg-slate-950 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Loading Payment Statuses...</span>
      </div>
    );
  }

  const getStatusBadge = (status: "Active" | "Inactive") => {
    if (status === "Active") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent font-bold capitalize">
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 border-transparent font-bold capitalize">
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Breadcrumbs & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Orders", href: "/admin/orders" },
            { label: "Payment Status" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-500" />
              Payment Status Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Create, edit, and delete your payment statuses (e.g. Paid, Failed, Refunded, Pending).
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchStatuses()}
              variant="outline"
              className="rounded-xl border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleOpenAdd}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 font-medium shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Status
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by status name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-650">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-full md:w-48 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 text-sm outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ) : paymentStatuses.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 text-green-500 mb-4 border border-transparent dark:border-slate-700">
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold mb-1">No Payment Statuses Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Create a custom payment status or modify search filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden lg:block overflow-x-auto">
              <Table className="w-full min-w-[800px]">
                <TableHeader className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="py-4 pl-6 font-semibold w-1/4">Name</TableHead>
                    <TableHead className="py-4 font-semibold w-1/4">Slug</TableHead>
                    <TableHead className="py-4 font-semibold w-1/3">Description</TableHead>
                    <TableHead className="py-4 font-semibold text-center">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentStatuses.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60"
                    >
                      <TableCell className="py-4 pl-6 font-semibold text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-mono text-gray-500 dark:text-slate-400">
                        {item.slug}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600 dark:text-slate-300">
                        {item.description || <span className="text-gray-400 italic">No description</span>}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span
                          onClick={() => toggleStatus(item)}
                          className="cursor-pointer select-none inline-block hover:opacity-80 transition-opacity"
                          title="Click to toggle status"
                        >
                          {getStatusBadge(item.status)}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right pr-6 space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenView(item)}
                          className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(item)}
                          className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-955/20 text-red-600 hover:text-red-750 dark:text-red-500 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile/Tablet View (Card grid layout) */}
            <div className="block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-55/50 dark:bg-slate-900/10">
              {paymentStatuses.map((item) => (
                <div
                  key={item.id}
                  className="p-4 space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-gray-400 block">Name</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Slug</span>
                      <span className="font-mono text-xs font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{item.slug}</span>
                    </div>
                  </div>

                  <div className="py-2.5 border-t border-b border-gray-100 dark:border-slate-850 flex justify-between items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs text-gray-450 dark:text-gray-500 block">Description</span>
                      <span className="text-xs text-gray-650 dark:text-gray-300 line-clamp-2">
                        {item.description || <span className="text-gray-400 italic">No description</span>}
                      </span>
                    </div>
                    <div
                      onClick={() => toggleStatus(item)}
                      className="cursor-pointer select-none shrink-0"
                      title="Click to toggle status"
                    >
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenView(item)}
                      className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                      className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-green-600 hover:text-green-700 dark:text-green-550 dark:hover:text-green-400"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDelete(item)}
                      className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 hover:text-red-750 dark:text-red-550 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-800">
                <span className="text-sm text-gray-500 dark:text-slate-400">
                  Page {currentPage} of {totalPages} ({total} items)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-xl"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-green-600" />
              Add Payment Status
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-slate-400">
              Create a new status option for order payments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-550 dark:text-slate-300">Name</label>
              <Input
                placeholder="e.g. Processing, Refunded, Paid"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border-gray-300 dark:border-slate-750"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-550 dark:text-slate-300">Description</label>
              <textarea
                placeholder="Description of when this payment status applies..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] text-sm px-3 py-2 border border-gray-300 dark:border-slate-750 rounded-xl bg-white dark:bg-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-550 dark:text-slate-300 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                className="w-full h-10 px-3 border border-gray-300 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-xl outline-none text-sm cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <DialogFooter className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border-gray-300 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Pencil className="h-4.5 w-4.5 text-green-600" />
              Edit Payment Status
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-slate-400">
              Modify an existing payment status setting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-555 dark:text-slate-300">Name</label>
              <Input
                placeholder="e.g. Processing, Refunded, Paid"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border-gray-300 dark:border-slate-750"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-555 dark:text-slate-300">Description</label>
              <textarea
                placeholder="Description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] text-sm px-3 py-2 border border-gray-300 dark:border-slate-750 rounded-xl bg-white dark:bg-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-555 dark:text-slate-300 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                className="w-full h-10 px-3 border border-gray-300 dark:border-slate-755 bg-white dark:bg-slate-900 rounded-xl outline-none text-sm cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <DialogFooter className="pt-4 border-t border-gray-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl border-gray-300 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-green-600" />
              Payment Status Details
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-3 py-1 border-b border-gray-100 dark:border-slate-800">
                <span className="font-semibold text-gray-500 dark:text-slate-400">Name</span>
                <span className="col-span-2 font-medium">{selectedItem.name}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-100 dark:border-slate-800">
                <span className="font-semibold text-gray-500 dark:text-slate-400">Slug</span>
                <span className="col-span-2 font-mono text-gray-600 dark:text-slate-300">{selectedItem.slug}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-100 dark:border-slate-800">
                <span className="font-semibold text-gray-500 dark:text-slate-400">Description</span>
                <span className="col-span-2 text-gray-700 dark:text-slate-300">{selectedItem.description || <em className="text-gray-400">No description</em>}</span>
              </div>
              <div className="grid grid-cols-3 py-1 border-b border-gray-100 dark:border-slate-800">
                <span className="font-semibold text-gray-500 dark:text-slate-400">Status</span>
                <span className="col-span-2">{getStatusBadge(selectedItem.status)}</span>
              </div>
              <div className="grid grid-cols-3 py-1">
                <span className="font-semibold text-gray-500 dark:text-slate-400">Created Date</span>
                <span className="col-span-2 text-gray-600 dark:text-slate-300">{selectedItem.createdDate}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewOpen(false)}
              className="rounded-xl border-gray-300 dark:border-slate-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-650" />
              Delete Payment Status
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-slate-400">
              Are you sure you want to delete the payment status{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {selectedItem?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-300 dark:border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
