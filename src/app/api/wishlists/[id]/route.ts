import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization") || "";

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/admin/wishlists/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("DELETE wishlist error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete wishlist item" }, { status: 500 });
  }
}
