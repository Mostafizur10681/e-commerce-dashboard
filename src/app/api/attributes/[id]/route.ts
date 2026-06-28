import { NextResponse } from "next/server";
import { Attribute } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const token = request.headers.get("Authorization");

    const res = await fetch(`http://127.0.0.1:8000/api/admin/attributes/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    const data = await res.json();
    const item = data.data;

    if (!item) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    const responseData: Attribute = {
      id: String(item.id),
      name: item.name,
      values: item.values || [],
      status: "Active",
      createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("GET Attribute by ID Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch attribute" }, { status: 500 });
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

    const body = await request.json();
    const { name, values } = body;

    if (!name) {
      return NextResponse.json({ error: "Attribute name is required" }, { status: 400 });
    }

    if (!values || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json({ error: "At least one attribute value is required" }, { status: 400 });
    }

    const code = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      name,
      code,
      type: "select",
      values: values.map((v: string) => v.trim()).filter(Boolean),
    };

    const res = await fetch(`http://127.0.0.1:8000/api/admin/attributes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update attribute on backend" }, { status: res.status });
    }

    const item = data.data;
    const responseData: Attribute = {
      id: String(item.id),
      name: item.name,
      values: item.values || [],
      status: "Active",
      createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("PUT Attribute Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update attribute" }, { status: 500 });
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

    const res = await fetch(`http://127.0.0.1:8000/api/admin/attributes/${id}`, {
      method: "DELETE",
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.message || "Failed to delete attribute on backend" }, { status: res.status });
    }

    return NextResponse.json({ message: "Attribute deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Attribute Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete attribute" }, { status: 500 });
  }
}
