"use client"

import React, { useState, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import { MessageSquare, Send, User, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("df_access_token") : null;
  const headers: any = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { headers }).then((res) => res.json());
};

const EMPTY_ARRAY: any[] = [];

interface ChatMessage {
  id: number;
  session_id: string | null;
  user_id: number | null;
  admin_id: number | null;
  sender: "user" | "admin";
  message: string;
  is_read: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch active chats list
  const { data: chatsData, error: chatsError, isLoading: chatsLoading } = useSWR(
    "/api/chats",
    fetcher,
    { refreshInterval: 1000 }
  );

  const activeChats: ChatMessage[] = chatsData?.data || [];

  // Determine current conversation identifier (user_id or session_id)
  const currentChat = activeChats.find(chat => {
    const ident = chat.user_id || chat.session_id;
    return ident === selectedChatId;
  });

  // 2. Fetch messages for the selected chat
  const { data: messagesData, error: messagesError } = useSWR(
    selectedChatId ? `/api/chats/${selectedChatId}` : null,
    fetcher,
    { refreshInterval: sending ? 0 : 1000 }
  );

  const messages: ChatMessage[] = messagesData?.data || EMPTY_ARRAY;

  // Scroll to bottom of message thread
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Handle Send Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const sentText = replyText.trim();
    if (!sentText || !selectedChatId) return;

    setReplyText("");
    
    // Check if the identifier is user_id or session_id
    const payload: any = {
      message: sentText
    };
    if (typeof selectedChatId === "number") {
      payload.user_id = selectedChatId;
    } else {
      payload.session_id = selectedChatId;
    }

    const optimisticMessage: ChatMessage = {
      id: Date.now(),
      session_id: typeof selectedChatId === "string" ? selectedChatId : null,
      user_id: typeof selectedChatId === "number" ? selectedChatId : null,
      admin_id: 1,
      sender: "admin",
      message: sentText,
      is_read: true,
      created_at: new Date().toISOString()
    };

    // Optimistically update local message cache immediately
    mutate(
      `/api/chats/${selectedChatId}`,
      (current: any) => ({
        ...current,
        data: [...(current?.data || []), optimisticMessage]
      }),
      false
    );

    setSending(true);
    const token = localStorage.getItem("df_access_token");

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Trigger silent sync in background
        mutate(`/api/chats/${selectedChatId}`);
        mutate("/api/chats");
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setSending(false);
    }
  };

  const getChatLabel = (chat: ChatMessage) => {
    if (chat.user) {
      return chat.user.name;
    }
    return `Guest (${chat.session_id?.substring(5, 12) || "Unknown"})`;
  };

  const getChatSublabel = (chat: ChatMessage) => {
    if (chat.user) {
      return chat.user.email;
    }
    return `Session: ${chat.session_id || "N/A"}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 p-2 sm:p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Live Chat</h1>
        <p className="text-muted-foreground text-sm">Respond to active client connections and guests in real-time.</p>
      </div>

      <div className="flex-1 flex overflow-hidden border rounded-xl bg-card text-card-foreground shadow-sm">
        {/* Left Side Pane: Conversations List */}
        <div className="w-80 border-r flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-semibold text-sm">Conversations</span>
            <Badge variant="secondary">{activeChats.length} active</Badge>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {chatsLoading && (
              <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Loading conversations...
              </div>
            )}
            
            {!chatsLoading && activeChats.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <MessageSquare className="h-8 w-8 text-slate-300" />
                No active support sessions.
              </div>
            )}

            {activeChats.map((chat) => {
              const ident = chat.user_id || chat.session_id;
              const isSelected = ident === selectedChatId;
              const hasUnread = chat.sender === 'user' && !chat.is_read;

              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(ident)}
                  className={`w-full p-4 text-left transition flex flex-col gap-1 border-l-4 ${
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800 border-primary"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{getChatLabel(chat)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {chat.message}
                    </span>
                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Pane: Chat Message Thread */}
        <div className="flex-1 flex flex-col h-full bg-background">
          {selectedChatId ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">
                      {currentChat ? getChatLabel(currentChat) : "Support Session"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate max-w-md">
                      {currentChat ? getChatSublabel(currentChat) : ""}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedChatId(null)} title="Close Thread">
                  <XCircle className="w-5 h-5 text-muted-foreground hover:text-rose-500 transition" />
                </Button>
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/20 dark:bg-slate-950/5">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                          isUser
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700/50"
                            : "bg-emerald-600 text-white rounded-tr-none"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {isUser ? "Client" : "You"} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Input */}
              <form onSubmit={handleSendReply} className="p-4 border-t flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                  className="flex-1 bg-slate-50 dark:bg-slate-950"
                />
                <Button type="submit" disabled={sending || !replyText.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 p-8">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">No Conversation Selected</h3>
              <p className="text-xs text-center max-w-xs">Select a conversation from the left side panel to start replying to customers in real-time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
