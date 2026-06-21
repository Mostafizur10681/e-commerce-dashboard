import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { initialReviews } from "@/data/mockData";
import { Review } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/reviews.json");

// Normalise helper to add status to initial reviews if missing
const normalizeReviews = (list: Review[]): Review[] => {
  return list.map((r) => ({
    ...r,
    status: r.status || (r.approved ? "Approved" : "Pending")
  }));
};

export async function readReviews(): Promise<Review[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    return normalizeReviews(JSON.parse(fileContent));
  } catch (error) {
    // If file doesn't exist, initialize with mock reviews
    const normalizedList = normalizeReviews(initialReviews);
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(normalizedList, null, 2), "utf-8");
    return normalizedList;
  }
}

export async function writeReviews(reviews: Review[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(reviews, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const rating = searchParams.get("rating") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let all = await readReviews();

    // Filter by query (reviewer, product, comment)
    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (r) =>
          r.customerName.toLowerCase().includes(lower) ||
          r.productName.toLowerCase().includes(lower) ||
          r.comment.toLowerCase().includes(lower)
      );
    }

    // Filter by status
    if (status !== "All") {
      all = all.filter((r) => r.status === status);
    }

    // Filter by rating
    if (rating !== "All") {
      const ratingNum = parseInt(rating, 10);
      all = all.filter((r) => r.rating === ratingNum);
    }

    // Sort by date desc
    all = [...all].sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      return dateB.localeCompare(dateA);
    });

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return NextResponse.json({
      reviews: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("GET Reviews Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, productName, rating, comment, status, imageUrl } = body;

    if (!customerName || !rating || !comment) {
      return NextResponse.json({ error: "Customer name, rating and comment are required" }, { status: 400 });
    }

    const reviews = await readReviews();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productName: productName || "General Store Service",
      customerName,
      rating: Number(rating),
      comment,
      approved: status === "Approved",
      status: status || "Pending",
      imageUrl: imageUrl || "",
      date: new Date().toISOString().split("T")[0],
    };

    reviews.push(newReview);
    await writeReviews(reviews);

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("POST Review Error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
