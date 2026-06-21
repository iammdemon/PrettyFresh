"use client";

import React, { useState, useEffect } from "react";
import { 
    User, MapPin, Package, Truck, CheckCircle,
    ArrowLeft, LogOut, Phone, Navigation, RefreshCw, AlertTriangle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { toBanglaNumber, toBanglaPrice } from "@/lib/bangla";
import { useAuth } from "@/context/AuthContext";

export default function RiderDashboard() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [newPhone, setNewPhone] = useState("");
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

    const { user: authUser, isLoading, refreshUser, logout } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (authUser) {
                if (authUser.role === "rider" || authUser.role === "super_admin") {
                    setUser(authUser);
                    fetchOrders(authUser.id!);
                } else {
                    toast.error("Access Denied: Rider privileges required.");
                    window.location.href = "/";
                }
            } else {
                window.location.href = "/auth";
            }
        }
    }, [authUser, isLoading]);

    const fetchOrders = async (riderId: string) => {
        try {
            const res = await fetch(`/api/orders?riderId=${riderId}`);
            const data = await res.json();
            if (data.success) {
                // Filter to show active orders that this rider needs to deliver
                const active = data.orders.filter((o: any) => ["Packed", "In Transit"].includes(o.status));
                const delivered = data.orders.filter((o: any) => o.status === "Delivered");
                // For simplicity, let's just show active ones first, then delivered ones.
                setOrders([...active, ...delivered]);
            }
        } catch (err) {
            console.error("Error fetching rider orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
                toast.success(`Order marked as ${status}!`);
            } else {
                toast.error("Failed to update status: " + data.error);
            }
        } catch (err) {
            console.error("Error updating order status:", err);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    if (loading || !user) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
                <div style={{ textAlign: "center", color: "var(--color-primary)" }}>
                    <RefreshCw size={40} className="animate-spin" style={{ margin: "0 auto 16px" }} />
                    <p style={{ fontWeight: 600 }}>Loading Rider Workspace...</p>
                </div>
            </div>
        );
    }

    const activeDeliveries = orders.filter(o => ["Packed", "In Transit"].includes(o.status));
    const completedDeliveries = orders.filter(o => o.status === "Delivered");

    const handleUpdateProfileClick = async () => {
        if (!newPhone || newPhone.trim() === "") {
            toast.error("Please enter a valid phone number.");
            return;
        }
        
        setIsUpdatingPhone(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name,
                    phone: newPhone.trim(),
                    gender: user.gender,
                    dob: user.dob,
                    address: user.address,
                    avatar: user.avatar
                })
            });
            const data = await res.json();
            if (data.success) {
                // Update local state without reloading
                setUser((prev: any) => ({ ...prev, phone: newPhone.trim() }));
                refreshUser(); // re-fetch the user details from /api/auth/me
                setShowPhoneModal(false);
                toast.success("Profile updated successfully!");
            } else {
                toast.error("Failed to update profile: " + data.error);
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setIsUpdatingPhone(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", fontFamily: "var(--font-inter), sans-serif", paddingBottom: "40px" }}>
            {/* Header */}
            <header style={{ 
                position: "sticky", 
                top: 0, 
                backgroundColor: "var(--color-primary)", 
                color: "white",
                zIndex: 100,
                boxShadow: "var(--shadow-md)"
            }}>
                <div className="container" style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    height: "70px",
                    padding: "0 24px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Truck size={28} />
                        <h1 style={{ fontSize: "1.35rem", margin: 0, fontWeight: 800 }}>Rider Console</h1>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                            <User size={16} /> {user.name}
                        </span>
                        <button 
                            className="btn" 
                            style={{ padding: "8px 16px", fontSize: "0.9rem", backgroundColor: "rgba(255,255,255,0.2)", color: "white", border: "none" }}
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: "32px 24px", maxWidth: "900px", margin: "0 auto" }}>
                
                {(!user.phone || user.phone.trim() === "") && (
                    <div style={{ 
                        backgroundColor: "#FFF3CD", 
                        border: "1px solid #FFEEBA", 
                        color: "#856404", 
                        padding: "16px 20px", 
                        borderRadius: "var(--radius-md)", 
                        marginBottom: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <AlertTriangle size={24} color="#856404" />
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>আপনার প্রফাইল আপডেট করুন</div>
                                <div style={{ fontSize: "0.9rem" }}>গ্রাহকদের সাথে যোগাযোগের জন্য আপনার মোবাইল নাম্বার প্রয়োজন। (Phone number is required to contact customers.)</div>
                            </div>
                        </div>
                        <button 
                            className="btn btn-primary" 
                            style={{ backgroundColor: "#856404", color: "white", padding: "8px 24px", whiteSpace: "nowrap", border: "none" }}
                            onClick={() => {
                                setNewPhone(user.phone || "");
                                setShowPhoneModal(true);
                            }}
                        >
                            Update Profile
                        </button>
                    </div>
                )}

                {/* Phone Update Modal */}
                {showPhoneModal && (
                    <div style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px"
                    }}>
                        <div style={{
                            backgroundColor: "var(--color-bg)",
                            borderRadius: "var(--radius-lg)",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "400px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                        }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px", color: "var(--color-text)" }}>Update Phone Number</h3>
                            <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "24px" }}>
                                আপনার মোবাইল নাম্বার লিখুন। গ্রাহকদের সাথে যোগাযোগের জন্য এটি প্রয়োজন।
                            </p>
                            
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--color-text)" }}>
                                    Mobile Number
                                </label>
                                <div style={{ position: "relative" }}>
                                    <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                                    <input 
                                        type="tel" 
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="e.g. 01700000000"
                                        style={{
                                            width: "100%",
                                            padding: "12px 12px 12px 40px",
                                            borderRadius: "var(--radius-sm)",
                                            border: "1px solid var(--color-border)",
                                            fontSize: "1rem",
                                            backgroundColor: "var(--color-white)",
                                            outline: "none"
                                        }}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                                <button 
                                    className="btn" 
                                    style={{ padding: "10px 20px", backgroundColor: "transparent", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                                    onClick={() => setShowPhoneModal(false)}
                                    disabled={isUpdatingPhone}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    style={{ padding: "10px 24px" }}
                                    onClick={handleUpdateProfileClick}
                                    disabled={isUpdatingPhone}
                                >
                                    {isUpdatingPhone ? "Saving..." : "Save Number"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                    <div style={{ backgroundColor: "var(--color-white)", borderRadius: "var(--radius-md)", padding: "20px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        <div style={{ color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "12px", borderRadius: "8px" }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Active Deliveries</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{toBanglaNumber(activeDeliveries.length.toString())}</div>
                        </div>
                    </div>
                    <div style={{ backgroundColor: "var(--color-white)", borderRadius: "var(--radius-md)", padding: "20px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        <div style={{ color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "12px", borderRadius: "8px" }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Completed Today</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{toBanglaNumber(completedDeliveries.length.toString())}</div>
                        </div>
                    </div>
                </div>

                <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Navigation size={20} className="icon-green" /> 
                    Assigned Deliveries
                </h2>

                {activeDeliveries.length === 0 ? (
                    <div style={{ 
                        backgroundColor: "var(--color-white)", 
                        padding: "40px", 
                        borderRadius: "var(--radius-md)", 
                        textAlign: "center",
                        border: "1px solid var(--color-border)"
                    }}>
                        <Truck size={48} color="var(--color-text-muted)" style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                        <h3 style={{ fontSize: "1.2rem", color: "var(--color-text)" }}>No Active Deliveries</h3>
                        <p style={{ color: "var(--color-text-muted)" }}>You don't have any pending assignments. Relax for a bit!</p>
                        <button className="btn btn-secondary" style={{ marginTop: "16px" }} onClick={() => fetchOrders(user.id)}>
                            <RefreshCw size={16} /> Refresh Console
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {activeDeliveries.map(order => (
                            <div key={order._id} style={{ 
                                backgroundColor: "var(--color-white)", 
                                borderRadius: "var(--radius-md)", 
                                overflow: "hidden",
                                border: "1px solid var(--color-border)",
                                boxShadow: "var(--shadow-md)"
                            }}>
                                {/* Order Header */}
                                <div style={{ 
                                    padding: "16px 20px", 
                                    backgroundColor: "var(--color-bg)", 
                                    borderBottom: "1px solid var(--color-border)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{toBanglaNumber(order.orderId)}</div>
                                    <span style={{ 
                                        backgroundColor: order.status === "In Transit" ? "var(--color-accent-light)" : "var(--color-primary-light)", 
                                        color: order.status === "In Transit" ? "var(--color-text)" : "var(--color-primary)",
                                        padding: "4px 10px",
                                        borderRadius: "100px",
                                        fontSize: "0.8rem",
                                        fontWeight: 800,
                                        textTransform: "uppercase"
                                    }}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Order Details */}
                                <div style={{ padding: "20px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                                        <div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>Customer Name</div>
                                            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{order.customerName}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>Customer Phone</div>
                                            <div style={{ fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <Phone size={16} className="icon-green" /> 
                                                <a href={`tel:${order.customerPhone}`} style={{ color: "inherit", textDecoration: "none" }}>{toBanglaNumber(order.customerPhone)}</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "20px" }}>
                                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Delivery Address</div>
                                        <div style={{ display: "flex", gap: "12px", backgroundColor: "var(--color-bg)", padding: "16px", borderRadius: "var(--radius-sm)" }}>
                                            <MapPin size={24} className="icon-green" style={{ flexShrink: 0 }} />
                                            <div style={{ fontWeight: 600, lineHeight: 1.5 }}>
                                                {order.address}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "20px" }}>
                                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Payment Information</div>
                                        <div style={{ 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            alignItems: "center", 
                                            backgroundColor: order.paymentMethod === "COD" ? "#FFF3CD" : "var(--color-primary-light)", 
                                            padding: "16px", 
                                            borderRadius: "var(--radius-sm)",
                                            border: `1px solid ${order.paymentMethod === "COD" ? "#FFEEBA" : "var(--color-primary)"}`
                                        }}>
                                            <div style={{ fontWeight: 700, color: order.paymentMethod === "COD" ? "#856404" : "var(--color-primary)" }}>
                                                {order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid via Wallet"}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: order.paymentMethod === "COD" ? "#856404" : "var(--color-primary)" }}>
                                                {order.paymentMethod === "COD" ? `Collect: ${toBanglaPrice(order.total)}` : "No Collection"}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "24px" }}>
                                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Items to Deliver</div>
                                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {order.items.map((item: any, i: number) => (
                                                <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", paddingBottom: "8px", borderBottom: "1px dashed var(--color-border)" }}>
                                                    <span>{item.name} ({toBanglaNumber(item.weight)})</span>
                                                    <span style={{ fontWeight: 700 }}>x{toBanglaNumber(item.quantity.toString())}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: "flex", gap: "16px" }}>
                                        {order.status === "Packed" && (
                                            <button 
                                                className="btn" 
                                                style={{ flex: 1, backgroundColor: "var(--color-text)", color: "white", padding: "12px" }}
                                                onClick={() => handleUpdateStatus(order.orderId, "In Transit")}
                                            >
                                                <Truck size={18} /> Start Delivery
                                            </button>
                                        )}
                                        {order.status === "In Transit" && (
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ flex: 1, padding: "12px", fontSize: "1rem" }}
                                                onClick={() => handleUpdateStatus(order.orderId, "Delivered")}
                                            >
                                                <CheckCircle size={20} /> Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
