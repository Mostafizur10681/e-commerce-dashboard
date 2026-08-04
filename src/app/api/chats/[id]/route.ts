import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization") || "";
    // Wait for params to resolve if it is a promise in Next.js 15
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/admin/chats/${id}`, {
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
    console.error(`GET chat messages error for ${id}:`, err);
    return NextResponse.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}
