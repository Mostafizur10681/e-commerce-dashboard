import { NextResponse } from "next/server";
import { readMessages, writeMessages } from "../messages/route";
import { ContactMessage } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required fields." },
        { status: 400 }
      );
    }

    const messages = await readMessages();
    const todayStr = new Date().toISOString();

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      subject: body.subject,
      message: body.message,
      status: "Unread",
      adminNote: "",
      createdAt: todayStr,
    };

    messages.push(newMsg);
    await writeMessages(messages);

    return NextResponse.json(newMsg, { status: 201 });
  } catch (err) {
    console.error("POST contact form submission error:", err);
    return NextResponse.json(
      { error: "Failed to submit contact form. Please try again." },
      { status: 500 }
    );
  }
}
