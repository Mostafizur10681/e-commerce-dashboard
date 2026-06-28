import { NextResponse } from "next/server";
import { Product } from "@/types";

// Helper to resolve category ID from name
async function resolveCategoryId(categoryName: string, token: string | null): Promise<number | null> {
  if (!categoryName) return null;
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/categories`, {
      headers: token ? { "Authorization": token } : {},
    });
    if (res.ok) {
      const json = await res.json();
      const list = json.data || [];
      const match = list.find((c: any) => c.name.toLowerCase() === categoryName.toLowerCase());
      if (match) return match.id;
    }
  } catch (e) {
    console.error("Resolve category ID failed", e);
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const token = request.headers.get("Authorization");

    const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = await res.json();
    const item = data.data;

    if (!item) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const responseData: Product = {
      id: String(item.id),
      name: item.name,
      category: item.category?.name || "General",
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      description: item.description || "",
      images: item.gallery && item.gallery.length > 0 ? item.gallery : (item.image ? [item.image] : []),
      status: item.status === true || item.status === 1 ? "active" : "inactive",
      sku: item.SKU || "",
      // Add other details for form compatibility
      subCategory: item.sub_category || "",
      brand: item.brand || "",
      shortDescription: item.short_description || "",
      regularPrice: Number(item.price) || 0,
      salePrice: Number(item.sale_price) || 0,
      stockQuantity: Number(item.stock) || 0,
      unit: item.unit || "pcs",
      stockStatus: item.stock_status || "in-stock",
      featured: Boolean(item.featured),
      bestSeller: Boolean(item.best_seller),
      organic: Boolean(item.organic),
      newArrival: Boolean(item.new_arrival),
      metaTitle: item.meta_title || "",
      metaDescription: item.meta_description || "",
      metaKeywords: item.meta_keywords || "",
    } as any;

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("GET Product by ID Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      regularPrice,
      salePrice,
      sku,
      stockQuantity,
      category,
      status,
      images,
    } = body;

    const resolvedCategoryId = await resolveCategoryId(category || "", token);

    const payload = {
      name,
      description: description || "",
      short_description: shortDescription || "",
      price: Number(regularPrice) || 0,
      sale_price: salePrice ? Number(salePrice) : null,
      SKU: sku || `SKU-${Date.now()}`,
      stock: Number(stockQuantity) || 0,
      category_id: resolvedCategoryId,
      status: status === "active" || status === true,
      image: images?.[0] || "",
      gallery: images || [],
    };

    const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update product on backend" }, { status: res.status });
    }

    const updated = data.data;
    const responseData: Product = {
      id: String(updated.id),
      name: updated.name,
      category: category || "General",
      price: Number(updated.price) || 0,
      stock: Number(updated.stock) || 0,
      description: updated.description || "",
      images: updated.gallery || (updated.image ? [updated.image] : []),
      status: updated.status === true || updated.status === 1 ? "active" : "inactive",
      sku: updated.SKU || "",
    } as any;

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("PUT Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const token = request.headers.get("Authorization");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.message || "Failed to delete product on backend" }, { status: res.status });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
