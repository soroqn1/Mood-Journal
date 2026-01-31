"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatForm from "@/components/ChatForm";

export default function Home() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeChatId={activeChatId} onSelectChat={setActiveChatId} />
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
        {activeChatId ? (
          <ChatForm chatId={activeChatId} />
        ) : (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Mood Journal AI</h1>
            <p className="text-slate-500">Pick a chat or start a new one to begin your reflection.</p>
          </div>
        )}
      </main>
    </div>
  );
}