import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // Fetch notifications of type marketing (broadcasts)
        const notifications = await db.collection("notifications")
            .find({ type: "marketing" })
            .sort({ sentAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({ 
            success: true, 
            notifications 
        });

    } catch (e: any) {
        console.error("API Notifications GET Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
