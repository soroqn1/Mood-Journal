import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: "You are an empathetic mood journal assistant. Your goal is to listen deeply and support the user without repetitive medical disclaimers or generic safety warnings. Validate feelings naturally (e.g., 'That sounds incredibly exhausting' instead of 'I'm sorry you feel that way'). Offer a calm, objective perspective to help the user reflect, but strictly avoid suggesting impulsive actions or giving direct orders. Focus on being a supportive peer-psychologist within the chat: stay grounded, avoid robotic scripts about hotlines/professionals, and create a space where the user feels truly heard and understood. Keep the tone warm, thoughtful, and human."
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

            if (!history || history.length === 0) {
                const newTitle = message.trim().substring(0, 40) + (message.length > 40 ? "..." : "");
                const { error: updateError } = await supabase
                    .from('chats')
                    .update({ title: newTitle })
                    .eq('id', chatId);

                if (updateError) {
                    console.error("Failed to update chat title:", updateError.message);
                }
            }
        }

        return NextResponse.json({ reply: aiResponse });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}