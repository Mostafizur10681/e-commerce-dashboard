import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Mock data for subscriptions
const mockSubscriptions = [
  {
    id: "sub-1001",
    userId: "u-001",
    name: "John Doe",
    email: "john@example.com",
    plan: "Basic",
    status: "Active",
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    paymentStatus: "Paid",
    autoRenew: true,
  },
  {
    id: "sub-1002",
    userId: "u-002",
    name: "Jane Smith",
    email: "jane@example.com",
    plan: "Pro",
    status: "Expired",
    startDate: "2022-05-15",
    endDate: "2023-05-15",
    paymentStatus: "Failed",
    autoRenew: false,
  },
  // Add more mock items as needed
];

const dataFilePath = path.join(process.cwd(), "src/data/subscriptions.json");

async function loadSubscriptions() {
  try {
    const content = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    // If file missing, write mock data
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(mockSubscriptions, null, 2), "utf-8");
    return mockSubscriptions;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const status = searchParams.get("status") || "All";
  const plan = searchParams.get("plan") || "All";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  let list = await loadSubscriptions();

  if (q) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }

  if (status !== "All") {
    list = list.filter((s) => s.status === status);
  }
  if (plan !== "All") {
    list = list.filter((s) => s.plan === plan);
  }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = list.slice(start, start + limit);

  return NextResponse.json({ data, total, page, limit, totalPages });
}

export async function POST(request: Request) {
  const body = await request.json();
  const subs = await loadSubscriptions();
  const newSub = {
    ...body,
    id: `sub-${Date.now()}`,
  };
  subs.push(newSub);
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(subs, null, 2), "utf-8");
  return NextResponse.json(newSub, { status: 201 });
}
