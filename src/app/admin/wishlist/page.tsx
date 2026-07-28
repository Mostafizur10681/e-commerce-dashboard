"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  X,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Eye,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatImage } from "@/lib/imageHelper";

interface WishlistItem {
  id: string;
  userId: number;
  productId: number;
  customerName: string;
  customerEmail: string;
  productName: string;
  productImage: string;
  productPrice: number;
  createdAt: string;
}

export default function AdminWishlistPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // States
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingItem, setViewingItem] = useState<WishlistItem | null>(null);

  const limit = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchWishlists = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const url = `/api/wishlists?page=${currentPage}&per_page=${limit}&q=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch wishlists");
      const json = await res.json();
      setItems(json.data || []);
      setTotalPages(json.meta?.last_page || 1);
      setTotalItems(json.meta?.total || 0);
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to load wishlists", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      const handler = setTimeout(() => {
        fetchWishlists();
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [mounted, currentPage, searchTerm]);

  const handleOpenDelete = (item: WishlistItem) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setDeleting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/wishlists/${selectedItem.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to remove item from wishlist");
      toast("Wishlist item removed successfully", "success");
      setIsDeleteOpen(false);
      fetchWishlists();
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to remove item", "error");
    } finally {
      setDeleting(false);
      setSelectedItem(null);
    }
  };

  if (!mounted) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-slate-955 transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Loading Wishlists...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-0 sm:p-2 lg:p-4 bg-gray-55 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Breadcrumb Header */}
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Wishlists" }]} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              Customer Wishlists
            </h1>
            <p className="text-sm text-gray-505 dark:text-slate-400">Monitor and manage products wishlisted by customers.</p>
          </div>
        </div>
      </div>

      {/* Search Filter Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4">
        <div className="relative">
          <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by customer name, email, or product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:ring-green-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-800 text-green-500 mb-4 border border-transparent dark:border-slate-700">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-1">No Wishlist Items</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">No customer wishlists match your current search.</p>
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden lg:block w-full overflow-x-auto">
              <Table className="min-w-[800px] w-full">
                <TableHeader className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="py-4 pl-6 font-semibold w-[350px]">Product</TableHead>
                    <TableHead className="py-4 font-semibold">Customer</TableHead>
                    <TableHead className="py-4 font-semibold w-[150px]">Date Added</TableHead>
                    <TableHead className="py-4 font-semibold text-right pr-6 w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-55 dark:hover:bg-slate-800/30">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          {item.productImage ? (
                            <img
                              src={formatImage(item.productImage)}
                              alt={item.productName}
                              className="h-10 w-10 object-cover rounded-lg border border-gray-150 dark:border-slate-800"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-405">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                              {item.productName}
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                              ৳{item.productPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{item.customerName}</span>
                          <span className="text-xs text-gray-500">{item.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-500">{item.createdAt}</TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingItem(item)}
                            className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(item)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                            title="Remove item"
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

            {/* Mobile/Tablet View (Card grid layout) */}
            <div className="block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-55/50 dark:bg-slate-900/10">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 space-y-4 bg-white dark:bg-slate-900 border border-gray-205 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    {item.productImage ? (
                      <img
                        src={formatImage(item.productImage)}
                        alt={item.productName}
                        className="h-12 w-12 object-cover rounded-lg border border-gray-150 dark:border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{item.productName}</h4>
                      <span className="text-xs text-green-600 dark:text-green-400 font-bold block mt-0.5">
                        ৳{item.productPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 border-t border-b border-gray-100 dark:border-slate-850 flex flex-col gap-1 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Customer</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.customerName}
                      </span>
                      <span className="text-gray-500 block text-[11px] font-mono mt-0.5">{item.customerEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-450 dark:text-slate-500">
                      Added: {item.createdAt}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingItem(item)}
                        className="h-8.5 w-8.5 rounded-xl text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDelete(item)}
                        className="h-8.5 w-8.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-955/20 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-gray-505 dark:text-slate-400 font-medium">
                  Showing {items.length} of {totalItems} items
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg cursor-pointer border-gray-200 dark:border-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-semibold px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg cursor-pointer border-gray-200 dark:border-slate-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Remove Wishlist Item?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to remove this product from the customer&apos;s wishlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl h-10 font-semibold cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 font-semibold cursor-pointer"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Item Details Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              Wishlist Entry Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Details of product wishlisted by customer.
            </DialogDescription>
          </DialogHeader>

          {viewingItem && (
            <div className="space-y-5 py-2">
              {/* Product preview card */}
              <div className="flex gap-4 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                {viewingItem.productImage ? (
                  <img
                    src={formatImage(viewingItem.productImage)}
                    alt={viewingItem.productName}
                    className="h-16 w-16 object-cover rounded-lg border border-gray-150 dark:border-slate-800 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <Package className="h-6 w-6" />
                  </div>
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <span className="font-bold text-gray-900 dark:text-white text-sm truncate leading-snug">
                    {viewingItem.productName}
                  </span>
                  <span className="text-sm font-black text-green-600 dark:text-green-400 mt-1">
                    ৳{viewingItem.productPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Customer details info */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Customer Details</h4>
                <div className="grid grid-cols-3 gap-y-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                  <span className="text-gray-500">Name:</span>
                  <span className="col-span-2 font-semibold text-gray-800 dark:text-slate-200">{viewingItem.customerName}</span>

                  <span className="text-gray-500">Email:</span>
                  <span className="col-span-2 font-semibold text-gray-800 dark:text-slate-200 truncate">{viewingItem.customerEmail}</span>
                  
                  <span className="text-gray-500">User ID:</span>
                  <span className="col-span-2 font-mono text-gray-800 dark:text-slate-200">#{viewingItem.userId}</span>
                </div>

                <h4 className="font-bold uppercase tracking-wider text-gray-400 text-[10px] pt-1">Activity Log</h4>
                <div className="grid grid-cols-3 gap-y-2">
                  <span className="text-gray-500">Date Added:</span>
                  <span className="col-span-2 font-semibold text-gray-800 dark:text-slate-200">{viewingItem.createdAt}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setViewingItem(null)}
              className="rounded-xl h-10 font-semibold cursor-pointer border-gray-200 dark:border-slate-800"
            >
              Close
            </Button>
            {viewingItem && (
              <Button
                onClick={() => {
                  setViewingItem(null);
                  router.push(`/admin/products/view/${viewingItem.productId}`);
                }}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 font-semibold cursor-pointer"
              >
                Go to Product
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
