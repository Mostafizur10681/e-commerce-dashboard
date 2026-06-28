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

    const res = await fetch(`http://127.0.0.1:8000/api/v1/divisions/${id}`, {
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("GET Division Detail Backend Error:", errText);
      return NextResponse.json({ error: "Division not found on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("GET Division Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch division detail" }, { status: 500, headers: CORS_HEADERS });
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
      division_name: body.division_name,
      division_name_bn: body.division_name_bn || "",
      division_code: body.division_code,
      status: (body.status === "Active" || body.status === "active" || body.status === 1 || body.status === true) ? 1 : 0,
    };

    const res = await fetch(`http://127.0.0.1:8000/api/admin/divisions/${id}`, {
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
      console.error("PUT Division Backend Error:", errText);
      try {
        const errJson = JSON.parse(errText);
        return NextResponse.json(errJson, { status: res.status, headers: CORS_HEADERS });
      } catch {
        return NextResponse.json({ error: "Failed to update division on backend" }, { status: res.status, headers: CORS_HEADERS });
      }
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("PUT Division Error:", error);
    return NextResponse.json({ error: "Failed to update division" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const authHeader = request.headers.get("Authorization");

    const res = await fetch(`http://127.0.0.1:8000/api/admin/divisions/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DELETE Division Backend Error:", errText);
      return NextResponse.json({ error: "Failed to delete division on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const data = await res.json();
    return NextResponse.json(data, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("DELETE Division Error:", error);
    return NextResponse.json({ error: "Failed to delete division" }, { status: 500, headers: CORS_HEADERS });
  }
}
