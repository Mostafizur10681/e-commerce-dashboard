import { NextResponse } from "next/server";
import { readUsers, writeUsers } from "../route";
import { User } from "@/types";

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
    const users = await readUsers();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(user, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("GET User error:", err);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const body = await request.json();
    const authHeader = request.headers.get("Authorization");

    const backendData: any = {};
    if (body.name !== undefined) backendData.name = body.name;
    if (body.email !== undefined) backendData.email = body.email;
    if (body.phone !== undefined) backendData.phone = body.phone;
    if (body.status !== undefined) backendData.status = body.status;
    if (body.role !== undefined) {
      backendData.role = body.role.toLowerCase();
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
      body: JSON.stringify(backendData),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("PUT User Backend Error:", errText);
      return NextResponse.json({ error: "Failed to update user on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const json = await res.json();
    let updatedUser: User | null = null;
    if (json.success && json.data) {
      const u = json.data;
      updatedUser = {
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role === "admin" ? "Admin" : "Customer",
        status: u.status,
      };
    }

    return NextResponse.json(updatedUser, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("PUT User error:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const authHeader = request.headers.get("Authorization");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        ...(authHeader ? { "Authorization": authHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DELETE User Backend Error:", errText);
      return NextResponse.json({ error: "Failed to delete user on backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("DELETE User error:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
