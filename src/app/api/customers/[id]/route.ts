import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await (params as any);
    const body = await request.json();

    const payload: any = {
      name: body.name,
      phone: body.phone,
    };

    if (body.profilePic) {
      payload.profile_pic = body.profilePic;
    }
    if (body.password) {
      payload.password = body.password;
    }
    if (body.currentPassword) {
      payload.current_password = body.currentPassword;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PUT Customer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await (params as any);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/customers/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
        "Accept": "application/json"
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to delete customer");
    }

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Customer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete customer" }, { status: 500 });
  }
}
