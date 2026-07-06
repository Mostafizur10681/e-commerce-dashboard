import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/banners/${id}`, {
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET banner error:", err);
    return NextResponse.json({ error: "Failed to get banner" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";
    
    // In order to send multipart/form-data file uploads to Laravel for a PUT endpoint,
    // we must send a POST request with _method = PUT in the form data.
    const formData = await request.formData();
    formData.append("_method", "PUT");

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/banners/${id}`, {
      method: "POST", // Send as POST for multipart/form-data support in PHP
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT banner error:", err);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/banners/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("DELETE banner error:", err);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
