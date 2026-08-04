import { NextResponse } from "next/server";
import { FAQ } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const status = searchParams.get("status") || "All";
    const sort = searchParams.get("sort") || "display_asc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const category = searchParams.get("category") || "All";

    const token = request.headers.get("Authorization");

    // Fetch from backend (retrieve all to perform client-side filtering/sorting)
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/faqs?all=1", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch FAQs from backend");
    }

    const json = await res.json();
    const rawList = json.data || [];
    let list: FAQ[] = rawList.map((item: any) => ({
      id: String(item.id),
      category: item.category || "General",
      question: item.question,
      answer: item.answer,
      displayOrder: item.id ? Number(item.id) : 1,
      status: item.status === true || item.status === 1 ? "active" : "inactive",
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
    }));

    // 1. Filter by search query
    if (q) {
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }

    // 2. Filter by status
    if (status !== "All") {
      list = list.filter(
        (f) => f.status.toLowerCase() === status.toLowerCase()
      );
    }

    // 3. Filter by category
    if (category !== "All") {
      list = list.filter(
        (f) => f.category && f.category.toLowerCase() === category.toLowerCase()
      );
    }

    // 4. Sort
    list.sort((a, b) => {
      if (sort === "display_desc") {
        return b.displayOrder - a.displayOrder;
      } else if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sort === "question_asc") {
        return a.question.localeCompare(b.question);
      } else {
        // default display_asc
        return a.displayOrder - b.displayOrder;
      }
    });

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginatedData = list.slice(start, start + limit);

    return NextResponse.json({
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err: any) {
    console.error("GET FAQs error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, category, status } = body;

    const payload = {
      question,
      answer,
      category,
      status: status === "active" || status === true,
    };

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/v1/auth/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create FAQ on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData: FAQ = {
      id: String(created.id),
      category: created.category || "General",
      question: created.question,
      answer: created.answer,
      displayOrder: created.id ? Number(created.id) : 1,
      status: created.status === true || created.status === 1 ? "active" : "inactive",
      createdAt: created.created_at || new Date().toISOString(),
      updatedAt: created.updated_at || new Date().toISOString(),
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (err: any) {
    console.error("POST FAQ error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
