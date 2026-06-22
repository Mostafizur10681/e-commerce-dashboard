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
    return [];
  }
}

// Helper function to save subscriptions to JSON
async function saveSubscriptions(data: Subscription[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const subs = await loadSubscriptions();
    const sub = subs.find((s) => s.id === id);

    if (!sub) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json(sub);
  } catch (err) {
    console.error("GET subscriber error:", err);
    return NextResponse.json({ error: "Failed to get subscriber" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const body = await request.json();
    const subs = await loadSubscriptions();
    const idx = subs.findIndex((s) => s.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    const currentSub = subs[idx];
    const todayStr = new Date().toISOString().split("T")[0];

    // Detect what changed to build a history entry
    const changes: string[] = [];
    if (body.name !== undefined && body.name !== currentSub.name) changes.push("Name");
    if (body.email !== undefined && body.email !== currentSub.email) changes.push("Email");
    if (body.status !== undefined && body.status !== currentSub.status) changes.push(`Status to ${body.status}`);
    if (body.source !== undefined && body.source !== currentSub.source) changes.push(`Source to ${body.source}`);
    if (body.notes !== undefined && body.notes !== currentSub.notes) changes.push("Notes");

    const history = [...(currentSub.activityHistory || [])];
    if (changes.length > 0) {
      history.push({
        date: todayStr,
        action: `Updated details: ${changes.join(", ")}`,
      });
    }

    const updatedSub: Subscription = {
      ...currentSub,
      name: body.name !== undefined ? body.name : currentSub.name,
      email: body.email !== undefined ? body.email : currentSub.email,
      status: body.status !== undefined ? body.status : currentSub.status,
      source: body.source !== undefined ? body.source : currentSub.source,
      notes: body.notes !== undefined ? body.notes : currentSub.notes,
      lastActivity: todayStr,
      activityHistory: history,
      // Keep legacy properties if provided/existent
      plan: body.plan !== undefined ? body.plan : currentSub.plan,
      startDate: body.startDate !== undefined ? body.startDate : currentSub.startDate,
      endDate: body.endDate !== undefined ? body.endDate : currentSub.endDate,
      autoRenew: body.autoRenew !== undefined ? body.autoRenew : currentSub.autoRenew,
    };

    subs[idx] = updatedSub;
    await saveSubscriptions(subs);

    return NextResponse.json(updatedSub);
  } catch (err) {
    console.error("PUT subscriber error:", err);
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const subs = await loadSubscriptions();
    const filtered = subs.filter((s) => s.id !== id);

    if (subs.length === filtered.length) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    await saveSubscriptions(filtered);
    return NextResponse.json({ success: true, message: "Subscriber deleted successfully" });
  } catch (err) {
    console.error("DELETE subscriber error:", err);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
