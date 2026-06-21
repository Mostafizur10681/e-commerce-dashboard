"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// Simple fetcher used across the admin forms
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FormValues {
  name: string;
  email: string;
  plan: "Basic" | "Pro" | "Premium";
  status: "Active" | "Expired" | "Cancelled";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentStatus: "Paid" | "Unpaid" | "Pending";
  amount?: number;
}

const defaultForm: FormValues = {
  name: "",
  email: "",
  plan: "Basic",
  status: "Active",
  startDate: "",
  endDate: "",
  autoRenew: false,
  paymentStatus: "Paid",
  amount: undefined,
};

export default function AddSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") ?? "";

  const [form, setForm] = useState<FormValues>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load subscription for edit mode
  const { data: editData, error: editError } = useSWR(
    id ? `/api/subscriptions/${id}` : null,
    fetcher
  );

  // Populate form when edit data arrives
  useEffect(() => {
    if (editData && form.name === "") {
      setForm({
        name: editData.name ?? "",
        email: editData.email ?? "",
        plan: editData.plan ?? "Basic",
        status: editData.status ?? "Active",
        startDate: editData.startDate ?? "",
        endDate: editData.endDate ?? "",
        autoRenew: editData.autoRenew ?? false,
        paymentStatus: editData.paymentStatus ?? "Paid",
        amount: editData.amount ?? undefined,
      });
    }
  }, [editData]);

  // Validation helpers
  const validate = (values: FormValues) => {
    const newErrors: Record<string, string> = {};
    if (!values.name.trim()) newErrors.name = "Name is required";
    if (!values.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      newErrors.email = "Invalid email format";
    if (!values.startDate) newErrors.startDate = "Start date required";
    if (!values.endDate) newErrors.endDate = "End date required";
    if (values.startDate && values.endDate && new Date(values.endDate) <= new Date(values.startDate))
      newErrors.endDate = "End date must be after start date";
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Auto‑fill amount when plan changes (hard‑coded pricing)
  useEffect(() => {
    const priceMap: Record<string, number> = { Basic: 10, Pro: 20, Premium: 30 };
    setForm((prev) => ({ ...prev, amount: priceMap[prev.plan] }));
  }, [form.plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/subscriptions/${id}` : "/api/subscriptions";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Request failed");
      }
      toast.success(`Subscription ${id ? "updated" : "created"} successfully`);
      router.push("/admin/subscriptions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading states for edit mode
  if (id && !editData && !editError) {
    return (
      <div className="p-6 bg-white dark:bg-slate-950 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading subscription…</p>
      </div>
    );
  }

  if (editError) {
    return (
      <div className="p-6 bg-white dark:bg-slate-950 min-h-screen">
        <p className="text-red-600 dark:text-red-400">Failed to load subscription.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-950 min-h-screen flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>{id ? "Edit Subscription" : "Add Subscription"}</CardTitle>
          <CardDescription>
            {id
              ? "Update the subscription details"
              : "Create a new user subscription"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            {/* Left Column – User Info & Plan */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="name">
                  User Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="email">
                  User Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="plan">
                  Plan Type
                </label>
                <Select
                  name="plan"
                  value={form.plan}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, plan: value as any }))
                  }
                >
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="status">
                  Subscription Status
                </label>
                <Select
                  name="status"
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, status: value as any }))
                  }
                >
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </Select>
              </div>
            </div>

            {/* Right Column – Dates & Settings */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="startDate">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="endDate">
                  End Date
                </label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoRenew"
                  name="autoRenew"
                  checked={form.autoRenew}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, autoRenew: checked }))
                  }
                />
                <label htmlFor="autoRenew" className="text-gray-700 dark:text-gray-300">
                  Auto Renewal
                </label>
              </div>
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="paymentStatus">
                  Payment Status
                </label>
                <Select
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, paymentStatus: value as any }))
                  }
                >
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </Select>
              </div>
              <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300" htmlFor="amount">
                  Amount (USD)
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  value={form.amount ?? ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex space-x-4 mt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
              >
                {submitting ? (id ? "Updating…" : "Creating…") : id ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                disabled={submitting}
                variant="outline"
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                onClick={() => router.push("/admin/subscriptions")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
