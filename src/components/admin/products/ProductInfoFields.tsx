import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function ProductInfoFields() {
  const { register, setValue } = useFormContext();
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
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="food">Food</SelectItem>
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
