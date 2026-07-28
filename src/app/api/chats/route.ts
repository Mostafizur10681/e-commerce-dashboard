import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const res = await fetch("http://127.0.0.1:8000/api/v1/auth/admin/chats", {
      headers: {
        "Authorization": token,
        "Accept": "application/json"
      },
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET chats error:", err);
    return NextResponse.json({ error: "Failed to fetch active chats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const body = await request.json();
    
    const res = await fetch("http://127.0.0.1:8000/api/v1/auth/admin/chats/reply", {
      method: "POST",
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
    console.error("POST chat reply error:", err);
    return NextResponse.json({ error: "Failed to send chat reply" }, { status: 500 });
  }
}
