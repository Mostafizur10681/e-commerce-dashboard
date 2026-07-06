import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/orders${qs ? `?${qs}` : ''}`, {
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
    console.error("GET orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
