import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, password } = body;

        if (!name || !phone || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        // Check duplicate
        const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
        if (existing) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        // Hash password securely with native Node.js crypto
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");


        const newUser = {
            name,
            phone,
            email: email.toLowerCase(),
            password: hashedPassword,
            avatar: "/assets/default-avatar.png",
            gender: "Not Specified",
            dob: "",
            address: "Not Provided",
            provider: "Email & Password",
            role: "customer",
            createdAt: new Date()
        };

        const result = await db.collection("users").insertOne(newUser);
        
        // Return user details for session
        const sessionUser = {
            id: result.insertedId.toString(),
            name,
            email: email.toLowerCase(),
            phone,
            avatar: newUser.avatar,
            gender: newUser.gender,
            dob: newUser.dob,
            address: newUser.address,
            provider: newUser.provider,
            role: newUser.role
        };

        const token = await signToken({
            id: sessionUser.id,
            email: sessionUser.email,
            role: sessionUser.role,
            name: sessionUser.name
        });

        // Create the response
        const response = NextResponse.json({ success: true, user: sessionUser, token });

        // Set HttpOnly cookie for Web App
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
    } catch (e: any) {
        console.error("API Auth Register Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
