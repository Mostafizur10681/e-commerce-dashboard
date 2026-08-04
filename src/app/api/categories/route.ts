import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Category } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const type = searchParams.get("type") || "All";

    const token = request.headers.get("Authorization");

    // Fetch all categories from Laravel backend
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/categories", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch categories from backend");
    }

    const json = await res.json();
    let all: Category[] = [];

    if (json.success && json.data) {
      all = (json.data || []).map((item: any) => ({
        id: String(item.id),
        name: item.name,
        description: item.description || "",
        parentId: item.parent_id ? String(item.parent_id) : null,
        imageUrl: item.image ? (item.image.startsWith("data:image/") || item.image.startsWith("http") ? item.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${item.image}`) : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
        status: item.status === true || item.status === 1 ? "Active" : "Inactive",
        createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
        seoTitle: item.name,
        seoDescription: item.description || "",
      }));
    }

    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.id.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    if (status !== "All") {
      all = all.filter((c) => c.status === status);
    }

    if (type === "main") {
      all = all.filter((c) => !c.parentId);
    } else if (type === "sub" || type === "subcategory") {
      all = all.filter((c) => !!c.parentId);
    }

    // Sort categories with newest first
    all = [...all].sort((a, b) => {
      const dateA = a.createdDate || "";
      const dateB = b.createdDate || "";
      return dateB.localeCompare(dateA);
    });

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return NextResponse.json({
      categories: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("GET Categories Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parent_id") || formData.get("parentId");
    const status = (formData.get("status") as "Active" | "Inactive") || "Active";
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "Category Image is required" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("name", name);
    backendFormData.append("description", description || "");
    if (parentId) {
      backendFormData.append("parent_id", String(parentId));
    }
    backendFormData.append("status", status === "Active" ? "1" : "0");
    backendFormData.append("image_file", imageFile);

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/categories", {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": token } : {}),
      },
      body: backendFormData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create category on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData: Category = {
      id: String(created.id),
      name: created.name,
      description: created.description || "",
      imageUrl: created.image ? (created.image.startsWith("data:image/") || created.image.startsWith("http") ? created.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${created.image}`) : "",
      status: created.status === true || created.status === 1 ? "Active" : "Inactive",
      createdDate: created.created_at ? new Date(created.created_at).toISOString().split("T")[0] : "",
      seoTitle: created.name,
      seoDescription: created.description || "",
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
