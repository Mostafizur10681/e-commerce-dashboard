"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Map, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AddDivisionPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);

  // Form Fields State
  const [divisionName, setDivisionName] = useState("");
  const [divisionNameBn, setDivisionNameBn] = useState("");
  const [divisionCode, setDivisionCode] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Validation States
  const [errors, setErrors] = useState<{
    divisionName?: string;
    divisionCode?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!divisionName.trim()) {
      newErrors.divisionName = "Division Name (English) is required";
    }
    if (!divisionCode.trim()) {
      newErrors.divisionCode = "Division Code is required";
    } else if (divisionCode.trim().length < 2) {
      newErrors.divisionCode = "Division Code must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast("Please fix all form validation errors", "error");
      return;
    }

    setSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const payload = {
        division_name: divisionName.trim(),
        division_name_bn: divisionNameBn.trim(),
        division_code: divisionCode.trim().toLowerCase(),
        status: status === "Active",
      };

      const res = await fetch("/api/divisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors from Laravel backend
        if (data.errors) {
          const apiErrors: any = {};
          if (data.errors.division_name) apiErrors.divisionName = data.errors.division_name[0];
          if (data.errors.division_code) apiErrors.divisionCode = data.errors.division_code[0];
          setErrors(apiErrors);
          throw new Error(data.message || "Validation failed on server");
        }
        throw new Error(data.message || "Failed to create division");
      }

      toast("Division created successfully", "success");
      router.push("/admin/locations/divisions");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to create division", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-gray-955 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="max-w-2xl mx-auto space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Locations", href: "/admin/locations/divisions" },
            { label: "Divisions", href: "/admin/locations/divisions" },
            { label: "Add Division" },
          ]}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push("/admin/locations/divisions")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-305 hover:text-[#16A34A] hover:bg-green-50/20 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Map className="h-6 w-6 text-[#16A34A]" />
              Add Division
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Create a new administrative division
            </p>
          </div>
        </div>
      </div>

      {/* Main Centered Form Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
        
        {/* Custom Header decoration */}
        <div className="px-6 py-5 bg-green-50/10 dark:bg-green-950/10 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-[#16A34A]" />
            <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">Configure Division Fields</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-5">
            {/* Division Name English */}
            <div className="space-y-2">
              <Label htmlFor="divisionName" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                Division Name (English) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="divisionName"
                placeholder="e.g. Dhaka"
                value={divisionName}
                onChange={(e) => setDivisionName(e.target.value)}
                className={`h-11 border-gray-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus-visible:ring-[#16A34A] ${
                  errors.divisionName ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.divisionName && (
                <p className="text-xs font-medium text-red-550">{errors.divisionName}</p>
              )}
            </div>

            {/* Division Name Bangla */}
            <div className="space-y-2">
              <Label htmlFor="divisionNameBn" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                Division Name (Bangla)
              </Label>
              <Input
                id="divisionNameBn"
                placeholder="e.g. ঢাকা"
                value={divisionNameBn}
                onChange={(e) => setDivisionNameBn(e.target.value)}
                className="h-11 border-gray-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>

            {/* Division Code */}
            <div className="space-y-2">
              <Label htmlFor="divisionCode" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                Division Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="divisionCode"
                placeholder="e.g. dhaka"
                value={divisionCode}
                onChange={(e) => setDivisionCode(e.target.value)}
                className={`h-11 border-gray-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus-visible:ring-[#16A34A] ${
                  errors.divisionCode ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.divisionCode && (
                <p className="text-xs font-medium text-red-550">{errors.divisionCode}</p>
              )}
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                Status <span className="text-red-500">*</span>
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-900 dark:text-white cursor-pointer transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/locations/divisions")}
              className="rounded-xl border-gray-200 dark:border-slate-805 cursor-pointer h-11 px-6 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl cursor-pointer h-11 px-6 text-sm font-medium shadow-sm shadow-[#16A34A]/10 transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-4.5 w-4.5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Save Division"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
