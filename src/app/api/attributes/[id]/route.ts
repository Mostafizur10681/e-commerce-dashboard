import { NextResponse } from "next/server";
import { readAttributes, writeAttributes } from "../route";
import { Attribute } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const attributes = await readAttributes();
    const attribute = attributes.find((a) => a.id === id);

    if (!attribute) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    return NextResponse.json(attribute);
  } catch (error) {
    console.error("GET Attribute by ID Error:", error);
    return NextResponse.json({ error: "Failed to fetch attribute" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const attributes = await readAttributes();
    const index = attributes.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, values, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Attribute name is required" }, { status: 400 });
    }

    if (!values || !Array.isArray(values) || values.length === 0) {
      return NextResponse.json({ error: "At least one attribute value is required" }, { status: 400 });
    }

    const currentAttribute = attributes[index];
    const updatedAttribute: Attribute = {
      ...currentAttribute,
      name,
      values: values.map((v: string) => v.trim()).filter(Boolean),
      status: status || currentAttribute.status || "Active",
    };

    attributes[index] = updatedAttribute;
    await writeAttributes(attributes);

    return NextResponse.json(updatedAttribute);
  } catch (error) {
    console.error("PUT Attribute Error:", error);
    return NextResponse.json({ error: "Failed to update attribute" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const attributes = await readAttributes();
    const index = attributes.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Attribute not found" }, { status: 404 });
    }

    const filtered = attributes.filter((a) => a.id !== id);
    await writeAttributes(filtered);

    return NextResponse.json({ message: "Attribute deleted successfully" });
  } catch (error) {
    console.error("DELETE Attribute Error:", error);
    return NextResponse.json({ error: "Failed to delete attribute" }, { status: 500 });
  }
}
