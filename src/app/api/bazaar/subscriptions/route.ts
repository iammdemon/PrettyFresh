import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/bazaar/subscriptions?userId=xyz
export async function GET(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        if (!isAdmin && userPayload.email !== userId.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only view own subscriptions" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        const subscriptions = await db.collection("bazaar_subscriptions").find({ userId }).toArray();

        return NextResponse.json({ success: true, subscriptions });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/bazaar/subscriptions
export async function POST(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, templateId, frequency } = body; 
        // frequency: "Monthly" | "Every 15 Days" | "Weekly" | "None"

        if (!userId || !templateId || !frequency) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        if (!isAdmin && userPayload.email !== userId.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only manage own subscriptions" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        if (frequency === "None") {
            // Cancel subscription
            await db.collection("bazaar_subscriptions").deleteOne({ userId, templateId });
            return NextResponse.json({ success: true, message: "Subscription cancelled" });
        }

        // Calculate next delivery date roughly based on frequency
        let daysToAdd = 30;
        if (frequency === "Weekly") daysToAdd = 7;
        else if (frequency === "Every 15 Days") daysToAdd = 15;

        const nextDeliveryDate = new Date();
        nextDeliveryDate.setDate(nextDeliveryDate.getDate() + daysToAdd);

        const sub = {
            userId,
            templateId,
            frequency,
            nextDeliveryDate,
            status: "active",
            updatedAt: new Date()
        };

        await db.collection("bazaar_subscriptions").updateOne(
            { userId, templateId },
            { $set: sub },
            { upsert: true }
        );

        return NextResponse.json({ success: true, nextDeliveryDate });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
