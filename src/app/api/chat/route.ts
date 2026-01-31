import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// initialize gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// configure model with psychologist role
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: "You are an empathetic mood journal assistant. Your goal is to help users reflect on their day. Be supportive, ask open-ended questions about emotions, and keep responses concise. Support both English and Ukrainian languages."
});

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        const chat = model.startChat({
            history: history.map((m: any) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        return NextResponse.json({ reply: response.text() });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}