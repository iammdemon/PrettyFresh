"use client";

import React, { Suspense } from "react";
import { PartyPopper } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toBanglaNumber } from "@/lib/bangla";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessContent() {
    const { successTotal } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const orderId = searchParams?.get("orderId") || "PF-00000";

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", padding: "80px 20px", display: "flex", justifyContent: "center" }}>
            <div style={{ background: "var(--color-white)", padding: "48px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", maxWidth: "500px", width: "100%", textAlign: "center" }}>
                
                <div style={{ display: "inline-flex", padding: "24px", borderRadius: "50%", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", marginBottom: "24px" }}>
                    <PartyPopper size={64} />
                </div>
                
                <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "16px" }}>Order Placed!</h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem", marginBottom: "32px", lineHeight: 1.5 }}>
                    Thank you for shopping with PrettyFresh. Your fresh groceries are being prepared.
                </p>

                <div style={{ background: "var(--color-bg-light)", padding: "24px", borderRadius: "16px", marginBottom: "32px", textAlign: "left", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--color-text-muted)" }}>Order ID</span>
                        <strong style={{ fontSize: "1.1rem" }}>{toBanglaNumber(orderId)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--color-text-muted)" }}>Est. Delivery</span>
                        <strong style={{ color: "var(--color-primary)" }}>{toBanglaNumber("58")} Minutes</strong>
                    </div>
                    <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--color-text-muted)" }}>Total (COD)</span>
                        <strong style={{ fontSize: "1.2rem", fontWeight: 800 }}>{successTotal || "৳0.00"}</strong>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <button 
                        className="btn btn-primary btn-block btn-lg" 
                        onClick={() => router.push("/dashboard")}
                        style={{ height: "54px", fontSize: "1.05rem" }}
                    >
                        Track Order in Dashboard
                    </button>
                    <button 
                        className="btn btn-secondary btn-block btn-lg" 
                        onClick={() => router.push("/")}
                        style={{ height: "54px", fontSize: "1.05rem" }}
                    >
                        Continue Shopping
                    </button>
                </div>

            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
