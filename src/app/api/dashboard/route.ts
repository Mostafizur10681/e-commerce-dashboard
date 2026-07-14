import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch("http://127.0.0.1:8000/api/admin/dashboard", {
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch dashboard metrics");
    }

    const json = await res.json();
    return NextResponse.json(json.data || json);
  } catch (error: any) {
    console.error("GET Dashboard stats error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
