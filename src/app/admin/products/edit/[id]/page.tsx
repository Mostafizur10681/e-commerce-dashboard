"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { useStore } from "@/store";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import ImageUploader, { ImageEntry } from "@/components/admin/products/ImageUploader";
import ProductPreviewCard from "@/components/admin/products/ProductPreviewCard";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params?.id as string;

  const { products, updateProduct, categories } = useStore();
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [imageError, setImageError] = useState("");

  const product = products.find((p) => p.id === id);

  const methods = useForm({
    defaultValues: {
      name: "",
      category: "",
      subCategory: "",
      brand: "",
      sku: "",
      shortDescription: "",
      description: "",
      regularPrice: 0,
      salePrice: 0,
      costPrice: 0,
      tax: 0,
      discount: 0,
      stockQuantity: 0,
      unit: "",
      status: "active",
      stockStatus: "in-stock",
      featured: false,
      bestSeller: false,
      organic: false,
      newArrival: false,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  const { register, setValue, watch, reset } = methods;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefill form when product loads
  useEffect(() => {
    if (!product) return;
    reset({
      name: product.name || "",
      category: product.category || "",
      subCategory: (product as any).subCategory || "",
      brand: (product as any).brand || "",
      sku: (product as any).sku || "",
      shortDescription: (product as any).shortDescription || "",
      description: product.description || "",
      regularPrice: product.price || 0,
      salePrice: (product as any).salePrice || 0,
      costPrice: (product as any).costPrice || 0,
      tax: (product as any).tax || 0,
      discount: (product as any).discount || 0,
      stockQuantity: product.stock || 0,
      unit: (product as any).unit || "",
      status: (product as any).status || "active",
      stockStatus: (product as any).stockStatus || "in-stock",
      featured: (product as any).featured || false,
      bestSeller: (product as any).bestSeller || false,
      organic: (product as any).organic || false,
      newArrival: (product as any).newArrival || false,
      metaTitle: (product as any).metaTitle || "",
      metaDescription: (product as any).metaDescription || "",
      metaKeywords: (product as any).metaKeywords || "",
    });
    // Load existing images
    if (product.images?.length) {
      setImages(product.images.map((src) => ({ file: null, preview: src })));
    }
  }, [product, reset]);

  const handleAddImages = (entries: ImageEntry[]) => {
    setImages((prev) => [...prev, ...entries]);
    setImageError("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (featuredIdx >= idx && featuredIdx > 0) setFeaturedIdx((p) => p - 1);
    else if (featuredIdx === idx) setFeaturedIdx(0);
  };

  const onSubmit = (data: any) => {
    if (images.length === 0) {
      setImageError("At least one product image is required.");
      return;
    }
    updateProduct(id, {
      name: data.name,
      price: Number(data.regularPrice) || 0,
      stock: Number(data.stockQuantity) || 0,
      category: data.category,
      description: data.description || "",
      images: images.map((e) => e.preview),
      ...(data as any),
    });
    toast("Product updated successfully");
    router.push("/admin/products");
  };

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 dark:text-gray-400 font-medium">Product not found.</p>
        <Button onClick={() => router.push("/admin/products")} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl">
          Back to Products
        </Button>
      </div>
    );
  }

  const formData = watch();
  const badges = [
    { name: "organic", label: "Organic" },
    { name: "featured", label: "Featured" },
    { name: "bestSeller", label: "Best Seller" },
    { name: "newArrival", label: "New Arrival" },
  ];

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            <Link href="/admin/dashboard" className="hover:text-[#16A34A] transition-colors">Dashboard</Link>
            <span>&gt;</span>
            <Link href="/admin/products" className="hover:text-[#16A34A] transition-colors">Products</Link>
            <span>&gt;</span>
            <span className="text-[#16A34A] font-semibold">Edit Product</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => router.push("/admin/products")}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:text-[#16A34A] hover:bg-green-50 dark:hover:bg-green-950/20 hover:scale-[1.05] transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Product</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update product details and save changes.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — Images */}
          <section className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Product Images</h2>
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

          {/* RIGHT — Fields */}
          <section className="space-y-4">
            {/* Product Info */}
            <div className="rounded-2xl shadow-sm p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold mb-4">Product Information</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" {...register("name")} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(v) => setValue("category", v)} defaultValue={product.category}>
                      <SelectTrigger id="category" className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0
                          ? categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)
                          : ["Electronics", "Clothing", "Food", "Sports"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subCategory">Sub Category</Label>
                    <Input id="subCategory" {...register("subCategory")} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" {...register("brand")} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" {...register("sku")} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea id="shortDescription" {...register("shortDescription")} className="mt-1" rows={2} />
                </div>
                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea id="description" {...register("description")} className="mt-1" rows={4} />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl shadow-sm p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold mb-4">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regularPrice">Regular Price ($)</Label>
                  <Input id="regularPrice" type="number" step="0.01" min="0" className="mt-1" {...register("regularPrice", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="salePrice">Sale Price ($)</Label>
                  <Input id="salePrice" type="number" step="0.01" min="0" className="mt-1" {...register("salePrice", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input id="tax" type="number" step="0.01" min="0" max="100" className="mt-1" {...register("tax", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input id="discount" type="number" step="0.01" min="0" max="100" className="mt-1" {...register("discount", { valueAsNumber: true })} />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="rounded-2xl shadow-sm p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold mb-4">Inventory</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input id="stockQuantity" type="number" min="0" className="mt-1" {...register("stockQuantity", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select onValueChange={(v) => setValue("unit", v)} defaultValue={(product as any).unit || ""}>
                    <SelectTrigger id="unit" className="mt-1">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">KG</SelectItem>
                      <SelectItem value="pcs">PCS</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                      <SelectItem value="packet">Packet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(v) => setValue("status", v)} defaultValue={(product as any).status || "active"}>
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stockStatus">Stock Status</Label>
                  <Select onValueChange={(v) => setValue("stockStatus", v)} defaultValue={(product as any).stockStatus || "in-stock"}>
                    <SelectTrigger id="stockStatus" className="mt-1">
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      <SelectItem value="preorder">Pre-order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="rounded-2xl shadow-sm p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold mb-4">Product Badges</h2>
              <div className="flex flex-wrap gap-4">
                {badges.map((field) => {
                  const checked = !!watch(field.name as any);
                  return (
                    <div key={field.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${field.name}`}
                        checked={checked}
                        onCheckedChange={(val) => setValue(field.name as any, !!val)}
                      />
                      <Label htmlFor={`edit-${field.name}`}>{field.label}</Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-2xl shadow-sm p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold mb-4">SEO</h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input id="metaTitle" {...register("metaTitle")} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea id="metaDescription" {...register("metaDescription")} className="mt-1" rows={2} />
                </div>
                <div>
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input id="metaKeywords" {...register("metaKeywords")} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl px-6">
                Update Product
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </section>

          {/* LIVE PREVIEW */}
          <section className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Live Preview</h2>
            <ProductPreviewCard
              images={images.map((e) => e.preview)}
              featuredIdx={featuredIdx}
            />
          </section>
        </form>
      </div>
    </FormProvider>
  );
}
