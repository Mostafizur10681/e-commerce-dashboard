import { NextResponse } from "next/server";
import { SubCategory } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const token = request.headers.get("Authorization");

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/sub-categories", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch sub categories from backend");
    }

    const json = await res.json();
    let all: SubCategory[] = [];

    if (json.success && json.data) {
      all = (json.data || []).map((item: any) => ({
        id: String(item.id),
        categoryId: String(item.category_id),
        categoryName: item.category ? item.category.name : "",
        name: item.name,
        description: item.description || "",
        imageUrl: item.image ? (item.image.startsWith("data:image/") || item.image.startsWith("http") ? item.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${item.image}`) : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
        status: item.status === true || item.status === 1 ? "Active" : "Inactive",
        createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
      }));
    }

    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.id.toLowerCase().includes(lower) ||
          (c.categoryName || "").toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    if (status !== "All") {
      all = all.filter((c) => c.status === status);
    }

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return NextResponse.json({
      subCategories: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("GET SubCategories Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch sub categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    const formData = await request.formData();
    const categoryId = formData.get("category_id") || formData.get("categoryId");
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as "Active" | "Inactive") || "Active";
    const imageFile = formData.get("image") as File | null;

    if (!categoryId) {
      return NextResponse.json({ error: "Parent category is required" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Sub category name is required" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("category_id", String(categoryId));
    backendFormData.append("name", name);
    backendFormData.append("description", description || "");
    backendFormData.append("status", status === "Active" ? "1" : "0");
    if (imageFile && imageFile.size > 0) {
      backendFormData.append("image_file", imageFile);
    }

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/sub-categories", {
      method: "POST",
      headers: {
        ...(token ? { "Authorization": token } : {}),
      },
      body: backendFormData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create sub category" }, { status: res.status });
    }

    const created = data.data;
    const responseData: SubCategory = {
      id: String(created.id),
      categoryId: String(created.category_id),
      categoryName: created.category ? created.category.name : "",
      name: created.name,
      description: created.description || "",
      imageUrl: created.image ? (created.image.startsWith("data:image/") || created.image.startsWith("http") ? created.image : `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/storage/${created.image}`) : "",
      status: created.status === true || created.status === 1 ? "Active" : "Inactive",
      createdDate: created.created_at ? new Date(created.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST SubCategory Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create sub category" }, { status: 500 });
  }
}
