import { NextResponse } from "next/server";
import { readMessages, writeMessages } from "../route";
import { ContactMessage } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const messages = await readMessages();
    const message = messages.find((m) => m.id === id);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (err) {
    console.error("GET message error:", err);
    return NextResponse.json({ error: "Failed to get message" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const body = await request.json();
    const messages = await readMessages();
    const idx = messages.findIndex((m) => m.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const currentMsg = messages[idx];

    // Support both adminNote and adminNotes from request
    const adminNoteVal = body.adminNote !== undefined ? body.adminNote : body.adminNotes;

    const updatedMsg: ContactMessage = {
      ...currentMsg,
      status: body.status !== undefined ? body.status : currentMsg.status,
      adminNote: adminNoteVal !== undefined ? adminNoteVal : currentMsg.adminNote,
      // If replyStatus or specific replies are handled, we can map them, or just merge other fields
      name: body.name !== undefined ? body.name : currentMsg.name,
      email: body.email !== undefined ? body.email : currentMsg.email,
      phone: body.phone !== undefined ? body.phone : currentMsg.phone,
      subject: body.subject !== undefined ? body.subject : currentMsg.subject,
      message: body.message !== undefined ? body.message : currentMsg.message,
    };

    messages[idx] = updatedMsg;
    await writeMessages(messages);

    return NextResponse.json(updatedMsg);
  } catch (err) {
    console.error("PUT message error:", err);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await (params as any);
    const messages = await readMessages();
    const filtered = messages.filter((m) => m.id !== id);

    if (messages.length === filtered.length) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await writeMessages(filtered);
    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("DELETE message error:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
