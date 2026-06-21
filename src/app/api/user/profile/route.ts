import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
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

        const isAdminOrRider = ["admin", "super_admin", "rider"].includes(userPayload.role || "");
        if (!isAdminOrRider && userPayload.email !== email.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only view own profile" }, { status: 403 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        const user = await db.collection("users").findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
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
            role: user.role || "customer",
            provider: user.provider
        };
        return NextResponse.json({ success: true, user: sessionUser });
    } catch (e: any) {
        console.error("GET Profile Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { email, name, phone, gender, dob, address, avatar } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        if (!isAdmin && userPayload.email !== email.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only update own profile" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // First find the user to get their ID
        const user = await db.collection("users").findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updateResult = await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: {
                    name,
                    phone,
                    gender,
                    dob,
                    address,
                    avatar,
                    updatedAt: new Date()
                }
            }
        );

        // If this user is a rider, sync their updated phone number to all their active orders
        if (user.role === "rider" || user.role === "super_admin") {
            await db.collection("orders").updateMany(
                { riderId: user._id.toString() },
                { 
                    $set: { 
                        riderPhone: phone,
                        riderName: name
                    } 
                }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("API Profile Update Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
