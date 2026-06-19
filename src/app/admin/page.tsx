"use client";

import React, { useState, useEffect } from "react";
import { 
    LayoutDashboard, ShoppingBag, Receipt, Users, LogOut, 
    Plus, Trash2, Edit, TrendingUp, CheckCircle, ArrowLeft,
    Shield, RefreshCw, X, CircleDot, AlertCircle, ShoppingCart, Award, Clock
} from "lucide-react";
import { toBanglaNumber, toBanglaPrice } from "@/lib/bangla";

interface ProductVariant {
    weight: string;
    price: number;
    discountPrice?: number;
}

interface Product {
    _id?: string;
    id?: string;
    name: string;
    category: string;
    image: string;
    variants: ProductVariant[];
    badge?: string;
    freshness?: string;
}

interface OrderItem {
    id: number;
    name: string;
    image: string;
    price: number;
    weight: string;
    quantity: number;
}

interface Order {
    _id?: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: "Pending" | "Confirmed" | "Packed" | "In Transit" | "Delivered" | "Cancelled";
    createdAt: string;
}

interface UserRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "super_admin" | "admin" | "customer";
    provider: string;
    createdAt: string;
}

interface Category {
    _id: string;
    name: string;
    code: string;
}

export default function AdminDashboard() {
    const [adminUser, setAdminUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "users">("overview");
    const [loading, setLoading] = useState(true);

    // Dynamic Lists
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Product Modal State
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [prodForm, setProdForm] = useState({
        name: "",
        category: "vegetables",
        image: "",
        variants: [{ weight: "1kg", price: "", discountPrice: "" }],
        badge: "",
        freshness: "Morning Harvest"
    });

    // Security Verification on Client Mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("prettyfresh_user");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const isAuthorized = parsed.role === "super_admin" || parsed.role === "admin";
                    
                    if (isAuthorized) {
                        setAdminUser(parsed);
                        setLoading(false);
                    } else {
                        // Unauthorized - redirect home
                        alert("Access Denied: Admin privileges required.");
                        window.location.href = "/";
                    }
                } catch (e) {
                    window.location.href = "/auth";
                }
            } else {
                window.location.href = "/auth";
            }
        }
    }, []);

    // Load Tab Data
    useEffect(() => {
        if (loading) return;
        
        const loadData = async () => {
            try {
                // Fetch Products
                const resProd = await fetch("/api/products");
                const dataProd = await resProd.json();
                if (dataProd.success) setProducts(dataProd.products);

                // Fetch Orders
                const resOrd = await fetch("/api/orders");
                const dataOrd = await resOrd.json();
                if (dataOrd.success) setOrders(dataOrd.orders);

                // Fetch Users
                const resUsers = await fetch("/api/admin/users");
                const dataUsers = await resUsers.json();
                if (dataUsers.success) setUsers(dataUsers.users);

                // Fetch Categories
                const resCat = await fetch("/api/categories");
                const dataCat = await resCat.json();
                if (dataCat.success) {
                    setCategories(dataCat.categories);
                    if (dataCat.categories.length > 0) {
                        setProdForm(prev => ({ ...prev, category: dataCat.categories[0]._id }));
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            }
        };

        loadData();
    }, [loading, activeTab]);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("prettyfresh_user");
            window.location.href = "/auth";
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setProdForm(prev => ({ ...prev, image: data.url }));
            } else {
                alert("Failed to upload image: " + data.error);
            }
        } catch (err) {
            console.error("Image upload failed:", err);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploadingImage(false);
        }
    };

    // --- PRODUCT CRUD ACTIONS ---
    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...prodForm,
            variants: prodForm.variants.map(v => ({
                weight: v.weight,
                price: Number(v.price),
                discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined
            })).filter(v => v.weight && !isNaN(v.price))
        };

        try {
            let res;
            if (editingProduct) {
                // Update
                res = await fetch("/api/products", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, _id: editingProduct._id, id: editingProduct.id })
                });
            } else {
                // Create
                res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();
            if (data.success) {
                setProductModalOpen(false);
                setEditingProduct(null);
                setProdForm({ name: "", category: "vegetables", image: "", variants: [{ weight: "1kg", price: "", discountPrice: "" }], badge: "", freshness: "Morning Harvest" });
                
                // Refresh list
                const refreshRes = await fetch("/api/products");
                const refreshData = await refreshRes.json();
                if (refreshData.success) setProducts(refreshData.products);
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            console.error("Product submission failed:", err);
        }
    };

    const startAddProduct = () => {
        setEditingProduct(null);
        setProdForm({
            name: "",
            category: "vegetables",
            image: "",
            variants: [{ weight: "1kg", price: "", discountPrice: "" }],
            badge: "",
            freshness: "Morning Harvest"
        });
        setProductModalOpen(true);
    };

    const startEditProduct = (prod: Product) => {
        setEditingProduct(prod);
        setProdForm({
            name: prod.name,
            category: prod.category,
            image: prod.image,
            variants: prod.variants && prod.variants.length > 0 
                ? prod.variants.map(v => ({ weight: v.weight, price: String(v.price), discountPrice: v.discountPrice ? String(v.discountPrice) : "" }))
                : [{ weight: "1kg", price: "", discountPrice: "" }],
            badge: prod.badge || "",
            freshness: prod.freshness || "Morning Harvest"
        });
        setProductModalOpen(true);
    };

    const handleDeleteProduct = async (prod: Product) => {
        if (!confirm(`Are you sure you want to delete "${prod.name}"?`)) return;
        
        try {
            const res = await fetch(`/api/products?${prod._id ? `_id=${prod._id}` : `id=${prod.id}`}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setProducts(prev => prev.filter(p => p.id !== prod.id && p._id !== prod._id));
            } else {
                alert("Failed to delete product: " + data.error);
            }
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    // --- CATEGORY CRUD ACTIONS ---
    const openCategoryModal = () => {
        setNewCategoryName("");
        setCategoryModalOpen(true);
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newCategoryName;
        if (!name || name.trim() === "") return;
        
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setCategories([...categories, data.category]);
                setProdForm(prev => ({ ...prev, category: data.category._id }));
                setCategoryModalOpen(false);
            } else {
                alert("Failed to create category: " + data.error);
            }
        } catch (err) {
            console.error("Error creating category:", err);
            alert("Error creating category.");
        }
    };

    // --- ORDER STATUS ACTIONS ---
    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: status as any } : o));
            } else {
                alert("Failed to update status: " + data.error);
            }
        } catch (err) {
            console.error("Error updating order status:", err);
        }
    };

    // --- USER ROLE MANAGEMENT ACTIONS ---
    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, role: newRole })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            } else {
                alert("Failed to change user permission: " + data.error);
            }
        } catch (err) {
            console.error("Error updating user role:", err);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
                <div style={{ textAlign: "center", color: "var(--color-primary)" }}>
                    <RefreshCw size={40} className="animate-spin" style={{ margin: "0 auto 16px" }} />
                    <p style={{ fontWeight: 600 }}>Loading admin workspace...</p>
                </div>
            </div>
        );
    }

    // Calculations for overview stats
    const totalSales = orders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);
    const totalPending = orders.filter(o => o.status === "Pending" || o.status === "Confirmed" || o.status === "Packed" || o.status === "In Transit").length;

    return (
        <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--color-bg)", fontFamily: "var(--font-inter), sans-serif" }}>
            
            {/* Sidebar Navigation */}
            <aside style={{
                width: "280px",
                backgroundColor: "var(--color-white)",
                borderRight: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                zIndex: 50
            }}>
                {/* Logo Section */}
                <div style={{ padding: "24px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <a href="/" className="logo" style={{ fontSize: "1.35rem", textDecoration: "none" }}>
                        <span className="logo-icon" style={{ width: "32px", height: "32px", borderRadius: "8px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </span>
                        <span className="logo-text">Pretty<span>Fresh</span></span>
                    </a>
                </div>

                {/* Profile Widget */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {adminUser.avatar && adminUser.avatar !== "/assets/default-avatar.png" ? (
                            <img src={adminUser.avatar} alt="Admin avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <Shield size={20} />
                        )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {adminUser.name}
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 700, textTransform: "uppercase" }}>
                            {adminUser.role === "super_admin" ? "Super Admin" : "System Admin"}
                        </span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                    <button 
                        onClick={() => setActiveTab("overview")}
                        className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <LayoutDashboard size={18} />
                        <span>Overview</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("products")}
                        className={`btn ${activeTab === "products" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <ShoppingBag size={18} />
                        <span>Products Catalog</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("orders")}
                        className={`btn ${activeTab === "orders" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <Receipt size={18} />
                        <span>Orders Tracking</span>
                        {totalPending > 0 && (
                            <span style={{ marginLeft: "auto", fontSize: "0.75rem", backgroundColor: "var(--color-accent)", color: "var(--color-primary)", padding: "2px 6px", borderRadius: "100px", fontWeight: 800 }}>
                                {toBanglaNumber(totalPending)}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab("users")}
                        className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <Users size={18} />
                        <span>Role Permissions</span>
                    </button>
                </nav>

                {/* Footer Exit actions */}
                <div style={{ padding: "24px 16px", borderTop: "1px solid var(--color-border)" }}>
                    <button onClick={() => window.location.href = "/"} className="btn btn-secondary" style={{ width: "100%", padding: "10px 16px", gap: "8px", marginBottom: "8px" }}>
                        <ArrowLeft size={16} />
                        <span>Return to Store</span>
                    </button>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: "100%", padding: "10px 16px", gap: "8px", color: "#d32f2f", borderColor: "#ffcdd2" }}>
                        <LogOut size={16} />
                        <span>Log Out Workspace</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Pane */}
            <main style={{ marginLeft: "280px", flexGrow: 1, padding: "40px" }}>
                
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>
                            WORKSPACE BOARD / {activeTab}
                        </span>
                        <h1 style={{ fontSize: "2rem", margin: "4px 0 0" }}>
                            {activeTab === "overview" && "Dashboard Analytics"}
                            {activeTab === "products" && "Inventory Management"}
                            {activeTab === "orders" && "Fulfillment Operations"}
                            {activeTab === "users" && "User Role Settings"}
                        </h1>
                    </div>
                    {activeTab === "products" && (
                        <button className="btn btn-primary" onClick={startAddProduct}>
                            <Plus size={18} />
                            <span>Add New Product</span>
                        </button>
                    )}
                </div>

                {/* TAB WINDOWS */}
                {activeTab === "overview" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        
                        {/* Summary Widget Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                            {[
                                { icon: <TrendingUp size={24} />, title: "Gross Revenue", value: toBanglaPrice(totalSales) },
                                { icon: <Receipt size={24} />, title: "Customer Orders", value: `${toBanglaNumber(orders.length)} Transactions` },
                                { icon: <ShoppingBag size={24} />, title: "Catalog Items", value: `${toBanglaNumber(products.length)} Products` },
                                { icon: <Users size={24} />, title: "Registered Accounts", value: `${toBanglaNumber(users.length)} Customers` }
                            ].map((stat, i) => (
                                <div key={i} style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", display: "flex", gap: "16px", alignItems: "center" }}>
                                    <div style={{ color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)", padding: "12px", borderRadius: "8px" }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{stat.title}</div>
                                        <div style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: "2px" }}>{stat.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Revenue line chart */}
                        <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                            <h3 style={{ fontSize: "1.1rem", marginBottom: "20px" }}>Revenue Statistics Trend</h3>
                            <div style={{ width: "100%", height: "200px", position: "relative" }}>
                                <svg viewBox="0 0 500 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                                    <path 
                                        d="M0,130 C50,110 100,120 150,90 C200,60 250,80 300,50 C350,20 400,30 450,10 L500,5" 
                                        fill="none" 
                                        stroke="var(--color-primary)" 
                                        strokeWidth="4" 
                                        strokeLinecap="round" 
                                    />
                                    <path 
                                        d="M0,130 C50,110 100,120 150,90 C200,60 250,80 300,50 C350,20 400,30 450,10 L500,5 L500,150 L0,150 Z" 
                                        fill="url(#grad)" 
                                        opacity="0.15" 
                                    />
                                    <defs>
                                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="var(--color-primary)" />
                                            <stop offset="100%" stopColor="var(--color-white)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                                    <span>May 25</span>
                                    <span>June 01</span>
                                    <span>June 08</span>
                                    <span>June 15</span>
                                    <span>June 19 (Today)</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions list */}
                        <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                            <h3 style={{ fontSize: "1.1rem", marginBottom: "20px" }}>Latest Transactions Activity</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                                        <th style={{ padding: "12px" }}>Order ID</th>
                                        <th style={{ padding: "12px" }}>Customer Name</th>
                                        <th style={{ padding: "12px" }}>Cart Items</th>
                                        <th style={{ padding: "12px" }}>Total Cost</th>
                                        <th style={{ padding: "12px" }}>Fulfillment status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 5).map((o, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "14px 12px", fontWeight: 700 }}>{toBanglaNumber(o.orderId)}</td>
                                            <td style={{ padding: "14px 12px" }}>{o.customerName}</td>
                                            <td style={{ padding: "14px 12px", color: "var(--color-text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {o.items.map(item => `${item.name} (${toBanglaNumber(item.quantity)})`).join(", ")}
                                            </td>
                                            <td style={{ padding: "14px 12px", fontWeight: 700 }}>{toBanglaPrice(o.total)}</td>
                                            <td style={{ padding: "14px 12px" }}>
                                                <span style={{
                                                    backgroundColor: o.status === "Delivered" ? "var(--color-primary-light)" : "var(--color-accent-light)",
                                                    color: o.status === "Delivered" ? "var(--color-primary)" : "var(--color-text)",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 700
                                                }}>{o.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                                No order checkout events logged yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {activeTab === "products" && (
                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        
                        {/* Products Catalog Table */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                                        <th style={{ padding: "12px" }}>Image</th>
                                        <th style={{ padding: "12px" }}>Product Name</th>
                                        <th style={{ padding: "12px" }}>Category</th>
                                        <th style={{ padding: "12px" }}>Price</th>
                                        <th style={{ padding: "12px" }}>Discount Price</th>
                                        <th style={{ padding: "12px" }}>Weights</th>
                                        <th style={{ padding: "12px" }}>Badge</th>
                                        <th style={{ padding: "12px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p, idx) => {
                                        const weightsDisplay = p.variants ? p.variants.map(v => v.weight).join(", ") : "1kg";
                                        const mainPrice = p.variants && p.variants.length > 0 ? p.variants[0].price : 0;
                                        const mainDiscount = p.variants && p.variants.length > 0 ? p.variants[0].discountPrice : undefined;
                                        return (
                                            <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                                <td style={{ padding: "12px" }}>
                                                    <img src={p.image} alt={p.name} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                                                </td>
                                                <td style={{ padding: "12px", fontWeight: 700 }}>{p.name}</td>
                                                <td style={{ padding: "12px", textTransform: "capitalize" }}>
                                                    {categories.find(c => c._id === p.category || c.code === p.category)?.name || p.category}
                                                </td>
                                                <td style={{ padding: "12px", fontWeight: 700 }}>{toBanglaPrice(mainPrice)}</td>
                                                <td style={{ padding: "12px", color: "var(--color-text-muted)" }}>
                                                    {mainDiscount ? toBanglaPrice(mainDiscount) : "-"}
                                                </td>
                                                <td style={{ padding: "12px" }}>{toBanglaNumber(weightsDisplay)}</td>
                                                <td style={{ padding: "12px" }}>
                                                    {p.badge && (
                                                        <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                                            {p.badge}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => startEditProduct(p)} aria-label="Edit product">
                                                            <Edit size={14} />
                                                        </button>
                                                        <button className="btn btn-secondary" style={{ padding: "6px", color: "#d32f2f", borderColor: "#ffcdd2" }} onClick={() => handleDeleteProduct(p)} aria-label="Delete product">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {activeTab === "orders" && (
                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        
                        {/* Orders List Table */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                                        <th style={{ padding: "12px" }}>Order ID</th>
                                        <th style={{ padding: "12px" }}>Customer info</th>
                                        <th style={{ padding: "12px" }}>Delivery Address</th>
                                        <th style={{ padding: "12px" }}>Purchased Items</th>
                                        <th style={{ padding: "12px" }}>Total Amount</th>
                                        <th style={{ padding: "12px" }}>Status Transition</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "16px 12px", fontWeight: 700 }}>{toBanglaNumber(o.orderId)}</td>
                                            <td style={{ padding: "16px 12px" }}>
                                                <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                                                <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{o.customerPhone}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{o.customerEmail}</div>
                                            </td>
                                            <td style={{ padding: "16px 12px", maxWidth: "180px", fontSize: "0.85rem" }}>{o.address}</td>
                                            <td style={{ padding: "16px 12px", fontSize: "0.85rem" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                    {o.items.map((item, i) => (
                                                        <span key={i}>
                                                            • {item.name} ({toBanglaNumber(item.weight)}) x <strong>{toBanglaNumber(item.quantity)}</strong>
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ padding: "16px 12px", fontWeight: 700 }}>{toBanglaPrice(o.total)}</td>
                                            <td style={{ padding: "16px 12px" }}>
                                                <select 
                                                    value={o.status}
                                                    onChange={(e) => handleUpdateOrderStatus(o.orderId, e.target.value)}
                                                    style={{ 
                                                        padding: "6px 12px", 
                                                        borderRadius: "4px", 
                                                        border: "1px solid var(--color-border)",
                                                        backgroundColor: "var(--color-bg)",
                                                        fontWeight: 700,
                                                        fontSize: "0.85rem",
                                                        color: o.status === "Delivered" ? "var(--color-primary)" : o.status === "Cancelled" ? "#d32f2f" : "var(--color-text)"
                                                    }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Packed">Packed</option>
                                                    <option value="In Transit">In Transit</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                                No customer checkout orders recorded in the system.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {activeTab === "users" && (
                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        
                        {/* Users Accounts & Permissions Table */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                                        <th style={{ padding: "12px" }}>Customer Name</th>
                                        <th style={{ padding: "12px" }}>Email</th>
                                        <th style={{ padding: "12px" }}>Phone</th>
                                        <th style={{ padding: "12px" }}>Login Method</th>
                                        <th style={{ padding: "12px" }}>Role Designation</th>
                                        <th style={{ padding: "12px" }}>Fulfillment Access</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, idx) => {
                                        const isSuper = u.role === "super_admin";
                                        return (
                                            <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                                <td style={{ padding: "16px 12px", fontWeight: 700 }}>{u.name}</td>
                                                <td style={{ padding: "16px 12px" }}>{u.email}</td>
                                                <td style={{ padding: "16px 12px" }}>{toBanglaNumber(u.phone)}</td>
                                                <td style={{ padding: "16px 12px" }}>{u.provider}</td>
                                                <td style={{ padding: "16px 12px" }}>
                                                    <span style={{ 
                                                        backgroundColor: u.role === "super_admin" ? "#ffe0b2" : u.role === "admin" ? "#e8f5e9" : "var(--color-bg)",
                                                        color: u.role === "super_admin" ? "#e65100" : u.role === "admin" ? "var(--color-primary)" : "var(--color-text)",
                                                        padding: "4px 8px",
                                                        borderRadius: "4px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 700
                                                    }}>
                                                        {u.role === "super_admin" ? "Super Admin" : u.role === "admin" ? "Admin" : "Customer"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "16px 12px" }}>
                                                    {isSuper ? (
                                                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>Locked Permission</span>
                                                    ) : (
                                                        <select 
                                                            value={u.role}
                                                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                                            style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--color-border)" }}
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="admin">System Admin</option>
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

            </main>

            {/* --- PRODUCT EDIT / ADD OVERLAY MODAL --- */}
            {productModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 200,
                    backdropFilter: "blur(4px)"
                }}>
                    <div style={{
                        backgroundColor: "var(--color-white)",
                        borderRadius: "var(--radius-lg)",
                        width: "500px",
                        maxWidth: "90%",
                        padding: "32px",
                        boxShadow: "var(--shadow-lg)",
                        position: "relative"
                    }}>
                        <button 
                            onClick={() => setProductModalOpen(false)}
                            style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: 0, cursor: "pointer", color: "var(--color-text-muted)" }}
                            aria-label="Close form"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 style={{ fontSize: "1.3rem", marginBottom: "24px" }}>
                            {editingProduct ? "Modify Product Details" : "Add New Catalog Product"}
                        </h3>
                        
                        <form onSubmit={handleProductSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="input-field">
                                <label style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>Product Name</label>
                                <input 
                                    type="text" 
                                    value={prodForm.name}
                                    onChange={(e) => setProdForm(prev => ({ ...prev, name: e.target.value }))}
                                    required 
                                    style={{ width: "100%" }}
                                />
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                                <div className="input-field">
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                        <label style={{ fontWeight: 600, fontSize: "0.85rem", display: "block" }}>Category</label>
                                        <button 
                                            type="button" 
                                            onClick={openCategoryModal}
                                            style={{ fontSize: "0.75rem", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                                        >
                                            + Add Category
                                        </button>
                                    </div>
                                    <select 
                                        value={prodForm.category}
                                        onChange={(e) => setProdForm(prev => ({ ...prev, category: e.target.value }))}
                                        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
                                    >
                                        {categories.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="input-field" style={{ backgroundColor: "var(--color-bg)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <label style={{ fontWeight: 700, fontSize: "0.95rem" }}>Product Variants (Weights & Pricing)</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setProdForm(prev => ({ ...prev, variants: [...prev.variants, { weight: "", price: "", discountPrice: "" }] }))}
                                        style={{ fontSize: "0.8rem", padding: "4px 8px", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}
                                    >
                                        + Add Variant
                                    </button>
                                </div>
                                
                                {prodForm.variants.map((variant, index) => (
                                    <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "8px", marginBottom: "8px", alignItems: "end" }}>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px", display: "block" }}>Weight (e.g. 1kg)</label>
                                            <input type="text" required value={variant.weight} onChange={e => {
                                                const newV = [...prodForm.variants];
                                                newV[index].weight = e.target.value;
                                                setProdForm({ ...prodForm, variants: newV });
                                            }} style={{ width: "100%", padding: "8px" }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px", display: "block" }}>Price</label>
                                            <input type="number" step="0.01" required value={variant.price} onChange={e => {
                                                const newV = [...prodForm.variants];
                                                newV[index].price = e.target.value;
                                                setProdForm({ ...prodForm, variants: newV });
                                            }} style={{ width: "100%", padding: "8px" }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px", display: "block" }}>Discount</label>
                                            <input type="number" step="0.01" value={variant.discountPrice} onChange={e => {
                                                const newV = [...prodForm.variants];
                                                newV[index].discountPrice = e.target.value;
                                                setProdForm({ ...prodForm, variants: newV });
                                            }} style={{ width: "100%", padding: "8px" }} />
                                        </div>
                                        {prodForm.variants.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const newV = prodForm.variants.filter((_, i) => i !== index);
                                                    setProdForm({ ...prodForm, variants: newV });
                                                }}
                                                style={{ padding: "8px", backgroundColor: "#ffcdd2", color: "#d32f2f", border: "none", borderRadius: "4px", cursor: "pointer", height: "37px" }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="input-field">
                                <label style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>Product Image</label>
                                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploadingImage}
                                            style={{ width: "100%", padding: "8px", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-sm)" }}
                                        />
                                        {isUploadingImage && <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", marginTop: "4px", display: "block" }}>Uploading securely to ImgBB...</span>}
                                        {prodForm.image && !isUploadingImage && <span style={{ fontSize: "0.75rem", color: "#2E7D32", marginTop: "4px", display: "block" }}>Image successfully hosted and linked.</span>}
                                    </div>
                                    {prodForm.image && (
                                        <img src={prodForm.image} alt="Preview" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--color-border)" }} />
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="input-field">
                                    <label style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>Promo Badge</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Organic, 10% OFF"
                                        value={prodForm.badge}
                                        onChange={(e) => setProdForm(prev => ({ ...prev, badge: e.target.value }))}
                                        style={{ width: "100%" }}
                                    />
                                </div>
                                <div className="input-field">
                                    <label style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>Freshness Status / Score</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 98% Freshness Score"
                                        value={prodForm.freshness}
                                        onChange={(e) => setProdForm(prev => ({ ...prev, freshness: e.target.value }))}
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{ width: "100%", padding: "12px", fontSize: "1rem", marginTop: "8px" }}
                                disabled={isUploadingImage}
                            >
                                {editingProduct ? "Save Changes" : "Publish Product"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- CATEGORY ADD OVERLAY MODAL --- */}
            {categoryModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    zIndex: 250, backdropFilter: "blur(4px)"
                }}>
                    <div style={{
                        backgroundColor: "var(--color-white)", borderRadius: "var(--radius-lg)",
                        width: "400px", maxWidth: "90%", padding: "32px",
                        boxShadow: "var(--shadow-lg)", position: "relative"
                    }}>
                        <button 
                            onClick={() => setCategoryModalOpen(false)}
                            style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: 0, cursor: "pointer", color: "var(--color-text-muted)" }}
                            aria-label="Close category form"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Create New Category</h3>
                        
                        <form onSubmit={handleCreateCategory} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="input-field">
                                <label style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>Category Name</label>
                                <input 
                                    type="text" 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Snacks, Beverages"
                                    required 
                                    style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                <button type="button" onClick={() => setCategoryModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: "10px" }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
