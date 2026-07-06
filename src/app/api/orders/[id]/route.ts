import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/orders/${id}`, {
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
    console.error("GET order error:", err);
    return NextResponse.json({ error: "Failed to get order" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";
    
    // We send JSON body for PUT
    const body = await request.json();

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/orders/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": token,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT order error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/orders/${id}`, {
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
    console.error("DELETE order error:", err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
