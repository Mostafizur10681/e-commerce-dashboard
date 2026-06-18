"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, Star, Trash2, ImagePlus } from "lucide-react";

interface ImageEntry {
  file: File;
  preview: string;
}

interface ImageUploaderProps {
  images: ImageEntry[];
  featuredIdx: number;
  onAdd: (entries: ImageEntry[]) => void;
  onRemove: (idx: number) => void;
  onSetFeatured: (idx: number) => void;
  error?: string;
}

export default function ImageUploader({
  images,
  featuredIdx,
  onAdd,
  onRemove,
  onSetFeatured,
  error,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!accepted.length) return;
    const entries: ImageEntry[] = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onAdd(entries);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onAdd]
  );

  const mainImage = images[featuredIdx]?.preview || images[0]?.preview || null;

  return (
    <div className="space-y-4">
      {/* Main image preview */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 aspect-[4/3] flex items-center justify-center">
        {mainImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt="Featured product"
              className="h-full w-full object-cover transition-all duration-500"
            />
            <span className="absolute top-3 left-3 bg-[#16A34A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-white" /> Featured
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400 select-none">
            <ImagePlus className="h-14 w-14 stroke-1" />
            <p className="text-sm font-medium">No image uploaded yet</p>
          </div>
        )}
      </div>

      {/* Drop zone / click to upload */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
          isDragging
            ? "border-[#16A34A] bg-green-50 dark:bg-green-950/20 scale-[1.01]"
            : "border-gray-300 dark:border-gray-600 hover:border-[#16A34A] hover:bg-green-50/50 dark:hover:bg-green-950/10"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <UploadCloud
          className={`mx-auto h-9 w-9 mb-2 transition-colors ${
            isDragging ? "text-[#16A34A]" : "text-gray-400"
          }`}
        />
        {isDragging ? (
          <p className="text-[#16A34A] font-semibold text-sm">Drop images here…</p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              Drag &amp; drop images here, or{" "}
              <span className="text-[#16A34A] font-semibold">click to browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, WEBP — multiple files supported
            </p>
          </>
        )}
      </div>

      {/* Validation error */}
      {error && (
        <p className="text-xs font-medium text-red-500 flex items-center gap-1">
          ⚠ {error}
        </p>
      )}

      {/* Thumbnail gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((entry, idx) => (
            <div
              key={idx}
              className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all duration-200 ${
                idx === featuredIdx
                  ? "border-[#16A34A] ring-2 ring-[#16A34A]/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.preview}
                alt={`product-${idx}`}
                className="w-full h-full object-cover"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {/* Set as Featured */}
                <button
                  type="button"
                  onClick={() => onSetFeatured(idx)}
                  title="Set as featured"
                  className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-yellow-100 transition shadow"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      idx === featuredIdx
                        ? "text-yellow-500 fill-yellow-400"
                        : "text-gray-500"
                    }`}
                  />
                </button>
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  title="Remove image"
                  className="h-7 w-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition shadow"
                >
                  <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {/* Featured badge (always visible on active) */}
              {idx === featuredIdx && (
                <span className="absolute bottom-1 left-1 bg-[#16A34A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  ★
                </span>
              )}
            </div>
          ))}

          {/* Add more images tile */}
          <div
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#16A34A] hover:bg-green-50 dark:hover:bg-green-950/10 transition-all"
          >
            <ImagePlus className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
