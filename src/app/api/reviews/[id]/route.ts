import { NextResponse } from "next/server";
import { Review } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerName, productName, rating, comment, status, approved, imageUrl } = body;

    const payload: any = {};
    if (rating !== undefined) payload.rating = Number(rating);
    if (comment !== undefined) payload.comment = comment;
    if (imageUrl !== undefined) payload.image_path = imageUrl;
    if (status !== undefined) {
      payload.status = status === "Approved" || status === true;
    } else if (approved !== undefined) {
      payload.status = approved === true;
    }

    const res = await fetch(`http://127.0.0.1:8000/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to update review on backend" }, { status: res.status });
    }

    const updated = data.data;
    const responseData: Review = {
      id: String(updated.id),
      productName: productName || updated.product?.name || "General Product",
      customerName: customerName || updated.user?.name || "Anonymous",
      rating: Number(updated.rating),
      comment: updated.comment || "",
      imageUrl: updated.image_path || null,
      approved: Boolean(updated.status),
      status: updated.status === true || updated.status === 1 ? "Approved" : "Pending",
      date: updated.created_at ? new Date(updated.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("PUT Review Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`http://127.0.0.1:8000/api/admin/reviews/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.message || "Failed to delete review on backend" }, { status: res.status });
    }

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Review Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete review" }, { status: 500 });
  }
}
