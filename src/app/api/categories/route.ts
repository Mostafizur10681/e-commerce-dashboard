import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { initialCategories } from "@/data/mockData";
import { Category } from "@/types";

const dataFilePath = path.join(process.cwd(), "src/data/categories.json");

export async function readCategories(): Promise<Category[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    // If file doesn't exist, initialize with mock categories and custom fields
    const initialWithFields: Category[] = initialCategories.map((cat, idx) => ({
      ...cat,
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
      status: "Active",
      createdDate: new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      seoTitle: cat.name,
      seoDescription: cat.description,
    }));
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(initialWithFields, null, 2), "utf-8");
    return initialWithFields;
  }
}

export async function writeCategories(categories: Category[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(categories, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "All";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let all = await readCategories();

    if (q) {
      const lower = q.toLowerCase();
      all = all.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.id.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    if (status !== "All") {
      all = all.filter((c) => c.status === status);
    }

    // Sort categories with newest first
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
      categories: paginated,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("GET Categories Error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as "Active" | "Inactive") || "Active";
    const seoTitle = (formData.get("seoTitle") as string) || "";
    const seoDescription = (formData.get("seoDescription") as string) || "";
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/categories/${filename}`;
    } else {
      return NextResponse.json({ error: "Category Image is required" }, { status: 400 });
    }

    const categories = await readCategories();
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      description: description || "",
      imageUrl,
      status,
      createdDate: new Date().toISOString().split("T")[0],
      seoTitle,
      seoDescription,
    };

    categories.push(newCategory);
    await writeCategories(categories);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("POST Category Error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
