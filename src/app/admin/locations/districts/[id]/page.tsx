"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MapPin, ArrowLeft, Pencil, Calendar, Info, Loader2, AlertTriangle, Hash, ToggleLeft, Map } from "lucide-react";

import { District } from "@/types";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function DistrictDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [district, setDistrict] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDistrict = async () => {
        try {
          setLoading(true);
          const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
          const res = await fetch(`/api/districts/${id}`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
          });
          if (!res.ok) throw new Error("Failed to load district details");
          const json = await res.json();
          if (json.success && json.data) {
            setDistrict(json.data);
          } else {
            throw new Error(json.message || "Failed to load district");
          }
        } catch (err: any) {
          console.error(err);
          setError(err.message || "Error loading district detail");
        } finally {
          setLoading(false);
        }
      };
      fetchDistrict();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 bg-gray-55 dark:bg-gray-955 transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-505 dark:text-gray-400">Loading district details...</span>
      </div>
    );
  }

  if (error || !district) {
    return (
      <div className="min-h-screen p-6 bg-gray-55 dark:bg-gray-955 flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">District Not Found</h3>
          <p className="text-sm text-gray-550 dark:text-gray-400">{error || "The requested district record does not exist."}</p>
          <Button onClick={() => router.push("/admin/locations/districts")} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl cursor-pointer">
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  const isActive = district.status === true || district.status === 1;
  const createdDate = district.created_at ? new Date(district.created_at).toLocaleString() : "-";
  const updatedDate = district.updated_at ? new Date(district.updated_at).toLocaleString() : "-";

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-55 dark:bg-gray-955 transition-colors duration-300">
      {/* Breadcrumbs & Header */}
      <div className="max-w-3xl mx-auto space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Locations", href: "/admin/locations/divisions" },
            { label: "Districts", href: "/admin/locations/districts" },
            { label: "District Details" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/locations/districts")}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-305 hover:text-[#16A34A] hover:bg-green-55/20 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-6 w-6 text-[#16A34A]" />
                {district.district_name}
              </h1>
              <p className="text-sm text-gray-555 dark:text-gray-400">
                District ID: {district.id}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/admin/locations/districts/edit/${district.id}`)}
            className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 font-medium shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Pencil className="h-4 w-4" />
            Edit District
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="px-6 py-5 bg-green-50/10 dark:bg-green-950/10 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-[#16A34A]" />
          <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider">General Information</span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parent Division */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Map className="h-3.5 w-3.5" /> Division
            </span>
            <p className="text-base font-bold text-[#16A34A]">{district.division?.division_name || "N/A"}</p>
          </div>

          {/* English Name */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Name (English)
            </span>
            <p className="text-base font-bold text-gray-900 dark:text-white">{district.district_name}</p>
          </div>

          {/* Bangla Name */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#16A34A]" /> Name (Bangla)
            </span>
            <p className="text-base font-bold text-gray-905 dark:text-gray-200">
              {district.district_name_bn || <span className="text-gray-400 font-normal italic">N/A</span>}
            </p>
          </div>

          {/* District Code */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" /> District Code
            </span>
            <p className="text-sm font-mono bg-gray-55 dark:bg-slate-950 border border-gray-150 dark:border-slate-850 px-2.5 py-1 rounded-lg w-max font-bold text-gray-800 dark:text-gray-300">
              {district.district_code}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <ToggleLeft className="h-3.5 w-3.5" /> Status
            </span>
            <div className="pt-1">
              <StatusBadge status={isActive ? 'active' : 'inactive'} />
            </div>
          </div>

          {/* Created Date */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Created At
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{createdDate}</p>
          </div>

          {/* Updated Date */}
          <div className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#16A34A]" /> Last Updated At
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{updatedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
