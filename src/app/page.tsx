"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import ChatForm from "@/components/ChatForm";
import { Plus, Menu, X } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden">
      <div className={`
        fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity
        ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
      `} onClick={() => setIsSidebarOpen(false)} />

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setIsSidebarOpen(false);
          }}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        <header className="lg:hidden flex items-center h-14 px-4 border-b border-border absolute top-0 left-0 right-0 bg-background z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2">
            <Menu size={20} />
          </button>
          <div className="flex-1 text-center font-semibold text-sm truncate px-4">
            Mood Journal
          </div>
        </header>

        <div className="lg:mt-0 flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto mt-14">
          {activeChatId ? (
            <ChatForm chatId={activeChatId} />
          ) : (
            <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-700">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.email?.split('@')[0]}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Pick a journal entry or start a new one to begin your reflection.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    const btn = document.getElementById('new-journal-btn');
                    btn?.click();
                  }}
                  className="p-4 rounded-xl border border-border hover:bg-accent transition-all cursor-pointer group space-y-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center group-hover:bg-background transition-colors">
                    <Plus size={18} />
                  </div>
                  <div className="font-semibold text-sm">New entry</div>
                  <p className="text-xs text-muted-foreground">Start a fresh reflection on your day.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}