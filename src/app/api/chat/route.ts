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
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "No message provided" }, { status: 400 });
        }

        // send request to gemini
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        console.error("Gemini Error:", error);

        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}