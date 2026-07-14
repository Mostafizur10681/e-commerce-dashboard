import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "15", 10);
    const q = searchParams.get("q") || "";

    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy request to Laravel backend
    const backendUrl = `http://127.0.0.1:8000/api/admin/wishlists?page=${page}&per_page=1000`;
    const res = await fetch(backendUrl, {
      headers: {
        "Authorization": token,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch wishlists from backend");
    }

    const json = await res.json();
    // The laravel success method wraps data in 'data'
    const allItems = json.data?.data || json.data || [];

    // Normalize wishlists list
    let wishlists = allItems.map((item: any) => ({
      id: String(item.id),
      userId: item.user_id,
      productId: item.product_id,
      customerName: item.user?.name || "Anonymous",
      customerEmail: item.user?.email || "N/A",
      productName: item.product?.name || "Unknown Product",
      productImage: item.product?.image || (item.product?.images?.[0]?.image_path) || "",
      productPrice: Number(item.product?.sale_price || item.product?.price || 0),
      createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A",
    }));

    // Filter
    if (q) {
      const lower = q.toLowerCase();
      wishlists = wishlists.filter(
        (w: any) =>
          w.customerName.toLowerCase().includes(lower) ||
          w.productName.toLowerCase().includes(lower) ||
          w.customerEmail.toLowerCase().includes(lower)
      );
    }

    // Paginate client side
    const total = wishlists.length;
    const totalPages = Math.ceil(total / perPage) || 1;
    const start = (page - 1) * perPage;
    const paginated = wishlists.slice(start, start + perPage);

    return NextResponse.json({
      data: paginated,
      meta: {
        total,
        current_page: page,
        last_page: totalPages,
        per_page: perPage,
      },
    });
  } catch (error: any) {
    console.error("GET Wishlists error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch wishlists" }, { status: 500 });
  }
}
