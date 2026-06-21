import { NextResponse, NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const image = formData.get("image");

        if (!image) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        const apiKey = process.env.IMGBB_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Server missing ImgBB API key configuration" }, { status: 500 });
        }

        // Forward formData directly to ImgBB
        const imgbbFormData = new FormData();
        imgbbFormData.append("image", image);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: imgbbFormData
        });

        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ success: true, url: data.data.url });
        } else {
            console.error("ImgBB Error Response:", data);
            return NextResponse.json({ error: "Failed to upload image to ImgBB" }, { status: 500 });
        }
    } catch (e: any) {
        console.error("API Upload Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
