"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store";
import {
  ArrowLeft, Tag, Boxes, Calendar, FileText, ShoppingBag,
  ShieldCheck, Sparkles, Star, Loader2, Pencil, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function ViewProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch product details
  useEffect(() => {
    if (!mounted || !id) return;
    const fetchProd = async () => {
      try {
        setLoadingProduct(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/products/${id}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to load product details");
        const data = await res.json();
        setProduct(data);
        if (data.images?.[0]) {
          setMainImage(data.images[0]);
        }
      } catch (e: any) {
        console.error(e);
        toast(e.message || "Failed to load product", "error");
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProd();
  }, [mounted, id]);

  if (!mounted || loadingProduct) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Boxes className="h-12 w-12 text-gray-300 animate-bounce" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Product not found.</p>
        <Button onClick={() => router.push("/admin/products")} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl">
          Back to Products
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete product");
      toast("Product deleted successfully", "success");
      setShowDeleteDialog(false);
      router.push("/admin/products");
    } catch (e: any) {
      console.error(e);
      toast(e.message || "Failed to delete product", "error");
    }
  };

  const badges: string[] = [];
  if ((product as any).organic) badges.push("Organic");
  if ((product as any).featured) badges.push("Featured");
  if ((product as any).bestSeller) badges.push("Best Seller");
  if ((product as any).newArrival) badges.push("New Arrival");

  const allImages = product.images?.length ? product.images : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          <Link href="/admin/dashboard" className="hover:text-[#16A34A] transition-colors">Dashboard</Link>
          <span>&gt;</span>
          <Link href="/admin/products" className="hover:text-[#16A34A] transition-colors">Products</Link>
          <span>&gt;</span>
          <span className="text-[#16A34A] font-semibold">View Product</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:text-[#16A34A] hover:bg-green-50 dark:hover:bg-green-950/20 hover:scale-[1.05] transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">View Product</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Read-only product details and specifications.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/admin/products/edit/${product.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl gap-2"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main product grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT — Image Gallery */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
          {/* Main image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 flex items-center justify-center relative">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={product.name} className="h-full w-full object-cover transition-all duration-500 hover:scale-105" />
            ) : (
              <Boxes className="h-16 w-16 text-gray-300" />
            )}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white shadow-xs border border-white/20">
                Main Image
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.map((imgUrl: string, index: number) => {
                const isActive = mainImage === imgUrl;
                return (
                  <button
                    key={index}
                    onClick={() => setMainImage(imgUrl)}
                    className={`aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "border-2 border-[#16A34A] scale-102 ring-4 ring-[#16A34A]/10 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-400 hover:scale-[1.03]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`thumb-${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Product Info */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-6">
          {/* Badges + Status */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-950/40 text-[#16A34A] dark:text-green-400 border border-green-200">
                {(product as any).status || "Active"}
              </span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200">In Stock</span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200">Out Of Stock</span>
              )}
              {badges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200">
                  <Star className="h-2.5 w-2.5" />{b}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{product.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="font-semibold uppercase tracking-wider">ID:</span>
              <span className="font-mono text-gray-800 dark:text-gray-300 font-bold">{product.id.toUpperCase()}</span>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50/70 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-[#16A34A]" /> Price
              </span>
              <div className="text-2xl font-extrabold text-[#16A34A]">${product.price.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Boxes className="h-3.5 w-3.5 text-[#16A34A]" /> Stock
              </span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono">{product.stock}</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#16A34A]" /> Description
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || "No description provided."}
            </p>
          </div>

          {/* Specs grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" /> Specifications
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Category", value: product.category },
                { label: "Brand", value: (product as any).brand || "—" },
                { label: "SKU", value: (product as any).sku || "—" },
                { label: "Unit", value: (product as any).unit || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          {((product as any).metaTitle || (product as any).metaDescription) && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" /> SEO Information
              </h3>
              <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                {(product as any).metaTitle && <p><span className="text-gray-400">Title:</span> <span className="font-medium text-gray-800 dark:text-gray-200">{(product as any).metaTitle}</span></p>}
                {(product as any).metaDescription && <p><span className="text-gray-400">Desc:</span> <span className="text-gray-700 dark:text-gray-300">{(product as any).metaDescription}</span></p>}
                {(product as any).metaKeywords && <p><span className="text-gray-400">Keywords:</span> <span className="text-gray-700 dark:text-gray-300">{(product as any).metaKeywords}</span></p>}
              </div>
            </div>
          )}

          <hr className="border-gray-100 dark:border-gray-800" />

          <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: <strong>2026-04-18</strong></span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Updated: <strong>{new Date().toISOString().split("T")[0]}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-950/40 mx-auto">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Product?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">&quot;{product.name}&quot;</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
