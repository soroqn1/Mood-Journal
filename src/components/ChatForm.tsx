"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface Message {
    role: "user" | "ai";
    content: string;
}

interface ChatFormProps {
    chatId: string;
}

export default function ChatForm({ chatId }: ChatFormProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch messages from Supabase when chatId changes
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("role, content")
                .eq("chat_id", chatId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching messages:", error);
            } else {
                setMessages(data as Message[]);
            }
        };

        if (chatId) {
            fetchMessages();
        }
    }, [chatId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    history: messages,
                    chatId: chatId // Send the current chatId to the API
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed");

            setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
        } catch (err: any) {
            setMessages((prev) => [...prev, { role: "ai", content: `Error: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-4 w-full max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">AI Mood Navigator</span>
                <span className="text-xs text-muted-foreground">ID: {chatId.slice(0, 8)}...</span>
            </div>

            <div className="h-[400px] overflow-y-auto mb-4 space-y-4 p-2">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-muted-foreground mt-20 italic">
                        Start your reflection for this session...
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted text-secondary-foreground rounded-tl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-xs text-muted-foreground animate-pulse">AI is reflecting...</div>}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your mood..."
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>Send</Button>
            </form>
        </Card>
    );
}