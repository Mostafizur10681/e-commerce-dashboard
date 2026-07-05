import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/subscriptions/${id}`, {
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data.data || data);
  } catch (err) {
    console.error("GET subscriber error:", err);
    return NextResponse.json({ error: "Failed to get subscriber" }, { status: 500 });
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

    const payload = {
      name: body.name,
      email: body.email,
      status: body.status,
      source: body.source,
      notes: body.notes,
    };

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/subscriptions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data.data || data);
  } catch (err) {
    console.error("PUT subscriber error:", err);
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/subscriptions/${id}`, {
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

    return NextResponse.json({ success: true, message: "Subscriber deleted successfully" });
  } catch (err) {
    console.error("DELETE subscriber error:", err);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
