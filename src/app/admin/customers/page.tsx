"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  X,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Customer } from "@/types";
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

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().length(11, "Phone number must be exactly 11 digits").regex(/^\d+$/, "Phone number must contain only digits"),
  ordersCount: z.number().min(0, "Orders count cannot be negative"),
  status: z.enum(["Active", "Inactive"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Data Fetching & Filters States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [limit] = useState(10);

  // Modals & Selections
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [quickViewCustomer, setQuickViewCustomer] = useState<Customer | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch customers from API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const url = `/api/customers?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${currentPage}&limit=${limit}`;
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotalPages(data.totalPages || 1);
      setTotalCustomers(data.total || 0);
    } catch (err) {
      console.error(err);
      toast("Error loading customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchCustomers();
    }
  }, [mounted, searchTerm, statusFilter, currentPage]);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ordersCount: 0,
      status: "Active",
      password: "",
    },
  });

  // Handle Form open for Add
  useEffect(() => {
    if (isFormOpen) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        ordersCount: 0,
        status: "Active",
        password: "",
      });
      setProfilePicPreview(null);
    }
  }, [isFormOpen, form]);

  const onSubmit = async (values: CustomerFormValues) => {
    try {
      const payload: any = { ...values };
      if (profilePicPreview) {
        payload.profilePic = profilePicPreview;
      }
      
      if (values.password) {
        payload.password = values.password;
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const res = await fetch("/api/customers", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        if (res.status === 422 && errorData.errors) {
          Object.keys(errorData.errors).forEach((key) => {
            form.setError(key as keyof CustomerFormValues, { 
              type: "server", 
              message: errorData.errors[key][0] 
            });
          });
          throw new Error("Please correct the highlighted errors.");
        }
        
        throw new Error(errorData.message || errorData.error || "Failed to create customer");
      }
      
      const successData = await res.json().catch(() => ({}));
      toast(successData.message || "New customer profile created", "success");
      
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast(err.message || "Failed to save customer details", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/customers/${deletingCustomer.id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete customer");
      toast("Customer deleted successfully", "success");
      setDeletingCustomer(null);
      // Adjust page if deleting last item
      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
      toast("Failed to delete customer profile", "error");
    }
  };

  const handleBulkSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customers.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleBulkSelectRow = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedCustomers((prev) => [...prev, id]);
    } else {
      setSelectedCustomers((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast("No customer records to export", "error");
      return;
    }

    const csvContent = [
      ["Customer ID", "Name", "Email", "Phone", "Orders Count", "Status", "Joined Date"],
      ...customers.map((c) => [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.ordersCount,
        c.status || "Active",
        c.joinedDate
      ])
    ]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Customers directory exported successfully", "success");
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-955 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Loading Directory...</span>
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
            { label: "Customers" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600 dark:text-green-500" />
              Customer Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Manage all registered customers and view purchase counts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="h-10 rounded-xl px-4 flex items-center gap-2 font-medium cursor-pointer border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors duration-200 shadow-sm dark:shadow-none"
            >
              <Download className="h-4.5 w-4.5" />
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setIsFormOpen(true);
              }}
              className=" hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-semibold shadow-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer focus:ring-2 focus:ring-green-500 dark:bg-green-505 dark:hover:bg-green-600 dark:border-none"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-slate-800 p-4 transition-all duration-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder="Search customers by name, email, or phone..."
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

          {/* Status select filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full md:w-48 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer transition-colors duration-200"
          >
            <option value="All">All Customer Statuses</option>
            <option value="Active">Active Customers</option>
            <option value="Inactive">Inactive Customers</option>
          </select>
        </div>
      </div>

      {/* Customers Data Table Wrapper Card */}
      <div className="bg-white dark:bg-slate-905 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden transition-all duration-200">
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
        ) : customers.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 text-green-500 mb-4 border border-transparent dark:border-slate-700">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">No Customers Found</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Create customer profiles to monitor and manage user purchase histories.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-6 font-semibold shadow-sm transition-colors duration-200 cursor-pointer focus:ring-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={() => {
                setIsFormOpen(true);
              }}
            >
              Create First Customer
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop View Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-20 border-b border-gray-200 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] pl-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.length === customers.length}
                        onChange={(e) => handleBulkSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-green-600 dark:text-green-500 focus:ring-green-500 cursor-pointer"
                      />
                    </TableHead>
                    <TableHead className="w-[100px] py-4 font-semibold text-gray-900 dark:text-slate-100">ID</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100">Customer Name</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100">Email Address</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100">Phone Number</TableHead>
                    <TableHead className="py-4 font-semibold text-gray-900 dark:text-slate-100 text-center">Orders Count</TableHead>
                    <TableHead className="w-[120px] py-4 font-semibold text-gray-900 dark:text-slate-100">Status</TableHead>
                    <TableHead className="w-[130px] py-4 font-semibold text-gray-900 dark:text-slate-100">Joined Date</TableHead>
                    <TableHead className="w-[150px] text-right pr-6 py-4 font-semibold text-gray-900 dark:text-slate-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => {
                    const isActive = customer.status !== "Inactive";
                    return (
                      <TableRow
                        key={customer.id}
                        className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800/60 transition-all duration-200"
                      >
                        <TableCell className="pl-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={(e) => handleBulkSelectRow(e.target.checked, customer.id)}
                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-green-600 dark:text-green-500 focus:ring-green-500 cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-bold text-gray-500 dark:text-slate-500 text-xs py-4">
                          {customer.id.toUpperCase()}
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-gray-900 dark:text-slate-100 text-sm">
                          <div className="flex items-center gap-3">
                            {customer.profilePic ? (
                              <img src={customer.profilePic} alt={customer.name} className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-slate-700 shadow-xs" />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-xs flex items-center justify-center border border-green-100/50 dark:border-green-900/30 shadow-xs">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span>{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-gray-600 dark:text-slate-300 text-sm">
                          {customer.email}
                        </TableCell>
                        <TableCell className="py-4 text-gray-600 dark:text-slate-300 text-sm font-medium">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="py-4 text-center font-bold text-gray-900 dark:text-slate-100 text-sm">
                          {customer.ordersCount}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${isActive
                                ? "bg-green-105 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                          >
                            {customer.status || "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-gray-500 dark:text-slate-400 text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-405 dark:text-slate-500" />
                            {customer.joinedDate}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setQuickViewCustomer(customer)}
                              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
                              title="Quick View Details"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            <Link href={`/admin/customers/${customer.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 cursor-pointer"
                                title="Edit Customer"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingCustomer(customer)}
                              className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition-colors duration-200 cursor-pointer"
                              title="Delete Customer"
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
            <div className="block md:hidden divide-y divide-gray-250 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {customers.map((customer) => {
                const isActive = customer.status !== "Inactive";
                return (
                  <div key={customer.id} className="p-4 space-y-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {customer.profilePic ? (
                          <img src={customer.profilePic} alt={customer.name} className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-xs flex items-center justify-center border border-green-100/50">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{customer.name}</h4>
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 block font-mono mt-0.5">{customer.id.toUpperCase()}</span>
                        </div>
                      </div>
                      <Badge
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold border-transparent ${isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-750 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                      >
                        {customer.status || "Active"}
                      </Badge>
                    </div>

                    <div className="p-3 bg-gray-50/50 dark:bg-slate-950/30 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                      <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-405 dark:text-slate-500" /> {customer.email}</p>
                      <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-405 dark:text-slate-500" /> {customer.phone}</p>
                      <div className="flex justify-between pt-1 font-semibold text-gray-900 dark:text-slate-200 border-t border-gray-100 dark:border-slate-800 mt-1">
                        <span>Orders Count: {customer.ordersCount}</span>
                        <span>Joined: {customer.joinedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuickViewCustomer(customer)}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-405 dark:hover:text-slate-200 cursor-pointer transition-colors duration-200"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Link href={`/admin/customers/${customer.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 hover:text-green-700 dark:text-green-405 dark:hover:text-green-300 cursor-pointer transition-colors duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCustomer(customer)}
                        className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-750 dark:text-red-405 dark:hover:text-red-500 cursor-pointer transition-colors duration-200"
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
                  Showing Page <span className="font-bold text-gray-900 dark:text-slate-105">{currentPage}</span> of{" "}
                  <span className="font-bold text-gray-900 dark:text-slate-105">{totalPages}</span> ({totalCustomers} total)
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

      {/* Customer Quick Profile Modal (View Action) */}
      <Dialog open={!!quickViewCustomer} onOpenChange={(open) => !open && setQuickViewCustomer(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200">
          {quickViewCustomer && (
            <div className="space-y-5 text-sm">
              <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  {quickViewCustomer.profilePic ? (
                    <img src={quickViewCustomer.profilePic} alt={quickViewCustomer.name} className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold text-base flex items-center justify-center border border-green-100/50">
                      {quickViewCustomer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105">
                      {quickViewCustomer.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Customer Profile Summary
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
                  <span className="text-gray-500 dark:text-slate-400">Account ID:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-slate-100">{quickViewCustomer.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Mail className="h-4 w-4 text-gray-400" /> Email:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{quickViewCustomer.email}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
                  <span className="text-gray-500 dark:text-slate-400 flex items-center gap-1"><Phone className="h-4 w-4 text-gray-400" /> Phone:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100 font-medium">{quickViewCustomer.phone}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
                  <span className="text-gray-500 dark:text-slate-400">Orders Completed:</span>
                  <span className="font-extrabold text-green-605 dark:text-green-400">{quickViewCustomer.ordersCount} Orders</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
                  <span className="text-gray-500 dark:text-slate-400">Account Status:</span>
                  <Badge
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${quickViewCustomer.status !== "Inactive"
                        ? "bg-green-101 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                  >
                    {quickViewCustomer.status || "Active"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-gray-505 dark:text-slate-400 flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-405" /> Joined Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{quickViewCustomer.joinedDate}</span>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <Button
                  onClick={() => setQuickViewCustomer(null)}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl px-5 h-9.5 text-xs font-semibold cursor-pointer"
                >
                  Close Profile
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Dialog Form (Add vs Edit) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200">
          <DialogHeader className="border-b pb-4 border-gray-100 dark:border-slate-800">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105">
              Create New Customer
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Provide the client contact details and purchase stats. Click save profile when complete.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

              {/* Profile Pic Upload */}
              <div className="space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Profile Picture</FormLabel>
                <div className="flex items-center gap-4">
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Preview" className="h-14 w-14 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProfilePicPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="cursor-pointer file:cursor-pointer file:bg-gray-100 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:text-xs file:font-semibold text-xs border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl"
                    />
                  </div>
                  {profilePicPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProfilePicPreview(null)}
                      className="text-red-500 hover:text-red-600 p-2 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Customer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sarah Connor"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="sarah.connor@cyberdyne.com"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+880 1712-345678"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Orders count */}
              <FormField
                control={form.control}
                name="ordersCount"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Completed Orders</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
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
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Account Status</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700 dark:text-slate-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank to keep unchanged"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
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
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl h-10 px-5 cursor-pointer border-gray-300 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold cursor-pointer shadow-sm dark:border-none"
                >
                  Create Profile
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-none transition-all duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-slate-105 flex items-center gap-2">
              <AlertCircle className="h-5.5 w-5.5 text-red-500" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              This action cannot be undone. This will permanently delete client profile{" "}
              <strong className="text-gray-900 dark:text-slate-100 font-bold">&quot;{deletingCustomer?.name}&quot;</strong>.
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
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
