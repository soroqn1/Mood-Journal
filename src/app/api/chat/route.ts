import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;
        return NextResponse.json({
            reply: `Hello, your text is: ${message}` //test
        });
    } catch (error) {
        return NextResponse.json({ error: "Error" }, { status: 400 });
    }
}