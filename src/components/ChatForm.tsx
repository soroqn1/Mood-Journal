"use client";

import { useState, useEffect } from "react";
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

    useEffect(() => {
        const saved = localStorage.getItem("chat_history");
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    }, []);
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("chat_history", JSON.stringify(messages));
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    history: messages
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

    const clearChat = () => {
        localStorage.removeItem("chat_history");
        setMessages([]);
    };

    return (
        <Card className="p-4 w-full max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <span className="text-sm font-medium text-muted-foreground">AI Mood Navigator</span>
                <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs h-8">Clear History</Button>
            </div>

            <div className="h-[400px] overflow-y-auto mb-4 space-y-4 p-2">
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
                <Input value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
                <Button type="submit" disabled={isLoading}>Send</Button>
            </form>
        </Card>
    );
}