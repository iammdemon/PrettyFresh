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
        
        const users = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray();
        
        // Strip sensitive data before sending to client
        const safeUsers = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone || "Not Configured",
            role: user.role || "customer",
            provider: user.provider || "Email & Password",
            walletBalance: user.walletBalance || 0,
            createdAt: user.createdAt || new Date()
        }));
        
        return NextResponse.json({ success: true, users: safeUsers });
    } catch (e: any) {
        console.error("GET Admin Users Error:", e);
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
        const { id, role } = body;
        
        if (!id || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        // Check super admin security - cannot modify a super_admin's permissions
        const query = { _id: new ObjectId(id) };
        const userToModify = await db.collection("users").findOne(query);
        
        if (userToModify && userToModify.role === "super_admin") {
            return NextResponse.json({ error: "Cannot modify Super Admin permissions" }, { status: 403 });
        }
        
        const result = await db.collection("users").updateOne(query, {
            $set: { role, updatedAt: new Date() }
        });
        
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "User role updated successfully" });
    } catch (e: any) {
        console.error("PUT Admin User Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
