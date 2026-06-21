import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { email, amount, type, description } = body;
        
        if (!email || !amount || !type || !description) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        // Security checks
        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        
        if (type === "cashback" || type === "refund") {
            if (!isAdmin) {
                return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
            }
        } else if (type === "purchase" || type === "deposit") {
            if (!isAdmin && userPayload.email !== email.toLowerCase()) {
                return NextResponse.json({ error: "Forbidden: Can only manage own wallet" }, { status: 403 });
            }
        }
        
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        // Find user
        const user = await db.collection("users").findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const currentBalance = user.walletBalance || 0;
        let newBalance = currentBalance;
        
        let status = "approved";

        // Calculate new balance
        if (type === "deposit") {
            // For deposits, we don't update the balance immediately. It goes to pending.
            status = "pending";
        } else if (type === "cashback" || type === "refund") {
            newBalance += numericAmount;
        } else if (type === "purchase") {
            if (currentBalance < numericAmount) {
                return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
            }
            newBalance -= numericAmount;
        } else {
            return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
        }
        
        // Ensure balance doesn't go below zero due to floating point
        if (newBalance < 0) newBalance = 0;
        
        // Update user balance only if it's not a pending deposit
        if (status === "approved") {
            await db.collection("users").updateOne(
                { _id: user._id },
                { $set: { walletBalance: newBalance } }
            );
        }
        
        // Create transaction record
        const transaction: any = {
            userId: user._id.toString(),
            userEmail: user.email,
            userName: user.name,
            amount: numericAmount,
            type, // deposit, purchase, cashback, refund
            description,
            status, // pending, approved, rejected
            balanceAfter: status === "approved" ? newBalance : null,
            createdAt: new Date()
        };

        if (type === "deposit") {
            transaction.method = "bKash";
            transaction.trxId = body.trxId || "";
            transaction.accountNumber = body.accountNumber || "";
        }
        
        await db.collection("wallet_transactions").insertOne(transaction);
        
        return NextResponse.json({ 
            success: true, 
            message: "Transaction successful",
            newBalance,
            transaction
        });
    } catch (e: any) {
        console.error("POST Wallet Transaction Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
