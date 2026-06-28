"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

import { Division, District } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AddThanaPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Form Fields State
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [thanaName, setThanaName] = useState("");
  const [thanaNameBn, setThanaNameBn] = useState("");
  const [thanaCode, setThanaCode] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Validation States
  const [errors, setErrors] = useState<{
    divisionId?: string;
    districtId?: string;
    thanaName?: string;
    thanaCode?: string;
  }>({});

  // Fetch divisions list
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
        console.error("Failed to load divisions for select", err);
      } finally {
        setLoadingDivisions(false);
      }
    };
    fetchDivisionsList();
  }, []);

  // Cascading fetch: fetch districts when division changes
  useEffect(() => {
    setDistrictId("");
    setDistricts([]);
    
    if (!divisionId) return;

    const fetchDistrictsForDivision = async () => {
      try {
        setLoadingDistricts(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/districts?division_id=${divisionId}&limit=100`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setDistricts(json.data.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load districts cascading list", err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistrictsForDivision();
  }, [divisionId]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!divisionId) {
      newErrors.divisionId = "Division is required";
    }
    if (!districtId) {
      newErrors.districtId = "District is required";
    }
    if (!thanaName.trim()) {
      newErrors.thanaName = "Thana Name (English) is required";
    }
    if (!thanaCode.trim()) {
      newErrors.thanaCode = "Thana Code is required";
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
        district_id: parseInt(districtId, 10),
        thana_name: thanaName.trim(),
        thana_name_bn: thanaNameBn.trim(),
        thana_code: thanaCode.trim().toLowerCase(),
        postal_code: postalCode.trim() || null,
        status: status === "Active",
      };

      const res = await fetch("/api/thanas", {
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
          if (data.errors.district_id) apiErrors.districtId = data.errors.district_id[0];
          if (data.errors.thana_name) apiErrors.thanaName = data.errors.thana_name[0];
          if (data.errors.thana_code) apiErrors.thanaCode = data.errors.thana_code[0];
          setErrors(apiErrors);
          throw new Error(data.message || "Validation failed on server");
        }
        throw new Error(data.message || "Failed to create thana");
      }

      toast("Thana created successfully", "success");
      router.push("/admin/locations/thanas");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to create thana", "error");
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
            { label: "Locations", href: "/admin/locations/thanas" },
            { label: "Thanas", href: "/admin/locations/thanas" },
            { label: "Add Thana" },
          ]}
        />
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push("/admin/locations/thanas")}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-305 hover:text-[#16A34A] hover:bg-green-55/20 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[#16A34A]" />
              Add Thana
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Create a new administrative thana / upazila
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
            <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">Configure Thana Fields</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-5">
            {/* Division dropdown */}
            <div className="space-y-2">
              <Label htmlFor="divisionId" className="text-gray-700 dark:text-gray-305 font-semibold text-sm">
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

            {/* District dropdown (cascading) */}
            <div className="space-y-2">
              <Label htmlFor="districtId" className="text-gray-700 dark:text-gray-305 font-semibold text-sm">
                District <span className="text-red-500">*</span>
              </Label>
              <select
                id="districtId"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className={`w-full h-11 border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-900 dark:text-white cursor-pointer transition-colors ${
                  errors.districtId ? "border-red-500 focus:ring-red-500" : ""
                }`}
                disabled={!divisionId || loadingDistricts}
              >
                <option value="">{divisionId ? "Select District" : "Select Division First"}</option>
                {districts.map((dst) => (
                  <option key={dst.id} value={dst.id}>
                    {dst.district_name}
                  </option>
                ))}
              </select>
              {loadingDistricts && <span className="text-xs text-gray-400">Loading districts...</span>}
              {errors.districtId && (
                <p className="text-xs font-medium text-red-550">{errors.districtId}</p>
              )}
            </div>

            {/* Thana Name English */}
            <div className="space-y-2">
              <Label htmlFor="thanaName" className="text-gray-700 dark:text-gray-305 font-semibold text-sm">
                Thana Name (English) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="thanaName"
                placeholder="e.g. Joydebpur"
                value={thanaName}
                onChange={(e) => setThanaName(e.target.value)}
                className={`h-11 border-gray-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl focus-visible:ring-[#16A34A] ${
                  errors.thanaName ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.thanaName && (
                <p className="text-xs font-medium text-red-550">{errors.thanaName}</p>
              )}
            </div>

            {/* Thana Name Bangla */}
            <div className="space-y-2">
              <Label htmlFor="thanaNameBn" className="text-gray-700 dark:text-gray-305 font-semibold text-sm">
                Thana Name (Bangla)
              </Label>
              <Input
                id="thanaNameBn"
                placeholder="e.g. জয়দেবপুর"
                value={thanaNameBn}
                onChange={(e) => setThanaNameBn(e.target.value)}
                className="h-11 border-gray-255 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>

            {/* Thana Code */}
            <div className="space-y-2">
              <Label htmlFor="thanaCode" className="text-gray-700 dark:text-gray-305 font-semibold text-sm">
                Thana Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="thanaCode"
                placeholder="e.g. joydebpur"
                value={thanaCode}
                onChange={(e) => setThanaCode(e.target.value)}
                className={`h-11 border-gray-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus-visible:ring-[#16A34A] ${
                  errors.thanaCode ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {errors.thanaCode && (
                <p className="text-xs font-medium text-red-550">{errors.thanaCode}</p>
              )}
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-gray-700 dark:text-gray-350 font-semibold text-sm">
                Postal Code
              </Label>
              <Input
                id="postalCode"
                placeholder="e.g. 1700"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="h-11 border-gray-250 dark:border-slate-805 dark:bg-slate-950 rounded-xl focus-visible:ring-[#16A34A]"
              />
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-305 font-semibold text-sm">
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
              onClick={() => router.push("/admin/locations/thanas")}
              className="rounded-xl border-gray-202 dark:border-slate-805 cursor-pointer h-11 px-6 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
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
                "Save Thana"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
