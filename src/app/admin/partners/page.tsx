"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Handshake,
  Search,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  Globe,
  AlertTriangle,
  Inbox
} from "lucide-react";

import { useStore } from "@/store";
import { Partner } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function PartnersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { partners, deletePartner } = useStore();

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  // Deleting State
  const [deletingPartner, setDeletingPartner] = useState<Partner | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteConfirm = () => {
    if (deletingPartner) {
      deletePartner(deletingPartner.id);
      toast("Partner deleted successfully", "success");
      setDeletingPartner(null);
    }
  };

  // Filter partners
  const filteredPartners = React.useMemo(() => {
    return partners.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.website.toLowerCase().includes(searchTerm.toLowerCase());

      const status = p.status || "Active";
      const statusMatch = statusFilter === "All" || status.toLowerCase() === statusFilter.toLowerCase();

      return nameMatch && statusMatch;
    });
  }, [partners, searchTerm, statusFilter]);

  // Sort partners
  const sortedPartners = React.useMemo(() => {
    const list = [...filteredPartners];
    if (sortBy === "Newest") {
      return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }
    if (sortBy === "Oldest") {
      return list.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    }
    if (sortBy === "A-Z") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "Z-A") {
      return list.sort((a, b) => b.name.localeCompare(a.name));
    }
    return list;
  }, [filteredPartners, sortBy]);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb & Header */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Partners" },
            { label: "Partner List" },
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <Handshake className="h-6 w-6 text-[#16A34A]" />
              Partner List
            </h1>
            <p className="text-sm text-gray-505 dark:text-gray-400">
              Manage brands, payment systems, shipping affiliates, and logistics partners.
            </p>
          </div>

        </div>
      </div>

      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-300">
        {/* LEFT: Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute top-3 left-4 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Partner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-gray-205 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
          />
        </div>

        {/* CENTER: Status & Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-750 dark:text-gray-300 cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-750 dark:text-gray-300 cursor-pointer"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="A-Z">A-Z</option>
              <option value="Z-A">Z-A</option>
            </select>
          </div>
        </div>

        {/* RIGHT: Add Partner button */}
        <Button
          onClick={() => router.push("/admin/partners/add")}
          className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-5 flex items-center gap-2 font-medium shadow-sm transition-all duration-200 lg:self-auto self-start cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Partner
        </Button>
      </div>

      {/* Partner Data Display Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        {sortedPartners.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 mb-4">
              <Handshake className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No partners found</h3>
            <p className="text-sm text-gray-550 dark:text-gray-450 mb-6">
              Create your first partner registration to get started.
            </p>
            <Button
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 px-6 font-medium shadow-sm transition-colors cursor-pointer"
              onClick={() => router.push("/admin/partners/add")}
            >
              Add Partner
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop View (Table layout) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-850">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-white pl-6 py-4">Partner Logo</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Partner Name</TableHead>
                    <TableHead className="font-semibold text-gray-900 dark:text-white py-4">Partner Website</TableHead>
                    <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-white py-4">Status</TableHead>
                    <TableHead className="w-[160px] font-semibold text-gray-900 dark:text-white py-4">Created Date</TableHead>
                    <TableHead className="w-[140px] text-right font-semibold text-gray-900 dark:text-white pr-6 py-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPartners.map((partner) => {
                    const status = partner.status || "Active";
                    const isActive = status.toLowerCase() === "active";
                    return (
                      <TableRow
                        key={partner.id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        {/* Logo */}
                        <TableCell className="pl-6 py-3.5">
                          <div className="h-[60px] w-[60px] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-1.5 shadow-xs">
                            {partner.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-full w-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400 font-semibold uppercase">No Logo</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Name */}
                        <TableCell className="py-3.5 font-bold text-gray-900 dark:text-white text-sm">
                          {partner.name}
                        </TableCell>

                        {/* Website */}
                        <TableCell className="py-3.5">
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] hover:underline"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            {partner.website}
                          </a>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5">
                          <Badge
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold select-none border border-transparent ${isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-450"
                              }`}
                          >
                            {status}
                          </Badge>
                        </TableCell>

                        {/* Created Date */}
                        <TableCell className="text-gray-500 dark:text-gray-400 text-sm py-3.5">
                          {partner.createdAt ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              <span>{partner.createdAt}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right pr-6 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/partners/view/${partner.id}`)}
                              title="View"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-[#16A34A] dark:text-gray-400 dark:hover:text-green-400 transition-colors cursor-pointer"
                              onClick={() => router.push(`/admin/partners/edit/${partner.id}`)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-550 transition-colors cursor-pointer"
                              onClick={() => setDeletingPartner(partner)}
                              title="Delete"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View (Card layout) */}
            <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-850">
              {sortedPartners.map((partner) => {
                const status = partner.status || "Active";
                const isActive = status.toLowerCase() === "active";
                return (
                  <div
                    key={partner.id}
                    className="p-4 space-y-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-[50px] w-[50px] rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-1">
                          {partner.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={partner.logo}
                              alt={partner.name}
                              className="h-full w-full object-cover rounded-md"
                            />
                          ) : (
                            <span className="text-[9px] text-gray-400 font-semibold uppercase">No Logo</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                            {partner.name}
                          </h4>
                          <span className="text-xs text-gray-450 dark:text-gray-500 block">ID: {partner.id}</span>
                        </div>
                      </div>
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent ${isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                      >
                        {status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Globe className="h-3.5 w-3.5 text-gray-455" />
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#16A34A] hover:underline font-semibold"
                        >
                          {partner.website}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{partner.createdAt || "No date record"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                        onClick={() => router.push(`/admin/partners/view/${partner.id}`)}
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-[#16A34A] dark:text-gray-400 dark:hover:text-green-400 cursor-pointer"
                        onClick={() => router.push(`/admin/partners/edit/${partner.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-550 cursor-pointer"
                        onClick={() => setDeletingPartner(partner)}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingPartner} onOpenChange={(open) => !open && setDeletingPartner(null)}>
        <AlertDialogContent className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 animate-in fade-in duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Delete Partner</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this partner?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2 justify-end">
            <AlertDialogCancel className="rounded-xl border-gray-200 h-10 px-4 cursor-pointer" variant="outline">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-750 text-white rounded-xl h-10 px-4 flex items-center justify-center cursor-pointer border-transparent shadow-sm hover:shadow-md"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
