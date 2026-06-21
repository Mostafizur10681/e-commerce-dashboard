"use client";

import { useState } from "react";
import useSWR from "swr";
import { SearchFilterBar } from "@/app/admin/components/SearchFilterBar";
import { SubscriptionTable } from "@/app/admin/components/SubscriptionTable";
import { SubscriptionCard } from "@/app/admin/components/SubscriptionCard";
import { DeleteModal } from "@/app/admin/components/DeleteModal";
import { TableSkeleton, CardSkeleton } from "@/app/admin/components/LoadingSkeleton";

interface Subscription {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "Active" | "Expired" | "Cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SubscriptionsPage() {
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const limit = 10; // rows per page

  // Data fetching via SWR
  const { data, error, mutate, isLoading } = useSWR<{
    data: Subscription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(
    `/api/subscriptions?q=${encodeURIComponent(searchTerm)}&status=${statusFilter}&page=${page}&limit=${limit}`,
    fetcher,
    { keepPreviousData: true }
  );

  const handleDelete = (sub: Subscription) => {
    setDeleteTarget(sub);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await fetch("/api/subscriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteTarget.id }),
    });
    setDeleteTarget(null);
    mutate(); // refetch list
  };

  const totalPages = data?.totalPages ?? 1;
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="p-6 bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Subscription Management
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Manage all user subscriptions
      </p>

      {/* Search / Filter bar */}
      <SearchFilterBar onSearch={setSearchTerm} onFilter={setStatusFilter} />

      {/* Content area */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-600 dark:text-red-400">
          Failed to load subscriptions.
        </p>
      )}

      {data && data.data.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No subscriptions match your criteria.
        </p>
      )}

      {data && data.data.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <SubscriptionTable data={data.data} onDelete={handleDelete} />
          </div>
          {/* Mobile cards */}
          <div className="lg:hidden">
            <SubscriptionCard data={data.data} onDelete={handleDelete} />
          </div>
          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={goPrev}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={page === totalPages}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        name={deleteTarget?.name ?? ""}
      />
    </div>
  );
}



