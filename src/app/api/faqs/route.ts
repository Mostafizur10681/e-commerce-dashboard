import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { FAQ } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/faqs.json");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function readFaqs(): Promise<FAQ[]> {
  try {
    const content = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

export async function writeFaqs(data: FAQ[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const status = searchParams.get("status") || "All";
    const sort = searchParams.get("sort") || "display_asc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let list = await readFaqs();

    // 1. Filter by search query
    if (q) {
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }

    // 2. Filter by status (case insensitive)
    if (status !== "All") {
      list = list.filter(
        (f) => f.status.toLowerCase() === status.toLowerCase()
      );
    }

    // 2.5. Filter by category
    const category = searchParams.get("category") || "All";
    if (category !== "All") {
      list = list.filter(
        (f) => f.category && f.category.toLowerCase() === category.toLowerCase()
      );
    }

    // 3. Sort
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

    return NextResponse.json(
      {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("GET FAQs error:", err);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 550, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const faqs = await readFaqs();

    const displayOrder = parseInt(body.displayOrder, 10);

    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      category: body.category || "General Questions",
      question: body.question || "",
      answer: body.answer || "",
      displayOrder: isNaN(displayOrder) ? 1 : displayOrder,
      status: body.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    faqs.push(newFaq);
    // Auto sort by display order before saving
    faqs.sort((a, b) => a.displayOrder - b.displayOrder);
    await writeFaqs(faqs);

    return NextResponse.json(newFaq, { status: 201, headers: CORS_HEADERS });
  } catch (err) {
    console.error("POST FAQ error:", err);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
