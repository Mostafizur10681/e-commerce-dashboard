import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  regularPrice: z.number().min(0, "Regular Price must be non-negative"),
  salePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  tax: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).max(100).optional(),
  stockQuantity: z.number().int().min(0, "Stock Quantity is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
  stockStatus: z.enum(["in-stock", "out-of-stock"]).default("in-stock"),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  organic: z.boolean().default(false),
  images: z.array(z.any()).min(1, "At least one image is required"),
});

export type ProductFormData = z.infer<typeof productSchema>;
