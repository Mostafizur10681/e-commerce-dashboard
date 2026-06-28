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
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || searchParams.get("per_page") || "10";
    const sort_by = searchParams.get("sort_by") || "";
    const sort_order = searchParams.get("sort_order") || "";

    const backendUrl = new URL("http://127.0.0.1:8000/api/v1/divisions");
    if (search) backendUrl.searchParams.set("search", search);
    if (status && status !== "All") {
      const statusValue = (status === "Active" || status === "active" || status === "1") ? "1" : "0";
      backendUrl.searchParams.set("status", statusValue);
    }
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
      console.error("GET Divisions Backend Error:", errText);
      return NextResponse.json({ error: "Failed to fetch divisions from backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("GET Divisions Error:", error);
    return NextResponse.json({ error: "Failed to fetch divisions" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();

    // Map frontend fields to backend rules
    const payload = {
      division_name: body.division_name,
      division_name_bn: body.division_name_bn || "",
      division_code: body.division_code,
      status: (body.status === "Active" || body.status === "active" || body.status === 1 || body.status === true) ? 1 : 0,
    };

    const res = await fetch("http://127.0.0.1:8000/api/admin/divisions", {
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
      console.error("POST Division Backend Error:", errText);
      try {
        const errJson = JSON.parse(errText);
        return NextResponse.json(errJson, { status: res.status, headers: CORS_HEADERS });
      } catch {
        return NextResponse.json({ error: "Failed to create division on backend" }, { status: res.status, headers: CORS_HEADERS });
      }
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("POST Division Error:", error);
    return NextResponse.json({ error: "Failed to create division" }, { status: 500, headers: CORS_HEADERS });
  }
}
