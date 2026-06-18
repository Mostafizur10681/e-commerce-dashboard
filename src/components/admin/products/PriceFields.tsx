import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PriceFields() {
  const { register } = useFormContext();
  return (
    <div className="rounded-2xl shadow-sm p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">Pricing</h2>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="regularPrice">Regular Price ($)</Label>
          <Input id="regularPrice" type="number" step="0.01" min="0" {...register("regularPrice", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="salePrice">Sale Price ($)</Label>
          <Input id="salePrice" type="number" step="0.01" min="0" {...register("salePrice", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="costPrice">Cost Price ($)</Label>
          <Input id="costPrice" type="number" step="0.01" min="0" {...register("costPrice", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="tax">Tax (%)</Label>
          <Input id="tax" type="number" step="0.01" min="0" max="100" {...register("tax", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="discount">Discount (%)</Label>
          <Input id="discount" type="number" step="0.01" min="0" max="100" {...register("discount", { valueAsNumber: true })} />
        </div>
      </div>
    </div>
  );
}
