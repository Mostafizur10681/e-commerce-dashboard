import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Category } from "@/types";

export default function ProductInfoFields() {
  const { register, setValue } = useFormContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        const res = await fetch("/api/categories?limit=1000", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error("Failed to load categories in ProductInfoFields", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="rounded-2xl shadow-sm p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">Product Information</h2>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" {...register("name")} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Loading categories...</SelectItem>
              ) : categories.length > 0 ? (
                categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))
              ) : (
                ["Electronics", "Clothing", "Food", "Sports"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="subCategory">Sub Category</Label>
          <Input id="subCategory" {...register("subCategory")} />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" {...register("brand")} />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} />
        </div>
        <div>
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea id="shortDescription" {...register("shortDescription")} />
        </div>
        <div>
          <Label htmlFor="description">Full Description</Label>
          <Textarea id="description" {...register("description")} />
        </div>
      </div>
    </div>
  );
}
