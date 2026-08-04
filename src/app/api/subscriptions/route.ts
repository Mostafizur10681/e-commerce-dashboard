import { NextResponse } from "next/server";
import { Subscription } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const status = searchParams.get("status") || "All";
    const dateFilter = searchParams.get("date") || "All Time";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const token = request.headers.get("Authorization") || "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/subscriptions?all=1`, {
      headers: {
        "Authorization": token,
        "Accept": "application/json"
      },
    });
    
    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch from backend" }, { status: res.status });
    }

    const backendData = await res.json();
    
    let originalData: Subscription[] = [];
    if (backendData && backendData.data) {
      if (Array.isArray(backendData.data)) {
        originalData = backendData.data;
      } else if (Array.isArray(backendData.data.data)) {
        originalData = backendData.data.data;
      }
    }

    let list = [...originalData];

    // 1. Search Query filter (Name, Email, ID)
    if (q) {
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          String(s.id).toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (status !== "All") {
      list = list.filter(
        (s) => s.status?.toLowerCase() === status.toLowerCase()
      );
    }

    // 3. Date filter
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    if (dateFilter !== "All Time") {
      list = list.filter((s) => {
        if (!s.subscriptionDate) return false;
        const subDate = new Date(s.subscriptionDate);
        const diffTime = Math.abs(now.getTime() - subDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "Today":
            return s.subscriptionDate === todayStr;
          case "This Week":
            return diffDays <= 7;
          case "This Month":
            return (
              subDate.getMonth() === now.getMonth() &&
              subDate.getFullYear() === now.getFullYear()
            );
          case "This Year":
            return subDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // 4. Sorting
    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.subscriptionDate).getTime() - new Date(b.subscriptionDate).getTime();
        case "name_asc":
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "last_activity":
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case "newest":
        default:
          return new Date(b.subscriptionDate).getTime() - new Date(a.subscriptionDate).getTime();
      }
    });

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginatedData = list.slice(start, start + limit);

    // Calculate database-wide stats for summary cards using the original unfiltered data
    const allSubs = originalData;
    const totalCount = allSubs.length;
    const activeCount = allSubs.filter(
      (s) => s.status === "Active" || s.status === "Subscribed"
    ).length;
    const unsubscribedCount = allSubs.filter(
      (s) => s.status === "Unsubscribed"
    ).length;
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newThisMonthCount = allSubs.filter((s) => {
      if (!s.subscriptionDate) return false;
      const d = new Date(s.subscriptionDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return NextResponse.json({
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
      stats: {
        total: totalCount,
        active: activeCount,
        unsubscribed: unsubscribedCount,
        newThisMonth: newThisMonthCount,
      },
    });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Forward the POST request to Laravel
    const token = request.headers.get("Authorization") || "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": token
      },
      body: JSON.stringify(body)
    });
    
    const backendData = await res.json();
    return NextResponse.json(backendData, { status: res.status });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Failed to create subscriber" }, { status: 500 });
  }
}
