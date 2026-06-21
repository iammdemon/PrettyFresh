"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, Trash2, ArrowLeft, Save, Sparkles, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

// Helper for Bangla numbers/prices
const toBanglaPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(price);
};

export default function BazaarManual() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    const { user: authUser, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (authUser) {
                setUser(authUser);
            } else {
                router.push("/auth?redirect=/bazaar/manual");
            }
        }
    }, [authUser, isLoading, router]);

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<any[]>([]);
    const [templateName, setTemplateName] = useState("My Monthly Bazaar");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Fetch products and categories
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/categories")
                ]);
                const prodData = await prodRes.json();
                const catData = await catRes.json();
                
                if (prodData.success && catData.success) {
                    setProducts(prodData.products);
                    
                    const catsMap = new Map();
                    catData.categories.forEach((c: any) => {
                        catsMap.set(c._id, c.name);
                        catsMap.set(c.code, c.name); // Fallback for old data
                    });
                    
                    // Only show categories that have products
                    const usedCatIds = Array.from(new Set(prodData.products.map((p: any) => p.category))) as string[];
                    const cats = usedCatIds.map(id => ({ id, name: catsMap.get(id) || id }));
                    
                    setCategories([{ id: "All", name: "All" }, ...cats]);
                }
            } catch (err) {
                console.error("Failed to fetch products or categories", err);
            }
        };

        fetchData();

        // Check if there's a draft from the AI Upload flow
        const draftStr = localStorage.getItem("bazaar_draft");
        if (draftStr) {
            try {
                const draft = JSON.parse(draftStr);
                setCart(draft);
                localStorage.removeItem("bazaar_draft");
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCat = activeCategory === "All" || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product._id);
            if (existing) {
                return prev.map(item => item.id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, {
                id: product._id,
                name: product.name,
                image: product.image,
                price: product.variants[0]?.price || 0,
                weight: product.variants[0]?.weight || "1 unit",
                quantity: 1
            }];
        });
        toast.success(`Added ${product.name}`);
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.quantity + delta;
                return newQ > 0 ? { ...item, quantity: newQ } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleSaveTemplate = async () => {
        if (!user) {
            toast.error("Please login to save templates.");
            return;
        }

        if (cart.length === 0) {
            toast.error("Please add some products to your bazaar list.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/bazaar/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.email || user.id || "anonymous",
                    name: templateName,
                    items: cart
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Bazaar template saved!");
                router.push("/dashboard/bazaar");
            } else {
                toast.error(data.error || "Failed to save template.");
            }
        } catch (e) {
            toast.error("Error saving template.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--color-bg)" }}>
            {/* Left Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <header style={{ padding: "20px 24px", backgroundColor: "var(--color-white)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                            <ArrowLeft size={24} />
                        </button>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--color-primary-dark)" }}>Build Manual Bazaar</h1>
                    </div>
                    <div style={{ position: "relative", width: "400px" }}>
                        <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: "100%", padding: "12px 16px 12px 48px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)", fontSize: "1rem" }}
                        />
                    </div>
                </header>

                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                    {/* Categories Sidebar */}
                    <div style={{ width: "240px", backgroundColor: "var(--color-white)", borderRight: "1px solid var(--color-border)", overflowY: "auto", padding: "20px 0" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", padding: "0 20px", marginBottom: "12px" }}>Categories</div>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "12px 20px",
                                    border: "none",
                                    backgroundColor: activeCategory === cat.id ? "var(--color-primary-light)" : "transparent",
                                    color: activeCategory === cat.id ? "var(--color-primary)" : "var(--color-text)",
                                    fontWeight: activeCategory === cat.id ? 700 : 500,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
                            {filteredProducts.map(product => (
                                <div key={product._id} style={{ backgroundColor: "var(--color-white)", borderRadius: "var(--radius-lg)", padding: "16px", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column" }}>
                                    <div style={{ height: "160px", marginBottom: "16px", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                        ) : (
                                            <div style={{ color: "var(--color-text-muted)" }}>No Image</div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>{product.variants[0]?.weight || "1 unit"}</div>
                                    <div style={{ fontWeight: 700, marginBottom: "8px", flexGrow: 1 }}>{product.name}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                                        <div style={{ color: "var(--color-primary)", fontWeight: 800, fontSize: "1.1rem" }}>{toBanglaPrice(product.variants[0]?.price || 0)}</div>
                                        <button 
                                            onClick={() => addToCart(product)}
                                            style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "var(--color-white)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.1s" }}
                                            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
                                            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar (The Bazaar List Cart) */}
            <div style={{ width: "380px", backgroundColor: "var(--color-white)", borderLeft: "1px solid var(--color-border)", display: "flex", flexDirection: "column", boxShadow: "-4px 0 15px rgba(0,0,0,0.03)" }}>
                <div style={{ padding: "24px", borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-primary)", color: "var(--color-white)" }}>
                    <div style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "8px" }}>Template Name</div>
                    <input 
                        type="text" 
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        style={{ width: "100%", padding: "8px 0", border: "none", borderBottom: "2px solid rgba(255,255,255,0.5)", backgroundColor: "transparent", color: "var(--color-white)", fontSize: "1.5rem", fontWeight: 800, outline: "none" }}
                    />
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginTop: "40px" }}>
                            <ShoppingBag size={48} style={{ opacity: 0.2, margin: "0 auto 16px" }} />
                            <p>Your bazaar list is empty.</p>
                            <p style={{ fontSize: "0.9rem" }}>Add items from the catalog.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}>
                                {item.image && <img src={item.image} alt={item.name} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{item.weight} • {toBanglaPrice(item.price)}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--color-bg)", padding: "4px", borderRadius: "var(--radius-full)" }}>
                                    <button onClick={() => updateQuantity(item.id, -1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", cursor: "pointer", backgroundColor: "var(--color-white)", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14}/></button>
                                    <span style={{ fontWeight: 700, width: "20px", textAlign: "center", fontSize: "0.9rem" }}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "none", cursor: "pointer", backgroundColor: "var(--color-white)", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14}/></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} style={{ color: "#d32f2f", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}

                    {/* Smart Suggestions */}
                    {cart.length > 0 && (
                        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#fff8e1", borderRadius: "var(--radius-lg)", border: "1px solid #ffe082" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f57f17", fontWeight: 700, marginBottom: "8px", fontSize: "0.9rem" }}>
                                <Sparkles size={16} /> Smart Suggestion
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "#616161", lineHeight: 1.5, margin: 0 }}>
                                Customers who buy {cart[0]?.name} usually add Lentils and Soybean Oil. Check the catalog to add them!
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ padding: "24px", borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--color-text-muted)" }}>
                        <span>Items</span>
                        <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{itemCount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "1.2rem", fontWeight: 800 }}>
                        <span>Estimated Cost</span>
                        <span style={{ color: "var(--color-primary)" }}>{toBanglaPrice(totalCost)}</span>
                    </div>
                    <button 
                        onClick={handleSaveTemplate}
                        disabled={isSaving || cart.length === 0}
                        className="btn btn-primary"
                        style={{ width: "100%", padding: "16px", borderRadius: "var(--radius-lg)", fontSize: "1.05rem", display: "flex", justifyContent: "center", gap: "8px" }}
                    >
                        <Save size={20} /> {isSaving ? "Saving..." : "Save Bazaar Template"}
                    </button>
                </div>
            </div>
        </div>
    );
}
