import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/messages?${qs}`, {
      headers: {
        "Authorization": token,
        "Accept": "application/json"
      },
      next: { revalidate: 0 }
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET messages proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data.data, { status: 201 });
  } catch (err) {
    console.error("POST message proxy error:", err);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/messages/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
        "Accept": "application/json"
      }
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

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const body = await request.json();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/messages/bulk`, {
      method: "PUT",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT bulk messages proxy error:", err);
    return NextResponse.json({ error: "Failed to update messages" }, { status: 500 });
  }
}
