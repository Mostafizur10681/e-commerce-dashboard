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

    const res = await fetch(`http://127.0.0.1:8000/api/admin/categories/${id}`, {
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
      imageUrl: item.image ? (item.image.startsWith("http") ? item.image : `http://127.0.0.1:8000/storage/${item.image}`) : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
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
    const detailRes = await fetch(`http://127.0.0.1:8000/api/admin/categories/${id}`, {
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
    const status = formData.get("status") as "Active" | "Inactive";
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let imageUrl = existing.image || "";
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/categories/${filename}`;
    }

    const payload = {
      name,
      description: description || "",
      status: status === "Active",
      image: imageUrl,
    };

    const res = await fetch(`http://127.0.0.1:8000/api/admin/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update category on backend" }, { status: res.status });
    }

    const updated = data.data;
    const responseData: Category = {
      id: String(updated.id),
      name: updated.name,
      description: updated.description || "",
      imageUrl: updated.image ? (updated.image.startsWith("http") ? updated.image : `http://127.0.0.1:8000/storage/${updated.image}`) : imageUrl,
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

    const res = await fetch(`http://127.0.0.1:8000/api/admin/categories/${id}`, {
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
