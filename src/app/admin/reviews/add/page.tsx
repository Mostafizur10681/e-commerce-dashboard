"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  Star,
  UploadCloud,
  X,
  MessageSquare,
  Sparkles,
  Info,
  Loader2,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const reviewSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  rating: z.number().min(1, "Please select a rating between 1 and 5").max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  status: z.enum(["Approved", "Pending", "Rejected"]),
  imageUrl: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function AddReviewPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customerName: "",
      productName: "",
      rating: 5,
      comment: "",
      status: "Pending",
      imageUrl: "",
    },
  });

  const { setValue } = form;

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("Selected file must be an image");
      return;
    }
    setImageError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setValue("imageUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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
      processFile(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("imageUrl", "");
    setImageError(null);
  };

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      setIsSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      toast("Review added successfully", "success");
      router.push("/admin/reviews");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 p-6 bg-white dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Reviews", href: "/admin/reviews" },
          { label: "Add Review" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-500" />
            Add New Review
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Create a custom customer feedback log manually.
          </p>
        </div>
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Columns: Form Fields */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-105 flex items-center gap-2 mb-2">
                <Info className="h-4.5 w-4.5 text-green-600 dark:text-green-500" />
                Review Details
              </h3>

              {/* Customer Name */}
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Customer Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Jane Doe"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Name */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Product Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Organic Avocados, Wireless Headset"
                        {...field}
                        className="h-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Review Comment */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Review Comment <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write customer review content..."
                        rows={5}
                        {...field}
                        className="border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Right 1 Column: Rating, Status, and Image Attach */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none space-y-5">
              {/* Rating Star Selection */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Product Rating <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isHighlighted = hoveredRating !== null ? star <= hoveredRating : star <= field.value;
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(null)}
                              onClick={() => field.onChange(star)}
                              className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                            >
                              <Star
                                className={`h-7 w-7 transition-all duration-150 ${isHighlighted
                                    ? "fill-yellow-400 text-yellow-400 scale-105"
                                    : "text-gray-300 dark:text-slate-700"
                                  }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Select */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Moderation Status
                    </FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-10 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Review Photo Attachment */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block">
                  Review Attachment (Optional)
                </Label>
                <p className="text-xs text-gray-400">
                  Upload a photo showing the product in use.
                </p>

                {/* Drop Zone Box */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center min-h-[170px] transition-all duration-200 ${isDragActive
                      ? "border-green-500 bg-green-500/5"
                      : imagePreview
                        ? "border-gray-200 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-950/20"
                        : "border-gray-300 dark:border-slate-750 hover:border-green-500 hover:bg-gray-50/50 dark:hover:bg-slate-800/10"
                    }`}
                >
                  {imagePreview ? (
                    /* Preview State */
                    <div className="relative w-full h-full space-y-2">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-black/5 flex items-center justify-center">
                        <img src={imagePreview} alt="Review attachment preview" className="max-h-36 object-contain" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 rounded-lg shadow-md cursor-pointer hover:bg-red-650"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Drop zone prompt */
                    <div className="space-y-3">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline cursor-pointer">
                          <span>Click to upload image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="text-[10px] text-gray-400 mt-0.5">or drag and drop here</p>
                      </div>
                    </div>
                  )}
                </div>

                {imageError && <p className="text-xs text-red-500 font-medium">{imageError}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/admin/reviews")}
                  className="flex-1 rounded-xl h-10 border-gray-300 dark:border-slate-700 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl h-10 border-transparent shadow-sm transition-colors cursor-pointer flex items-center justify-center font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    "Save Review"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
