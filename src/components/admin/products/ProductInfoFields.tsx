import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Category, SubCategory } from "@/types";

export default function ProductInfoFields() {
  const { register, setValue, watch } = useFormContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategoriesList, setSubCategoriesList] = useState<SubCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSubCats, setLoadingSubCats] = useState(true);

  const selectedCategoryName = watch("category");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
        
        // Fetch Main Categories
        const catRes = await fetch("/api/categories?limit=1000", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.categories || []);
        }

        // Fetch Sub Categories from sub_categories table
        const subRes = await fetch("/api/sub-categories?limit=1000", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubCategoriesList(subData.subCategories || []);
        }
      } catch (e) {
        console.error("Failed to load categories in ProductInfoFields", e);
      } finally {
        setLoadingCats(false);
        setLoadingSubCats(false);
      }
    };
    fetchData();
  }, []);

  const mainCategories = categories.filter((c) => !c.parentId);
  const selectedParent = categories.find((c) => c.name === selectedCategoryName);
  
  // Filter subcategories matching selected parent category, or show all subcategories if none selected
  const availableSubCategories = selectedParent
    ? subCategoriesList.filter((sc) => String(sc.categoryId) === String(selectedParent.id))
    : subCategoriesList;

  return (
    <div className="rounded-2xl shadow-sm p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">Product Information</h2>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" {...register("name")} />
        </div>

        {/* Category (Main Category) */}
        <div>
          <Label htmlFor="category">Category (Main Category)</Label>
          <Select onValueChange={(v) => { setValue("category", v); setValue("subCategory", ""); }}>
            <SelectTrigger><SelectValue placeholder="Select main category" /></SelectTrigger>
            <SelectContent>
              {loadingCats ? (
                <SelectItem value="loading" disabled>Loading categories...</SelectItem>
              ) : mainCategories.length > 0 ? (
                mainCategories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))
              ) : (
                ["Men", "Women", "Children"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Category Dropdown from sub_categories table */}
        <div>
          <Label htmlFor="subCategory">Sub Category</Label>
          <Select onValueChange={(v) => {
            const matched = subCategoriesList.find((sc) => String(sc.id) === String(v) || sc.name === v);
            if (matched) {
              setValue("subCategoryId", matched.id);
              setValue("subCategory", matched.name);
            } else {
              setValue("subCategory", v);
            }
          }}>
            <SelectTrigger><SelectValue placeholder="Select sub category" /></SelectTrigger>
            <SelectContent>
              {loadingSubCats ? (
                <SelectItem value="loading" disabled>Loading sub categories...</SelectItem>
              ) : availableSubCategories.length > 0 ? (
                availableSubCategories.map((sc) => (
                  <SelectItem key={sc.id} value={String(sc.id)}>
                    {sc.name} {sc.categoryName ? `(${sc.categoryName})` : ""}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No sub categories available</SelectItem>
              )}
            </SelectContent>
          </Select>
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
