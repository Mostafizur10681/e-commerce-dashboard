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

    const res = await fetch(`http://127.0.0.1:8000/api/v1/districts/${id}`, {
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("GET District Detail Backend Error:", errText);
      return NextResponse.json({ error: "District not found on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("GET District Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch district detail" }, { status: 500, headers: CORS_HEADERS });
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
      district_name: body.district_name,
      district_name_bn: body.district_name_bn || "",
      district_code: body.district_code,
      status: (body.status === "Active" || body.status === "active" || body.status === 1 || body.status === true) ? 1 : 0,
    };

    const res = await fetch(`http://127.0.0.1:8000/api/admin/districts/${id}`, {
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
      console.error("PUT District Backend Error:", errText);
      try {
        const errJson = JSON.parse(errText);
        return NextResponse.json(errJson, { status: res.status, headers: CORS_HEADERS });
      } catch {
        return NextResponse.json({ error: "Failed to update district on backend" }, { status: res.status, headers: CORS_HEADERS });
      }
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("PUT District Error:", error);
    return NextResponse.json({ error: "Failed to update district" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const authHeader = request.headers.get("Authorization");

    const res = await fetch(`http://127.0.0.1:8000/api/admin/districts/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DELETE District Backend Error:", errText);
      return NextResponse.json({ error: "Failed to delete district on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("DELETE District Error:", error);
    return NextResponse.json({ error: "Failed to delete district" }, { status: 500, headers: CORS_HEADERS });
  }
}
