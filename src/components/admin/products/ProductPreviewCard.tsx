"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Tag, Boxes, Star } from "lucide-react";

interface ProductPreviewCardProps {
  images: string[];
  featuredIdx: number;
}

export default function ProductPreviewCard({
  images,
  featuredIdx,
}: ProductPreviewCardProps) {
  const { watch } = useFormContext();
  const data = watch();

  const mainImg = images[featuredIdx] || images[0] || null;
  const name = data.name || "Product Name";
  const regularPrice = Number(data.regularPrice) || 0;
  const salePrice = Number(data.salePrice) || 0;
  const category = data.category || "—";
  const brand = data.brand || "—";
  const description = data.description || "No description provided.";
  const stockQty = Number(data.stockQuantity) || 0;
  const badges: string[] = [];
  if (data.organic) badges.push("Organic");
  if (data.featured) badges.push("Featured");
  if (data.bestSeller) badges.push("Best Seller");
  if (data.newArrival) badges.push("New Arrival");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      {/* Image side */}
      <div className="space-y-3">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {mainImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImg}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Boxes className="h-16 w-16 text-gray-300" />
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`thumb-${i}`}
                className={`rounded-lg aspect-square object-cover border-2 ${
                  i === featuredIdx
                    ? "border-[#16A34A]"
                    : "border-transparent"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info side */}
      <div className="space-y-4">
        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/40 text-[#16A34A] dark:text-green-400 text-[10px] font-bold border border-green-200 dark:border-green-800/50 uppercase tracking-wider"
              >
                <Star className="h-2.5 w-2.5" />
                {b}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {name}
        </h2>

        {/* Pricing */}
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-[#16A34A]">
            ${(salePrice > 0 ? salePrice : regularPrice).toFixed(2)}
          </span>
          {salePrice > 0 && regularPrice > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ${regularPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-400 mb-0.5 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Category
            </p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{category}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-400 mb-0.5">Brand</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{brand}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-400 mb-0.5 flex items-center gap-1">
              <Boxes className="h-3 w-3" /> Stock
            </p>
            <p className={`font-semibold ${stockQty > 0 ? "text-green-600" : "text-red-500"}`}>
              {stockQty > 0 ? `${Number(stockQty)} units` : "Out of stock"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-400 mb-0.5">Status</p>
            <p className="font-semibold capitalize text-gray-800 dark:text-gray-200">{data.status || "—"}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Description</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{description}</p>
        </div>
      </div>
    </div>
  );
}
