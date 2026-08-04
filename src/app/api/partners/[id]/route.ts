import { NextResponse } from "next/server";
import { Partner } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const token = request.headers.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/partners/${id}`, {
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const data = await res.json();
    const item = data.data;

    if (!item) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const responseData: Partner = {
      id: String(item.id),
      name: item.name,
      website: item.website || "",
      logo: item.logo || "",
      image: item.image || "",
      description: item.description || "",
      status: item.status === true || item.status === 1 ? "Active" : "Inactive",
      createdAt: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
      updatedAt: item.updated_at ? new Date(item.updated_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("GET Partner by ID Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch partner" }, { status: 500 });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/partners/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": token } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update partner on backend" }, { status: res.status });
    }

    const updated = data.data;
    const responseData: Partner = {
      id: String(updated.id),
      name: updated.name,
      website: updated.website || "",
      logo: updated.logo || "",
      image: updated.image || "",
      description: updated.description || "",
      status: updated.status === true || updated.status === 1 ? "Active" : "Inactive",
      createdAt: updated.created_at ? new Date(updated.created_at).toISOString().split("T")[0] : "",
      updatedAt: updated.updated_at ? new Date(updated.updated_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("PUT Partner Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update partner" }, { status: 500 });
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/partners/${id}`, {
      method: "DELETE",
      headers: token ? { "Authorization": token } : {},
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.message || "Failed to delete partner on backend" }, { status: res.status });
    }

    return NextResponse.json({ message: "Partner deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Partner Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete partner" }, { status: 500 });
  }
}
