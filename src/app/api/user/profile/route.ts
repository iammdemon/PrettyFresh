import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, phone, gender, dob, address, avatar } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        const updateResult = await db.collection("users").updateOne(
            { email: email.toLowerCase() },
            {
                $set: {
                    name,
                    phone,
                    gender,
                    dob,
                    address,
                    avatar,
                    updatedAt: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("API Profile Update Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
