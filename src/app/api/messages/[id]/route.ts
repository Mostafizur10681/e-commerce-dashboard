import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/messages/${id}`, {
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
      next: { revalidate: 0 }
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data.data);
  } catch (err) {
    console.error("GET message proxy error:", err);
    return NextResponse.json({ error: "Failed to get message" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";
    const body = await request.json();

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/messages/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data.data);
  } catch (err) {
    console.error("PUT message proxy error:", err);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/messages/${id}`, {
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
    console.error("DELETE message proxy error:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
