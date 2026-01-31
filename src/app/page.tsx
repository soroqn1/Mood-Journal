"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import ChatForm from "@/components/ChatForm";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeChatId={activeChatId} onSelectChat={setActiveChatId} />
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
        {activeChatId ? (
          <ChatForm chatId={activeChatId} />
        ) : (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Welcome, {user.email?.split('@')[0]}
            </h1>
            <p className="text-slate-500">Pick a chat or start a new one to begin your reflection.</p>
          </div>
        )}
      </main>
    </div>
  );
}