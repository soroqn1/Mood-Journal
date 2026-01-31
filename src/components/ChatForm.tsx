"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Send, User, Bot, Sparkles } from "lucide-react";

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
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("role, content")
                .eq("chat_id", chatId)
                .order("created_at", { ascending: true });

            if (!error && data) {
                setMessages(data as Message[]);
            }
        };

        if (chatId) {
            fetchMessages();
        }
    }, [chatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

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
                    chatId: chatId
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed");

            setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);

            if (messages.length === 0) {
                const newTitle = input.trim().substring(0, 40) + (input.length > 40 ? "..." : "");
                await supabase
                    .from('chats')
                    .update({ title: newTitle })
                    .eq('id', chatId);
            }
        } catch (err: any) {
            setMessages((prev) => [...prev, { role: "ai", content: `Error: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto px-4">
            <header className="py-8 flex items-center justify-between border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight">Daily Reflection</h2>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mood Assistant • Session {chatId.slice(0, 4)}</p>
                    </div>
                </div>
            </header>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto py-8 space-y-10 scroll-smooth no-scrollbar"
            >
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-1000">
                        <div className="text-4xl mb-4 grayscale opacity-50">✍️</div>
                        <h3 className="text-xl font-semibold">How are you feeling today?</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Take a moment to describe your current state of mind. I'm here to listen and help you navigate your emotions.
                        </p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${m.role === 'user' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground border border-border'
                            }`}>
                            {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`max-w-[80%] space-y-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${m.role === 'user'
                                ? 'bg-foreground text-background rounded-tr-none'
                                : 'bg-muted/50 border border-border/50 text-foreground rounded-tl-none'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                            <Bot size={14} className="text-muted-foreground" />
                        </div>
                        <div className="bg-muted/30 border border-border/30 w-32 h-10 rounded-2xl"></div>
                    </div>
                )}
            </div>

            <footer className="py-8 bg-background sticky bottom-0">
                <form onSubmit={sendMessage} className="relative group">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your reflection..."
                        disabled={isLoading}
                        className="h-14 pl-6 pr-14 bg-background border-2 border-border/50 focus:border-foreground/20 rounded-2xl text-[15px] shadow-sm transition-all outline-none ring-0 focus-visible:ring-0"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 top-2.5 w-9 h-9 flex items-center justify-center rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30 disabled:hover:bg-foreground transition-all"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-center mt-4 text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                    Your journal is private and encrypted
                </p>
            </footer>
        </div>
    );
}