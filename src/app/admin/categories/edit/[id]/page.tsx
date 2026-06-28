"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  UploadCloud,
  X,
  FileText,
  Layers,
  Sparkles,
  Info,
  Loader2,
  AlertTriangle
} from "lucide-react";

import { useStore } from "@/store";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

interface EditCategoryFormValues {
  name: string;
  description: string;
  status: "Active" | "Inactive";
  seoTitle: string;
  seoDescription: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { updateCategory: storeUpdateCategory } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      status: "Active",
      seoTitle: "",
      seoDescription: "",
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/categories/${id}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Category not found");
          }
          throw new Error("Failed to load category details");
        }
        const category: Category = await res.json();
        reset({
          name: category.name,
          description: category.description,
          status: category.status || "Active",
          seoTitle: category.seoTitle || "",
          seoDescription: category.seoDescription || "",
        });
        if (category.imageUrl) {
          setImagePreview(category.imageUrl);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setImageError("Selected file must be an image");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
 
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setImageError("Selected file must be an image");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (values: EditCategoryFormValues) => {
    if (!imagePreview && !imageFile) {
      setImageError("Category image is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("status", values.status);
      formData.append("seoTitle", values.seoTitle);
      formData.append("seoDescription", values.seoDescription);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      const updatedCategory = await res.json();

      // Sync Zustand Store
      storeUpdateCategory(id, updatedCategory);

      toast("Category updated successfully", "success");

      router.push("/admin/categories");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to update category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading category details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs mt-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold mb-1">Error Loading Category</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#16A34A] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Categories", href: "/admin/categories" },
          { label: "Edit Category" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#16A34A]" />
            Edit Category
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update category properties, SEO info, and cover image.
          </p>
        </div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-655 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Info */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Info className="h-4.5 w-4.5 text-[#16A34A]" />
              General Information
            </h3>

            {/* Category Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Smart Electronics, Running Shoes"
                {...register("name", { required: "Category name is required" })}
                className="h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
              />
              {errors.name && (
                <p className="text-xs text-red-550 dark:text-red-400 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Give a descriptive summary for this category classification..."
                rows={4}
                {...register("description")}
                className="border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <select
                id="status"
                {...register("status")}
                className="w-full h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-700 dark:text-gray-300"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <FileText className="h-4.5 w-4.5 text-[#16A34A]" />
              Search Engine Optimization (Optional)
            </h3>

            {/* SEO Title */}
            <div className="space-y-1.5">
              <Label htmlFor="seoTitle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta SEO Title
              </Label>
              <Input
                id="seoTitle"
                placeholder="Custom title tag for browser tabs"
                {...register("seoTitle")}
                className="h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>

            {/* SEO Description */}
            <div className="space-y-1.5">
              <Label htmlFor="seoDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta SEO Description
              </Label>
              <Textarea
                id="seoDescription"
                placeholder="Short snippet summary for search results page description..."
                rows={3}
                {...register("seoDescription")}
                className="border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Image Uploader */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <Sparkles className="h-4.5 w-4.5 text-[#16A34A]" />
              Category Cover Image <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-gray-400">
              Selected image representing this category. Required format: PNG, JPG, or WEBP.
            </p>

            {/* Drop Zone Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[200px] transition-all ${
                isDragActive
                  ? "border-[#16A34A] bg-[#16A34A]/5"
                  : imagePreview
                  ? "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-955/20"
                  : "border-gray-250 dark:border-gray-800 hover:border-[#16A34A]/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/10"
              }`}
            >
              {imagePreview ? (
                /* Preview State */
                <div className="relative w-full h-full space-y-3">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-850">
                    <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-lg shadow-md cursor-pointer border-transparent"
                      onClick={removeImage}
                    >
                      <X className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 truncate">
                    {imageFile ? imageFile.name : "Active image URL"}
                  </p>
                </div>
              ) : (
                /* Initial Upload prompt state */
                <div className="space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/20 text-[#16A34A]">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#16A34A] hover:underline cursor-pointer">
                      <span>Click to upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-xs text-gray-450 dark:text-gray-400 mt-1">or drag and drop here</p>
                  </div>
                </div>
              )}
            </div>

            {imageError && <p className="text-xs text-red-550 dark:text-red-400 font-medium">{imageError}</p>}
          </div>

          {/* Submission Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push("/admin/categories")}
              className="flex-1 rounded-xl h-10 border-gray-200 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 border-transparent shadow-xs transition-colors cursor-pointer flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
