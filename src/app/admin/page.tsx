"use client";

import React, { useState, useEffect } from "react";
import { 
    LayoutDashboard, ShoppingBag, Receipt, Users, LogOut, 
    Plus, Trash2, Edit, TrendingUp, CheckCircle, ArrowLeft, PieChart,
    Shield, RefreshCw, X, CircleDot, AlertCircle, ShoppingCart, Award, Clock, DollarSign, Check, XCircle, Zap, Megaphone
} from "lucide-react";
import { toast } from "react-hot-toast";
import { toBanglaNumber, toBanglaPrice } from "@/lib/bangla";
import { useAuth } from "@/context/AuthContext";

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
    isTopSelling?: boolean;
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
    riderId?: string;
    riderName?: string;
    riderPhone?: string;
    createdAt: string;
}

interface UserRecord {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "super_admin" | "admin" | "rider" | "customer";
    provider: string;
    walletBalance?: number;
    createdAt: string;
}

interface Category {
    _id: string;
    name: string;
    code: string;
}

export default function AdminDashboard() {
    const [adminUser, setAdminUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "users" | "funds" | "finance" | "bazaar" | "marketing">("overview");
    const [loading, setLoading] = useState(true);

    // Dynamic Lists
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [fundRequests, setFundRequests] = useState<any[]>([]);
    const [financeData, setFinanceData] = useState<any>(null);

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
        freshness: "Morning Harvest",
        isTopSelling: false
    });

    // Custom Modal States
    const [cashbackModalOpen, setCashbackModalOpen] = useState(false);
    const [cashbackUser, setCashbackUser] = useState<{ email: string, name: string } | null>(null);
    const [cashbackAmount, setCashbackAmount] = useState("");

    const [fundConfirmModalOpen, setFundConfirmModalOpen] = useState(false);
    const [fundConfirmData, setFundConfirmData] = useState<{ id: string, action: "approve" | "reject" } | null>(null);

    const [productConfirmModalOpen, setProductConfirmModalOpen] = useState(false);
    const [productConfirmData, setProductConfirmData] = useState<Product | null>(null);

    const { user: authUser, isLoading: isAuthLoading, logout } = useAuth();
    
    // Security Verification on Client Mount
    useEffect(() => {
        if (!isAuthLoading) {
            if (authUser) {
                const isAuthorized = authUser.role === "super_admin" || authUser.role === "admin";
                
                if (isAuthorized) {
                    setAdminUser(authUser);
                    setLoading(false);
                } else {
                    // Unauthorized - redirect home
                    toast.error("Access Denied: Admin privileges required.");
                    window.location.href = "/";
                }
            } else {
                toast.error("Access Denied: Admin privileges required.");
                window.location.href = "/";
            }
        }
    }, [authUser, isAuthLoading]);
    // Load active tab data
    useEffect(() => {
        if (!adminUser) return;

        if (activeTab === "funds") {
            const loadFunds = async () => {
                const resFunds = await fetch("/api/admin/funds");
                const dataFunds = await resFunds.json();
                if (dataFunds.success) setFundRequests(dataFunds.requests);
            }
            loadFunds();
        }
        
        if (activeTab === "finance") {
            const loadFinance = async () => {
                const resFin = await fetch("/api/admin/finance");
                const dataFin = await resFin.json();
                if (dataFin.success) setFinanceData(dataFin.finance);
            }
            loadFinance();
        }
    }, [activeTab, adminUser]);

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

    const handleLogout = async () => {
        await logout();
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
                toast.success("Image uploaded successfully");
                setProdForm(prev => ({ ...prev, image: data.url }));
            } else {
                toast.error("Failed to upload image: " + data.error);
            }
        } catch (err) {
            console.error("Image upload failed:", err);
            toast.error("Image upload failed. Please try again.");
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
                setProdForm({ name: "", category: "vegetables", image: "", variants: [{ weight: "1kg", price: "", discountPrice: "" }], badge: "", freshness: "Morning Harvest", isTopSelling: false });
                
                // Refresh list
                const refreshRes = await fetch("/api/products");
                const refreshData = await refreshRes.json();
                if (refreshData.success) setProducts(refreshData.products);
                toast.success(`Product ${editingProduct ? "updated" : "created"} successfully`);
            } else {
                toast.error("Error: " + data.error);
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
            freshness: "Morning Harvest",
            isTopSelling: false
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
            freshness: prod.freshness || "Morning Harvest",
            isTopSelling: prod.isTopSelling || false
        });
        setProductModalOpen(true);
    };

    const confirmDeleteProduct = (prod: Product) => {
        setProductConfirmData(prod);
        setProductConfirmModalOpen(true);
    };

    const submitDeleteProduct = async () => {
        if (!productConfirmData) return;
        
        try {
            const res = await fetch(`/api/products?${productConfirmData._id ? `_id=${productConfirmData._id}` : `id=${productConfirmData.id}`}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                setProducts(prev => prev.filter(p => p.id !== productConfirmData.id && p._id !== productConfirmData._id));
                toast.success("Product deleted successfully");
                setProductConfirmModalOpen(false);
            } else {
                toast.error("Failed to delete product: " + data.error);
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            toast.error("An error occurred");
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
                setCategories(prev => [...prev, data.category]);
                setNewCategoryName("");
                setCategoryModalOpen(false);
                toast.success("Category created successfully");
            } else {
                toast.error("Failed to create category: " + data.error);
            }
        } catch (err) {
            console.error("Error creating category:", err);
            toast.error("Error creating category.");
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
                toast.success(`Order marked as ${status}`);
            } else {
                toast.error("Failed to update status: " + data.error);
            }
        } catch (err) {
            console.error("Error updating order status:", err);
        }
    };

    const handleAssignRider = async (orderId: string, riderId: string) => {
        const rider = users.find(u => u.id === riderId);
        if (!rider) return;
        const currentOrder = orders.find(o => o.orderId === orderId);
        if (!currentOrder) return;

        try {
            const res = await fetch("/api/orders", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    orderId, 
                    status: currentOrder.status, 
                    riderId: rider.id, 
                    riderName: rider.name, 
                    riderPhone: rider.phone 
                })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.orderId === orderId ? { 
                    ...o, 
                    riderId: rider.id, 
                    riderName: rider.name, 
                    riderPhone: rider.phone 
                } : o));
                toast.success(`Assigned to ${rider.name}`);
            } else {
                toast.error("Failed to assign rider: " + data.error);
            }
        } catch (err) {
            console.error("Error assigning rider:", err);
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
                toast.success("User role updated successfully");
            } else {
                toast.error("Failed to change user permission: " + data.error);
            }
        } catch (err) {
            console.error("Error updating user role:", err);
        }
    };

    const openGiftCashback = (email: string, name: string) => {
        setCashbackUser({ email, name });
        setCashbackAmount("");
        setCashbackModalOpen(true);
    };

    const submitGiftCashback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cashbackUser) return;
        
        const amount = Number(cashbackAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Invalid amount entered.");
            return;
        }

        try {
            const res = await fetch("/api/user/wallet/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: cashbackUser.email,
                    amount,
                    type: "cashback",
                    description: "Gifted cashback from Administration"
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Successfully gifted ${toBanglaPrice(amount)} to ${cashbackUser.name}`);
                // Refresh list
                const refreshRes = await fetch("/api/admin/users");
                const refreshData = await refreshRes.json();
                if (refreshData.success) setUsers(refreshData.users);
                setCashbackModalOpen(false);
            } else {
                toast.error("Failed to gift cashback: " + data.error);
            }
        } catch (err) {
            console.error("Error gifting cashback:", err);
        }
    };

    // --- FUND REQUEST ACTIONS ---
    const confirmFundRequestAction = (id: string, action: "approve" | "reject") => {
        setFundConfirmData({ id, action });
        setFundConfirmModalOpen(true);
    };

    const submitFundRequestAction = async () => {
        if (!fundConfirmData) return;
        
        try {
            const res = await fetch("/api/admin/funds", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: fundConfirmData.id, action: fundConfirmData.action })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh funds and users
                const resFunds = await fetch("/api/admin/funds");
                const dataFunds = await resFunds.json();
                if (dataFunds.success) setFundRequests(dataFunds.requests);
                
                const resUsers = await fetch("/api/admin/users");
                const dataUsers = await resUsers.json();
                if (dataUsers.success) setUsers(dataUsers.users);
                
                toast.success(`Fund request ${fundConfirmData.action}d successfully`);
                setFundConfirmModalOpen(false);
            } else {
                toast.error("Action failed: " + data.error);
                setFundConfirmModalOpen(false);
            }
        } catch (err) {
            console.error("Error updating fund request:", err);
            toast.error("An error occurred");
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
                        onClick={() => setActiveTab("marketing")}
                        className={`btn ${activeTab === "marketing" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <Megaphone size={18} />
                        <span>Marketing</span>
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
                    <button 
                        onClick={() => setActiveTab("funds")}
                        className={`btn ${activeTab === "funds" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <DollarSign size={18} />
                        <span>Fund Requests</span>
                        {fundRequests.length > 0 && (
                            <span style={{ marginLeft: "auto", background: "#f57c00", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 800 }}>
                                {fundRequests.length}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab("finance")}
                        className={`btn ${activeTab === "finance" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <TrendingUp size={18} />
                        <span>Financial Overview</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab("bazaar")}
                        className={`btn ${activeTab === "bazaar" ? "btn-primary" : "btn-secondary"}`}
                        style={{ justifyContent: "flex-start", width: "100%", padding: "12px 16px" }}
                    >
                        <Zap size={18} />
                        <span>Bazaar AI Setup</span>
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
                            {activeTab === "funds" && "Wallet Funding Operations"}
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
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
                                                        {p.badge && (
                                                            <span style={{ fontSize: "0.75rem", backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                                                {p.badge}
                                                            </span>
                                                        )}
                                                        {p.isTopSelling && (
                                                            <span style={{ fontSize: "0.75rem", backgroundColor: "#ffebee", color: "#d32f2f", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                                                🔥 Top
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px" }}>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => startEditProduct(p)} aria-label="Edit product">
                                                            <Edit size={14} />
                                                        </button>
                                                        <button onClick={() => confirmDeleteProduct(p)} style={{ background: "none", border: 0, color: "#d32f2f", cursor: "pointer", padding: "4px" }} aria-label="Delete">
                                                            <Trash2 size={18} />
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
                                        <th style={{ padding: "12px" }}>Assign Rider</th>
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
                                            <td style={{ padding: "16px 12px" }}>
                                                <select
                                                    value={o.riderId || ""}
                                                    onChange={(e) => handleAssignRider(o.orderId, e.target.value)}
                                                    style={{ 
                                                        padding: "6px 12px", 
                                                        borderRadius: "4px", 
                                                        border: "1px solid var(--color-border)",
                                                        backgroundColor: "var(--color-bg)",
                                                        fontSize: "0.85rem",
                                                        width: "140px"
                                                    }}
                                                    disabled={o.status === "Delivered" || o.status === "Cancelled"}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {users.filter(u => u.role === "rider").map(rider => (
                                                        <option key={rider.id} value={rider.id}>{rider.name}</option>
                                                    ))}
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
                                        <th style={{ padding: "12px" }}>Wallet Balance</th>
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
                                                <td style={{ padding: "16px 12px", fontWeight: 700, color: "var(--color-primary)" }}>
                                                    {toBanglaPrice(u.walletBalance || 0)}
                                                    <button 
                                                        onClick={() => openGiftCashback(u.email, u.name)}
                                                        style={{ display: "block", marginTop: "8px", fontSize: "0.75rem", padding: "4px 8px", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600 }}
                                                    >
                                                        + Gift Cashback
                                                    </button>
                                                </td>
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
                                                        {u.role === "super_admin" ? "Super Admin" : u.role === "admin" ? "Admin" : u.role === "rider" ? "Rider" : "Customer"}
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
                                                            <option value="rider">Rider</option>
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

                {activeTab === "funds" && (
                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Pending bKash Deposits</h2>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                                        <th style={{ padding: "12px" }}>Date</th>
                                        <th style={{ padding: "12px" }}>Customer</th>
                                        <th style={{ padding: "12px" }}>bKash Number</th>
                                        <th style={{ padding: "12px" }}>TrxID</th>
                                        <th style={{ padding: "12px" }}>Amount</th>
                                        <th style={{ padding: "12px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fundRequests.length > 0 ? fundRequests.map((req, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                            <td style={{ padding: "16px 12px" }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: "16px 12px", fontWeight: 600 }}>{req.userName}<br/><span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{req.userEmail}</span></td>
                                            <td style={{ padding: "16px 12px" }}>{req.accountNumber}</td>
                                            <td style={{ padding: "16px 12px", fontFamily: "monospace", letterSpacing: "1px" }}>{req.trxId}</td>
                                            <td style={{ padding: "16px 12px", fontWeight: 700, color: "var(--color-primary)" }}>{toBanglaPrice(req.amount)}</td>
                                            <td style={{ padding: "16px 12px" }}>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button 
                                                        onClick={() => confirmFundRequestAction(req.id, "approve")}
                                                        style={{ padding: "6px 12px", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmFundRequestAction(req.id, "reject")}
                                                        style={{ padding: "6px 12px", backgroundColor: "#ffcdd2", color: "#d32f2f", border: "none", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                                No pending fund requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "finance" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Financial Overview</h2>
                        </div>
                        
                        {financeData ? (
                            <>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <DollarSign size={28} />
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "4px" }}>Total Cash Collected (Riders)</div>
                                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary)" }}>{toBanglaPrice(financeData.totalCashCollected)}</div>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#e3f2fd", color: "#1976d2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "4px" }}>Total bKash Deposits</div>
                                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1976d2" }}>{toBanglaPrice(financeData.totalBkashDeposits)}</div>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#fff3e0", color: "#f57c00", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <PieChart size={28} />
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "4px" }}>Grand Total Revenue</div>
                                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f57c00" }}>{toBanglaPrice(financeData.grandTotalRevenue)}</div>
                                        </div>
                                    </div>
                                    <div style={{ backgroundColor: "var(--color-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "56px", height: "56px", borderRadius: "12px", backgroundColor: "#fce4ec", color: "#d81b60", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <AlertCircle size={28} />
                                        </div>
                                        <div>
                                            <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "4px" }}>Outstanding Wallet Liability</div>
                                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#d81b60" }}>{toBanglaPrice(financeData.totalWalletBalances)}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "4px" }}>Customer balances available to spend</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: "24px", backgroundColor: "var(--color-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}>
                                        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Recent Financial Transactions</h3>
                                    </div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                            <thead>
                                                <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "2px solid var(--color-border)", fontSize: "0.85rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Date</th>
                                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Type</th>
                                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Customer</th>
                                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Reference</th>
                                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {financeData.recentTransactions && financeData.recentTransactions.length > 0 ? financeData.recentTransactions.map((tx: any) => (
                                                    <tr key={tx.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                                                        <td style={{ padding: "16px 24px", fontSize: "0.9rem" }}>{new Date(tx.date).toLocaleString()}</td>
                                                        <td style={{ padding: "16px 24px" }}>
                                                            <span style={{ 
                                                                padding: "4px 8px", 
                                                                borderRadius: "12px", 
                                                                fontSize: "0.75rem", 
                                                                fontWeight: 700,
                                                                backgroundColor: tx.isCredit ? "#e8f5e9" : "#ffebee",
                                                                color: tx.isCredit ? "#2e7d32" : "#c62828"
                                                            }}>
                                                                {tx.type}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>{tx.customer}</td>
                                                        <td style={{ padding: "16px 24px", fontSize: "0.85rem", fontFamily: "monospace" }}>{tx.reference}</td>
                                                        <td style={{ padding: "16px 24px", fontWeight: 800, textAlign: "right", color: tx.isCredit ? "#2e7d32" : "#c62828" }}>
                                                            {tx.isCredit ? "+" : "-"}{toBanglaPrice(tx.amount)}
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                                                            No transactions found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)", backgroundColor: "var(--color-white)", borderRadius: "var(--radius-md)" }}>
                                Loading financial data...
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "bazaar" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Bazaar AI Setup</h2>
                        </div>
                        
                        <div style={{ backgroundColor: "var(--color-white)", padding: "40px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                <Zap size={32} />
                            </div>
                            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px" }}>AI OCR & Product Matching</h3>
                            <p style={{ color: "var(--color-text-muted)", maxWidth: "600px", margin: "0 auto 24px" }}>
                                The Monthly Bazaar Builder is powered by the OpenRouter API. To enable handwritten list parsing, make sure your <code style={{ backgroundColor: "var(--color-bg)", padding: "4px 8px", borderRadius: "4px" }}>OPENROUTER_API_KEY</code> is configured in your environment variables.
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                                <div style={{ padding: "20px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", minWidth: "200px" }}>
                                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: "8px" }}>Active</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", fontWeight: 600 }}>OCR Engine Status</div>
                                </div>
                                <div style={{ padding: "20px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-md)", minWidth: "200px" }}>
                                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)", marginBottom: "8px" }}>--</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Total Active Subscriptions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "marketing" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Push Notifications</h2>
                        </div>
                        
                        <div style={{ backgroundColor: "var(--color-white)", padding: "40px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-sm)", maxWidth: "800px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Megaphone size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Send Marketing Broadcast</h3>
                                    <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0 0", fontSize: "0.9rem" }}>
                                        Push messages instantly to all users with the app installed.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                                const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
                                
                                const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                                submitBtn.disabled = true;
                                submitBtn.innerText = "Sending...";
                                
                                try {
                                    const res = await fetch("/api/admin/notifications/send", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ title, message })
                                    });
                                    const data = await res.json();
                                    
                                    if (data.success) {
                                        if (data.message) {
                                            toast.success(data.message);
                                        } else {
                                            toast.success(`Sent to ${data.sent} devices! (${data.failed} failed)`);
                                        }
                                        form.reset();
                                    } else {
                                        toast.error(data.error || data.message || "Failed to send push notification.");
                                    }
                                } catch (err) {
                                    toast.error("Network error sending notification.");
                                } finally {
                                    submitBtn.disabled = false;
                                    submitBtn.innerText = "Broadcast Message";
                                }
                            }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div className="input-field">
                                    <label style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "8px", display: "block" }}>Notification Title</label>
                                    <input 
                                        type="text" 
                                        name="title"
                                        placeholder="e.g. 🚨 Weekend Flash Sale!" 
                                        required
                                        style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "1rem" }}
                                    />
                                </div>
                                
                                <div className="input-field">
                                    <label style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "8px", display: "block" }}>Message Body</label>
                                    <textarea 
                                        name="message"
                                        placeholder="e.g. Get 20% off all fresh fruits this weekend only. Tap to shop now!" 
                                        required
                                        rows={4}
                                        style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "1rem", resize: "vertical" }}
                                    />
                                </div>
                                
                                <button type="submit" className="btn btn-primary" style={{ padding: "14px", fontSize: "1rem", marginTop: "8px", display: "flex", justifyContent: "center", gap: "8px" }}>
                                    <Megaphone size={18} /> Broadcast Message
                                </button>
                            </form>
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

                            <div className="input-field" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", padding: "12px", backgroundColor: "var(--color-bg)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                                <input 
                                    type="checkbox" 
                                    id="isTopSelling"
                                    checked={prodForm.isTopSelling}
                                    onChange={(e) => setProdForm(prev => ({ ...prev, isTopSelling: e.target.checked }))}
                                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--color-primary)" }}
                                />
                                <label htmlFor="isTopSelling" style={{ fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", userSelect: "none", margin: 0 }}>
                                    🔥 Mark as Top Selling Product (Overrides Auto-calculation)
                                </label>
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

            {/* --- CASHBACK GIFT MODAL --- */}
            {cashbackModalOpen && cashbackUser && (
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
                            onClick={() => setCashbackModalOpen(false)}
                            style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: 0, cursor: "pointer", color: "var(--color-text-muted)" }}
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Gift Cashback</h3>
                        <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "20px" }}>
                            Send promotional funds to <strong style={{ color: "var(--color-text)" }}>{cashbackUser.name}</strong>.
                        </p>
                        
                        <form onSubmit={submitGiftCashback} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="input-field">
                                <label style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "6px", display: "block" }}>Amount (৳)</label>
                                <input 
                                    type="number" 
                                    value={cashbackAmount}
                                    onChange={(e) => setCashbackAmount(e.target.value)}
                                    placeholder="e.g. 50"
                                    min="1"
                                    required 
                                    style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                                <button type="button" onClick={() => setCashbackModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: "10px" }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>
                                    Send Funds
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- FUND ACTION CONFIRMATION MODAL --- */}
            {fundConfirmModalOpen && fundConfirmData && (
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
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "50%", 
                            backgroundColor: fundConfirmData.action === "approve" ? "#e8f5e9" : "#ffebee", 
                            color: fundConfirmData.action === "approve" ? "#2e7d32" : "#c62828",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "16px"
                        }}>
                            {fundConfirmData.action === "approve" ? <Check size={24} /> : <XCircle size={24} />}
                        </div>
                        
                        <h3 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>
                            Confirm {fundConfirmData.action === "approve" ? "Approval" : "Rejection"}
                        </h3>
                        <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
                            Are you sure you want to {fundConfirmData.action} this bKash deposit request? 
                            {fundConfirmData.action === "approve" && " This will instantly add the funds to the customer's wallet balance."}
                        </p>
                        
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setFundConfirmModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: "10px" }}>
                                Cancel
                            </button>
                            <button 
                                onClick={submitFundRequestAction} 
                                className="btn" 
                                style={{ 
                                    flex: 1, padding: "10px", 
                                    backgroundColor: fundConfirmData.action === "approve" ? "#2e7d32" : "#c62828", 
                                    color: "white" 
                                }}
                            >
                                Yes, {fundConfirmData.action}
                            </button>
                        </div>
                    </div>
                    {/* --- PRODUCT DELETION CONFIRMATION MODAL --- */}
            {productConfirmModalOpen && productConfirmData && (
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
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "50%", 
                            backgroundColor: "#ffebee", color: "#c62828",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "16px"
                        }}>
                            <Trash2 size={24} />
                        </div>
                        
                        <h3 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>
                            Delete Product
                        </h3>
                        <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
                            Are you sure you want to delete <strong style={{ color: "var(--color-text)" }}>"{productConfirmData.name}"</strong>? This action cannot be undone.
                        </p>
                        
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setProductConfirmModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: "10px" }}>
                                Cancel
                            </button>
                            <button 
                                onClick={submitDeleteProduct} 
                                className="btn" 
                                style={{ 
                                    flex: 1, padding: "10px", 
                                    backgroundColor: "#c62828", 
                                    color: "white" 
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
            )}

        </div>
    );
}
