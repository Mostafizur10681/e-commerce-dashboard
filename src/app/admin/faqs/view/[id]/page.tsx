"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  HelpCircle,
  ArrowLeft,
  Calendar,
  Sparkles,
  Loader2,
  AlertTriangle,
  Pencil
} from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ViewFaqPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getFaqById } = useStore();

  const [loading, setLoading] = useState(true);
  const [faq, setFaq] = useState<any>(null);

  useEffect(() => {
    if (id) {
      // First try store
      const storeData = getFaqById(id);
      if (storeData) {
        setFaq(storeData);
        setLoading(false);
      } else {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        fetch(`/api/faqs/${id}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Not found");
          })
          .then((data) => {
            setFaq(data);
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

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading FAQ details...</span>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-955 rounded-2xl border border-gray-250 p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <h3 className="text-lg font-bold">FAQ Not Found</h3>
        <p className="text-sm text-gray-500">The requested FAQ record does not exist or has been deleted.</p>
        <Button onClick={() => router.push("/admin/faqs")} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl cursor-pointer border-transparent">
          Back to List
        </Button>
      </div>
    );
  }

  const isActive = (faq.status || "active").toLowerCase() === "active";

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "FAQs", href: "/admin/faqs" },
            { label: "View FAQ" },
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
              View FAQ Details
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Read-only details of the FAQ database entry
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden transition-all">
        {/* Header decoration */}
        <div className="h-32 bg-green-50 dark:bg-green-950/20 border-b border-gray-150 dark:border-gray-800 relative flex items-center px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#16A34A]" />
            <span className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">FAQ Information Profile</span>
          </div>
        </div>

        {/* Profile Card Container */}
        <div className="px-8 pb-8 relative -mt-12 space-y-6">
          {/* Action Row */}
          <div className="flex justify-end">
            <Button
              onClick={() => router.push(`/admin/faqs/edit/${faq.id}`)}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-medium cursor-pointer border-transparent shadow-xs transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit FAQ
            </Button>
          </div>

          {/* Details list */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
            {/* Category */}
            <div className="grid grid-cols-3 gap-4 items-center py-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</span>
              <div className="col-span-2">
                <Badge className="rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  {faq.category || "General Questions"}
                </Badge>
              </div>
            </div>

            {/* Question */}
            <div className="grid grid-cols-3 gap-4 items-start py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-1">FAQ Question</span>
              <span className="col-span-2 text-sm font-bold text-gray-900 dark:text-white leading-snug">{faq.question}</span>
            </div>

            {/* Answer */}
            <div className="grid grid-cols-3 gap-4 items-start py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-405 uppercase tracking-wider pt-1">FAQ Answer</span>
              <span className="col-span-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-55/30 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-100 dark:border-gray-850 block whitespace-pre-wrap">
                {faq.answer}
              </span>
            </div>

            {/* Display Order */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-950">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Display Order</span>
              <span className="col-span-2 text-sm font-mono font-bold text-gray-900 dark:text-white">{faq.displayOrder}</span>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Status</span>
              <div className="col-span-2">
                <Badge
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${
                    isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Created Date */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-505 dark:text-gray-400 uppercase tracking-wider">Created Date</span>
              <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-750 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{faq.createdAt ? new Date(faq.createdAt).toLocaleString() : "No Date"}</span>
              </div>
            </div>

            {/* Last Updated Date */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-wider">Last Updated</span>
              <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-750 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{faq.updatedAt ? new Date(faq.updatedAt).toLocaleString() : "No Date"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
