import { NextResponse } from "next/server";
import { readReviews, writeReviews } from "../route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const body = await request.json();
    const { customerName, productName, rating, comment, status, approved } = body;

    const reviews = await readReviews();
    const idx = reviews.findIndex((r) => r.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updatedReview = {
      ...reviews[idx],
      customerName: customerName !== undefined ? customerName : reviews[idx].customerName,
      productName: productName !== undefined ? productName : reviews[idx].productName,
      rating: rating !== undefined ? Number(rating) : reviews[idx].rating,
      comment: comment !== undefined ? comment : reviews[idx].comment,
      status: status !== undefined ? status : reviews[idx].status,
      approved: approved !== undefined ? approved : (status !== undefined ? status === "Approved" : reviews[idx].approved)
    };

    reviews[idx] = updatedReview;
    await writeReviews(reviews);

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("PUT Review Error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const reviews = await readReviews();
    const filtered = reviews.filter((r) => r.id !== id);

    if (reviews.length === filtered.length) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await writeReviews(filtered);
    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("DELETE Review Error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
