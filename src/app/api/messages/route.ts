import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ContactMessage } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/messages.json");

// Helper to load messages from JSON database
export async function readMessages(): Promise<ContactMessage[]> {
  try {
    const content = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

// Helper to save messages to JSON database
export async function writeMessages(data: ContactMessage[]) {
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

    let list = await readMessages();

    // 1. Filter by search query (Name, Email, Subject)
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q)
      );
    }

    // 2. Filter by status
    if (status !== "All") {
      list = list.filter(
        (m) => m.status.toLowerCase() === status.toLowerCase()
      );
    }

    // 3. Filter by date
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    if (dateFilter !== "All Time") {
      list = list.filter((m) => {
        if (!m.createdAt) return false;
        const msgDate = new Date(m.createdAt);
        const msgDateStr = msgDate.toISOString().split("T")[0];
        const diffTime = Math.abs(now.getTime() - msgDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "Today":
            return msgDateStr === todayStr;
          case "This Week":
            return diffDays <= 7;
          case "This Month":
            return (
              msgDate.getMonth() === now.getMonth() &&
              msgDate.getFullYear() === now.getFullYear()
            );
          case "This Year":
            return msgDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // 4. Sort messages
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      switch (sort) {
        case "oldest":
          return timeA - timeB;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "newest":
        default:
          return timeB - timeA;
      }
    });

    // 5. Pagination
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginatedData = list.slice(start, start + limit);

    // Calculate database-wide stats for summary cards
    const allMessages = await readMessages();
    const totalCount = allMessages.length;
    const unreadCount = allMessages.filter((m) => m.status === "Unread").length;
    const readCount = allMessages.filter((m) => m.status === "Read").length;
    
    const todayCount = allMessages.filter((m) => {
      if (!m.createdAt) return false;
      const dStr = new Date(m.createdAt).toISOString().split("T")[0];
      return dStr === todayStr;
    }).length;

    return NextResponse.json({
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
      stats: {
        total: totalCount,
        unread: unreadCount,
        read: readCount,
        today: todayCount,
      },
    });
  } catch (err) {
    console.error("GET messages error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = await readMessages();

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      subject: body.subject || "",
      message: body.message || "",
      status: body.status || "Unread",
      adminNote: body.adminNote || "",
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    await writeMessages(messages);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (err) {
    console.error("POST message error:", err);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let messages = await readMessages();
    const originalLength = messages.length;
    messages = messages.filter((m) => m.id !== id);

    if (messages.length === originalLength) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await writeMessages(messages);
    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("DELETE message error:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
