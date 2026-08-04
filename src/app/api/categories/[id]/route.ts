import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Category } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const token = request.headers.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/categories/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const data = await res.json();
    const item = data.data;

    if (!item) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const responseData: Category = {
      id: String(item.id),
      name: item.name,
      description: item.description || "",
      parentId: item.parent_id ? String(item.parent_id) : null,
      imageUrl: item.image ? (item.image.startsWith("data:image/") || item.image.startsWith("http") ? item.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${item.image}`) : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
      status: item.status === true || item.status === 1 ? "Active" : "Inactive",
      createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
      seoTitle: item.name,
      seoDescription: item.description || "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("GET Category by ID Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch category" }, { status: 500 });
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

    // Fetch existing details to preserve image if not uploaded
    const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/categories/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    if (!detailRes.ok) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const detailData = await detailRes.json();
    const existing = detailData.data;

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parent_id") || formData.get("parentId");
    const status = formData.get("status") as "Active" | "Inactive";
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("_method", "PUT");
    backendFormData.append("name", name);
    backendFormData.append("description", description || "");
    if (parentId) {
      backendFormData.append("parent_id", String(parentId));
    }
    backendFormData.append("status", status === "Active" ? "1" : "0");
    if (imageFile && imageFile.size > 0) {
      backendFormData.append("image_file", imageFile);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/categories/${id}`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": token } : {}),
      },
      body: backendFormData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update category on backend" }, { status: res.status });
    }

    const fallbackImageUrl = existing.image ? (existing.image.startsWith("data:image/") || existing.image.startsWith("http") ? existing.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${existing.image}`) : "";

    const updated = data.data;
    const responseData: Category = {
      id: String(updated.id),
      name: updated.name,
      description: updated.description || "",
      imageUrl: updated.image ? (updated.image.startsWith("data:image/") || updated.image.startsWith("http") ? updated.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${updated.image}`) : fallbackImageUrl,
      status: updated.status === true || updated.status === 1 ? "Active" : "Inactive",
      createdDate: updated.created_at ? new Date(updated.created_at).toISOString().split("T")[0] : "",
      seoTitle: updated.name,
      seoDescription: updated.description || "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("PUT Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/categories/${id}`, {
      method: "DELETE",
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.message || "Failed to delete category on backend" }, { status: res.status });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
