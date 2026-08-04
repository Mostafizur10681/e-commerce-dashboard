import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { initialUsers } from "@/data/mockData";
import { User } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/users.json");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function readUsers(): Promise<User[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    // If file doesn't exist, initialize with mock users
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(initialUsers, null, 2), "utf-8");
    return initialUsers;
  }
}

export async function writeUsers(users: User[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "All";

    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000") + "/api/admin/users?per_page=100", {
      headers: authHeader ? { "Authorization": authHeader, "Accept": "application/json" } : { "Accept": "application/json" },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("GET Users Backend Error:", errText);
      return NextResponse.json({ error: "Failed to fetch users from backend" }, { status: res.status, headers: CORS_HEADERS });
    }

    const json = await res.json();
    let all: User[] = [];

    if (json.success && json.data && json.data.data) {
      all = json.data.data.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role === "admin" ? "Admin" : "Customer",
        status: u.status,
        created_at: u.created_at || "",
      }));
    }

    // Filter by query (name, email)
    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );
    }

    // Filter by role
    if (role !== "All") {
      all = all.filter((u) => u.role.toLowerCase() === role.toLowerCase());
    }

    // Sort by registration date (created_at) descending
    all.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      // Fallback to id descending
      return Number(b.id) - Number(a.id);
    });

    return NextResponse.json(all, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400, headers: CORS_HEADERS });
    }

    const users = await readUsers();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || "Customer",
    };

    users.push(newUser);
    await writeUsers(users);

    return NextResponse.json(newUser, { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error("POST User Error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500, headers: CORS_HEADERS });
  }
}
