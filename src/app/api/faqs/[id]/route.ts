import { NextResponse } from "next/server";
import { readFaqs, writeFaqs } from "../route";
import { FAQ } from "@/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const faqs = await readFaqs();
    const faq = faqs.find((f) => f.id === id);

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(faq, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("GET FAQ error:", err);
    return NextResponse.json(
      { error: "Failed to get FAQ" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const body = await request.json();
    const faqs = await readFaqs();
    const idx = faqs.findIndex((f) => f.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const currentFaq = faqs[idx];
    const displayOrder = body.displayOrder !== undefined ? parseInt(body.displayOrder, 10) : currentFaq.displayOrder;

    const updatedFaq: FAQ = {
      ...currentFaq,
      category: body.category !== undefined ? body.category : currentFaq.category,
      question: body.question !== undefined ? body.question : currentFaq.question,
      answer: body.answer !== undefined ? body.answer : currentFaq.answer,
      displayOrder: isNaN(displayOrder) ? currentFaq.displayOrder : displayOrder,
      status: body.status !== undefined ? body.status : currentFaq.status,
      updatedAt: new Date().toISOString(),
    };

    faqs[idx] = updatedFaq;
    // Auto sort by display order before saving
    faqs.sort((a, b) => a.displayOrder - b.displayOrder);
    await writeFaqs(faqs);

    return NextResponse.json(updatedFaq, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("PUT FAQ error:", err);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const faqs = await readFaqs();
    const filtered = faqs.filter((f) => f.id !== id);

    if (faqs.length === filtered.length) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    await writeFaqs(filtered);
    return NextResponse.json(
      { success: true, message: "FAQ deleted successfully" },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("DELETE FAQ error:", err);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
