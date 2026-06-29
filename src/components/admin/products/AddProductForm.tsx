"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useStore } from "@/store";
import { useRouter } from "next/navigation";
import ProductInfoFields from "@/components/admin/products/ProductInfoFields";
import PriceFields from "@/components/admin/products/PriceFields";
import InventoryFields from "@/components/admin/products/InventoryFields";
import StatusFields from "@/components/admin/products/StatusFields";
import BadgeCheckboxes from "@/components/admin/products/BadgeCheckboxes";
import SEOFields from "@/components/admin/products/SEOFields";
import ProductPreviewCard from "@/components/admin/products/ProductPreviewCard";
import ImageUploader, { ImageEntry } from "@/components/admin/products/ImageUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

export default function AddProductForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [imageError, setImageError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      subCategory: "",
      brand: "",
      shortDescription: "",
      description: "",
      regularPrice: 0,
      salePrice: 0,
      costPrice: 0,
      tax: 0,
      discount: 0,
      stockQuantity: 0,
      sku: "",
      barcode: "",
      unit: "",
      status: "active" as const,
      stockStatus: "in-stock" as const,
      featured: false,
      bestSeller: false,
      organic: false,
      newArrival: false,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  const { handleSubmit } = methods;

  const handleAddImages = (entries: ImageEntry[]) => {
    setImages((prev) => [...prev, ...entries]);
    setImageError("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (featuredIdx >= idx && featuredIdx > 0) {
      setFeaturedIdx((p) => p - 1);
    } else if (featuredIdx === idx) {
      setFeaturedIdx(0);
    }
  };

  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      setImageError("At least one product image is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;

      // Convert all new files to base64 strings
      const imagePayload = await Promise.all(
        images.map(async (img) => {
          if (img.file) {
            return await toBase64(img.file);
          }
          return img.preview;
        })
      );

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...data,
          images: imagePayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      toast("Product saved successfully!");
      router.push("/admin/products");
    } catch (e: any) {
      console.error(e);
      toast(e.message || "Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* LEFT — Images */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Product Images
            </h2>
            <ImageUploader
              images={images}
              featuredIdx={featuredIdx}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
              onSetFeatured={setFeaturedIdx}
              error={imageError}
            />
          </div>
        </section>

        {/* RIGHT — Form cards */}
        <section className="space-y-4">
          <ProductInfoFields />
          <PriceFields />
          <InventoryFields />
          <StatusFields />
          <BadgeCheckboxes />
          <SEOFields />

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl px-6"
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl">
              Save &amp; Publish
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </section>

        {/* LIVE PREVIEW — full width */}
        <section className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Live Preview
          </h2>
          <ProductPreviewCard
            images={images.map((e) => e.preview)}
            featuredIdx={featuredIdx}
          />
        </section>
      </form>
    </FormProvider>
  );
}
