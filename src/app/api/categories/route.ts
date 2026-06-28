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

    const token = request.headers.get("Authorization");

    // Fetch all categories from Laravel backend
    const res = await fetch("http://127.0.0.1:8000/api/admin/categories", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      throw new Error("Failed to fetch categories from backend");
    }

    const json = await res.json();
    let all: Category[] = [];

    if (json.success && json.data) {
      all = (json.data || []).map((item: any) => ({
        id: String(item.id),
        name: item.name,
        description: item.description || "",
        imageUrl: item.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
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
    const status = (formData.get("status") as "Active" | "Inactive") || "Active";
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/categories/${filename}`;
    } else {
      return NextResponse.json({ error: "Category Image is required" }, { status: 400 });
    }

    const payload = {
      name,
      description: description || "",
      status: status === "Active",
      image: imageUrl,
    };

    const res = await fetch("http://127.0.0.1:8000/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {}),
      },
      body: JSON.stringify(payload),
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
      imageUrl: created.image || imageUrl,
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
