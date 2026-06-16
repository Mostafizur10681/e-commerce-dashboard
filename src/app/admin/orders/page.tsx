"use client"

import { useEffect, useState } from "react";
import { Eye, Search, X, Loader2, ClipboardList, Info } from "lucide-react";

import { useStore } from "@/store";
import { Order, OrderStatus } from "@/types";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const [mounted, setMounted] = useState(false);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800" variant="outline">Delivered</Badge>;
      case "Shipped":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800" variant="outline">Shipped</Badge>;
      case "Processing":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800" variant="outline">Processing</Badge>;
      case "Pending":
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800" variant="outline">Pending</Badge>;
      case "Cancelled":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800" variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statusOptions: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track customer transactions, update shipping fulfillment states, and review order detail bills.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center max-w-sm gap-2">
        <div className="relative w-full">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search Order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 border-slate-200/85 dark:border-slate-800 dark:bg-slate-950/50"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1.5 h-6 w-6 text-slate-400 hover:text-slate-600 rounded-full"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[180px] text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ClipboardList className="h-8 w-8 stroke-1" />
                    <span>No orders found matching &quot;{searchTerm}&quot;</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100 pl-6">
                    #{order.id}
                  </TableCell>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-slate-100">${order.amount}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400 text-xs font-mono">{order.date}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {/* Status Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200 dark:border-slate-800">
                              Update Status
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Select Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {statusOptions.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => {
                                updateOrderStatus(order.id, status);
                                if (selectedOrder?.id === order.id) {
                                  setSelectedOrder({ ...selectedOrder, status });
                                }
                              }}
                            >
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Drawer Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6">
              <SheetHeader className="border-b pb-4 dark:border-slate-850">
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  Order Details #{selectedOrder.id}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Recorded on {selectedOrder.date}
                </SheetDescription>
              </SheetHeader>

              {/* Order Info Block */}
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" /> Customer Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-right">{selectedOrder.customerName}</span>
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-semibold text-right text-emerald-600 dark:text-emerald-450">Paid</span>
                    <span className="text-slate-500">Fulfillment Status:</span>
                    <span className="text-right flex justify-end">{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Purchased Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm p-3 border rounded-lg border-slate-100 dark:border-slate-850"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-850 dark:text-slate-200 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-slate-500">
                            ${item.price} &times; {item.quantity}
                          </p>
                        </div>
                        <div className="font-bold shrink-0">
                          ${item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Bill Box */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center text-slate-900 dark:text-white">
                  <span className="font-bold text-base">Grand Total</span>
                  <span className="font-black text-xl text-indigo-600 dark:text-indigo-450">
                    ${selectedOrder.amount}
                  </span>
                </div>
              </div>

              {/* Action Update Section */}
              <div className="space-y-3 pt-6 border-t dark:border-slate-850">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Change Status</p>
                <div className="flex gap-2">
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedOrder.status === status ? "default" : "outline"}
                      className={selectedOrder.status === status ? "bg-indigo-600 text-white" : "text-xs px-2 h-8"}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, status);
                        setSelectedOrder({ ...selectedOrder, status });
                      }}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
