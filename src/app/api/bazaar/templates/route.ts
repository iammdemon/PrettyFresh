import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/bazaar/templates?userId=xyz
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
            return NextResponse.json({ error: "Forbidden: Can only view own templates" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        const templates = await db.collection("bazaar_templates").find({ userId }).toArray();

        return NextResponse.json({ success: true, templates });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/bazaar/templates
export async function POST(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, name, items } = body;

        if (!userId || !name || !items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        if (!isAdmin && userPayload.email !== userId.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only manage own templates" }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        const newTemplate = {
            userId,
            name,
            items,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection("bazaar_templates").insertOne(newTemplate);

        return NextResponse.json({ success: true, templateId: result.insertedId });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

// DELETE /api/bazaar/templates?id=xyz
export async function DELETE(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("prettyfresh");

        // Fetch template to check ownership
        const template = await db.collection("bazaar_templates").findOne({ _id: new ObjectId(id) });
        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        if (!isAdmin && userPayload.email !== template.userId.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only delete own templates" }, { status: 403 });
        }

        await db.collection("bazaar_templates").deleteOne({ _id: new ObjectId(id) });
        // Also delete associated subscription if any
        await db.collection("bazaar_subscriptions").deleteMany({ templateId: id });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
