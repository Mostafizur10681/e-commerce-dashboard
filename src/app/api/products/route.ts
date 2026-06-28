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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "All";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const token = request.headers.get("Authorization");

    const res = await fetch("http://127.0.0.1:8000/api/admin/products?per_page=100", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products from backend");
    }

    const json = await res.json();
    let all: Product[] = [];

    const rawList = json.data?.data || json.data || [];
    all = rawList.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      category: item.category?.name || "General",
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      description: item.description || "",
      images: item.gallery && item.gallery.length > 0 ? item.gallery : (item.image ? [item.image] : []),
      // Extra fields for compatibility
      status: item.status === true || item.status === 1 ? "active" : "inactive",
      sku: item.SKU || "",
    }));

    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.id.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
    }

    if (category !== "All") {
      all = all.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (status !== "All") {
      all = all.filter((p) => (p as any).status === status);
    }

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return NextResponse.json({
      products: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

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

    const res = await fetch("http://127.0.0.1:8000/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create product on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData: Product = {
      id: String(created.id),
      name: created.name,
      category: category || "General",
      price: Number(created.price) || 0,
      stock: Number(created.stock) || 0,
      description: created.description || "",
      images: created.gallery || (created.image ? [created.image] : []),
      status: created.status === true || created.status === 1 ? "active" : "inactive",
      sku: created.SKU || "",
    } as any;

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
