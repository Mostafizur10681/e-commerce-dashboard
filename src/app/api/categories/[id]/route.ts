import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readCategories, writeCategories } from "../route";
import { Category } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const categories = await readCategories();
    const category = categories.find((c) => c.id === id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET Category by ID Error:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const categories = await readCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "Active" | "Inactive";
    const seoTitle = (formData.get("seoTitle") as string) || "";
    const seoDescription = (formData.get("seoDescription") as string) || "";
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const currentCategory = categories[index];
    let imageUrl = currentCategory.imageUrl;

    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/categories/${filename}`;
    }

    const updatedCategory: Category = {
      ...currentCategory,
      name,
      description: description || "",
      imageUrl,
      status: status || currentCategory.status || "Active",
      seoTitle,
      seoDescription,
    };

    categories[index] = updatedCategory;
    await writeCategories(categories);

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const categories = await readCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const filtered = categories.filter((c) => c.id !== id);
    await writeCategories(filtered);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
