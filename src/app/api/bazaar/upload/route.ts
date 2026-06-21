import { NextResponse, NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const { imageBase64 } = body; // Data URL format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."

        if (!imageBase64) {
            return NextResponse.json({ error: "Missing image data" }, { status: 400 });
        }

        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured on the server." }, { status: 500 });
        }

        const promptText = `You are a grocery list OCR and matching assistant.
I am providing an image of a handwritten or printed grocery list (in Bangla or English).
Please extract each item and its quantity from the list.

Respond ONLY with a valid JSON array of objects. Do not include any markdown formatting or text outside the JSON array.
Each object should have:
- "detectedName": The exact text found in the image (translated to English if it's in Bangla)
- "detectedQuantity": The quantity found (e.g. "25kg", "5L", "30 pcs", or null if not specified)

Example output:
[
  { "detectedName": "Miniket Rice", "detectedQuantity": "25kg" },
  { "detectedName": "Soybean Oil", "detectedQuantity": "5L" }
]`;

        // Call OpenRouter API
        const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            { type: "image_url", image_url: { url: imageBase64 } }
                        ]
                    }
                ]
            })
        });

        if (!orResponse.ok) {
            const err = await orResponse.text();
            console.error("OpenRouter Error:", err);
            return NextResponse.json({ error: "Failed to process image with AI." }, { status: 500 });
        }

        const orData = await orResponse.json();
        const aiMessage = orData.choices?.[0]?.message?.content || "[]";

        // Parse the AI output
        let extractedItems = [];
        try {
            // Remove markdown code blocks if any
            const cleanedText = aiMessage.replace(/```json/g, "").replace(/```/g, "").trim();
            extractedItems = JSON.parse(cleanedText);
        } catch (parseErr) {
            console.error("Failed to parse AI JSON response:", aiMessage);
            return NextResponse.json({ error: "AI returned invalid format." }, { status: 500 });
        }

        // Now, perform fuzzy matching against our database catalog
        const client = await clientPromise;
        const db = client.db("prettyfresh");
        const products = await db.collection("products").find({}).toArray();

        const results = extractedItems.map((item: any) => {
            const searchLower = item.detectedName.toLowerCase();
            
            // Basic matching logic: find product where name contains the detected text, or vice versa
            let matchedProduct = products.find(p => 
                p.name.toLowerCase().includes(searchLower) || searchLower.includes(p.name.toLowerCase())
            );

            // Find alternatives
            let alternatives = products.filter(p => 
                p.category === matchedProduct?.category && p._id !== matchedProduct?._id
            ).slice(0, 3);

            return {
                originalName: item.detectedName,
                originalQuantity: item.detectedQuantity,
                matchedProduct: matchedProduct ? {
                    id: matchedProduct._id.toString(),
                    name: matchedProduct.name,
                    image: matchedProduct.image,
                    price: matchedProduct.variants[0]?.price || 0,
                    weight: matchedProduct.variants[0]?.weight || "1 unit"
                } : null,
                alternatives: alternatives.map(alt => ({
                    id: alt._id.toString(),
                    name: alt.name,
                    price: alt.variants[0]?.price || 0
                }))
            };
        });

        return NextResponse.json({ success: true, results });

    } catch (e: any) {
        console.error("Bazaar Upload API Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
