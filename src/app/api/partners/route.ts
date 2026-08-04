import { NextResponse } from "next/server";
import { Partner } from "@/types";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization");

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/partners", {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch partners from backend");
    }

    const json = await res.json();
    let all: Partner[] = [];

    if (json.success && json.data) {
      all = (json.data || []).map((item: any) => ({
        id: String(item.id),
        name: item.name,
        website: item.website || "",
        logo: item.logo || "",
        image: item.image || "",
        description: item.description || "",
        status: item.status === true || item.status === 1 ? "Active" : "Inactive",
        createdAt: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
        updatedAt: item.updated_at ? new Date(item.updated_at).toISOString().split("T")[0] : "",
      }));
    }

    return NextResponse.json({ partners: all });
  } catch (error: any) {
    console.error("GET Partners Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    const body = await request.json();
    const { name, website, logo, image, description, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Partner name is required" }, { status: 400 });
    }

    const payload = {
      name,
      website: website || null,
      logo: logo || null,
      image: image || null,
      description: description || null,
      status: status === "Active" || status === true,
    };

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/partners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create partner on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData: Partner = {
      id: String(created.id),
      name: created.name,
      website: created.website || "",
      logo: created.logo || "",
      image: created.image || "",
      description: created.description || "",
      status: created.status === true || created.status === 1 ? "Active" : "Inactive",
      createdAt: created.created_at ? new Date(created.created_at).toISOString().split("T")[0] : "",
      updatedAt: created.updated_at ? new Date(created.updated_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST Partner Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create partner" }, { status: 500 });
  }
}
