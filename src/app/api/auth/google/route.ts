import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, avatar, provider } = body;

        if (!email) {
            return NextResponse.json({ error: "Missing email field" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // Upsert Google user details
        const query = { email: email.toLowerCase() };
        const update = {
            $set: {
                name: name || "Google User",
                avatar: avatar || "/assets/default-avatar.png",
                provider: provider || "Google",
                updatedAt: new Date()
            },
            $setOnInsert: {
                phone: "",
                gender: "Not Specified",
                dob: "",
                address: "Not Provided",
                createdAt: new Date(),
                role: "customer"
            }
        };

        // Perform upsert
        await db.collection("users").updateOne(query, update, { upsert: true });
        const user = await db.collection("users").findOne(query);

        if (!user) {
            return NextResponse.json({ error: "Failed to sync Google user" }, { status: 500 });
        }

        const sessionUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            avatar: user.avatar,
            gender: user.gender || "Not Specified",
            dob: user.dob || "",
            address: user.address || "Not Provided",
            role: user.role || "customer"
        };

        return NextResponse.json({ success: true, user: sessionUser });
    } catch (e: any) {
        console.error("API Auth Google Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
