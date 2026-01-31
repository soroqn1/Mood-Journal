"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ChatForm() {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = useState("");

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // add user message to state
        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // send to backend
        const response = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message: input }),
        });
        const data = await response.json();

        // add ai message to state
        setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    };

    return (
        <Card className="p-4 w-full max-w-md mx-auto">
            <div className="h-64 overflow-y-auto mb-4 space-y-2 border-b pb-2">
                {messages.map((m, i) => (
                    <div key={i} className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                        {m.content}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} />
                <Button type="submit">Send</Button>
            </form>
        </Card>
    );
}