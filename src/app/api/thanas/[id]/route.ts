import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const authHeader = request.headers.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/thanas/${id}`, {
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("GET Thana Detail Backend Error:", errText);
      return NextResponse.json({ error: "Thana not found on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("GET Thana Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch thana detail" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const authHeader = request.headers.get("Authorization");
    const body = await request.json();

    const payload = {
      division_id: body.division_id,
      district_id: body.district_id,
      thana_name: body.thana_name,
      thana_name_bn: body.thana_name_bn || "",
      thana_code: body.thana_code,
      postal_code: body.postal_code || "",
      status: (body.status === "Active" || body.status === "active" || body.status === 1 || body.status === true) ? 1 : 0,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/thanas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("PUT Thana Backend Error:", errText);
      try {
        const errJson = JSON.parse(errText);
        return NextResponse.json(errJson, { status: res.status, headers: CORS_HEADERS });
      } catch {
        return NextResponse.json({ error: "Failed to update thana on backend" }, { status: res.status, headers: CORS_HEADERS });
      }
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("PUT Thana Error:", error);
    return NextResponse.json({ error: "Failed to update thana" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const authHeader = request.headers.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/thanas/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DELETE Thana Backend Error:", errText);
      return NextResponse.json({ error: "Failed to delete thana on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("DELETE Thana Error:", error);
    return NextResponse.json({ error: "Failed to delete thana" }, { status: 500, headers: CORS_HEADERS });
  }
}
