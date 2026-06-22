import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Subscription } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/subscriptions.json");

// Helper function to load subscriptions from JSON
async function loadSubscriptions(): Promise<Subscription[]> {
  try {
    const content = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    // Return empty list if file not found (will be initialized on save)
    return [];
  }
}

// Helper function to save subscriptions to JSON
async function saveSubscriptions(data: Subscription[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const status = searchParams.get("status") || "All";
    const dateFilter = searchParams.get("date") || "All Time";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let list = await loadSubscriptions();

    // 1. Search Query filter (Name, Email, ID)
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (status !== "All") {
      list = list.filter(
        (s) => s.status.toLowerCase() === status.toLowerCase()
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
            // Either in the same month or within 30 days
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
          return a.name.localeCompare(b.name);
        case "name_desc":
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

    // Calculate database-wide stats for summary cards
    const allSubs = await loadSubscriptions();
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
    const subs = await loadSubscriptions();

    const todayStr = new Date().toISOString().split("T")[0];
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      name: body.name || "",
      email: body.email || "",
      status: body.status || "Subscribed",
      source: body.source || "Manual",
      subscriptionDate: body.subscriptionDate || todayStr,
      lastActivity: body.lastActivity || todayStr,
      notes: body.notes || "",
      activityHistory: body.activityHistory || [
        { date: todayStr, action: `Subscribed via ${body.source || "Manual"}` },
      ],
      // Optional/legacy compatibility
      plan: body.plan || "Basic",
      startDate: body.startDate || todayStr,
      endDate: body.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      autoRenew: body.autoRenew !== undefined ? body.autoRenew : true,
    };

    subs.push(newSub);
    await saveSubscriptions(subs);

    return NextResponse.json(newSub, { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Failed to create subscriber" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let subs = await loadSubscriptions();
    const originalLength = subs.length;
    subs = subs.filter((s) => s.id !== id);

    if (subs.length === originalLength) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    await saveSubscriptions(subs);
    return NextResponse.json({ success: true, message: "Subscriber deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
