"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, CalendarClock, Trash2, Copy, Edit2, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

// Helper for Bangla numbers/prices
const toBanglaPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(price);
};

export default function UserBazaarDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (currentUser: any) => {
        try {
            const userIdStr = currentUser.email || currentUser.id || "anonymous";
            const [tplRes, subRes] = await Promise.all([
                fetch(`/api/bazaar/templates?userId=${encodeURIComponent(userIdStr)}`, { cache: 'no-store' }),
                fetch(`/api/bazaar/subscriptions?userId=${encodeURIComponent(userIdStr)}`, { cache: 'no-store' })
            ]);
            
            const tplData = await tplRes.json();
            const subData = await subRes.json();

            if (tplData.success) setTemplates(tplData.templates);
            if (subData.success) setSubscriptions(subData.subscriptions);
        } catch (e) {
            console.error("Failed to fetch bazaar data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const { user: authUser, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (!isAuthLoading) {
            if (authUser) {
                setUser(authUser);
                fetchData(authUser);
            } else {
                router.push("/auth?redirect=/dashboard/bazaar");
            }
        }
    }, [authUser, isAuthLoading, router]);

    const handleDeleteTemplate = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this template?");
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/bazaar/templates?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Template deleted.");
                if (user) fetchData(user);
            } else {
                toast.error(data.error || "Failed to delete.");
            }
        } catch (e) {
            toast.error("Error deleting template.");
        }
    };

    const handleUpdateSubscription = async (templateId: string, frequency: string) => {
        try {
            const res = await fetch(`/api/bazaar/subscriptions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?.email || user?.id || "anonymous", templateId, frequency })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Subscription updated to ${frequency}`);
                if (user) fetchData(user);
            } else {
                toast.error(data.error || "Failed to update subscription.");
            }
        } catch (e) {
            toast.error("Error updating subscription.");
        }
    };

    if (isLoading) {
        return <div style={{ padding: "60px", textAlign: "center" }}>Loading your bazaars...</div>;
    }

    return (
        <main style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", minHeight: "100vh" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                <button 
                    onClick={() => router.push("/dashboard")} 
                    style={{ 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer", 
                        color: "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "1rem",
                        fontWeight: 600
                    }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                <div>
                    <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--color-primary-dark)", margin: 0 }}>My Monthly Bazaars</h1>
                    <p style={{ color: "var(--color-text-muted)", marginTop: "8px" }}>Manage your saved grocery templates and recurring deliveries.</p>
                </div>
                <button 
                    onClick={() => router.push("/bazaar")}
                    className="btn btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Plus size={20} /> New Bazaar
                </button>
            </div>

            {templates.length === 0 ? (
                <div style={{ backgroundColor: "var(--color-white)", borderRadius: "var(--radius-xl)", padding: "60px", textAlign: "center", border: "1px dashed var(--color-border)" }}>
                    <ShoppingBag size={64} style={{ margin: "0 auto 20px", color: "var(--color-text-muted)", opacity: 0.5 }} />
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>No templates yet</h2>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>Create your first monthly bazaar to save time on grocery shopping.</p>
                    <button onClick={() => router.push("/bazaar")} className="btn btn-primary">Create Template</button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {templates.map(tpl => {
                        const sub = subscriptions.find(s => s.templateId === tpl._id);
                        const totalCost = tpl.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                        
                        return (
                            <div key={tpl._id} style={{ backgroundColor: "var(--color-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                                {/* Header */}
                                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-bg)" }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 700 }}>{tpl.name}</h3>
                                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{tpl.items.length} Items • Est. Total: {toBanglaPrice(totalCost)}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button style={{ padding: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }} title="Duplicate (Coming Soon)">
                                            <Copy size={20} />
                                        </button>
                                        <button style={{ padding: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }} title="Edit (Coming Soon)">
                                            <Edit2 size={20} />
                                        </button>
                                        <button onClick={() => handleDeleteTemplate(tpl._id)} style={{ padding: "8px", background: "none", border: "none", cursor: "pointer", color: "#d32f2f" }} title="Delete">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: "24px", display: "flex", gap: "32px", alignItems: "flex-start" }}>
                                    {/* Preview Items */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>Items Preview</div>
                                        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px" }}>
                                            {tpl.items.slice(0, 5).map((item: any) => (
                                                <div key={item.id} style={{ width: "60px", flexShrink: 0, textAlign: "center" }}>
                                                    <div style={{ width: "60px", height: "60px", borderRadius: "8px", backgroundColor: "var(--color-bg)", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                                        {item.image ? <img src={item.image} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} /> : <ShoppingBag size={24} color="#ccc" />}
                                                    </div>
                                                    <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                                                    <div style={{ fontSize: "0.7rem", fontWeight: 700 }}>x{item.quantity}</div>
                                                </div>
                                            ))}
                                            {tpl.items.length > 5 && (
                                                <div style={{ width: "60px", height: "60px", borderRadius: "8px", backgroundColor: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-primary)" }}>
                                                    +{tpl.items.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subscription Controls */}
                                    <div style={{ width: "300px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", padding: "20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, marginBottom: "16px", color: sub ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                                            <CalendarClock size={20} />
                                            {sub ? "Active Subscription" : "No Active Subscription"}
                                        </div>
                                        
                                        <select 
                                            value={sub ? sub.frequency : "None"} 
                                            onChange={(e) => handleUpdateSubscription(tpl._id, e.target.value)}
                                            style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "12px", fontSize: "0.95rem" }}
                                        >
                                            <option value="None">Do Not Auto-Deliver</option>
                                            <option value="Weekly">Deliver Weekly</option>
                                            <option value="Every 15 Days">Deliver Every 15 Days</option>
                                            <option value="Monthly">Deliver Monthly</option>
                                        </select>

                                        {sub && (
                                            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                                                Next delivery: <strong style={{ color: "var(--color-text)" }}>{new Date(sub.nextDeliveryDate).toLocaleDateString()}</strong>
                                            </div>
                                        )}

                                        <button 
                                            className="btn btn-secondary" 
                                            style={{ width: "100%", marginTop: "16px", padding: "10px" }}
                                            onClick={() => {
                                                // Handle instant checkout logic here if needed
                                                toast("Checkout feature coming soon!", { icon: "🛒" });
                                            }}
                                        >
                                            Order Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
