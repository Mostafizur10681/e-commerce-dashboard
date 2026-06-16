"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Tag, Layers, Boxes, Calendar, FileText, ShoppingBag, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

import { useStore } from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProductDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products } = useStore();
  const [mounted, setMounted] = useState(false);

  const productId = searchParams.get("id");
  const product = products.find((p) => p.id === productId) || products[0];

  const [mainImage, setMainImage] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (product?.images?.[0]) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4">
        <Boxes className="h-12 w-12 text-gray-300 animate-bounce" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No products found in the catalog.</p>
        <Button onClick={() => router.push("/admin/products")} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl">
          Back to Products List
        </Button>
      </div>
    );
  }

  // Pre-load dynamic visual details based on Category
  const isFood = product.category.toLowerCase().includes("food") || product.category.toLowerCase().includes("spice") || product.category.toLowerCase().includes("grocery");
  
  const mockThumbnails = isFood
    ? [
        product.images[0],
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=80",
      ]
    : [
        product.images[0],
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      ];

  const specMock = isFood
    ? {
        brand: "FreshMart Organic",
        origin: "South Asia / Local Farm",
        weight: "500g",
        packaging: "Resealable Foil Pouch",
        material: "100% Organic & Preservative-Free",
      }
    : {
        brand: "DataFlow Tech",
        origin: "California, USA",
        weight: "1.2kg",
        packaging: "ECO-Retail Gift Box",
        material: "Aircraft-Grade Aluminum & Alloys",
      };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1 text-[11px] text-gray-550 dark:text-gray-400 font-medium">
          <Link href="/admin/dashboard" className="hover:text-[#16A34A] transition-colors">Dashboard</Link>
          <span>&gt;</span>
          <Link href="/admin/products" className="hover:text-[#16A34A] transition-colors">Product</Link>
          <span>&gt;</span>
          <span className="text-[#16A34A] font-semibold">Product Details</span>
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
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Product Details</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Detailed catalog specifications and active visual assets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main product card (Responsive split display) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: Image Gallery Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-150 dark:border-gray-800 p-6 shadow-xs space-y-4 transition-all duration-300 hover:shadow-md hover:scale-[1.005]">
          {/* Main Display Image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 flex items-center justify-center relative">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
              />
            ) : (
              <Boxes className="h-16 w-16 text-gray-300" />
            )}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white shadow-xs border border-white/20">
                Main Image
              </span>
            </div>
          </div>

          {/* Thumbnail Selection Area */}
          <div className="grid grid-cols-4 gap-3">
            {mockThumbnails.map((imgUrl, index) => {
              const isActive = mainImage === imgUrl;
              return (
                <button
                  key={index}
                  onClick={() => setMainImage(imgUrl)}
                  className={`aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "border-2 border-[#16A34A] scale-102 ring-4 ring-[#16A34A]/10 shadow-sm"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-450 dark:hover:border-gray-650 hover:scale-[1.03]"
                  }`}
                >
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={`${product.name} Thumb ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-mono">
                      {index + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Product Details Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-150 dark:border-gray-800 p-8 shadow-xs space-y-6 transition-all duration-300 hover:shadow-md hover:scale-[1.005]">
          {/* Header Metadata */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="bg-green-100 hover:bg-green-100 text-[#16A34A] dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-full font-semibold text-[10px] uppercase tracking-wider">
                Active Catalog
              </Badge>
              {product.stock > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/40 text-green-750 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-750 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  Out Of Stock
                </span>
              )}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-905 dark:text-white leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-450 dark:text-gray-400">
              <span className="font-semibold uppercase tracking-wider">Product ID:</span>
              <span className="font-mono text-gray-800 dark:text-gray-300 font-bold">{product.id.toUpperCase()}</span>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-850" />

          {/* Pricing & Stock Details */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50/70 dark:bg-gray-850/30 p-4.5 rounded-2xl border border-gray-150/40 dark:border-gray-800/40">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-[#16A34A]" /> Price
              </span>
              <div className="text-2xl font-extrabold text-[#16A34A]">
                ${product.price.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Boxes className="h-3.5 w-3.5 text-[#16A34A]" /> Available Units
              </span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono">
                {product.stock}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#16A34A]" /> Description
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-350 leading-relaxed">
              {product.description || "No description provided for this catalog inventory item. Standard commercial product descriptions and safety information applies."}
            </p>
          </div>

          {/* Specifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" /> Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-850/20 border border-gray-150/40 dark:border-gray-800/40">
                <span className="text-gray-450 font-medium">Brand</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250">{specMock.brand}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-850/20 border border-gray-150/40 dark:border-gray-800/40">
                <span className="text-gray-450 font-medium">Origin</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250">{specMock.origin}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-850/20 border border-gray-150/40 dark:border-gray-800/40">
                <span className="text-gray-450 font-medium">Item Weight</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250">{specMock.weight}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-850/20 border border-gray-150/40 dark:border-gray-800/40">
                <span className="text-gray-450 font-medium">Packaging</span>
                <span className="font-semibold text-gray-800 dark:text-gray-250 text-right">{specMock.packaging}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-850/20 border border-gray-150/40 dark:border-gray-800/40 text-xs">
              <span className="text-gray-450 font-medium flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-[#16A34A]" /> Material / Notes</span>
              <span className="font-semibold text-gray-800 dark:text-gray-250 text-right">{specMock.material}</span>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-850" />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-450 dark:text-gray-550">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: <strong>2026-04-18</strong></span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Updated: <strong>2026-06-12</strong></span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
