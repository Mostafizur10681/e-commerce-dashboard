"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ArrowLeft, Layers, Loader2 } from "lucide-react";

import { Category, SubCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditSubCategoryFormValues {
  categoryId: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

export default function EditSubCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditSubCategoryFormValues>({
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      status: "Active",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        
        // Fetch categories list
        const catRes = await fetch("/api/categories?limit=1000", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }

        // Fetch single sub category details
        const subRes = await fetch(`/api/sub-categories/${id}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (subRes.ok) {
          const subCategory: SubCategory = await subRes.json();
          reset({
            categoryId: subCategory.categoryId,
            name: subCategory.name,
            description: subCategory.description,
            status: subCategory.status || "Active",
          });
          if (subCategory.imageUrl) {
            setImagePreview(subCategory.imageUrl);
          }
        }
      } catch (e) {
        console.error("Failed to load sub category details", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: EditSubCategoryFormValues) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("category_id", values.categoryId);
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("status", values.status);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
      const res = await fetch(`/api/sub-categories/${id}`, {
        method: "PUT",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update sub category");
      }

      toast("Sub category updated successfully", "success");
      router.push("/admin/sub-categories");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to update sub category", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#16A34A]" />
        <p className="mt-2 text-sm text-gray-500">Loading sub category details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Sub Categories", href: "/admin/sub-categories" },
          { label: "Edit Sub Category" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#16A34A]" />
            Edit Sub Category
          </h1>
          <p className="text-sm text-gray-500">Update sub category parameters.</p>
        </div>
        <Link href="/admin/sub-categories" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Select Main Category <span className="text-red-500">*</span></Label>
          <Select value={watch("categoryId")} onValueChange={(val) => setValue("categoryId", val)}>
            <SelectTrigger className="h-10 border-gray-200 dark:border-gray-800 rounded-xl">
              <SelectValue placeholder="Select parent main category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-semibold">Sub Category Name <span className="text-red-500">*</span></Label>
          <Input id="name" {...register("name", { required: "Name is required" })} className="h-10 rounded-xl" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
          <Textarea id="description" rows={3} {...register("description")} className="rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Sub Category Image</Label>
          <Input type="file" accept="image/*" onChange={handleFileChange} className="h-10 rounded-xl" />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover mt-2 border" />
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
          <select id="status" {...register("status")} className="w-full h-10 border rounded-xl px-3 text-sm">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/sub-categories")} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#16A34A] hover:bg-green-700 text-white rounded-xl px-6">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Sub Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
