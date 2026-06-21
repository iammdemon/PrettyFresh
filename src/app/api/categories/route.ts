import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";

const DEFAULT_CATEGORIES = [
    { name: "Vegetables", code: "vegetables" },
    { name: "Fruits", code: "fruits" },
    { name: "Dairy", code: "dairy" },
    { name: "Grocery", code: "grocery" },
    { name: "Daily Bazaar Deal", code: "daily-bazaar" }
];

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        let categories = await db.collection("categories").find({}).toArray();
        
        if (categories.length === 0) {
            await db.collection("categories").insertMany(DEFAULT_CATEGORIES);
            categories = await db.collection("categories").find({}).toArray();
        }
        
        return NextResponse.json({ success: true, categories });
    } catch (e: any) {
        console.error("GET Categories Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload || (userPayload.role !== "admin" && userPayload.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
        }

        const body = await request.json();
        const { name } = body;
        
        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        // Generate a code from name
        const code = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        const newCategory = {
            name,
            code,
            createdAt: new Date()
        };
        
        const result = await db.collection("categories").insertOne(newCategory);
        return NextResponse.json({ success: true, category: { ...newCategory, _id: result.insertedId } });
    } catch (e: any) {
        console.error("POST Category Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const _id = searchParams.get("_id");
        
        if (!_id) {
            return NextResponse.json({ error: "Missing category identifier" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        const result = await db.collection("categories").deleteOne({ _id: new ObjectId(_id) });
        
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "Category deleted successfully" });
    } catch (e: any) {
        console.error("DELETE Category Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
