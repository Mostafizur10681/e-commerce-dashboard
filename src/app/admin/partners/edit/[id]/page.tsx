"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Handshake,
  ArrowLeft,
  Upload,
  Globe,
  Trash2,
  RefreshCw,
  Sparkles,
  Loader2
} from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function EditPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { getPartnerById, updatePartner } = useStore();

  const [loading, setLoading] = useState(true);

  // Form Fields State
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");

  // Validation States
  const [errors, setErrors] = useState<{
    name?: string;
    website?: string;
    logo?: string;
  }>({});

  useEffect(() => {
    const loadPartner = async () => {
      try {
        setLoading(true);
        let partner = getPartnerById(id);
        if (!partner) {
          const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
          const res = await fetch(`/api/partners/${id}`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
          });
          if (res.ok) {
            partner = await res.json();
          }
        }

        if (partner) {
          setName(partner.name);
          setWebsite(partner.website);
          setStatus((partner.status as "Active" | "Inactive") || "Active");
          setLogo(partner.logo || "");
          setDescription(partner.description || "");
        } else {
          toast("Partner not found", "error");
          router.push("/admin/partners");
        }
      } catch (err) {
        console.error(err);
        toast("Error loading partner details", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPartner();
    }
  }, [id, getPartnerById, router, toast]);

  // react-dropzone handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
        setErrors((prev) => ({ ...prev, logo: undefined }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Partner name is required";
    
    if (!website.trim()) {
      newErrors.website = "Partner website URL is required";
    } else {
      try {
        new URL(website);
      } catch (_) {
        newErrors.website = "Please enter a valid website URL (including http:// or https://)";
      }
    }

    if (!logo) newErrors.logo = "Partner logo image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast("Please fix all form validation errors", "error");
      return;
    }

    try {
      setIsSaving(true);
      const success = await updatePartner(id, {
        name,
        website,
        logo,
        status,
        description,
      });

      if (success) {
        toast("Partner updated successfully", "success");
        router.push("/admin/partners");
      } else {
        toast("Failed to update partner. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred while saving", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading partner details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-955 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Partners", href: "/admin/partners" },
            { label: "Edit Partner" },
          ]}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push("/admin/partners")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:text-[#16A34A] hover:bg-green-50 dark:hover:bg-green-950/20 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Handshake className="h-6 w-6 text-[#16A34A]" />
              Edit Partner
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Update affiliate partner profile details
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Form Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-[#16A34A]" />
              Partner Information
            </h2>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-350">
                Partner Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google, Stripe, Shopify"
                className="h-10 border-gray-200 dark:border-gray-805 dark:bg-gray-955 rounded-xl focus-visible:ring-[#16A34A]"
              />
              {errors.name && <p className="text-xs text-red-550 font-medium">{errors.name}</p>}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-semibold text-gray-700 dark:text-gray-355">
                Partner Website URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. https://google.com"
                className="h-10 border-gray-200 dark:border-gray-805 dark:bg-gray-955 rounded-xl focus-visible:ring-[#16A34A]"
              />
              {errors.website && <p className="text-xs text-red-550 font-medium">{errors.website}</p>}
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-355">
                Partner Logo / Image <span className="text-red-500">*</span>
              </Label>

              {!logo ? (
                /* Empty Dropzone State */
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center min-h-[160px] ${
                    isDragActive
                      ? "border-[#16A34A] bg-green-50/30 dark:bg-green-955/10"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-950/20"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Drag &amp; drop partner logo here, or click to browse files
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Supports JPG, PNG, WEBP (Max 2MB)</p>
                </div>
              ) : (
                /* Uploaded Image Preview & Manage Row */
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 rounded-2xl">
                  {/* Image Display */}
                  <img
                    src={logo}
                    alt="Partner Logo Preview"
                    className="h-[200px] w-[200px] object-cover rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
                  />

                  {/* Actions Panel */}
                  <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                    <div {...getRootProps()} className="w-full">
                      <input {...getInputProps()} />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl px-4 flex items-center justify-center gap-2 cursor-pointer w-full"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Replace Image
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xl px-4 text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/10 border-gray-200 flex items-center justify-center gap-2 cursor-pointer w-full"
                      onClick={() => setLogo("")}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Image
                    </Button>
                  </div>
                </div>
              )}
              {errors.logo && <p className="text-xs text-red-550 font-medium">{errors.logo}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-355">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                className="w-full h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-705 dark:text-gray-300 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-355">
                Description <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the partner relationship..."
                rows={4}
                className="border-gray-250 dark:border-gray-800 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/partners")}
              className="rounded-xl h-10 px-6 cursor-pointer border-gray-205"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-8 font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer border-transparent"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Partner"
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Live Preview Panel */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Live Preview
            </h3>

            {/* Preview Card */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 overflow-hidden flex flex-col">
              {/* Image box */}
              <div className="h-[200px] w-full border-b border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-gray-900 p-6">
                {logo ? (
                  <img
                    src={logo}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain filter dark:brightness-90 rounded-lg"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <Handshake className="h-10 w-10 text-gray-300 mx-auto stroke-1" />
                    <span className="text-xs text-gray-400 block font-medium">No Logo Uploaded</span>
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="p-5 flex-1 space-y-3.5 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base truncate flex-1">
                    {name || "Partner Name"}
                  </h4>
                  <Badge
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border border-transparent shrink-0 ${
                      status === "Active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-450"
                    }`}
                  >
                    {status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Globe className="h-4 w-4 text-gray-400" />
                  {website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#16A34A] hover:underline font-medium truncate"
                    >
                      {website}
                    </a>
                  ) : (
                    <span className="italic text-gray-400">https://website-url.com</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed min-h-[48px]">
                  {description || "No description provided yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
