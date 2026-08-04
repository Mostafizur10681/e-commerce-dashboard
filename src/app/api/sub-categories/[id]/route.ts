import { NextResponse } from "next/server";
import { SubCategory } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const token = request.headers.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/sub-categories/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Sub category not found" }, { status: 404 });
    }

    const data = await res.json();
    const item = data.data;

    if (!item) {
      return NextResponse.json({ error: "Sub category not found" }, { status: 404 });
    }

    const responseData: SubCategory = {
      id: String(item.id),
      categoryId: String(item.category_id),
      categoryName: item.category ? item.category.name : "",
      name: item.name,
      description: item.description || "",
      imageUrl: item.image ? (item.image.startsWith("data:image/") || item.image.startsWith("http") ? item.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${item.image}`) : "",
      status: item.status === true || item.status === 1 ? "Active" : "Inactive",
      createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("GET SubCategory by ID Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch sub category" }, { status: 500 });
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

    const formData = await request.formData();
    const categoryId = formData.get("category_id") || formData.get("categoryId");
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "Active" | "Inactive";
    const imageFile = formData.get("image") as File | null;

    const backendFormData = new FormData();
    backendFormData.append("_method", "PUT");
    if (categoryId && categoryId !== "undefined" && categoryId !== "null" && categoryId !== "") {
      backendFormData.append("category_id", String(categoryId));
    }
    if (name) backendFormData.append("name", name);
    if (description !== null) backendFormData.append("description", description);
    if (status) backendFormData.append("status", status === "Active" ? "1" : "0");
    if (imageFile && imageFile.size > 0) {
      backendFormData.append("image_file", imageFile);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/sub-categories/${id}`, {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": token } : {}),
      },
      body: backendFormData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update sub category" }, { status: res.status });
    }

    const updated = data.data;
    const responseData: SubCategory = {
      id: String(updated.id),
      categoryId: String(updated.category_id),
      categoryName: updated.category ? updated.category.name : "",
      name: updated.name,
      description: updated.description || "",
      imageUrl: updated.image ? (updated.image.startsWith("data:image/") || updated.image.startsWith("http") ? updated.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${updated.image}`) : "",
      status: updated.status === true || updated.status === 1 ? "Active" : "Inactive",
      createdDate: updated.created_at ? new Date(updated.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("PUT SubCategory Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update sub category" }, { status: 500 });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/sub-categories/${id}`, {
      method: "DELETE",
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to delete sub category" }, { status: res.status });
    }

    return NextResponse.json({ message: "Sub category deleted successfully" });
  } catch (error: any) {
    console.error("DELETE SubCategory Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete sub category" }, { status: 500 });
  }
}
