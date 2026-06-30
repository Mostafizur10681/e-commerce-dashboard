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
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = await res.json();
    const item = data.data;

    if (!item) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let imagesArray: string[] = [];
    if (item.images && Array.isArray(item.images)) {
      imagesArray = item.images.map((img: any) => {
        if (typeof img === "string") return img;
        if (img && img.image_path) {
          return img.image_path.startsWith("http") ? img.image_path : `http://127.0.0.1:8000/storage/${img.image_path}`;
        }
        return "";
      }).filter(Boolean);
    }
    if (imagesArray.length === 0) {
      if (item.gallery && Array.isArray(item.gallery)) {
        imagesArray = item.gallery.map((img: string) => img.startsWith("http") ? img : `http://127.0.0.1:8000/storage/${img}`);
      } else if (item.image) {
        imagesArray = [item.image.startsWith("http") ? item.image : `http://127.0.0.1:8000/storage/${item.image}`];
      }
    }

    const responseData: Product = {
      id: String(item.id),
      name: item.name,
      category: item.category?.name || "General",
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      description: item.description || "",
      images: imagesArray,
      status: item.status === true || item.status === 1 ? "active" : "inactive",
      sku: item.SKU || "",
      // Add other details for form compatibility
      subCategory: item.sub_category || "",
      brand: item.brand || "",
      shortDescription: item.short_description || "",
      regularPrice: Number(item.price) || 0,
      salePrice: Number(item.sale_price) || 0,
      stockQuantity: Number(item.stock) || 0,
      tax: Number(item.tax) || 0,
      discount: Number(item.discount) || 0,
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
      subCategory,
      brand,
      tax,
      discount,
      unit,
      stockStatus,
      featured,
      bestSeller,
      organic,
      newArrival,
      metaTitle,
      metaDescription,
      metaKeywords,
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
      sub_category: subCategory || "",
      brand: brand || "",
      tax: Number(tax) || 0,
      discount: Number(discount) || 0,
      unit: unit || "",
      stock_status: stockStatus || "in-stock",
      featured: Boolean(featured),
      best_seller: Boolean(bestSeller),
      organic: Boolean(organic),
      new_arrival: Boolean(newArrival),
      meta_title: metaTitle || "",
      meta_description: metaDescription || "",
      meta_keywords: metaKeywords || "",
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
    let updatedImagesArray: string[] = [];
    if (updated.images && Array.isArray(updated.images)) {
      updatedImagesArray = updated.images.map((img: any) => {
        if (typeof img === "string") return img;
        if (img && img.image_path) {
          return img.image_path.startsWith("http") ? img.image_path : `http://127.0.0.1:8000/storage/${img.image_path}`;
        }
        return "";
      }).filter(Boolean);
    }
    if (updatedImagesArray.length === 0) {
      if (updated.gallery && Array.isArray(updated.gallery)) {
        updatedImagesArray = updated.gallery.map((img: string) => img.startsWith("http") ? img : `http://127.0.0.1:8000/storage/${img}`);
      } else if (updated.image) {
        updatedImagesArray = [updated.image.startsWith("http") ? updated.image : `http://127.0.0.1:8000/storage/${updated.image}`];
      }
    }

    const responseData: Product = {
      id: String(updated.id),
      name: updated.name,
      category: category || "General",
      price: Number(updated.price) || 0,
      stock: Number(updated.stock) || 0,
      description: updated.description || "",
      images: updatedImagesArray,
      status: updated.status === true || updated.status === 1 ? "active" : "inactive",
      sku: updated.SKU || "",
      subCategory: updated.sub_category || "",
      brand: updated.brand || "",
      shortDescription: updated.short_description || "",
      regularPrice: Number(updated.price) || 0,
      salePrice: Number(updated.sale_price) || 0,
      stockQuantity: Number(updated.stock) || 0,
      tax: Number(updated.tax) || 0,
      discount: Number(updated.discount) || 0,
      unit: updated.unit || "",
      stockStatus: updated.stock_status || "in-stock",
      featured: Boolean(updated.featured),
      bestSeller: Boolean(updated.best_seller),
      organic: Boolean(updated.organic),
      newArrival: Boolean(updated.new_arrival),
      metaTitle: updated.meta_title || "",
      metaDescription: updated.meta_description || "",
      metaKeywords: updated.meta_keywords || "",
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
