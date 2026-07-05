import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    const res = await fetch(`http://127.0.0.1:8000/api/admin/customers?page=${page}&per_page=${limit}`, {
      headers: {
        "Authorization": token,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch customers from backend");
    }

    const json = await res.json();
    const rawList = json.data?.data || json.data || [];
    const total = json.data?.total || rawList.length;
    const totalPages = json.data?.last_page || Math.ceil(total / Number(limit)) || 1;

    let all = rawList.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      email: item.email,
      phone: item.phone || "",
      ordersCount: item.orders_count || 0,
      joinedDate: (item.created_at || "").split("T")[0],
      status: item.status === "active" ? "Active" : "Inactive",
      profilePic: item.profile_pic ? (item.profile_pic.startsWith("http") || item.profile_pic.startsWith("data:image/") ? item.profile_pic : `http://127.0.0.1:8000/storage/${item.profile_pic}`) : null,
    }));

    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (c: any) =>
          c.name.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower) ||
          c.phone.toLowerCase().includes(lower)
      );
    }

    if (status !== "All") {
      all = all.filter((c: any) => c.status === status);
    }

    return NextResponse.json({
      customers: all,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    });
  } catch (error) {
    console.error("GET Customers Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ error: "Creating customer from dashboard is not supported currently. Users register themselves." }, { status: 400 });
}
