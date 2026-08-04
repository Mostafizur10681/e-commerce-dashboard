import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/about`, {
      headers: {
        "Accept": "application/json"
      },
      next: { revalidate: 0 } // Disable fetch cache to ensure dynamic updates are retrieved
    });
    
    const data = await res.json();
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET about error:", err);
    return NextResponse.json({ error: "Failed to fetch about page content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const body = await request.json();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/about`, {
      method: "PUT",
      headers: {
        "Authorization": token,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PUT about error:", err);
    return NextResponse.json({ error: "Failed to update about page content" }, { status: 500 });
  }
}
