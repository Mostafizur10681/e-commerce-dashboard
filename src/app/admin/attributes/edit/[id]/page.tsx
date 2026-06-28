"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Sliders,
  Plus,
  X,
  Info,
  Tags,
  Loader2,
  AlertTriangle
} from "lucide-react";

import { useStore } from "@/store";
import { Attribute } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/badge";

interface EditAttributeFormValues {
  name: string;
  status: "Active" | "Inactive";
}

export default function EditAttributePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { updateAttribute: storeUpdateAttribute } = useStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newValueInput, setNewValueInput] = useState("");
  const [valuesList, setValuesList] = useState<string[]>([]);
  const [valueError, setValueError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAttributeFormValues>({
    defaultValues: {
      name: "",
      status: "Active",
    },
  });

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch(`/api/attributes/${id}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Attribute not found");
          }
          throw new Error("Failed to load attribute details");
        }
        const attribute: Attribute = await res.json();
        reset({
          name: attribute.name,
          status: attribute.status || "Active",
        });
        setValuesList(attribute.values || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load attribute");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAttribute();
    }
  }, [id, reset]);

  const handleAddValue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValueError(null);

    const trimmed = newValueInput.trim();
    if (!trimmed) {
      setValueError("Value cannot be empty");
      return;
    }

    if (valuesList.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setValueError("This value already exists in the list");
      return;
    }

    setValuesList((prev) => [...prev, trimmed]);
    setNewValueInput("");
  };

  const handleRemoveValue = (idx: number) => {
    setValuesList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddValue();
    }
  };

  const onSubmit = async (values: EditAttributeFormValues) => {
    if (valuesList.length === 0) {
      setValueError("At least one attribute value is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/attributes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          status: values.status,
          values: valuesList,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update attribute");
      }

      const updatedAttribute = await res.json();

      // Sync Zustand Store
      storeUpdateAttribute(id, updatedAttribute);

      toast("Attribute updated successfully", "success");

      router.push("/admin/attributes");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to update attribute", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
        <span className="text-sm font-semibold text-gray-500">Loading attribute details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs mt-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold mb-1">Error Loading Attribute</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <Link
          href="/admin/attributes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#16A34A] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Attributes", href: "/admin/attributes" },
          { label: "Edit Attribute" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-6 w-6 text-[#16A34A]" />
            Edit Attribute
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update attribute properties and dynamic values options.
          </p>
        </div>
        <Link
          href="/admin/attributes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-650 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Core Info Box */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <Info className="h-4.5 w-4.5 text-[#16A34A]" />
            General Information
          </h3>

          {/* Attribute Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Attribute Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Size, Color, Material, Brand"
              {...register("name", { required: "Attribute name is required" })}
              className="h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-950/50 rounded-xl focus-visible:ring-[#16A34A]"
            />
            {errors.name && (
              <p className="text-xs text-red-550 dark:text-red-400 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status
            </Label>
            <select
              id="status"
              {...register("status")}
              className="w-full h-10 border border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#16A34A] text-gray-700 dark:text-gray-300"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Dynamic Values Box */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <Tags className="h-4.5 w-4.5 text-[#16A34A]" />
            Attribute Values <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs text-gray-400">
            Define different options for this attribute. Type a value below and hit Enter or click the "+" button.
          </p>

          {/* Tag entry system */}
          <div className="flex gap-2">
            <Input
              value={newValueInput}
              onChange={(e) => setNewValueInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Red, XL, Cotton, Nike"
              className="h-10 border-gray-200 dark:border-gray-800 dark:bg-gray-955 rounded-xl focus-visible:ring-[#16A34A] flex-1"
            />
            <Button
              type="button"
              onClick={handleAddValue}
              className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 w-10 shrink-0 flex items-center justify-center cursor-pointer border-transparent"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {valueError && <p className="text-xs text-red-550 dark:text-red-400 font-medium">{valueError}</p>}

          {/* List of current tags */}
          <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 min-h-[100px] flex flex-wrap gap-2 items-center bg-gray-50/50 dark:bg-gray-950/30">
            {valuesList.length === 0 ? (
              <span className="text-xs text-gray-400 italic mx-auto">No values added yet. Define at least one attribute value.</span>
            ) : (
              valuesList.map((val, idx) => (
                <Badge
                  key={idx}
                  className="rounded-lg px-2.5 py-1 text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-205 dark:border-gray-750 text-gray-850 dark:text-gray-200 flex items-center gap-1.5"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(idx)}
                    className="text-gray-450 hover:text-red-500 transition shrink-0 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Submission Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/admin/attributes")}
            className="rounded-xl h-10 border-gray-200 px-6 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl h-10 border-transparent px-8 shadow-xs transition-colors cursor-pointer flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
