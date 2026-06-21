import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { messaging } from "@/lib/firebase-admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, message } = body;

        if (!title || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // Fetch all unique device tokens
        const users = await db.collection("users").find({ deviceTokens: { $exists: true, $not: {$size: 0} } }).toArray();
        let allTokens: string[] = [];
        for (const user of users) {
            if (Array.isArray(user.deviceTokens)) {
                allTokens.push(...user.deviceTokens);
            }
        }

        // De-duplicate tokens
        allTokens = Array.from(new Set(allTokens));

        if (allTokens.length === 0) {
            return NextResponse.json({ success: true, message: "No device tokens found. Nobody to notify." });
        }

        // Send multicast message
        const response = await messaging.sendEachForMulticast({
            tokens: allTokens,
            notification: {
                title: title,
                body: message,
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK"
            }
        });

        // Save to notification history
        await db.collection("notifications").insertOne({
            type: "marketing",
            title,
            message,
            sentAt: new Date(),
            successCount: response.successCount,
            failureCount: response.failureCount
        });

        return NextResponse.json({ 
            success: true, 
            sent: response.successCount, 
            failed: response.failureCount 
        });

    } catch (e: any) {
        console.error("API Notification Send Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
