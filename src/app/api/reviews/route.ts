import { NextResponse } from "next/server";
import { Review } from "@/types";

// Helper to resolve product ID from name
async function resolveProductId(productName: string, token: string | null): Promise<number> {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/products?per_page=1000`, {
      headers: token ? { "Authorization": token } : {},
    });
    if (res.ok) {
      const json = await res.json();
      const list = json.data?.data || json.data || [];
      const match = list.find((p: any) => p.name.toLowerCase() === productName.toLowerCase());
      if (match) return match.id;
    }
  } catch (e) {
    console.error("Resolve product ID failed", e);
  }
  // Fallback to query first available product
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/products?limit=1`, {
      headers: token ? { "Authorization": token } : {},
    });
    if (res.ok) {
      const json = await res.json();
      const list = json.data?.data || json.data || [];
      if (list.length > 0) return list[0].id;
    }
  } catch (e) {}
  return 1;
}

// Helper to resolve user ID from customer name
async function resolveUserId(customerName: string, token: string | null, fallbackId: number): Promise<number> {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/users?q=${encodeURIComponent(customerName)}`, {
      headers: token ? { "Authorization": token } : {},
    });
    if (res.ok) {
      const json = await res.json();
      const list = json.data?.data || json.data || [];
      if (list.length > 0) return list[0].id;
    }
  } catch (e) {
    console.error("Resolve user ID failed", e);
  }
  return fallbackId;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const rating = searchParams.get("rating") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const token = request.headers.get("Authorization");

    let all: Review[] = [];

    if (token) {
      // Admin dashboard moderation - fetch all reviews
      const res = await fetch("http://127.0.0.1:8000/api/admin/reviews?per_page=100", {
        headers: { "Authorization": token },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch reviews from admin backend");
      }
      const json = await res.json();
      const rawList = json.data?.data || json.data || [];
      all = rawList.map((item: any) => ({
        id: String(item.id),
        productName: item.product?.name || "General Product",
        customerName: item.user?.name || "Anonymous",
        rating: Number(item.rating),
        comment: item.comment || "",
        imageUrl: item.image_path || null,
        date: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
        approved: Boolean(item.status),
        status: item.status === true || item.status === 1 || item.status === "Approved" ? "Approved" : "Pending",
      }));
    } else {
      // Public review list for product
      const productId = searchParams.get("product_id") || "1";
      const res = await fetch(`http://127.0.0.1:8000/api/v1/reviews?product_id=${productId}&per_page=100`);
      if (res.ok) {
        const json = await res.json();
        const rawList = json.data?.data || json.data || [];
        all = rawList.map((item: any) => ({
          id: String(item.id),
          productName: item.product?.name || "General Product",
          customerName: item.user?.name || "Anonymous",
          rating: Number(item.rating),
          comment: item.comment || "",
          imageUrl: item.image_path || null,
          date: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
          approved: Boolean(item.status),
          status: item.status === true || item.status === 1 || item.status === "Approved" ? "Approved" : "Pending",
        }));
      }
    }

    // Apply filters
    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (r) =>
          r.customerName.toLowerCase().includes(lower) ||
          r.productName.toLowerCase().includes(lower) ||
          r.comment.toLowerCase().includes(lower)
      );
    }

    if (status !== "All") {
      all = all.filter((r) => r.status === status);
    }

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
  } catch (error: any) {
    console.error("GET Reviews Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerName, productName, rating, comment, status, imageUrl } = body;

    if (!rating || !comment) {
      return NextResponse.json({ error: "Rating and comment are required" }, { status: 400 });
    }

    // Resolve current user profile ID, name, and role from authenticated user
    let authUserId = 1;
    let authUserName = "Anonymous";
    let userRole = "customer";
    try {
      const profileRes = await fetch("http://127.0.0.1:8000/api/user", {
        headers: { "Authorization": token },
      });
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        const profileData = profileJson.data || profileJson;
        authUserId = profileData.id || 1;
        authUserName = profileData.name || "Anonymous";
        userRole = profileData.role || "customer";
      }
    } catch (e) {
      console.error("Failed to fetch user profile fallback", e);
    }

    // Resolve product_id relation
    const resolvedProductId = await resolveProductId(productName || "", token);

    const payload = {
      product_id: resolvedProductId,
      user_id: authUserId,
      rating: Number(rating),
      comment: comment,
      status: status === "Approved" || status === true,
      image_path: imageUrl || null,
    };

    const targetUrl = userRole === "admin"
      ? "http://127.0.0.1:8000/api/admin/reviews"
      : "http://127.0.0.1:8000/api/customer/reviews";

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create review on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData: Review = {
      id: String(created.id),
      productName: productName || created.product?.name || "General Product",
      customerName: authUserName || created.user?.name || "Anonymous",
      rating: Number(created.rating),
      comment: created.comment || "",
      imageUrl: created.image_path || null,
      approved: Boolean(created.status),
      status: created.status === true || created.status === 1 ? "Approved" : "Pending",
      date: created.created_at ? new Date(created.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST Review Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
