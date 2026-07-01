import { NextResponse } from "next/server";
import { FAQCategory } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const token = request.headers.get("Authorization");

    const res = await fetch("http://127.0.0.1:8000/api/faq-categories", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch FAQ categories from backend");
    }

    const json = await res.json();
    let all: FAQCategory[] = [];

    if (json.success && json.data) {
      all = (json.data || []).map((item: any) => ({
        id: String(item.id),
        name: item.name,
        slug: item.slug,
        description: item.description || "",
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
          c.description.toLowerCase().includes(lower)
      );
    }

    if (status !== "All") {
      all = all.filter((c) => c.status === status);
    }

    // Sort newest first
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
      faqCategories: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("GET FAQ Categories Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch FAQ categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status } = body;

    if (!name) {
      return NextResponse.json({ error: "FAQ Category name is required" }, { status: 400 });
    }

    const payload = {
      name,
      description,
      status: status === "Active" || status === true,
    };

    const res = await fetch("http://127.0.0.1:8000/api/admin/faq-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create FAQ category on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData: FAQCategory = {
      id: String(created.id),
      name: created.name,
      slug: created.slug,
      description: created.description || "",
      status: created.status === true || created.status === 1 ? "Active" : "Inactive",
      createdDate: created.created_at ? new Date(created.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST FAQ Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit FAQ category" }, { status: 500 });
  }
}
