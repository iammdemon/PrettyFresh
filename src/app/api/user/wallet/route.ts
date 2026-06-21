import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        if (!email) {
            return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
        }
        
        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        if (!isAdmin && userPayload.email !== email.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only view own wallet" }, { status: 403 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        // Find user
        const user = await db.collection("users").findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        // Fetch wallet balance (default to 0 if undefined)
        const walletBalance = user.walletBalance || 0;
        
        // Fetch transactions
        const transactions = await db.collection("wallet_transactions")
            .find({ userId: user._id.toString() })
            .sort({ createdAt: -1 })
            .toArray();
            
        return NextResponse.json({ 
            success: true, 
            walletBalance, 
            transactions 
        });
    } catch (e: any) {
        console.error("GET Wallet Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
