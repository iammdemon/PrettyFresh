import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // Hash input password to match DB record
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

        const user = await db.collection("users").findOne({ 
            email: email.toLowerCase(),
            password: hashedPassword
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
        }

        const userRole = user.role || "customer";

        // Return user session payload
        const sessionUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            gender: user.gender,
            dob: user.dob,
            address: user.address,
            provider: user.provider,
            role: userRole
        };

        return NextResponse.json({ success: true, user: sessionUser });
    } catch (e: any) {
        console.error("API Auth Login Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
