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
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch products from backend");
    }

    const json = await res.json();
    let all: Product[] = [];

    const rawList = json.data?.data || json.data || [];
    all = rawList.map((item: any) => {
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

      return {
        id: String(item.id),
        name: item.name,
        category: item.category?.name || "General",
        price: Number(item.price) || 0,
        stock: Number(item.stock) || 0,
        description: item.description || "",
        images: imagesArray,
        status: item.status === true || item.status === 1 ? "active" : "inactive",
        sku: item.SKU || "",
        subCategory: item.sub_category || "",
        brand: item.brand || "",
        shortDescription: item.short_description || "",
        regularPrice: Number(item.price) || 0,
        salePrice: Number(item.sale_price) || 0,
        stockQuantity: Number(item.stock) || 0,
        tax: Number(item.tax) || 0,
        discount: Number(item.discount) || 0,
        unit: item.unit || "",
        stockStatus: item.stock_status || "in-stock",
        featured: Boolean(item.featured),
        bestSeller: Boolean(item.best_seller),
        organic: Boolean(item.organic),
        newArrival: Boolean(item.new_arrival),
        metaTitle: item.meta_title || "",
        metaDescription: item.meta_description || "",
        metaKeywords: item.meta_keywords || "",
        attributes: item.attributes || [],
      };
    });


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
      attributes,
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
      attributes: attributes || [],
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
    let createdImagesArray: string[] = [];
    if (created.images && Array.isArray(created.images)) {
      createdImagesArray = created.images.map((img: any) => {
        if (typeof img === "string") return img;
        if (img && img.image_path) {
          return img.image_path.startsWith("http") ? img.image_path : `http://127.0.0.1:8000/storage/${img.image_path}`;
        }
        return "";
      }).filter(Boolean);
    }
    if (createdImagesArray.length === 0) {
      if (created.gallery && Array.isArray(created.gallery)) {
        createdImagesArray = created.gallery.map((img: string) => img.startsWith("http") ? img : `http://127.0.0.1:8000/storage/${img}`);
      } else if (created.image) {
        createdImagesArray = [created.image.startsWith("http") ? created.image : `http://127.0.0.1:8000/storage/${created.image}`];
      }
    }

    const responseData: Product = {
      id: String(created.id),
      name: created.name,
      category: category || "General",
      price: Number(created.price) || 0,
      stock: Number(created.stock) || 0,
      description: created.description || "",
      images: createdImagesArray,
      status: created.status === true || created.status === 1 ? "active" : "inactive",
      sku: created.SKU || "",
      subCategory: created.sub_category || "",
      brand: created.brand || "",
      shortDescription: created.short_description || "",
      regularPrice: Number(created.price) || 0,
      salePrice: Number(created.sale_price) || 0,
      stockQuantity: Number(created.stock) || 0,
      tax: Number(created.tax) || 0,
      discount: Number(created.discount) || 0,
      unit: created.unit || "",
      stockStatus: created.stock_status || "in-stock",
      featured: Boolean(created.featured),
      bestSeller: Boolean(created.best_seller),
      organic: Boolean(created.organic),
      newArrival: Boolean(created.new_arrival),
      metaTitle: created.meta_title || "",
      metaDescription: created.meta_description || "",
      metaKeywords: created.meta_keywords || "",
      attributes: created.attributes || [],
    } as any;

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
