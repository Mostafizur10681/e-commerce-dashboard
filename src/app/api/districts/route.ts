import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const division_id = searchParams.get("division_id") || "";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || searchParams.get("per_page") || "10";
    const sort_by = searchParams.get("sort_by") || "";
    const sort_order = searchParams.get("sort_order") || "";

    const backendUrl = new URL((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/v1/districts");
    if (search) backendUrl.searchParams.set("search", search);
    if (status && status !== "All") {
      const statusValue = (status === "Active" || status === "active" || status === "1") ? "1" : "0";
      backendUrl.searchParams.set("status", statusValue);
    }
    if (division_id) backendUrl.searchParams.set("division_id", division_id);
    backendUrl.searchParams.set("page", page);
    backendUrl.searchParams.set("per_page", limit);
    if (sort_by) backendUrl.searchParams.set("sort_by", sort_by);
    if (sort_order) backendUrl.searchParams.set("sort_order", sort_order);

    const authHeader = request.headers.get("Authorization");

    const res = await fetch(backendUrl.toString(), {
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("GET Districts Backend Error:", errText);
      return NextResponse.json({ error: "Failed to fetch districts from backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("GET Districts Error:", error);
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();

    const payload = {
      division_id: body.division_id,
      district_name: body.district_name,
      district_name_bn: body.district_name_bn || "",
      district_code: body.district_code,
      status: (body.status === "Active" || body.status === "active" || body.status === 1 || body.status === true) ? 1 : 0,
    };

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/districts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("POST District Backend Error:", errText);
      try {
        const errJson = JSON.parse(errText);
        return NextResponse.json(errJson, { status: res.status, headers: CORS_HEADERS });
      } catch {
        return NextResponse.json({ error: "Failed to create district on backend" }, { status: res.status, headers: CORS_HEADERS });
      }
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("POST District Error:", error);
    return NextResponse.json({ error: "Failed to create district" }, { status: 500, headers: CORS_HEADERS });
  }
}
