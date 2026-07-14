import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/v1/footer-settings`, {
      next: { revalidate: 0 }
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET footer-settings proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch footer settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const body = await request.json();

    const res = await fetch(`http://127.0.0.1:8000/api/v1/auth/footer-settings`, {
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
    console.error("PUT footer-settings proxy error:", err);
    return NextResponse.json({ error: "Failed to update footer settings" }, { status: 500 });
  }
}
