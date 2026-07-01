import { NextResponse } from "next/server";
import { FAQ } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization");

    const res = await fetch(`http://127.0.0.1:8000/api/v1/faqs/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch FAQ" }, { status: res.status });
    }

    const item = data.data;
    const responseData: FAQ = {
      id: String(item.id),
      category: item.category || "General",
      question: item.question,
      answer: item.answer,
      displayOrder: item.id ? Number(item.id) : 1,
      status: item.status === true || item.status === 1 ? "active" : "inactive",
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("GET FAQ error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to get FAQ" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, category, status } = body;

    const payload: any = {};
    if (question !== undefined) payload.question = question;
    if (answer !== undefined) payload.answer = answer;
    if (category !== undefined) payload.category = category;
    if (status !== undefined) {
      payload.status = status === "active" || status === true;
    }

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/faqs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update FAQ" }, { status: res.status });
    }

    const updated = data.data;
    const responseData: FAQ = {
      id: String(updated.id),
      category: updated.category || "General",
      question: updated.question,
      answer: updated.answer,
      displayOrder: updated.id ? Number(updated.id) : 1,
      status: updated.status === true || updated.status === 1 ? "active" : "inactive",
      createdAt: updated.created_at || new Date().toISOString(),
      updatedAt: updated.updated_at || new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("PUT FAQ error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/faqs/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to delete FAQ" }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: "FAQ deleted successfully" });
  } catch (err: any) {
    console.error("DELETE FAQ error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
