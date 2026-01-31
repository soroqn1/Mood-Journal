"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
    role: "user" | "ai";
    content: string;
}

export default function ChatForm() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get response");
            }

            setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
        } catch (err: any) {
            console.error("Chat Error:", err);
            setMessages((prev) => [...prev, { role: "ai", content: `Error: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-4 w-full max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary">
            <div className="h-[450px] overflow-y-auto mb-4 space-y-4 p-2 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground mt-20">
                        How are you feeling today? / Як ти почуваєшся сьогодні?
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
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-2xl animate-pulse">AI is typing...</div>
                    </div>
                )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t pt-4">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your mood..."
                    disabled={isLoading}
                    className="focus-visible:ring-primary"
                />
                <Button type="submit" disabled={isLoading} className="px-6">
                    {isLoading ? "..." : "Send"}
                </Button>
            </form>
        </Card>
    );
}