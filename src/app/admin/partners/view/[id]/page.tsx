"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Handshake,
  ArrowLeft,
  Globe,
  Calendar,
  Sparkles,
  Loader2,
  AlertTriangle,
  Pencil
} from "lucide-react";

import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ViewPartnerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getPartnerById } = useStore();

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const data = getPartnerById(id);
      setPartner(data);
      setLoading(false);
    }
  }, [id, getPartnerById]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading partner details...</span>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-955 rounded-2xl border border-gray-250 p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <h3 className="text-lg font-bold">Partner Not Found</h3>
        <p className="text-sm text-gray-500">The requested partner record does not exist or has been deleted.</p>
        <Button onClick={() => router.push("/admin/partners")} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl">
          Back to List
        </Button>
      </div>
    );
  }

  const isActive = (partner.status || "Active").toLowerCase() === "active";

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Partners", href: "/admin/partners" },
            { label: "View Partner" },
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
              View Partner Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Read-only details of the affiliate partner profile
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden transition-all">
        {/* Header decoration */}
        <div className="h-32 bg-green-50 dark:bg-green-950/20 border-b border-gray-150 dark:border-gray-800 relative flex items-center px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#16A34A]" />
            <span className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Affiliate Partner Profile</span>
          </div>
        </div>

        {/* Profile Card Container */}
        <div className="px-8 pb-8 relative -mt-12 space-y-6">
          {/* Logo container */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-md flex items-center justify-center">
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain filter dark:brightness-95"
                />
              ) : (
                <span className="text-xs text-gray-400 font-semibold uppercase">No Logo</span>
              )}
            </div>

            <Button
              onClick={() => router.push(`/admin/partners/edit/${partner.id}`)}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-medium cursor-pointer border-transparent shadow-xs transition-colors self-start sm:self-auto"
            >
              <Pencil className="h-4 w-4" />
              Edit Partner
            </Button>
          </div>

          {/* Details list */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
            {/* Name */}
            <div className="grid grid-cols-3 gap-4 items-center py-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Partner Name</span>
              <span className="col-span-2 text-sm font-bold text-gray-900 dark:text-white">{partner.name}</span>
            </div>

            {/* ID */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-950">
              <span className="text-xs font-semibold text-gray-505 dark:text-gray-400 uppercase tracking-wider">Partner ID</span>
              <span className="col-span-2 text-sm font-mono text-gray-650 dark:text-gray-350">{partner.id}</span>
            </div>

            {/* Website */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-950">
              <span className="text-xs font-semibold text-gray-505 dark:text-gray-400 uppercase tracking-wider">Website URL</span>
              <div className="col-span-2">
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A] hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {partner.website}
                </a>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-405 uppercase tracking-wider">Status</span>
              <div className="col-span-2">
                <Badge
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${
                    isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {partner.status || "Active"}
                </Badge>
              </div>
            </div>

            {/* Created Date */}
            <div className="grid grid-cols-3 gap-4 items-center py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-505 dark:text-gray-400 uppercase tracking-wider">Created Date</span>
              <div className="col-span-2 flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{partner.createdAt || "No Date"}</span>
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-3 gap-4 items-start py-2 border-t border-gray-50 dark:border-gray-955">
              <span className="text-xs font-semibold text-gray-505 dark:text-gray-400 uppercase tracking-wider pt-1">Description</span>
              <span className="col-span-2 text-xs text-gray-505 dark:text-gray-400 leading-relaxed min-h-[40px]">
                {partner.description || "No description provided."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
