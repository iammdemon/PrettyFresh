import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload || (userPayload.role !== "admin" && userPayload.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        // Fetch all pending bKash deposits
        const requests = await db.collection("wallet_transactions")
            .find({ type: "deposit", method: "bKash", status: "pending" })
            .sort({ createdAt: -1 })
            .toArray();
            
        // Map _id to id string
        const mapped = requests.map(req => ({
            ...req,
            id: req._id.toString()
        }));
        
        return NextResponse.json({ success: true, requests: mapped });
    } catch (e: any) {
        console.error("GET Admin Funds Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload || (userPayload.role !== "admin" && userPayload.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
        }

        const body = await request.json();
        const { id, action } = body; // action: "approve" or "reject"
        
        if (!id || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        const trx = await db.collection("wallet_transactions").findOne({ _id: new ObjectId(id) });
        if (!trx) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }
        
        if (trx.status !== "pending") {
            return NextResponse.json({ error: `Transaction is already ${trx.status}` }, { status: 400 });
        }
        
        if (action === "reject") {
            await db.collection("wallet_transactions").updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: "rejected" } }
            );
            return NextResponse.json({ success: true, message: "Request rejected" });
        }
        
        if (action === "approve") {
            // Find user to increment balance
            const user = await db.collection("users").findOne({ _id: new ObjectId(trx.userId) });
            if (!user) {
                return NextResponse.json({ error: "Associated user not found" }, { status: 404 });
            }
            
            const newBalance = (user.walletBalance || 0) + trx.amount;
            
            // Update user balance
            await db.collection("users").updateOne(
                { _id: user._id },
                { $set: { walletBalance: newBalance } }
            );
            
            // Update transaction to approved and record final balance
            await db.collection("wallet_transactions").updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: "approved", balanceAfter: newBalance } }
            );
            
            return NextResponse.json({ success: true, message: "Request approved and balance updated" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e: any) {
        console.error("PUT Admin Funds Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
