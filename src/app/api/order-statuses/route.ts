import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const allQuery = searchParams.get("all") || "false";

    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = `http://127.0.0.1:8000/api/admin/order-statuses?all=${allQuery === "true" ? "true" : "false"}`;

    const res = await fetch(backendUrl, {
      headers: {
        "Authorization": token,
        "Accept": "application/json"
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error("Failed to fetch order statuses from backend");
    }

    const json = await res.json();
    let allItems: any[] = [];

    const backendData = json.data;
    if (backendData) {
      const list = Array.isArray(backendData) ? backendData : (backendData.data || []);
      allItems = list.map((item: any) => ({
        id: String(item.id),
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        status: item.status === true || item.status === 1 ? "Active" : "Inactive",
        createdDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "",
      }));
    }

    if (q) {
      const lower = q.toLowerCase();
      allItems = allItems.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.id.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    if (status !== "All") {
      allItems = allItems.filter((c) => c.status === status);
    }

    if (allQuery === "true") {
      return NextResponse.json({
        orderStatuses: allItems,
        total: allItems.length,
      });
    }

    const total = allItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = allItems.slice(start, start + limit);

    return NextResponse.json({
      orderStatuses: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error("GET Order Statuses Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order statuses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Order Status name is required" }, { status: 400 });
    }

    const payload = {
      name,
      description,
      status: status === "Active" || status === true,
    };

    const res = await fetch("http://127.0.0.1:8000/api/admin/order-statuses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to create order status on backend" }, { status: res.status });
    }

    const created = data.data;
    const responseData = {
      id: String(created.id),
      name: created.name,
      slug: created.slug,
      description: created.description || "",
      status: created.status === true || created.status === 1 ? "Active" : "Inactive",
      createdDate: created.created_at ? new Date(created.created_at).toISOString().split("T")[0] : "",
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST Order Status Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit order status" }, { status: 500 });
  }
}
