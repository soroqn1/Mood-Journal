import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: "You are an empathetic mood journal assistant..."
});

export async function POST(req: Request) {
    try {
        const { message, history, chatId } = await req.json();

        const chat = model.startChat({
            history: history.map((m: any) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        const aiResponse = result.response.text();

        if (chatId) {
            await supabase.from('messages').insert([
                { chat_id: chatId, role: 'user', content: message },
                { chat_id: chatId, role: 'ai', content: aiResponse }
            ]);

            if (history.length === 0) {
                const newTitle = message.length > 30 ? message.substring(0, 30) + "..." : message;
                await supabase
                    .from('chats')
                    .update({ title: newTitle })
                    .eq('id', chatId);
            }
        }

        return NextResponse.json({ reply: aiResponse });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}