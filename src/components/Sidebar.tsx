"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Plus, MessageSquare, LogOut } from "lucide-react";

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
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('chats')
            .insert([{ title: `Chat ${chats.length + 1}`, user_id: userData.user?.id }])
            .select()
            .single();

        if (data) {
            setChats([data, ...chats]);
            onSelectChat(data.id);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <div className="w-64 bg-[#0f172a] text-white h-screen flex flex-col p-4 shadow-2xl border-r border-slate-800">
            <Button
                onClick={createNewChat}
                className="w-full mb-6 bg-blue-600 hover:bg-blue-500 flex gap-2 font-semibold shadow-lg shadow-blue-900/20"
            >
                <Plus size={18} /> New Chat
            </Button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Recent Journals</p>
                {chats.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-all group ${activeChatId === chat.id
                                ? 'bg-slate-800 text-blue-400 shadow-inner'
                                : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        <MessageSquare size={16} className={activeChatId === chat.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'} />
                        <span className="truncate font-medium">{chat.title}</span>
                    </button>
                ))}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm font-semibold group"
                >
                    <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}