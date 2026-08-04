import { NextResponse } from "next/server";
import { Attribute } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const token = request.headers.get("Authorization");

    // Fetch all attributes from Laravel backend admin group
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/attributes?all=1", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      throw new Error("Failed to fetch attributes from backend");
    }

    const json = await res.json();
    let all: Attribute[] = [];

    if (json.success && json.data) {
      all = (json.data || []).map((item: any) => ({
        id: String(item.id),
        name: item.name,
        values: item.values || [],
        status: "Active", // Laravel backend does not support status on attributes
        createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
      }));
    }

    // Filter by query search term
    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (a) =>
          a.name.toLowerCase().includes(lower) ||
          a.id.toLowerCase().includes(lower) ||
          a.values.some((v) => v.toLowerCase().includes(lower))
      );
    }

    // Filter by status (mocked to Active, if filter is Inactive we get empty list)
    if (status !== "All") {
      all = all.filter((a) => a.status === status);
    }

    // Sort attributes by createdDate descending (newest first)
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
      attributes: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("GET Attributes Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    const body = await request.json();
    const { name, values } = body;

    if (!name) {
      return NextResponse.json({ error: "Attribute name is required" }, { status: 400 });
    }

    if (!values || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json({ error: "At least one attribute value is required" }, { status: 400 });
    }

    // Generate unique code slug
    const code = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const payload = {
      name,
      code,
      type: "select", // default type for admin dashboard attributes
      values: values.map((v: string) => v.trim()).filter(Boolean),
    };

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/attributes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create attribute on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData: Attribute = {
      id: String(created.id),
      name: created.name,
      values: created.values || [],
      status: "Active",
      createdDate: created.created_at ? new Date(created.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST Attribute Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create attribute" }, { status: 500 });
  }
}
