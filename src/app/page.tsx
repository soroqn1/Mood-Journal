import ChatForm from "@/components/ChatForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <h1 className="text-3xl font-bold mb-8">Mood Journal AI</h1>
      <ChatForm />
    </main>
  );
}