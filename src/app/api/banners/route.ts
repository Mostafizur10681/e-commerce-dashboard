import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization") || "";
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/banners${qs ? `?${qs}` : ''}`, {
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
    console.error("GET error:", err);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = request.headers.get("Authorization") || "";
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/banners`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": token
      },
      body: formData // Let fetch set the correct multipart/form-data headers with boundary
    });
    
    const backendData = await res.json();
    return NextResponse.json(backendData, { status: res.status });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
