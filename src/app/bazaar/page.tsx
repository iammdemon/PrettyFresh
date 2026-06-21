"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Camera, ListPlus, ArrowRight, Zap, ShoppingBag } from "lucide-react";

export default function BazaarHub() {
    const router = useRouter();

    return (
        <main style={{ padding: "60px 20px", maxWidth: "1200px", margin: "0 auto", minHeight: "100vh" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <h1 style={{ fontSize: "2.8rem", fontWeight: 800, color: "var(--color-primary-dark)", marginBottom: "16px" }}>
                    Create Your Monthly Bazaar In Minutes
                </h1>
                <p style={{ fontSize: "1.2rem", color: "var(--color-text-muted)", maxWidth: "600px", margin: "0 auto" }}>
                    Upload your handwritten bazaar list or build your monthly shopping list manually. It's never been easier.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px", alignItems: "stretch" }}>
                {/* Option 1: AI Upload */}
                <div 
                    onClick={() => router.push("/bazaar/upload")}
                    style={{
                        backgroundColor: "var(--color-white)",
                        borderRadius: "var(--radius-xl)",
                        padding: "40px",
                        border: "2px solid transparent",
                        boxShadow: "var(--shadow-lg)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.borderColor = "var(--color-primary)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "transparent";
                    }}
                >
                    <div style={{ position: "absolute", top: 0, right: 0, padding: "12px 20px", backgroundColor: "#fff8e1", color: "#f57f17", fontWeight: 700, fontSize: "0.85rem", borderBottomLeftRadius: "var(--radius-lg)" }}>
                        <Zap size={14} style={{ display: "inline", marginRight: "4px" }}/> AI Powered
                    </div>
                    <div style={{ width: "80px", height: "80px", borderRadius: "20px", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                        <Camera size={40} />
                    </div>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px" }}>Upload Your Bazaar List</h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", lineHeight: 1.6, flexGrow: 1 }}>
                        Take a photo of your handwritten or printed grocery list and let our AI build your cart automatically. We detect Bengali and English handwriting instantly!
                    </p>
                    
                    <div style={{ marginTop: "32px", display: "flex", alignItems: "center", color: "var(--color-primary)", fontWeight: 700, fontSize: "1.1rem" }}>
                        Start Upload <ArrowRight size={20} style={{ marginLeft: "8px" }} />
                    </div>
                </div>

                {/* Option 2: Manual Build */}
                <div 
                    onClick={() => router.push("/bazaar/manual")}
                    style={{
                        backgroundColor: "var(--color-white)",
                        borderRadius: "var(--radius-xl)",
                        padding: "40px",
                        border: "2px solid transparent",
                        boxShadow: "var(--shadow-lg)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.borderColor = "var(--color-primary)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "transparent";
                    }}
                >
                    <div style={{ width: "80px", height: "80px", borderRadius: "20px", backgroundColor: "#f3e5f5", color: "#8e24aa", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                        <ListPlus size={40} />
                    </div>
                    <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px" }}>Create Bazaar List Manually</h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "1.05rem", lineHeight: 1.6, flexGrow: 1 }}>
                        Select products from our catalog and create your own monthly grocery template. Save multiple templates and subscribe for recurring deliveries.
                    </p>
                    
                    <div style={{ marginTop: "32px", display: "flex", alignItems: "center", color: "#8e24aa", fontWeight: 700, fontSize: "1.1rem" }}>
                        Start Building <ArrowRight size={20} style={{ marginLeft: "8px" }} />
                    </div>
                </div>
            </div>

            {/* View Templates CTA */}
            <div style={{ textAlign: "center", marginTop: "60px" }}>
                <button 
                    onClick={() => router.push("/dashboard/bazaar")}
                    style={{
                        padding: "16px 32px",
                        backgroundColor: "var(--color-white)",
                        border: "2px solid var(--color-border)",
                        borderRadius: "var(--radius-full)",
                        color: "var(--color-text)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s ease",
                        boxShadow: "var(--shadow-sm)"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-bg)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-white)"}
                >
                    <ShoppingBag size={20} /> View Saved Templates
                </button>
            </div>
        </main>
    );
}
