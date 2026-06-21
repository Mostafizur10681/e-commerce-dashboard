"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { CardSkeleton } from "@/app/admin/components/LoadingSkeleton";

// Simple fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EditSubscriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = React.use(params);

  const { data, error, isLoading } = useSWR(id ? `/api/subscriptions/${id}` : null, fetcher);

  const [form, setForm] = useState({
    name: "",
    email: "",
    plan: "",
    status: "Active",
    startDate: "",
    endDate: "",
    autoRenew: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Populate form when data loads
  if (data && form.name === "") {
    setForm({
      name: data.name,
      email: data.email,
      plan: data.plan,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      autoRenew: data.autoRenew,
    });
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    router.push("/admin/subscriptions");
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-950 min-h-screen">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || (data && (data as any).error)) {
    const errMsg = (data as any)?.error || 'Failed to load subscription.';
    return (
      <div className="p-6 bg-white dark:bg-slate-950 min-h-screen">
        <p className="text-red-600 dark:text-red-400">{errMsg}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-950 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Edit Subscription
      </h1>
      <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="p-2 border rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="p-2 border rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
          required
        />
        <input
          name="plan"
          value={form.plan}
          onChange={handleChange}
          placeholder="Plan"
          className="p-2 border rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
          required
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="p-2 border rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
        >
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          className="p-2 border rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
        />
        <input
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          className="p-2 border rounded bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white"
        />
        <label className="flex items-center space-x-2">
          <input
            name="autoRenew"
            type="checkbox"
            checked={form.autoRenew}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 text-emerald-600 bg-gray-100 border-gray-300 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">Auto‑Renew</span>
        </label>
        <div className="flex space-x-4 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/subscriptions")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
