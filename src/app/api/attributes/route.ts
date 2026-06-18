import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { initialAttributes } from "@/data/mockData";
import { Attribute } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/attributes.json");

export async function readAttributes(): Promise<Attribute[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    // If file doesn't exist, initialize with mock attributes and custom fields
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(initialAttributes, null, 2), "utf-8");
    return initialAttributes;
  }
}

export async function writeAttributes(attributes: Attribute[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(attributes, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let all = await readAttributes();

    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (a) =>
          a.name.toLowerCase().includes(lower) ||
          a.id.toLowerCase().includes(lower) ||
          a.values.some((v) => v.toLowerCase().includes(lower))
      );
    }

    if (status !== "All") {
      all = all.filter((a) => a.status === status);
    }

    // Sort attributes with newest first
    all = [...all].sort((a, b) => {
      const dateA = a.createdDate || "";
      const dateB = b.createdDate || "";
      return dateB.localeCompare(dateA);
    });

    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);

    return NextResponse.json({
      attributes: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("GET Attributes Error:", error);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, values, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Attribute name is required" }, { status: 400 });
    }

    if (!values || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json({ error: "At least one attribute value is required" }, { status: 400 });
    }

    const attributes = await readAttributes();
    const newAttribute: Attribute = {
      id: `attr-${Date.now()}`,
      name,
      values: values.map((v: string) => v.trim()).filter(Boolean),
      status: status || "Active",
      createdDate: new Date().toISOString().split("T")[0],
    };

    attributes.push(newAttribute);
    await writeAttributes(attributes);

    return NextResponse.json(newAttribute, { status: 201 });
  } catch (error) {
    console.error("POST Attribute Error:", error);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}
