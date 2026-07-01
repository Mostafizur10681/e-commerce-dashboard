"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { HelpCircle, ArrowLeft, Sparkles, ChevronDown, Loader2, AlertTriangle } from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

export default function EditFaqPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { getFaqById, updateFaq } = useStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [category, setCategory] = useState("General Questions");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // Dynamic categories
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch("/api/faq-categories", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          const list = json && Array.isArray(json.faqCategories) ? json.faqCategories : (Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
          setCategories(list);
        }
      } catch (err) {
        console.error("Failed to load FAQ categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Tab State: "edit" or "preview"
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Accordion preview expand state (within preview tab)
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);

  // Validation States
  const [errors, setErrors] = useState<{
    question?: string;
    answer?: string;
    displayOrder?: string;
  }>({});

  useEffect(() => {
    if (id) {
      // First try store
      const faq = getFaqById(id);
      if (faq) {
        setQuestion(faq.question || "");
        setAnswer(faq.answer || "");
        setDisplayOrder((faq.displayOrder || 1).toString());
        setStatus((faq.status as "active" | "inactive") || "active");
        setCategory(faq.category || "General Questions");
        setLoading(false);
      } else {
        // Fetch from API
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        fetch(`/api/faqs/${id}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("FAQ not found");
          })
          .then((data) => {
            setQuestion(data.question || "");
            setAnswer(data.answer || "");
            setDisplayOrder((data.displayOrder || 1).toString());
            setStatus((data.status as "active" | "inactive") || "active");
            setCategory(data.category || "General Questions");
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [id, getFaqById]);

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

    setSaving(true);
    try {
      const parsedOrder = parseInt(displayOrder, 10);
      const payload = {
        category,
        question,
        answer,
        displayOrder: isNaN(parsedOrder) ? 1 : parsedOrder,
        status,
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/faqs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update FAQ");
      const savedData = await res.json();

      // Sync local store
      updateFaq(id, payload);

      toast("FAQ updated successfully", "success");
      router.push("/admin/faqs");
    } catch (err) {
      console.error(err);
      toast("Failed to update FAQ", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-55 dark:bg-gray-950 transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-550 dark:text-gray-400">Loading FAQ details...</span>
      </div>
    );
  }

  if (!question && !answer) {
    return (
      <div className="min-h-screen p-6 bg-gray-55 dark:bg-gray-955 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">FAQ Not Found</h3>
          <p className="text-sm text-gray-505 dark:text-gray-400">The requested FAQ record does not exist or has been deleted.</p>
          <Button onClick={() => router.push("/admin/faqs")} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl cursor-pointer border-transparent shadow-sm">
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="max-w-2xl mx-auto space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "FAQs", href: "/admin/faqs" },
            { label: "Edit FAQ" },
          ]}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push("/admin/faqs")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:text-[#16A34A] hover:bg-green-55/20 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#16A34A]" />
              Edit FAQ
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Update FAQ details
            </p>
          </div>
        </div>
      </div>

      {/* Main Centered Form Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
        
        {/* Custom Header decoration */}
        <div className="px-6 py-5 bg-green-50/20 dark:bg-green-950/10 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-[#16A34A]" />
            <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">Configure FAQ Record</span>
          </div>
          
          {/* Form / Preview Tabs Selector */}
          <div className="flex p-0.5 rounded-lg bg-gray-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === "edit"
                  ? "bg-white dark:bg-slate-900 text-[#16A34A] shadow-xs"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250"
              )}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                activeTab === "preview"
                  ? "bg-white dark:bg-slate-900 text-[#16A34A] shadow-xs"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250"
              )}
            >
              Preview
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {activeTab === "edit" ? (
            /* ================= EDIT FORM TAB ================= */
            <div className="space-y-5">
              {/* Category selector */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                  FAQ Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={categoriesLoading}
                  className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-900 dark:text-white cursor-pointer transition-colors disabled:opacity-50"
                >
                  {categoriesLoading ? (
                    <option value="">Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="General">General</option>
                  ) : (
                    categories.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Question Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="question" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    FAQ Question <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {question.length}/150
                  </span>
                </div>
                <Input
                  id="question"
                  value={question}
                  maxLength={150}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How long does delivery take?"
                  className="h-10 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus-visible:ring-[#16A34A] text-sm md:text-base transition-colors"
                />
                {errors.question && <p className="text-xs text-red-500 font-medium">{errors.question}</p>}
              </div>

              {/* Answer Textarea */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="answer" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    FAQ Answer <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {answer.length}/1000
                  </span>
                </div>
                <Textarea
                  id="answer"
                  value={answer}
                  maxLength={1000}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide a detailed, multi-line answer here..."
                  rows={6}
                  className="bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus-visible:ring-[#16A34A] text-sm leading-relaxed transition-colors"
                />
                {errors.answer && <p className="text-xs text-red-500 font-medium">{errors.answer}</p>}
              </div>

              {/* Grid for Display Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Display Order */}
                <div className="space-y-2">
                  <Label htmlFor="displayOrder" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    Display Order <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="e.g. 1"
                    className="h-10 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus-visible:ring-[#16A34A] transition-colors"
                  />
                  {errors.displayOrder && <p className="text-xs text-red-500 font-medium">{errors.displayOrder}</p>}
                </div>

                {/* Status Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                    className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-900 dark:text-white cursor-pointer transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* ================= LIVE PREVIEW TAB ================= */
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between border-b border-gray-105 dark:border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Live Preview Mode
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                    {category}
                  </Badge>
                  <Badge
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-transparent ${
                      status === "active"
                        ? "bg-green-105 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-400"
                    }`}
                  >
                    {status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Accordion Preview */}
              <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-gray-55/30 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                  className="w-full flex justify-between items-center p-5 bg-gray-50/50 dark:bg-slate-950/30 text-left font-bold text-gray-900 dark:text-white text-sm md:text-base focus:outline-none"
                >
                  <span className="leading-snug pr-4">{question || "Question placeholder..."}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300",
                      isPreviewExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isPreviewExpanded && (
                  <div className="p-5 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-slate-800 text-sm leading-relaxed whitespace-pre-wrap min-h-[80px]">
                    {answer || "Answer placeholder..."}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic text-center">
                * Click the accordion header above to preview expansion.
              </p>
            </div>
          )}

          {/* Action buttons (stacked on mobile, inline on desktop) */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button
              type="button"
              disabled={saving}
              onClick={() => router.push("/admin/faqs")}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl h-10 px-6 cursor-pointer border-transparent w-full sm:w-auto transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 px-8 font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer border-transparent w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  Saving...
                </>
              ) : (
                "Save FAQ"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
