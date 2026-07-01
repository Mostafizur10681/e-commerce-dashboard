"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Layers,
  Info,
  Loader2,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface EditFAQCategoryFormValues {
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

export default function EditFAQCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditFAQCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (!id) return;
    const fetchCategoryDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/faq-categories/${id}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to load FAQ category details");
        const category = await res.json();
        
        setValue("name", category.name);
        setValue("description", category.description || "");
        setValue("status", category.status);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while loading FAQ category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [id, setValue]);

  const onSubmit = async (values: EditFAQCategoryFormValues) => {
    try {
      setIsSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/faq-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update FAQ category");
      }

      toast("FAQ category updated successfully", "success");
      router.push("/admin/faq-categories");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to update FAQ category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-16 text-center max-w-sm mx-auto min-h-[400px] flex flex-col justify-center items-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Failed to Load</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{error}</p>
        <Button onClick={() => router.push("/admin/faq-categories")} variant="outline" className="rounded-xl h-10 px-5">
          Back to FAQ Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 p-6 bg-white dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "FAQ Categories", href: "/admin/faq-categories" },
          { label: "Edit Category" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-green-600 dark:text-green-500" />
            Edit FAQ Category
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Update category classification details.
          </p>
        </div>
        <Link
          href="/admin/faq-categories"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 mb-2">
            <Info className="h-4.5 w-4.5 text-green-600 dark:text-green-500" />
            FAQ Category Details
          </h3>

          {/* Name */}
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Orders & Shipping"
              {...register("name", { required: "Category name is required" })}
              className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
            />
            {errors.name && (
              <span className="text-xs text-red-500 font-semibold">{errors.name.message}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Description
            </Label>
            <Textarea
              placeholder="Describe the topics covered in this FAQ category..."
              rows={4}
              {...register("description")}
              className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl p-3 text-sm focus-visible:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Status
            </Label>
            <select
              {...register("status")}
              className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/faq-categories")}
            className="rounded-xl h-10 px-5 border-gray-300 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer border-transparent"
          >
            {isSubmitting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
            Save FAQ Category
          </Button>
        </div>
      </form>
    </div>
  );
}
