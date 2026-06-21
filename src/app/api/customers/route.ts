import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { initialCustomers } from "@/data/mockData";
import { Customer } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/customers.json");

// Helper to add default status if missing
const normalizeCustomers = (list: Customer[]): Customer[] => {
  return list.map((c, idx) => ({
    ...c,
    status: c.status || (idx % 3 === 0 ? "Inactive" : "Active") // default status split for demo realism
  }));
};

export async function readCustomers(): Promise<Customer[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    return normalizeCustomers(JSON.parse(fileContent));
  } catch (error) {
    // If file doesn't exist, initialize with mock customers
    const initialWithStatus = normalizeCustomers(initialCustomers);
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(initialWithStatus, null, 2), "utf-8");
    return initialWithStatus;
  }
}

export async function writeCustomers(customers: Customer[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(customers, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let all = await readCustomers();

    // Filter by query (name, email, phone)
    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower) ||
          c.phone.toLowerCase().includes(lower)
      );
    }

    // Filter by status
    if (status !== "All") {
      all = all.filter((c) => c.status === status);
    }

    // Sort by joinedDate desc
    all = [...all].sort((a, b) => {
      const dateA = a.joinedDate || "";
      const dateB = b.joinedDate || "";
      return dateB.localeCompare(dateA);
    });

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return NextResponse.json({
      customers: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("GET Customers Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, ordersCount, status } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
    }

    const customers = await readCustomers();
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      email,
      phone,
      ordersCount: ordersCount !== undefined ? Number(ordersCount) : 0,
      status: status || "Active",
      joinedDate: new Date().toISOString().split("T")[0],
    };

    customers.push(newCustomer);
    await writeCustomers(customers);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("POST Customer Error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
