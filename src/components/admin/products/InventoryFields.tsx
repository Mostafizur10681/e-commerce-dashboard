import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function InventoryFields() {
  const { register, setValue, watch } = useFormContext();
  const stockStatus = watch("stockStatus");

  return (
    <div className="rounded-2xl shadow-sm p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">Inventory</h2>
      <div className="grid gap-4">
        {/* Stock Quantity */}
        <div>
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input
            id="stockQuantity"
            type="number"
            min="0"
            {...register("stockQuantity", { valueAsNumber: true })}
          />
        </div>
        {/* Unit */}
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select onValueChange={(v) => setValue("unit", v)} defaultValue={""}>
            <SelectTrigger id="unit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">KG</SelectItem>
              <SelectItem value="pcs">PCS</SelectItem>
              <SelectItem value="dozen">Dozen</SelectItem>
              <SelectItem value="packet">Packet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Stock Status */}
        <div>
          <Label htmlFor="stockStatus">Stock Status</Label>
          <Select
            onValueChange={(v) => setValue("stockStatus", v)}
            defaultValue={stockStatus || "in-stock"}
          >
            <SelectTrigger id="stockStatus">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              <SelectItem value="preorder">Pre‑order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
