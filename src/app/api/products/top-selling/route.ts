import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        // 1. Fetch manual top sellers
        const manualTopSelling = await db.collection("products").find({ isTopSelling: true }).toArray();
        const manualIds = manualTopSelling.map(p => p._id.toString());
        
        const MAX_PRODUCTS = 10;
        let finalProducts = [...manualTopSelling];
        
        // 2. If we need more products, calculate automatically from orders in the last 30 days
        if (finalProducts.length < MAX_PRODUCTS) {
            const limit = MAX_PRODUCTS - finalProducts.length;
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const pipeline = [
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $unwind: "$items" },
                { 
                    $group: { 
                        _id: "$items.id", 
                        totalQuantity: { $sum: "$items.quantity" } 
                    } 
                },
                { $sort: { totalQuantity: -1 } as const },
                // Filter out products already added manually
                { $match: { _id: { $nin: manualIds } } },
                { $limit: limit }
            ];
            
            const topSellingItems = await db.collection("orders").aggregate(pipeline).toArray();
            
            if (topSellingItems.length > 0) {
                // The item.id in orders might be an ObjectId string, so convert it to ObjectId for lookup
                const productIds = topSellingItems
                    .map(item => {
                        try {
                            return new ObjectId(item._id as string);
                        } catch (e) {
                            return null;
                        }
                    })
                    .filter(id => id !== null);
                
                if (productIds.length > 0) {
                    const autoTopSelling = await db.collection("products")
                        .find({ _id: { $in: productIds } })
                        .toArray();
                    
                    // Maintain the sorted order based on totalQuantity
                    const sortedAutoTopSelling = topSellingItems
                        .map(item => autoTopSelling.find(p => p._id.toString() === item._id))
                        .filter(p => p !== undefined);
                        
                    finalProducts = [...finalProducts, ...sortedAutoTopSelling];
                }
            }
        }
        
        return NextResponse.json({ success: true, products: finalProducts });
    } catch (e: any) {
        console.error("GET Top Selling Products Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
