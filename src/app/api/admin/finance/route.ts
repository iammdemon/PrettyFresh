import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload || (userPayload.role !== "admin" && userPayload.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // 1. Total Wallet Balance Liability (Sum of all user wallet balances)
        const walletAgg = await db.collection("users").aggregate([
            { $group: { _id: null, totalBalance: { $sum: { $ifNull: ["$walletBalance", 0] } } } }
        ]).toArray();
        const totalWalletBalances = walletAgg.length > 0 ? walletAgg[0].totalBalance : 0;

        // 2. Total bKash Deposits (Approved deposits in wallet_transactions)
        const bkashAgg = await db.collection("wallet_transactions").aggregate([
            { 
                $match: { 
                    type: "deposit", 
                    status: "approved" 
                } 
            },
            { $group: { _id: null, totalDeposits: { $sum: "$amount" } } }
        ]).toArray();
        const totalBkashDeposits = bkashAgg.length > 0 ? bkashAgg[0].totalDeposits : 0;

        // 3. Total Cash Collected by Riders (Delivered COD orders)
        const cashAgg = await db.collection("orders").aggregate([
            { 
                $match: { 
                    paymentMethod: "COD", 
                    status: "Delivered" 
                } 
            },
            { $group: { _id: null, totalCash: { $sum: "$total" } } }
        ]).toArray();
        const totalCashCollected = cashAgg.length > 0 ? cashAgg[0].totalCash : 0;

        // 4. Fetch Transaction Timeline
        const walletTxs = await db.collection("wallet_transactions").find({ status: { $in: ["approved", "completed"] } }).sort({ createdAt: -1 }).limit(100).toArray();
        const codOrders = await db.collection("orders").find({ paymentMethod: "COD", status: "Delivered" }).sort({ createdAt: -1 }).limit(100).toArray();
        
        const allTransactions = [
            ...walletTxs.map(tx => ({
                id: tx._id.toString(),
                date: tx.createdAt,
                type: tx.type === "deposit" ? "bKash Deposit" : tx.type === "cashback" ? "Gifted Cashback" : "Wallet Purchase",
                customer: tx.userEmail || "Unknown",
                amount: tx.amount,
                isCredit: tx.type === "deposit" || tx.type === "cashback",
                reference: tx.trxId || tx.description || "N/A"
            })),
            ...codOrders.map(o => ({
                id: o._id.toString(),
                date: o.createdAt,
                type: "Cash Collected (COD)",
                customer: o.user?.email || "Unknown",
                amount: o.total,
                isCredit: true, // It's revenue for the business
                reference: o.orderId
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            success: true,
            finance: {
                totalWalletBalances,
                totalBkashDeposits,
                totalCashCollected,
                grandTotalRevenue: totalBkashDeposits + totalCashCollected,
                recentTransactions: allTransactions
            }
        });

    } catch (e: any) {
        console.error("Finance API Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
