"use client";

import React, { useState, useEffect } from "react";
import { 
    User, Mail, Phone, MapPin, ShoppingBag, Award, Clock, 
    ArrowLeft, LogOut, CheckCircle, Package, Truck, Smile, RefreshCw, Plus
} from "lucide-react";
import { toast } from "react-hot-toast";
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

import { useAuth } from "@/context/AuthContext";

export default function CustomerDashboard() {
    const { user, isLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses">("overview");
    const [orders, setOrders] = useState<any[]>([]);
    
    // Wallet States
    const [walletBalance, setWalletBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
    const [addAmount, setAddAmount] = useState("");
    const [bkashNumber, setBkashNumber] = useState("");
    const [bkashTrxId, setBkashTrxId] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                window.location.href = "/auth";
            } else if (!user.phone || user.phone === "" || !user.address || user.address === "Not Provided") {
                window.location.href = "/onboarding";
            }
        }
    }, [user, isLoading]);

    useEffect(() => {
        if (user && user.email) {
            fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrders(data.orders);
                    }
                })
                .catch(err => console.error("Error fetching orders:", err));
                
            fetchWalletData(user.email);
        }
    }, [user]);

    const fetchWalletData = (email: string) => {
        fetch(`/api/user/wallet?email=${encodeURIComponent(email)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setWalletBalance(data.walletBalance);
                    setTransactions(data.transactions);
                }
            })
            .catch(err => console.error("Error fetching wallet data:", err));
    };

    const handleAddMoney = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }
        if (!bkashNumber || !bkashTrxId) {
            toast.error("Please enter your bKash number and Transaction ID.");
            return;
        }
        
        setIsAdding(true);
        try {
            const res = await fetch("/api/user/wallet/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user!.email,
                    amount: addAmount,
                    type: "deposit",
                    description: "Added funds via bKash",
                    accountNumber: bkashNumber,
                    trxId: bkashTrxId
                })
            });
            const data = await res.json();
            if (data.success) {
                setTransactions([data.transaction, ...transactions]);
                setIsAddMoneyModalOpen(false);
                setAddAmount("");
                setBkashNumber("");
                setBkashTrxId("");
                toast.success("Deposit request submitted successfully! Funds will be added once approved by an admin.", { duration: 4000 });
            } else {
                toast.error(data.error || "Failed to submit request");
            }
        } catch (err) {
            console.error("Add money error:", err);
            toast.error("An error occurred");
        } finally {
            setIsAdding(false);
        }
    };

    const handleLogout = async () => {
        await logout();
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
                        <img src="/logo.png" alt="TAZA Logo" height="32" style={{ maxHeight: "32px", width: "auto" }} />
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
                        {(() => {
                            const activeOrder = orders.find(o => ["Pending", "Confirmed", "Packed", "In Transit"].includes(o.status));
                            
                            if (!activeOrder) {
                                return (
                                    <div style={{ 
                                        backgroundColor: "var(--color-white)", 
                                        borderRadius: "var(--radius-md)", 
                                        padding: "24px",
                                        boxShadow: "var(--shadow-sm)",
                                        border: "1px solid var(--color-border)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center"
                                    }}>
                                        <Package size={48} color="var(--color-text-muted)" style={{ marginBottom: "16px", opacity: 0.5 }} />
                                        <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>No Active Orders</h3>
                                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>You don't have any orders currently in progress.</p>
                                        <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={() => window.location.href = "/"}>Start Shopping</button>
                                    </div>
                                );
                            }

                            const statusMap: Record<string, number> = {
                                "Pending": 1,
                                "Confirmed": 2,
                                "Packed": 3,
                                "In Transit": 4
                            };
                            
                            const progressIndex = statusMap[activeOrder.status] || 1;
                            const progressHeight = progressIndex === 1 ? "10%" : progressIndex === 2 ? "33%" : progressIndex === 3 ? "66%" : "100%";

                            return (
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
                                            borderRadius: "4px",
                                            textTransform: "uppercase"
                                        }}>
                                            {activeOrder.status}
                                        </span>
                                    </div>
                                    
                                    <div style={{ backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "20px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                            <span>Order ID: <strong>{toBanglaNumber(activeOrder.orderId)}</strong></span>
                                            <span>Date: <strong>{new Date(activeOrder.createdAt).toLocaleDateString()}</strong></span>
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
                                            <div style={{ height: progressHeight, width: "100%", backgroundColor: "var(--color-primary)", transition: "height 0.3s ease" }}></div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 2, opacity: progressIndex >= 1 ? 1 : 0.5 }}>
                                            <div style={{ 
                                                width: "36px", 
                                                height: "36px", 
                                                borderRadius: "50%", 
                                                backgroundColor: progressIndex >= 1 ? "var(--color-primary)" : "var(--color-bg)", 
                                                color: progressIndex >= 1 ? "white" : "var(--color-text-muted)",
                                                border: progressIndex >= 1 ? "none" : "2px solid var(--color-border)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Order Pending</div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Order received</span>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 2, opacity: progressIndex >= 2 ? 1 : 0.5 }}>
                                            <div style={{ 
                                                width: "36px", 
                                                height: "36px", 
                                                borderRadius: "50%", 
                                                backgroundColor: progressIndex >= 2 ? "var(--color-primary)" : "var(--color-bg)", 
                                                color: progressIndex >= 2 ? "white" : "var(--color-text-muted)",
                                                border: progressIndex >= 2 ? "none" : "2px solid var(--color-border)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <CheckCircle size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Order Confirmed</div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Preparing your items</span>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 2, opacity: progressIndex >= 3 ? 1 : 0.5 }}>
                                            <div style={{ 
                                                width: "36px", 
                                                height: "36px", 
                                                borderRadius: "50%", 
                                                backgroundColor: progressIndex >= 3 ? "var(--color-primary)" : "var(--color-bg)", 
                                                color: progressIndex >= 3 ? "white" : "var(--color-text-muted)",
                                                border: progressIndex >= 3 ? "none" : "2px solid var(--color-border)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Quality Checked & Packed</div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Ready for dispatch</span>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 2, opacity: progressIndex >= 4 ? 1 : 0.5 }}>
                                            <div style={{ 
                                                width: "36px", 
                                                height: "36px", 
                                                borderRadius: "50%", 
                                                backgroundColor: progressIndex >= 4 ? "var(--color-primary)" : "var(--color-bg)", 
                                                color: progressIndex >= 4 ? "white" : "var(--color-text-muted)",
                                                border: progressIndex >= 4 ? "none" : "2px solid var(--color-border)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <Truck size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Out for Delivery</div>
                                                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                                    {activeOrder.riderName 
                                                        ? `Rider ${activeOrder.riderName} is heading to you (${!activeOrder.riderPhone || activeOrder.riderPhone === "Not Configured" ? "Number Unavailable" : `Call: ${toBanglaNumber(activeOrder.riderPhone)}`})` 
                                                        : "Heading to you"
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* 3. Monthly Bazaar Card */}
                        <div style={{ 
                            backgroundColor: "var(--color-white)", 
                            borderRadius: "var(--radius-md)", 
                            padding: "24px",
                            boxShadow: "var(--shadow-sm)",
                            border: "1px solid var(--color-border)",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ 
                                    width: "48px", 
                                    height: "48px", 
                                    borderRadius: "12px", 
                                    backgroundColor: "rgba(139, 195, 74, 0.15)", // Lime accent
                                    color: "var(--color-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem" }}>Monthly Bazaar Builder</h3>
                                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Automate your grocery</span>
                                </div>
                            </div>
                            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "20px", flex: 1 }}>
                                Create your monthly grocery template. You can upload a handwritten list using our AI or build it manually, then set it to auto-deliver.
                            </p>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button 
                                    onClick={() => window.location.href = "/dashboard/bazaar"}
                                    className="btn btn-secondary" 
                                    style={{ flex: 1, padding: "10px", fontSize: "0.9rem" }}
                                >
                                    My Bazaars
                                </button>
                                <button 
                                    onClick={() => window.location.href = "/bazaar"}
                                    className="btn btn-primary" 
                                    style={{ flex: 1, padding: "10px", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                >
                                    <Plus size={16} /> New List
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Stats Cards Section */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                        {[
                            { icon: <ShoppingBag size={24} />, title: "Total Orders", value: `${toBanglaNumber(orders.length.toString())}` },
                            { icon: <Award size={24} />, title: "Loyalty Points", value: `${toBanglaNumber("1,240")} pts` },
                            { icon: <Clock size={24} />, title: "Total Spent", value: `${toBanglaPrice(orders.reduce((sum, o) => sum + o.total, 0))}` },
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

                    {/* 2.5 Wallet Section */}
                    <div style={{ 
                        backgroundColor: "var(--color-white)", 
                        borderRadius: "var(--radius-md)", 
                        padding: "24px",
                        boxShadow: "var(--shadow-sm)",
                        border: "1px solid var(--color-border)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                My Wallet
                            </h3>
                            <button 
                                className="btn btn-primary" 
                                style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                                onClick={() => setIsAddMoneyModalOpen(true)}
                            >
                                <Plus size={16} />
                                ADD Money
                            </button>
                        </div>
                        
                        <div style={{ 
                            background: "linear-gradient(135deg, #f1f8e9, #c8e6c9)", 
                            borderRadius: "var(--radius-sm)", 
                            padding: "24px", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            marginBottom: "24px",
                            border: "1px solid #a5d6a7"
                        }}>
                            <div>
                                <span style={{ fontSize: "0.85rem", color: "#2e7d32", fontWeight: 700, textTransform: "uppercase" }}>Available Balance</span>
                                <h2 style={{ fontSize: "2rem", margin: "8px 0 0 0", color: "#1b5e20" }}>{toBanglaPrice(walletBalance)}</h2>
                            </div>
                        </div>

                        {transactions.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <h4 style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Recent Transactions</h4>
                                {transactions.slice(0, 5).map((txn, idx) => (
                                    <div key={idx} style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center", 
                                        padding: "12px", 
                                        backgroundColor: "var(--color-bg)", 
                                        borderRadius: "var(--radius-sm)" 
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)", textTransform: "capitalize" }}>{txn.type}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "4px" }}>{txn.description} • {new Date(txn.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: txn.status === "pending" ? "#f57c00" : (["deposit", "cashback", "refund"].includes(txn.type) ? "var(--color-primary)" : "#d32f2f") }}>
                                            {txn.status === "pending" ? "(Pending)" : (["deposit", "cashback", "refund"].includes(txn.type) ? "+" : "-")} {toBanglaPrice(txn.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)" }}>
                                No wallet transactions yet.
                            </div>
                        )}
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
                                    {orders.length > 0 ? orders.map((o, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "16px 12px", fontWeight: 700 }}>{toBanglaNumber(o.orderId)}</td>
                                            <td style={{ padding: "16px 12px", color: "var(--color-text-muted)" }}>
                                                {o.items.map((item: any) => `${item.name} (${item.weight})`).join(", ")}
                                            </td>
                                            <td style={{ padding: "16px 12px" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: "16px 12px", fontWeight: 700 }}>{toBanglaPrice(o.total)}</td>
                                            <td style={{ padding: "16px 12px" }}>
                                                <span style={{ 
                                                    backgroundColor: o.status === "Delivered" ? "var(--color-primary-light)" : o.status === "Cancelled" ? "#ffcdd2" : "var(--color-accent-light)", 
                                                    color: o.status === "Delivered" ? "var(--color-primary)" : o.status === "Cancelled" ? "#d32f2f" : "var(--color-text)",
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
                                    )) : (
                                        <tr>
                                            <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                                No past orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </main>

            {/* Add Money Modal */}
            {isAddMoneyModalOpen && (
                <div style={{ 
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
                }}>
                    <div style={{ 
                        backgroundColor: "white", padding: "32px", borderRadius: "var(--radius-lg)", 
                        width: "100%", maxWidth: "400px", position: "relative"
                    }}>
                        <button 
                            onClick={() => setIsAddMoneyModalOpen(false)}
                            style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}
                        >
                            <LogOut size={20} />
                        </button>
                        <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>ADD Money via bKash</h2>
                        <div style={{ backgroundColor: "var(--color-bg-light)", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                                1. Go to your bKash App and select <strong>Send Money</strong>
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>
                                2. Send the desired amount to our Official Merchant Number: <strong style={{ color: "var(--color-text)", fontSize: "0.9rem" }}>01700-000000</strong>
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                                3. Copy the <strong>Transaction ID (TrxID)</strong> and fill out the form below.
                            </p>
                        </div>
                        
                        <form onSubmit={handleAddMoney} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Sent Amount (৳)</label>
                                <input 
                                    type="number" 
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="e.g. 500"
                                    min="1"
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "1rem", outline: "none" }}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Your bKash Account Number</label>
                                <input 
                                    type="tel" 
                                    value={bkashNumber}
                                    onChange={(e) => setBkashNumber(e.target.value)}
                                    placeholder="e.g. 017XXXXXXXX"
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "1rem", outline: "none" }}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Transaction ID (TrxID)</label>
                                <input 
                                    type="text" 
                                    value={bkashTrxId}
                                    onChange={(e) => setBkashTrxId(e.target.value)}
                                    placeholder="e.g. 8K42LMP9A"
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "1rem", outline: "none" }}
                                    required
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isAdding}
                                className="btn btn-primary" 
                                style={{ width: "100%", padding: "14px", fontSize: "1rem", marginTop: "8px" }}
                            >
                                {isAdding ? "Submitting..." : "Submit Payment Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
