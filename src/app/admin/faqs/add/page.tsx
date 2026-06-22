"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, ArrowLeft, Sparkles, ChevronDown } from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

export default function AddFaqPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addFaq } = useStore();

  // Form Fields State
  const [category, setCategory] = useState("General Questions");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(false);

  // Accordion preview expand state
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);

  // Validation States
  const [errors, setErrors] = useState<{
    question?: string;
    answer?: string;
    displayOrder?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!question.trim()) {
      newErrors.question = "FAQ Question is required";
    }
    if (!answer.trim()) {
      newErrors.answer = "FAQ Answer is required";
    }
    
    const orderNum = parseInt(displayOrder, 10);
    if (!displayOrder.trim()) {
      newErrors.displayOrder = "Display Order is required";
    } else if (isNaN(orderNum) || orderNum < 1) {
      newErrors.displayOrder = "Display Order must be a positive integer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast("Please fix all form validation errors", "error");
      return;
    }

    setLoading(true);
    try {
      const parsedOrder = parseInt(displayOrder, 10);
      const payload = {
        category,
        question,
        answer,
        displayOrder: isNaN(parsedOrder) ? 1 : parsedOrder,
        status,
      };

      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save FAQ");
      const savedData = await res.json();

      // Sync local store
      addFaq(payload);

      toast("FAQ created successfully", "success");
      router.push("/admin/faqs");
    } catch (err) {
      console.error(err);
      toast("Failed to create FAQ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "FAQs", href: "/admin/faqs" },
            { label: "Add FAQ" },
          ]}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push("/admin/faqs")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:text-[#16A34A] hover:bg-green-50 dark:hover:bg-green-955/20 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#16A34A]" />
              Add FAQ
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Create a new frequently asked question entry
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Form Details (8 Columns on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-[#16A34A]" />
              FAQ Content
            </h2>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-350">
                FAQ Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 border border-gray-200 dark:border-gray-850 dark:bg-gray-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-750 dark:text-gray-300 cursor-pointer"
              >
                <option value="Orders">Orders</option>
                <option value="Shipping">Shipping</option>
                <option value="Returns & Refunds">Returns & Refunds</option>
                <option value="Payments">Payments</option>
                <option value="Accounts">Accounts</option>
                <option value="Products">Products</option>
                <option value="General Questions">General Questions</option>
              </select>
            </div>

            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-semibold text-gray-700 dark:text-gray-350">
                FAQ Question <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How long does delivery take?"
                className="h-10 border-gray-205 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
              />
              {errors.question && <p className="text-xs text-red-500 font-medium">{errors.question}</p>}
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Label htmlFor="answer" className="text-sm font-semibold text-gray-700 dark:text-gray-355">
                FAQ Answer <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Orders are usually delivered within 2-5 business days depending on location."
                rows={6}
                className="border-gray-250 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A] text-sm leading-relaxed"
              />
              {errors.answer && <p className="text-xs text-red-500 font-medium">{errors.answer}</p>}
            </div>

            {/* Grid for Display Order & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="displayOrder" className="text-sm font-semibold text-gray-700 dark:text-gray-355">
                  Display Order <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="e.g. 1"
                  className="h-10 border-gray-205 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
                />
                {errors.displayOrder && <p className="text-xs text-red-500 font-medium">{errors.displayOrder}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-355">
                  Status <span className="text-red-500">*</span>
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className="w-full h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-750 dark:text-gray-300 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.push("/admin/faqs")}
              className="rounded-xl h-10 px-6 cursor-pointer border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-8 font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer border-transparent"
            >
              {loading ? "Saving..." : "Save FAQ"}
            </Button>
          </div>
        </div>

        {/* Right Side: Live Accordion Preview (4 Columns on desktop) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Live Accordion Preview
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <Badge className="rounded-full px-2 py-0.5 text-[9px] font-bold border-transparent bg-green-105/10 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  {category}
                </Badge>
                <Badge
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold border-transparent ${
                    status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-805 dark:text-gray-400"
                  }`}
                >
                  {status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Accordion Preview Container */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs bg-gray-55/30 dark:bg-gray-950/20">
              <button
                type="button"
                onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                className="w-full flex justify-between items-center p-4 bg-gray-55 dark:bg-gray-955/40 text-left font-bold text-gray-900 dark:text-white text-sm focus:outline-none"
              >
                <span className="leading-snug pr-4">{question || "How long does delivery take?"}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300",
                    isPreviewExpanded && "rotate-180"
                  )}
                />
              </button>
              {isPreviewExpanded && (
                <div className="p-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-850 text-xs leading-relaxed whitespace-pre-wrap min-h-[60px]">
                  {answer || "Orders are usually delivered within 2-5 business days depending on location."}
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic text-center">
              * Click the header to test accordion fold expansion.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
