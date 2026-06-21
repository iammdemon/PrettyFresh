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
        const riderId = searchParams.get('riderId');
        
        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        const isRider = userPayload.role === "rider";
        
        if (!isAdmin && !isRider && userPayload.email !== email?.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Can only view own orders" }, { status: 403 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        let query: any = {};
        // Customers can only see their own orders
        if (!isAdmin && !isRider) {
            query.customerEmail = userPayload.email;
        } else {
            if (email) query.customerEmail = email.toLowerCase();
            if (riderId) query.riderId = riderId;
        }
        
        const orders = await db.collection("orders").find(query).sort({ createdAt: -1 }).toArray();
        return NextResponse.json({ success: true, orders });
    } catch (e: any) {
        console.error("GET Orders Error:", e);
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
        const { orderId, customerName, customerEmail, customerPhone, address, items, subtotal, deliveryFee, total, status, paymentMethod } = body;
        
        if (!orderId || !customerEmail || !items || !total) {
            return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
        }
        
        const isAdmin = userPayload.role === "admin" || userPayload.role === "super_admin";
        if (!isAdmin && userPayload.email !== customerEmail.toLowerCase()) {
            return NextResponse.json({ error: "Forbidden: Cannot create order for another user" }, { status: 403 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        const newOrder = {
            orderId,
            customerName: customerName || "Guest Customer",
            customerEmail: customerEmail.toLowerCase(),
            customerPhone: customerPhone || "Not Provided",
            address: address || "Not Provided",
            items: items.map((item: any) => ({
                id: item.id,
                name: item.name,
                image: item.image,
                price: Number(item.price),
                weight: item.weight,
                quantity: Number(item.quantity)
            })),
            subtotal: Number(subtotal),
            deliveryFee: Number(deliveryFee || 2.00),
            total: Number(total),
            status: status || "Pending",
            paymentMethod: paymentMethod || "COD",
            createdAt: new Date()
        };
        
        const result = await db.collection("orders").insertOne(newOrder);
        return NextResponse.json({ success: true, order: { ...newOrder, _id: result.insertedId } });
    } catch (e: any) {
        console.error("POST Order Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isAdminOrRider = ["admin", "super_admin", "rider"].includes(userPayload.role || "");
        if (!isAdminOrRider) {
            return NextResponse.json({ error: "Forbidden: Not authorized to update order status" }, { status: 403 });
        }

        const body = await request.json();
        const { _id, orderId, status, riderId, riderName, riderPhone } = body;
        
        if (!_id && !orderId) {
            return NextResponse.json({ error: "Missing order identifier" }, { status: 400 });
        }
        if (!status) {
            return NextResponse.json({ error: "Missing status field" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        const query: any = {};
        if (_id) {
            query._id = new ObjectId(_id);
        } else {
            query.orderId = orderId;
        }
        
        const updateData: any = { status, updatedAt: new Date() };
        if (riderId) updateData.riderId = riderId;
        if (riderName) updateData.riderName = riderName;
        if (riderPhone) updateData.riderPhone = riderPhone;

        const result = await db.collection("orders").updateOne(query, {
            $set: updateData
        });
        
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "Order status updated successfully" });
    } catch (e: any) {
        console.error("PUT Order Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
