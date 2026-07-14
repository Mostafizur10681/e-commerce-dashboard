"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import {
  Printer,
  Download,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Calendar,
  Building,
  User,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { Order, PaymentStatus, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface InvoiceViewProps {
  order: Order;
}

export default function InvoiceView({ order: rawOrder }: InvoiceViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Normalize API snake_case data to the camelCase shape this component expects
  const order = {
    ...rawOrder,
    id: rawOrder.id,
    order_number: (rawOrder as any).order_number || String(rawOrder.id),
    customerName: (rawOrder as any).customerName || (rawOrder as any).customer_name || 'N/A',
    customerEmail: (rawOrder as any).customerEmail || (rawOrder as any).customer_email || '',
    customerPhone: (rawOrder as any).customerPhone || (rawOrder as any).customer_phone || '',
    date: (rawOrder as any).date || ((rawOrder as any).created_at ? new Date((rawOrder as any).created_at).toLocaleDateString() : 'N/A'),
    created_at: (rawOrder as any).created_at || (rawOrder as any).date || '',
    amount: Number((rawOrder as any).amount || (rawOrder as any).total || 0),
    subtotal: Number((rawOrder as any).subtotal || 0),
    shippingCost: Number((rawOrder as any).shippingCost || (rawOrder as any).shipping_cost || 0),
    paymentMethod: (rawOrder as any).paymentMethod || (rawOrder as any).payment_method || 'Cash on Delivery',
    paymentStatus: (rawOrder as any).paymentStatus || (rawOrder as any).payment_status || 'Pending',
    status: (rawOrder as any).status || 'Pending',
    shippingAddress: (rawOrder as any).shippingAddress || {
      street: (rawOrder as any).address || '',
      city: (rawOrder as any).district || '',
      state: (rawOrder as any).thana || '',
      country: (rawOrder as any).division || 'Bangladesh',
    },
    items: ((rawOrder as any).items || []).map((item: any) => ({
      ...item,
      productName: item.productName || item.product?.name || 'Product',
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      attributes: item.attributes || null,
    })),
  };

  const subtotalVal = order.subtotal || (order.amount - (order.shippingCost || 0));
  const shippingVal = order.shippingCost || 0;
  const vatVal = Math.round(subtotalVal * 0.05); // 5% VAT
  const discountVal = 0; // $0 discount
  const grandTotalVal = order.amount;
  const payStatus = order.paymentStatus || "Paid";

  const getOrderBadgeStyle = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Processing":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Pending":
        return "bg-slate-100 text-slate-700 dark:bg-slate-805 dark:text-slate-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Returned":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPaymentBadgeStyle = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Refunded":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-850 dark:text-gray-400";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      let y = 20;

      // Company Info Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(22, 163, 74); // #16A34A
      doc.text("FreshMart Ltd.", 15, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      y += 6;
      doc.text("Plot 12, Road 45, Gulshan-2, Dhaka 1212", 15, y);
      y += 4.5;
      doc.text("Phone: +880 1712-345678 | Email: info@freshmart.com", 15, y);

      // Invoice metadata (top-right align)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // text-slate-800
      doc.text("INVOICE", 150, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Invoice No: INV-${order.order_number || String(order.id)}`, 150, 26);
      doc.text(`Order ID: #${order.order_number || String(order.id)}`, 150, 31);
      doc.text(`Date: ${order.date}`, 150, 36);

      // Horizontal separator line
      y = 42;
      doc.setDrawColor(226, 232, 240); // border-slate-200
      doc.setLineWidth(0.4);
      doc.line(15, y, 195, y);

      // Customer Bill To Info vs Order Info
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("BILL TO:", 15, y);
      doc.text("ORDER INFO:", 110, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      
      y += 5.5;
      doc.text(`Name: ${order.customerName}`, 15, y);
      doc.text(`Order Date: ${order.date}`, 110, y);
      
      y += 5;
      doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 15, y);
      doc.text(`Payment Method: ${order.paymentMethod}`, 110, y);
      
      y += 5;
      doc.text(`Email: ${order.customerEmail || 'N/A'}`, 15, y);
      doc.text(`Payment Status: ${payStatus}`, 110, y);
      
      y += 5;
      doc.text(`Address: ${order.shippingAddress?.street || 'N/A'}`, 15, y);
      doc.text(`Order Status: ${order.status}`, 110, y);
      
      y += 5;
      doc.text(`District: ${order.shippingAddress?.city || "Dhaka"}`, 15, y);
      y += 5;
      doc.text(`Thana: ${order.shippingAddress?.state || "Gulshan"}`, 15, y);

      // Product Table Header
      y += 12;
      doc.setFillColor(248, 250, 252); // bg-slate-50
      doc.rect(15, y, 180, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Product Description", 18, y + 5.5);
      doc.text("Qty", 120, y + 5.5);
      doc.text("Unit Price", 145, y + 5.5);
      doc.text("Subtotal", 175, y + 5.5);

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      y += 8;

      order.items.forEach((item: any) => {
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y, 195, y);
        y += 6.5;
        doc.text(item.productName, 18, y);
        doc.text(String(item.quantity), 120, y);
        doc.text(`BDT ${item.price}`, 145, y);
        doc.text(`BDT ${item.price * item.quantity}`, 175, y);
        // Print attributes below product name
        if (item.attributes && typeof item.attributes === 'object') {
          const attrPairs = Object.entries(item.attributes);
          if (attrPairs.length > 0) {
            y += 4.5;
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            const attrText = attrPairs.map(([k, v]) => `${k}: ${v}`).join('  |  ');
            doc.text(attrText, 20, y);
            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
          }
        }
        y += 2;
      });

      // Horizontal separator line before calculations
      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.line(110, y, 195, y);

      // Summary
      y += 6;
      doc.text("Subtotal:", 120, y);
      doc.text(`$${subtotalVal}`, 175, y);

      y += 5;
      doc.text("Discount:", 120, y);
      doc.text(`$${discountVal}`, 175, y);

      y += 5;
      doc.text("VAT/Tax (5%):", 120, y);
      doc.text(`$${vatVal}`, 175, y);

      y += 5;
      doc.text("Shipping Charge:", 120, y);
      doc.text(`$${shippingVal}`, 175, y);

      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.line(110, y, 195, y);

      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Grand Total:", 120, y);
      doc.setTextColor(22, 163, 74); // primary green
      doc.text(`$${grandTotalVal}`, 175, y);

      // Thank You Note
      y += 20;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for shopping with FreshMart! For any queries, contact support@freshmart.com", 15, y);

      doc.save(`invoice_${order.id}.pdf`);
      toast("PDF downloaded successfully", "success");
    } catch (err) {
      console.error("PDF Generation error", err);
      toast("Failed to download PDF", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action panel (Hidden on print) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <button
          onClick={() => router.push("/admin/orders")}
          className="h-10 px-4 flex items-center gap-2 font-medium cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-fit shadow-xs"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back To Orders
        </button>
        <div className="flex items-center gap-2.5">
          <Button
            onClick={handlePrint}
            className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-medium shadow-sm transition-all cursor-pointer"
          >
            <Printer className="h-4.5 w-4.5" />
            Print Invoice
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="h-10 rounded-xl px-5 flex items-center gap-2 font-medium border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer shadow-xs"
          >
            <Download className="h-4.5 w-4.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Area */}
      <div
        id="invoice-print-area"
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 shadow-sm transition-all max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:bg-white print:text-black"
      >
        {/* Style block for print margins */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            #invoice-print-area {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
          }
        `}} />

        {/* Top Section: Company logo & metadata */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b border-gray-150 dark:border-gray-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-950/20 text-[#16A34A] dark:text-green-400 font-bold flex items-center justify-center border border-green-100/50 dark:border-green-900/30">
                <ShoppingBag className="h-5.5 w-5.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white print:text-black">
                FreshMart Ltd.
              </span>
            </div>
            <div className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed print:text-gray-700">
              <p>Plot 12, Road 45, Gulshan-2, Dhaka 1212</p>
              <p>Phone: +880 1712-345678 | Email: info@freshmart.com</p>
            </div>
          </div>

          <div className="md:text-right space-y-1 text-sm">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white print:text-black tracking-tight">INVOICE</h1>
            <p className="text-xs text-gray-500 font-medium">Invoice No: <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 print:text-black">INV-{order.order_number || String(order.id)}</span></p>
            <p className="text-xs text-gray-505">Order ID: <span className="font-semibold text-gray-800 dark:text-gray-200 print:text-black">#{order.order_number || String(order.id)}</span></p>
            <p className="text-xs text-gray-505">Invoice Date: <span className="font-semibold text-gray-800 dark:text-gray-200 print:text-black">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span></p>
          </div>
        </div>

        {/* Customer & Order details columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-150 dark:border-gray-800 text-sm">
          {/* Billing / Customer info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 pb-1 border-b border-gray-100 dark:border-gray-850">
              <User className="h-4 w-4 text-[#16A34A]" /> Bill To
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 print:text-black">
              <p className="text-sm font-bold text-gray-900 dark:text-white print:text-black">{order.customerName}</p>
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> {order.customerPhone || 'N/A'}</p>
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> {order.customerEmail || 'N/A'}</p>
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <span>
                  {order.shippingAddress?.street || 'N/A'}<br />
                  District: {order.shippingAddress?.city || 'N/A'}<br />
                  Thana: {order.shippingAddress?.state || 'N/A'}<br />
                  Division: {order.shippingAddress?.country || 'Bangladesh'}
                </span>
              </p>
            </div>
          </div>

          {/* Order metadata */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 pb-1 border-b border-gray-100 dark:border-gray-850">
              <Building className="h-4 w-4 text-[#16A34A]" /> Order Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-850 pb-1.5">
                <span className="text-gray-500">Order Date:</span>
                <span className="font-semibold text-gray-900 dark:text-white print:text-black">{order.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-855 pb-1.5">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-semibold text-gray-900 dark:text-white print:text-black flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-gray-400" /> {order.paymentMethod || "PayPal"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-gray-855 pb-1.5">
                <span className="text-gray-500">Payment Status:</span>
                <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border-transparent ${getPaymentBadgeStyle(payStatus)}`}>
                  {payStatus}
                </Badge>
              </div>
              <div className="flex justify-between pb-0.5">
                <span className="text-gray-500">Order Fulfillment Status:</span>
                <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border-transparent ${getOrderBadgeStyle(order.status)}`}>
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered products table */}
        <div className="py-8">
          <div className="overflow-x-auto border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-150 dark:border-gray-800 text-gray-500 font-bold">
                  <th className="pl-5 py-3.5">Product</th>
                  <th className="py-3.5 text-center w-[80px]">Quantity</th>
                  <th className="py-3.5 text-center w-[120px]">Unit Price</th>
                  <th className="pr-5 py-3.5 text-right w-[120px]">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.items.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                    <td className="pl-5 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white print:text-black block">
                        {item.productName}
                      </span>
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(item.attributes).map(([key, val]: [string, any]) => (
                            <span
                              key={key}
                              className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 capitalize print:border print:border-gray-300 print:text-gray-700 print:bg-transparent"
                            >
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-center font-bold text-gray-800 dark:text-gray-200 print:text-black">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-center font-medium text-gray-700 dark:text-gray-300 print:text-black">
                      ৳{item.price}
                    </td>
                    <td className="pr-5 py-4 text-right font-extrabold text-gray-900 dark:text-white print:text-black">
                      ৳{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals panel grid */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 py-6 border-t border-gray-150 dark:border-gray-800">
          <div className="text-[11px] text-gray-400 dark:text-gray-500 max-w-sm leading-relaxed print:text-gray-600">
            <h4 className="font-bold text-gray-505 dark:text-gray-400 mb-1">Invoice Notes:</h4>
            <p>Please check your items upon delivery. Keep this copy for return/warranty purposes. All checks can be addressed to FreshMart Ltd.</p>
          </div>

          <div className="w-full sm:max-w-xs space-y-2.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-950 dark:text-white print:text-black">${subtotalVal}</span>
            </div>
            <div className="flex justify-between text-gray-550">
              <span>Discount</span>
              <span className="font-semibold text-gray-950 dark:text-white print:text-black">${discountVal}</span>
            </div>
            <div className="flex justify-between text-gray-550">
              <span>VAT/Tax (5%)</span>
              <span className="font-semibold text-gray-950 dark:text-white print:text-black">${vatVal}</span>
            </div>
            <div className="flex justify-between text-gray-550">
              <span>Shipping Charge</span>
              <span className="font-semibold text-gray-950 dark:text-white print:text-black">${shippingVal}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-extrabold text-sm text-gray-900 dark:text-white print:text-black">
              <span>Grand Total</span>
              <span className="text-[#16A34A] dark:text-green-400 text-base">${grandTotalVal}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-850 text-[10px] text-gray-400">
          FreshMart Ltd. © 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
}
