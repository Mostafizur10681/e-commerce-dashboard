import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SEOFields() {
  const { register } = useFormContext();
  return (
    <div className="rounded-2xl shadow-sm p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">SEO</h2>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input id="metaTitle" {...register("metaTitle")} />
        </div>
        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea id="metaDescription" {...register("metaDescription")} />
        </div>
        <div>
          <Label htmlFor="metaKeywords">Meta Keywords</Label>
          <Input id="metaKeywords" {...register("metaKeywords")} />
        </div>
      </div>
    </div>
  );
}
