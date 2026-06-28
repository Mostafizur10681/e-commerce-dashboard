"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

import { Division } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AddDistrictPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(true);

  // Form Fields State
  const [divisionId, setDivisionId] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [districtNameBn, setDistrictNameBn] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Validation States
  const [errors, setErrors] = useState<{
    divisionId?: string;
    districtName?: string;
    districtCode?: string;
  }>({});

  // Fetch divisions list for select input
  useEffect(() => {
    const fetchDivisionsList = async () => {
      try {
        setLoadingDivisions(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch("/api/divisions?limit=100", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setDivisions(json.data.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load divisions for dropdown", err);
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisionsList();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!divisionId) {
      newErrors.divisionId = "Division is required";
    }
    if (!districtName.trim()) {
      newErrors.districtName = "District Name (English) is required";
    }
    if (!districtCode.trim()) {
      newErrors.districtCode = "District Code is required";
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
        division_id: parseInt(divisionId, 10),
        district_name: districtName.trim(),
        district_name_bn: districtNameBn.trim(),
        district_code: districtCode.trim().toLowerCase(),
        status: status === "Active",
      };

      const res = await fetch("/api/districts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const apiErrors: any = {};
          if (data.errors.division_id) apiErrors.divisionId = data.errors.division_id[0];
          if (data.errors.district_name) apiErrors.districtName = data.errors.district_name[0];
          if (data.errors.district_code) apiErrors.districtCode = data.errors.district_code[0];
          setErrors(apiErrors);
          throw new Error(data.message || "Validation failed on server");
        }
        throw new Error(data.message || "Failed to create district");
      }

      toast("District created successfully", "success");
      router.push("/admin/locations/districts");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to create district", "error");
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
            { label: "Locations", href: "/admin/locations/districts" },
            { label: "Districts", href: "/admin/locations/districts" },
            { label: "Add District" },
          ]}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push("/admin/locations/districts")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-305 hover:text-[#16A34A] hover:bg-green-55/20 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[#16A34A]" />
              Add District
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Create a new administrative district
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
            <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">Configure District Fields</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-5">
            {/* Division dropdown */}
            <div className="space-y-2">
              <Label htmlFor="divisionId" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                Division <span className="text-red-500">*</span>
              </Label>
              <select
                id="divisionId"
                value={divisionId}
                onChange={(e) => setDivisionId(e.target.value)}
                className={`w-full h-11 border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-900 dark:text-white cursor-pointer transition-colors ${
                  errors.divisionId ? "border-red-500 focus:ring-red-500" : ""
                }`}
                disabled={loadingDivisions}
              >
                <option value="">Select Division</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.division_name}
                  </option>
                ))}
              </select>
              {loadingDivisions && <span className="text-xs text-gray-400">Loading divisions...</span>}
              {errors.divisionId && (
                <p className="text-xs font-medium text-red-550">{errors.divisionId}</p>
              )}
            </div>

            {/* District Name English */}
            <div className="space-y-2">
              <Label htmlFor="districtName" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                District Name (English) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="districtName"
                placeholder="e.g. Gazipur"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                className={`h-11 border-gray-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl focus-visible:ring-[#16A34A] ${
                  errors.districtName ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.districtName && (
                <p className="text-xs font-medium text-red-550">{errors.districtName}</p>
              )}
            </div>

            {/* District Name Bangla */}
            <div className="space-y-2">
              <Label htmlFor="districtNameBn" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                District Name (Bangla)
              </Label>
              <Input
                id="districtNameBn"
                placeholder="e.g. গাজীপুর"
                value={districtNameBn}
                onChange={(e) => setDistrictNameBn(e.target.value)}
                className="h-11 border-gray-255 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>

            {/* District Code */}
            <div className="space-y-2">
              <Label htmlFor="districtCode" className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                District Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="districtCode"
                placeholder="e.g. gazipur"
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
                className={`h-11 border-gray-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl focus-visible:ring-[#16A34A] ${
                  errors.districtCode ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.districtCode && (
                <p className="text-xs font-medium text-red-550">{errors.districtCode}</p>
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
              onClick={() => router.push("/admin/locations/districts")}
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
                "Save District"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
