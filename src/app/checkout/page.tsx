"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toBanglaPrice, toBanglaNumber } from "@/lib/bangla";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, CreditCard } from "lucide-react";

export default function CheckoutPage() {
    const { cart, checkout, triggerToast } = useCart();
    const router = useRouter();
    
    const [savedUser, setSavedUser] = useState<any>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Wallet States
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "Wallet">("COD");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.00;
    const total = subtotal + deliveryFee;

    const { user: authUser, isLoading } = useAuth();
    
    useEffect(() => {
        if (!isLoading) {
            if (authUser) {
                // Onboarding Guard
                if (!authUser.phone || authUser.phone === "" || !authUser.address || authUser.address === "Not Provided") {
                    window.location.href = "/onboarding";
                    return;
                }
                setSavedUser(authUser);
                
                // Fetch wallet balance
                fetch(`/api/user/wallet?email=${encodeURIComponent(authUser.email)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) setWalletBalance(data.walletBalance);
                    });
            } else {
                router.push("/auth");
            }
        }
    }, [authUser, isLoading, router]);

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            triggerToast("Your cart is empty!");
            return;
        }

        setLoading(true);

        const targetAddress = useNewAddress ? newAddress : (savedUser?.address || "");
        const targetPhone = useNewAddress ? newPhone : (savedUser?.phone || "");

        if (!targetAddress || !targetPhone) {
            triggerToast("Please provide a valid delivery address and phone number.");
            setLoading(false);
            return;
        }

        // Handle Wallet Payment
        if (paymentMethod === "Wallet") {
            if (walletBalance === null || walletBalance < total) {
                triggerToast("Insufficient wallet balance.");
                setLoading(false);
                return;
            }
            
            try {
                const res = await fetch("/api/user/wallet/transaction", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: savedUser.email,
                        amount: total,
                        type: "purchase",
                        description: `Paid for order (Subtotal: ${subtotal}, Delivery: ${deliveryFee})`
                    })
                });
                const data = await res.json();
                if (!data.success) {
                    triggerToast(data.error || "Failed to process wallet payment.");
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error("Wallet checkout error:", err);
                triggerToast("An error occurred during payment.");
                setLoading(false);
                return;
            }
        }

        const orderId = await checkout(targetAddress, targetPhone, paymentMethod);
        
        if (orderId) {
            router.push(`/checkout/success?orderId=${orderId}`);
        } else {
            setLoading(false);
            triggerToast("Checkout failed. Please try again.");
        }
    };

    if (!savedUser) {
        return <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</div>;
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <button 
                    onClick={() => router.back()} 
                    style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--color-text)", fontWeight: 600, cursor: "pointer", marginBottom: "24px" }}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "32px" }}>Checkout</h1>

                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", alignItems: "flex-start" }}>
                    
                    {/* Left Column: Delivery Details */}
                    <div style={{ flex: "1 1 600px", background: "var(--color-white)", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <MapPin size={20} color="var(--color-primary)" /> Delivery Details
                        </h2>
                        
                        <form id="checkout-form" onSubmit={handleCheckoutSubmit}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "16px", border: "1px solid var(--color-border)", borderRadius: "12px", background: !useNewAddress ? "var(--color-bg-light)" : "transparent", transition: "all 0.2s" }}>
                                    <input 
                                        type="radio" 
                                        checked={!useNewAddress} 
                                        onChange={() => setUseNewAddress(false)} 
                                        style={{ accentColor: "var(--color-primary)", width: "18px", height: "18px" }}
                                    />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>Use Saved Address</span>
                                        <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                                            {savedUser?.address || "No saved address"} • {savedUser?.phone || "No saved phone"}
                                        </span>
                                    </div>
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "16px", border: "1px solid var(--color-border)", borderRadius: "12px", background: useNewAddress ? "var(--color-bg-light)" : "transparent", transition: "all 0.2s" }}>
                                    <input 
                                        type="radio" 
                                        checked={useNewAddress} 
                                        onChange={() => setUseNewAddress(true)} 
                                        style={{ accentColor: "var(--color-primary)", width: "18px", height: "18px" }}
                                    />
                                    <span style={{ fontWeight: 600, fontSize: "1.05rem" }}>Deliver to a New Address</span>
                                </label>
                            </div>

                            {useNewAddress && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px", padding: "24px", background: "var(--color-bg-light)", borderRadius: "12px" }}>
                                    <div className="input-field">
                                        <label htmlFor="new-address" style={{ fontWeight: 600 }}>New Address</label>
                                        <div style={{ position: "relative" }}>
                                            <MapPin size={18} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--color-text-muted)" }} />
                                            <textarea 
                                                id="new-address" 
                                                rows={3} 
                                                placeholder="e.g. House 12, Road 5, Block C, Banani" 
                                                value={newAddress}
                                                onChange={(e) => setNewAddress(e.target.value)}
                                                required={useNewAddress}
                                                style={{ paddingLeft: "40px", width: "100%", borderRadius: "8px", border: "1px solid var(--color-border)", padding: "12px 12px 12px 40px" }}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="input-field">
                                        <label htmlFor="new-phone" style={{ fontWeight: 600 }}>Contact Number</label>
                                        <div style={{ position: "relative" }}>
                                            <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                                            <input 
                                                type="tel" 
                                                id="new-phone" 
                                                placeholder="e.g. +8801700000000" 
                                                value={newPhone}
                                                onChange={(e) => setNewPhone(e.target.value)}
                                                required={useNewAddress} 
                                                style={{ paddingLeft: "40px", width: "100%", borderRadius: "8px", border: "1px solid var(--color-border)", padding: "12px 12px 12px 40px" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div style={{ marginTop: "32px" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>Payment Method</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <label style={{ 
                                        padding: "16px", 
                                        border: `1px solid ${paymentMethod === "COD" ? "var(--color-primary)" : "var(--color-border)"}`, 
                                        borderRadius: "12px", 
                                        background: paymentMethod === "COD" ? "var(--color-primary-light)" : "transparent", 
                                        display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s" 
                                    }}>
                                        <input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} style={{ accentColor: "var(--color-primary)", width: "18px", height: "18px" }} />
                                        <CreditCard size={24} color={paymentMethod === "COD" ? "var(--color-primary)" : "var(--color-text-muted)"} />
                                        <div>
                                            <div style={{ fontWeight: 700, color: paymentMethod === "COD" ? "var(--color-primary)" : "var(--color-text)" }}>Cash on Delivery</div>
                                            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Pay when you receive your order</div>
                                        </div>
                                    </label>
                                    
                                    <label style={{ 
                                        padding: "16px", 
                                        border: `1px solid ${paymentMethod === "Wallet" ? "var(--color-primary)" : "var(--color-border)"}`, 
                                        borderRadius: "12px", 
                                        background: paymentMethod === "Wallet" ? "var(--color-primary-light)" : "transparent", 
                                        display: "flex", alignItems: "center", gap: "12px", 
                                        cursor: (walletBalance !== null && walletBalance >= total) ? "pointer" : "not-allowed", 
                                        opacity: (walletBalance !== null && walletBalance >= total) ? 1 : 0.6,
                                        transition: "all 0.2s" 
                                    }}>
                                        <input 
                                            type="radio" 
                                            checked={paymentMethod === "Wallet"} 
                                            onChange={() => { if (walletBalance !== null && walletBalance >= total) setPaymentMethod("Wallet") }} 
                                            disabled={walletBalance === null || walletBalance < total}
                                            style={{ accentColor: "var(--color-primary)", width: "18px", height: "18px" }} 
                                        />
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === "Wallet" ? "var(--color-primary)" : "var(--color-text-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: paymentMethod === "Wallet" ? "var(--color-primary)" : "var(--color-text)" }}>Pay with Wallet</div>
                                                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Available Balance: {walletBalance !== null ? toBanglaPrice(walletBalance) : "..."}</div>
                                            </div>
                                            {(walletBalance !== null && walletBalance < total) && (
                                                <span style={{ fontSize: "0.75rem", color: "#d32f2f", backgroundColor: "#ffcdd2", padding: "4px 8px", borderRadius: "4px", fontWeight: 700 }}>Insufficient Funds</span>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div style={{ flex: "1 1 350px", background: "var(--color-white)", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "24px" }}>Order Summary</h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", maxHeight: "300px", overflowY: "auto", paddingRight: "8px" }}>
                            {cart.map((item, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "50px", height: "50px", borderRadius: "8px", backgroundColor: "var(--color-bg-light)", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{toBanglaNumber(item.quantity.toString())} x {item.weight}</div>
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{toBanglaPrice(item.price * item.quantity)}</div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div style={{ textAlign: "center", padding: "20px", color: "var(--color-text-muted)" }}>Your cart is empty.</div>
                            )}
                        </div>

                        <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)" }}>
                                <span>Subtotal ({toBanglaNumber(totalItems.toString())} items)</span>
                                <span>{toBanglaPrice(subtotal)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)" }}>
                                <span>Delivery Fee</span>
                                <span>{toBanglaPrice(deliveryFee)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.25rem", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--color-border)" }}>
                                <span>Total</span>
                                <span style={{ color: "var(--color-primary)" }}>{toBanglaPrice(total)}</span>
                            </div>
                        </div>

                        <button 
                            form="checkout-form"
                            type="submit" 
                            className="btn btn-primary btn-block btn-lg" 
                            disabled={loading || cart.length === 0}
                            style={{ marginTop: "32px", height: "54px", fontSize: "1.1rem" }}
                        >
                            {loading ? "Processing..." : "Confirm & Place Order"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
