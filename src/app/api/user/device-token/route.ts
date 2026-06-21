import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, token } = body;

        if (!email || !token) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // Add token to the user document, using an array to support multiple devices, using addToSet to prevent duplicates
        await db.collection("users").updateOne(
            { email: email.toLowerCase() },
            { $addToSet: { deviceTokens: token } as any },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("API Device Token Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
