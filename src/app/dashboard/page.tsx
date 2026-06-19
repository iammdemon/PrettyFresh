"use client";

import React, { useState, useEffect } from "react";
import { 
    User, Mail, Phone, MapPin, ShoppingBag, Award, Clock, 
    ArrowLeft, LogOut, CheckCircle, Package, Truck, Smile, RefreshCw
} from "lucide-react";
import { toBanglaNumber, toBanglaPrice } from "@/lib/bangla";

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    gender?: string;
    dob?: string;
    address: string;
    provider?: string;
}

export default function CustomerDashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses">("overview");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("prettyfresh_user");
            if (saved) {
                try {
                    setUser(JSON.parse(saved));
                } catch (e) {
                    console.error("Error parsing user context:", e);
                }
            } else {
                // Fallback default mock user details for preview
                setUser({
                    name: "Sajib Hassan",
                    email: "sajib.hassan@example.com",
                    phone: "01712345678",
                    avatar: "/assets/default-avatar.png",
                    gender: "Male",
                    dob: "1994-06-12",
                    address: "Flat 4B, Building 12, Gulshan 2 Central Park Road, Dhaka",
                    provider: "Google (Demo Session)"
                });
            }
        }
    }, []);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("prettyfresh_user");
            window.location.href = "/auth";
        }
    };

    if (!user) return null;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", fontFamily: "var(--font-inter), sans-serif" }}>
            {/* Header */}
            <header style={{ 
                position: "sticky", 
                top: 0, 
                backgroundColor: "var(--color-white)", 
                borderBottom: "1px solid var(--color-border)",
                zIndex: 100,
                boxShadow: "var(--shadow-sm)"
            }}>
                <div className="container" style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    height: "70px" 
                }}>
                    <a href="/" className="logo" style={{ fontSize: "1.35rem" }}>
                        <span className="logo-icon" style={{ width: "32px", height: "32px", borderRadius: "8px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </span>
                        <span className="logo-text">Pretty<span>Fresh</span></span>
                    </a>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <button 
                            className="btn btn-secondary" 
                            style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                            onClick={() => window.location.href = "/"}
                        >
                            <ArrowLeft size={16} />
                            <span>Shop Home</span>
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            style={{ padding: "8px 16px", fontSize: "0.9rem", color: "#d32f2f", borderColor: "#ffcdd2" }}
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Container */}
            <main className="container" style={{ padding: "40px 24px" }}>
                
                {/* Greeting Hero */}
                <div style={{ 
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                    borderRadius: "var(--radius-lg)",
                    padding: "32px",
                    color: "white",
                    marginBottom: "32px",
                    boxShadow: "var(--shadow-md)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <span style={{ 
                            textTransform: "uppercase", 
                            fontSize: "0.75rem", 
                            fontWeight: 800, 
                            letterSpacing: "1px",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            display: "inline-block",
                            marginBottom: "12px"
                        }}>
                            PRETTYFRESH GREEN CLUB • GOLD
                        </span>
                        <h1 style={{ color: "white", fontSize: "2rem", marginBottom: "8px" }}>
                            Welcome back, {user.name}!
                        </h1>
                        <p style={{ opacity: 0.9, maxWidth: "600px", fontSize: "1rem" }}>
                            Your fresh groceries are just one tap away. You currently have <strong style={{ color: "#E8F5E9" }}>{toBanglaNumber("1,240")} green points</strong>. Use them at checkout to claim premium vegetable boxes.
                        </p>
                    </div>
                    {/* Decorative abstract pattern */}
                    <div style={{ 
                        position: "absolute", 
                        right: "-50px", 
                        bottom: "-50px", 
                        width: "250px", 
                        height: "250px", 
                        borderRadius: "50%", 
                        background: "rgba(255,255,255,0.06)",
                        zIndex: 1
                    }}></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
                    {/* Responsive Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
                        
                        {/* 1. Account Summary Card */}
                        <div style={{ 
                            backgroundColor: "var(--color-white)", 
                            borderRadius: "var(--radius-md)", 
                            padding: "24px",
                            boxShadow: "var(--shadow-sm)",
                            border: "1px solid var(--color-border)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                                <div style={{ 
                                    width: "64px", 
                                    height: "64px", 
                                    borderRadius: "50%", 
                                    backgroundColor: "var(--color-primary-light)",
                                    color: "var(--color-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden"
                                }}>
                                    {user.avatar && user.avatar !== "/assets/default-avatar.png" ? (
                                        <img src={user.avatar} alt="Profile photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <User size={32} />
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.2rem", color: "var(--color-text)" }}>{user.name}</h3>
                                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                                        Logged in via {user.provider || "Email/Password"}
                                    </span>
                                </div>
                            </div>
                            
                            <hr style={{ border: 0, height: "1px", backgroundColor: "var(--color-border)", marginBottom: "20px" }} />

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Mail size={16} className="icon-green" />
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Email Address</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Phone size={16} className="icon-green" />
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Mobile Number</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user.phone || "Not Configured"}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <MapPin size={16} className="icon-green" />
                                    <div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Primary Address</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user.address}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Live Order Tracker Card */}
                        <div style={{ 
                            backgroundColor: "var(--color-white)", 
                            borderRadius: "var(--radius-md)", 
                            padding: "24px",
                            boxShadow: "var(--shadow-sm)",
                            border: "1px solid var(--color-border)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "1.1rem" }}>Active Order Status</h3>
                                <span style={{ 
                                    backgroundColor: "var(--color-accent-light)", 
                                    color: "var(--color-primary)", 
                                    fontSize: "0.75rem", 
                                    fontWeight: 700,
                                    padding: "4px 8px",
                                    borderRadius: "4px"
                                }}>
                                    IN TRANSIT
                                </span>
                            </div>
                            
                            <div style={{ backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                    <span>Order ID: <strong>{toBanglaNumber("#PF-84920")}</strong></span>
                                    <span>Est. Delivery: <strong>{toBanglaNumber("15")} Mins</strong></span>
                                </div>
                            </div>

                            {/* Timeline steps */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
                                {/* Timeline line */}
                                <div style={{ 
                                    position: "absolute", 
                                    left: "17px", 
                                    top: "8px", 
                                    bottom: "8px", 
                                    width: "2px", 
                                    backgroundColor: "var(--color-primary-light)",
                                    zIndex: 1 
                                }}>
                                    <div style={{ height: "66%", width: "100%", backgroundColor: "var(--color-primary)" }}></div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 2 }}>
                                    <div style={{ 
                                        width: "36px", 
                                        height: "36px", 
                                        borderRadius: "50%", 
                                        backgroundColor: "var(--color-primary)", 
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <CheckCircle size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Order Confirmed</div>
                                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Today, {toBanglaNumber("02:30")} PM</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 2 }}>
                                    <div style={{ 
                                        width: "36px", 
                                        height: "36px", 
                                        borderRadius: "50%", 
                                        backgroundColor: "var(--color-primary)", 
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <Package size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Quality Checked & Packed</div>
                                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Today, {toBanglaNumber("02:42")} PM</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 2 }}>
                                    <div style={{ 
                                        width: "36px", 
                                        height: "36px", 
                                        borderRadius: "50%", 
                                        backgroundColor: "var(--color-primary)", 
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <Truck size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Out for Delivery</div>
                                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Rider Sajid is heading to you</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Stats Cards Section */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        {[
                            { icon: <ShoppingBag size={24} />, title: "Total Orders", value: `${toBanglaNumber("18")} Completed` },
                            { icon: <Award size={24} />, title: "Loyalty Points", value: `${toBanglaNumber("1,240")} pts` },
                            { icon: <Clock size={24} />, title: "Saved Time", value: `${toBanglaNumber("9.2")} Hours` },
                            { icon: <Smile size={24} />, title: "Freshness Rating", value: `${toBanglaNumber("98")}% (Perfect)` }
                        ].map((stat, i) => (
                            <div key={i} style={{ 
                                backgroundColor: "var(--color-white)", 
                                borderRadius: "var(--radius-sm)", 
                                padding: "20px", 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "16px",
                                border: "1px solid var(--color-border)",
                                boxShadow: "var(--shadow-sm)"
                            }}>
                                <div style={{ color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "12px", borderRadius: "8px" }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{stat.title}</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. Past Orders Section */}
                    <div style={{ 
                        backgroundColor: "var(--color-white)", 
                        borderRadius: "var(--radius-md)", 
                        padding: "24px",
                        boxShadow: "var(--shadow-sm)",
                        border: "1px solid var(--color-border)"
                    }}>
                        <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Past Order History</h3>
                        
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)", fontWeight: 700 }}>
                                        <th style={{ padding: "12px" }}>Order ID</th>
                                        <th style={{ padding: "12px" }}>Items Purchased</th>
                                        <th style={{ padding: "12px" }}>Date</th>
                                        <th style={{ padding: "12px" }}>Total Price</th>
                                        <th style={{ padding: "12px" }}>Delivery Status</th>
                                        <th style={{ padding: "12px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: "#PF-79105", items: "Fresh Green Broccoli (1kg), Organic Farm Eggs (12pcs)", date: "June 12, 2026", price: 18.40, status: "Delivered" },
                                        { id: "#PF-72304", items: "Local Red Tomato (2kg), Sweet Malta (1.5kg), Organic Honey", date: "June 05, 2026", price: 24.10, status: "Delivered" },
                                        { id: "#PF-68492", items: "Fresh Spinach Bundle, Chicken Breast Boneless (1kg)", date: "May 28, 2026", price: 15.60, status: "Delivered" }
                                    ].map((o, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "16px 12px", fontWeight: 700 }}>{toBanglaNumber(o.id)}</td>
                                            <td style={{ padding: "16px 12px", color: "var(--color-text-muted)" }}>{toBanglaNumber(o.items)}</td>
                                            <td style={{ padding: "16px 12px" }}>{toBanglaNumber(o.date)}</td>
                                            <td style={{ padding: "16px 12px", fontWeight: 700 }}>{toBanglaPrice(o.price)}</td>
                                            <td style={{ padding: "16px 12px" }}>
                                                <span style={{ 
                                                    backgroundColor: "var(--color-primary-light)", 
                                                    color: "var(--color-primary)",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700
                                                }}>{o.status}</span>
                                            </td>
                                            <td style={{ padding: "16px 12px" }}>
                                                <button 
                                                    className="btn btn-secondary" 
                                                    style={{ padding: "6px 12px", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                                                    onClick={() => window.location.href = "/"}
                                                >
                                                    <RefreshCw size={12} />
                                                    Reorder
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
