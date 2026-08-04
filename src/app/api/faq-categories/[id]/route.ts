import { NextResponse } from "next/server";
import { FAQCategory } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/faq-categories/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch FAQ category" }, { status: res.status });
    }

    const item = data.data;
    const responseData: FAQCategory = {
      id: String(item.id),
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      status: item.status === true || item.status === 1 ? "Active" : "Inactive",
      createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("GET FAQ Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load FAQ category" }, { status: 500 });
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
    const { name, description, status } = body;

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (status !== undefined) {
      payload.status = status === "Active" || status === true;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/faq-categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update FAQ category" }, { status: res.status });
    }

    const updated = data.data;
    const responseData: FAQCategory = {
      id: String(updated.id),
      name: updated.name,
      slug: updated.slug,
      description: updated.description || "",
      status: updated.status === true || updated.status === 1 ? "Active" : "Inactive",
      createdDate: updated.created_at ? new Date(updated.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("PUT FAQ Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update FAQ category" }, { status: 500 });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/faq-categories/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to delete FAQ category" }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: "FAQ category deleted successfully" });
  } catch (error: any) {
    console.error("DELETE FAQ Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete FAQ category" }, { status: 500 });
  }
}
