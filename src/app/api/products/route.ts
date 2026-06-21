import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUserFromRequest } from "@/lib/auth";

const SEED_PRODUCTS = [
    {
        name: "Fresh Red Tomatoes",
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 0.79, discountPrice: 0.99 },
            { weight: "1kg", price: 1.49, discountPrice: 1.99 },
            { weight: "2kg", price: 2.89, discountPrice: 3.89 }
        ],
        badge: "Organic",
        freshness: "Morning Harvest"
    },
    {
        name: "Organic Sweet Carrots",
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "1kg", price: 1.99, discountPrice: 2.49 },
            { weight: "2kg", price: 3.80, discountPrice: 4.80 }
        ],
        badge: "Farm Fresh",
        freshness: "Morning Harvest"
    },
    {
        name: "Crisp Royal Gala Apples",
        category: "fruits",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "1kg", price: 2.99, discountPrice: 3.49 },
            { weight: "1.5kg", price: 4.39, discountPrice: 5.19 },
            { weight: "3kg", price: 8.50, discountPrice: 10.00 }
        ],
        badge: "Imported",
        freshness: "Morning Harvest"
    },
    {
        name: "Premium Bananas",
        category: "fruits",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "6 Pcs", price: 0.69, discountPrice: 0.85 },
            { weight: "1 Dozen", price: 1.29, discountPrice: 1.59 }
        ],
        badge: "15% OFF",
        freshness: "Morning Harvest"
    },
    {
        name: "Farm Fresh Whole Milk",
        category: "dairy",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "1L", price: 1.89, discountPrice: 2.19 },
            { weight: "2L", price: 3.60, discountPrice: 4.20 }
        ],
        badge: "Pasteurized",
        freshness: "Morning Harvest"
    },
    {
        name: "Organic Brown Eggs",
        category: "dairy",
        image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "6 Pcs", price: 1.30, discountPrice: 1.60 },
            { weight: "12 Pcs", price: 2.49, discountPrice: 2.99 }
        ],
        badge: "Free Range",
        freshness: "Morning Harvest"
    },
    {
        name: "Fresh Boneless Chicken Breast",
        category: "grocery",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 2.60, discountPrice: 3.10 },
            { weight: "1kg", price: 4.99, discountPrice: 5.99 }
        ],
        badge: "Antibiotic-Free",
        freshness: "Morning Harvest"
    },
    {
        name: "Atlantic Salmon Fillet",
        category: "grocery",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 4.60, discountPrice: 5.60 },
            { weight: "1kg", price: 8.99, discountPrice: 10.99 }
        ],
        badge: "Chilled",
        freshness: "Morning Harvest"
    },
    {
        name: "Crisp Green Bell Pepper",
        category: "daily-bazaar",
        image: "https://images.unsplash.com/photo-1580201006675-4131b3157790?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "250g", price: 0.99, discountPrice: 1.49 }
        ],
        badge: "Hot Bargain",
        freshness: "98% Freshness Score"
    },
    {
        name: "Organic Strawberries Box",
        category: "daily-bazaar",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "250g Box", price: 3.49, discountPrice: 4.49 }
        ],
        badge: "Hot Bargain",
        freshness: "Picked Today"
    },
    {
        name: "Pure Clover Honey",
        category: "daily-bazaar",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 5.99, discountPrice: 7.49 }
        ],
        badge: "Hot Bargain",
        freshness: "100% Organic"
    },
    {
        name: "Fresh Garden Broccoli",
        category: "daily-bazaar",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 1.19, discountPrice: 1.69 }
        ],
        badge: "Hot Bargain",
        freshness: "Morning Harvest"
    }
];

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        let products = await db.collection("products").find({}).toArray();
        
        // Auto-migration: if old schema detected (price field exists directly on product without variants), drop and reseed.
        if (products.length > 0 && products[0].price !== undefined && !products[0].variants) {
            await db.collection("products").deleteMany({});
            products = [];
        }
        
        let categories = await db.collection("categories").find({}).toArray();
        if (categories.length === 0) {
            const DEFAULT_CATEGORIES = [
                { name: "Vegetables", code: "vegetables" },
                { name: "Fruits", code: "fruits" },
                { name: "Dairy", code: "dairy" },
                { name: "Grocery", code: "grocery" },
                { name: "Daily Bazaar Deal", code: "daily-bazaar" }
            ];
            await db.collection("categories").insertMany(DEFAULT_CATEGORIES);
            categories = await db.collection("categories").find({}).toArray();
        }

        if (products.length === 0) {
            // Seed database
            const seededProducts = SEED_PRODUCTS.map(p => {
                const matchedCat = categories.find(c => c.code === p.category);
                return {
                    ...p,
                    category: matchedCat ? matchedCat._id.toString() : p.category
                };
            });
            await db.collection("products").insertMany(seededProducts);
            products = await db.collection("products").find({}).toArray();
        } else {
            let needsMigration = false;
            for (const p of products) {
                // If the category field matches a known old code and is not an ObjectId string length
                if (p.category && p.category.length < 24) {
                    const matchedCat = categories.find(c => c.code === p.category);
                    if (matchedCat) {
                        needsMigration = true;
                        break;
                    }
                }
            }

            if (needsMigration) {
                for (const p of products) {
                    const matchedCat = categories.find(c => c.code === p.category);
                    if (matchedCat) {
                        await db.collection("products").updateOne(
                            { _id: p._id },
                            { $set: { category: matchedCat._id.toString() } }
                        );
                    }
                }
                products = await db.collection("products").find({}).toArray();
            }
        }
        
        return NextResponse.json({ success: true, products });
    } catch (e: any) {
        console.error("GET Products Error:", e);
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
        const { name, category, image, variants, badge, freshness, isTopSelling } = body;
        
        if (!name || !category || !image || !variants) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        const newProduct = {
            name,
            category,
            image,
            variants: variants.map((v: any) => ({
                weight: v.weight,
                price: Number(v.price),
                discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined
            })),
            badge: badge || undefined,
            freshness: freshness || "Standard",
            isTopSelling: isTopSelling === true,
            createdAt: new Date()
        };
        
        const result = await db.collection("products").insertOne(newProduct);
        return NextResponse.json({ success: true, product: { ...newProduct, _id: result.insertedId } });
    } catch (e: any) {
        console.error("POST Product Error:", e);
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
        const { _id, id, name, category, image, variants, badge, freshness, isTopSelling } = body;
        
        if (!_id && id === undefined) {
            return NextResponse.json({ error: "Missing product identifier" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        const query: any = {};
        if (_id) {
            query._id = new ObjectId(_id);
        } else {
            query._id = new ObjectId(id);
        }
        
        const updateData: any = {};
        if (name) updateData.name = name;
        if (category) updateData.category = category;
        if (image) updateData.image = image;
        if (variants && Array.isArray(variants)) {
            updateData.variants = variants.map((v: any) => ({
                weight: v.weight,
                price: Number(v.price),
                discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined
            }));
        }
        if (badge !== undefined) updateData.badge = badge;
        if (freshness !== undefined) updateData.freshness = freshness;
        if (isTopSelling !== undefined) updateData.isTopSelling = isTopSelling === true;
        
        const result = await db.collection("products").updateOne(query, { $set: updateData });
        
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "Product updated successfully" });
    } catch (e: any) {
        console.error("PUT Product Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload || (userPayload.role !== "admin" && userPayload.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const _id = searchParams.get("_id");
        const id = searchParams.get("id");
        
        if (!_id && !id) {
            return NextResponse.json({ error: "Missing product identifier" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        
        const query: any = {};
        if (_id) {
            query._id = new ObjectId(_id);
        } else {
            query._id = new ObjectId(id as string);
        }
        
        const result = await db.collection("products").deleteOne(query);
        
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, message: "Product deleted successfully" });
    } catch (e: any) {
        console.error("DELETE Product Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
