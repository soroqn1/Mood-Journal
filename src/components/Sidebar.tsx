"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

interface SidebarProps {
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
}

export default function Sidebar({ activeChatId, onSelectChat }: SidebarProps) {
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        fetchChats();

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chats' },
                () => fetchChats()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchChats = async () => {
        const { data } = await supabase
            .from('chats')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setChats(data);
    };

    const createNewChat = async () => {
        const { data, error } = await supabase
            .from('chats')
            .insert([{ title: `Chat ${chats.length + 1}` }])
            .select()
            .single();

        if (data) {
            setChats([data, ...chats]);
            onSelectChat(data.id);
        }
    };

    return (
        <div className="w-64 bg-slate-900 text-white h-screen flex flex-col p-4 shadow-2xl">
            <Button
                onClick={createNewChat}
                className="w-full mb-6 bg-blue-600 hover:bg-blue-700 flex gap-2"
            >
                <Plus size={18} /> New Chat
            </Button>

            <div className="flex-1 overflow-y-auto space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your History</p>
                {chats.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${activeChatId === chat.id ? 'bg-slate-800 text-blue-400' : 'hover:bg-slate-800 text-slate-300'
                            }`}
                    >
                        <MessageSquare size={16} />
                        <span className="truncate">{chat.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}