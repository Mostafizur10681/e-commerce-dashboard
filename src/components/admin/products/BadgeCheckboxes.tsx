"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const BADGES = [
  { name: "organic", label: "Organic" },
  { name: "featured", label: "Featured" },
  { name: "bestSeller", label: "Best Seller" },
  { name: "newArrival", label: "New Arrival" },
];

export default function BadgeCheckboxes() {
  const { setValue, watch } = useFormContext();

  return (
    <div className="rounded-2xl shadow-sm p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">Product Badges</h2>
      <div className="flex flex-wrap gap-4">
        {BADGES.map((field) => {
          const checked = !!watch(field.name);
          return (
            <div key={field.name} className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={checked}
                onCheckedChange={(val) => setValue(field.name, !!val)}
              />
              <Label htmlFor={field.name}>{field.label}</Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
