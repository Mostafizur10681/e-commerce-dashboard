import React from "react";
import AddProductForm from "@/components/admin/products/AddProductForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Add New Product",
};

export default function AddProductPage() {
  return (
    <section className="p-6 md:p-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Products", href: "/admin/products" },
          { label: "Add Product", href: "/admin/products/add" },
        ]}
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        Add New Product
      </h1>
      <div className="mt-6">
        <AddProductForm />
      </div>
    </section>
  );
}
