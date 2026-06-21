import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const payload = await getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // Fetch full user details from DB based on JWT payload ID
        const user = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });

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
            role: user.role || "customer"
        };

        return NextResponse.json({ success: true, user: sessionUser });
    } catch (e: any) {
        console.error("API Auth Me Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
