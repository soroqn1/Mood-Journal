"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
    Plus,
    LogOut,
    ChevronDown,
    FileText,
    Trash2,
    User as UserIcon
} from "lucide-react";

interface SidebarProps {
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
}

export default function Sidebar({ activeChatId, onSelectChat }: SidebarProps) {
    const [chats, setChats] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        getUser();
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
        const { data } = await supabase
            .from('chats')
            .insert([{ title: `New Journal`, user_id: userData.user?.id }])
            .select()
            .single();

        if (data) {
            setChats([data, ...chats]);
            onSelectChat(data.id);
        }
    };

    const deleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        try {
            // 1. Delete messages first (to satisfy FK constraints if CASCADE is not set)
            const { error: msgError } = await supabase
                .from('messages')
                .delete()
                .eq('chat_id', id);

            if (msgError) console.warn("Note: Error deleting messages:", msgError.message);

            // 2. Delete the chat itself
            // We use .select() to verify if a row was actually removed
            const { data, error } = await supabase
                .from('chats')
                .delete()
                .eq('id', id)
                .eq('user_id', user?.id)
                .select();

            if (error) {
                console.error("Supabase error:", error);
                alert(`Error: ${error.message}`);
                return;
            }

            // If no data was returned, it means RLS blocked it or the row didn't exist
            if (!data || data.length === 0) {
                alert("Could not delete. You might not have permission to delete this journal (check Supabase RLS policies).");
                return;
            }

            // 3. Update local state only after confirmation from DB
            setChats(prev => prev.filter(chat => chat.id !== id));
            if (activeChatId === id) onSelectChat("");

        } catch (err: any) {
            console.error("Critical error during deletion:", err);
            alert("An unexpected error occurred.");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const isAnonymous = user?.is_anonymous || !user?.email;
    const userDisplayName = isAnonymous ? 'Guest' : user?.email?.split('@')[0];

    return (
        <div className="w-60 bg-sidebar text-sidebar-foreground h-screen flex flex-col border-r border-sidebar-border select-none relative">
            <div className="p-3 mb-2 relative">
                <div
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 px-2 hover:bg-sidebar-accent rounded-md cursor-pointer transition-colors group"
                >
                    <div className="w-5 h-5 bg-sidebar-primary text-sidebar-primary-foreground rounded flex items-center justify-center text-[10px] font-bold">
                        {isAnonymous ? <UserIcon size={12} /> : (user?.email?.[0]?.toUpperCase() || 'U')}
                    </div>
                    <span className="text-sm font-medium truncate flex-1">
                        {userDisplayName}'s Journal
                    </span>
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </div>

                {showProfileMenu && (
                    <div className="absolute top-12 left-3 right-3 bg-card border border-border rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3 py-2 border-b border-border">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isAnonymous ? 'Guest Account' : user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut size={14} />
                            Sign out
                        </button>
                    </div>
                )}
            </div>

            <div className="px-3 mb-4">
                <Button
                    id="new-journal-btn"
                    onClick={createNewChat}
                    variant="outline"
                    className="w-full h-9 flex items-center justify-start gap-2 border-border/50 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground text-sm font-medium transition-all"
                >
                    <Plus size={16} />
                    New Journal
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-4 no-scrollbar">
                <div>
                    <div className="px-3 mb-1 flex items-center justify-between group">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Private</span>
                    </div>
                    <div className="space-y-0.5">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={`flex items-center gap-2 p-1.5 px-3 rounded-md cursor-pointer text-sm transition-colors group relative ${activeChatId === chat.id
                                    ? 'bg-sidebar-accent text-foreground'
                                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                                    }`}
                            >
                                <FileText size={16} className={activeChatId === chat.id ? 'text-foreground' : 'text-muted-foreground'} />
                                <span className="truncate flex-1 pr-6">{chat.title}</span>
                                <Trash2
                                    size={14}
                                    onClick={(e) => deleteChat(e, chat.id)}
                                    className="absolute right-2 text-muted-foreground/0 group-hover:text-muted-foreground hover:text-destructive transition-all"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 mt-auto">
                {/* Empty footer for now, buttons moved to top */}
            </div>
        </div>
    );
}