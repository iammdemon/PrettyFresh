"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown, ShoppingCart, SearchCode } from "lucide-react";
import { toBanglaPrice } from "@/lib/bangla";

export const PRODUCTS = [
    {
        id: "64a7c1b50000000000000001",
        name: "Fresh Red Tomatoes",
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 0.79, discountPrice: 0.99 },
            { weight: "1kg", price: 1.49, discountPrice: 1.99 },
            { weight: "2kg", price: 2.89, discountPrice: 3.89 }
        ],
        badge: "Organic",
        freshness: "Morning Harvest"
    },
    {
        id: "64a7c1b50000000000000002",
        name: "Organic Sweet Carrots",
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "1kg", price: 1.99, discountPrice: 2.49 },
            { weight: "2kg", price: 3.80, discountPrice: 4.80 }
        ],
        badge: "Farm Fresh",
        freshness: "Morning Harvest"
    },
    {
        id: "64a7c1b50000000000000003",
        name: "Crisp Royal Gala Apples",
        category: "fruits",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "1kg", price: 2.99, discountPrice: 3.49 },
            { weight: "1.5kg", price: 4.39, discountPrice: 5.19 },
            { weight: "3kg", price: 8.50, discountPrice: 10.00 }
        ],
        badge: "Imported",
        freshness: "Morning Harvest"
    },
    {
        id: "64a7c1b50000000000000004",
        name: "Premium Bananas",
        category: "fruits",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "6 Pcs", price: 0.69, discountPrice: 0.85 },
            { weight: "1 Dozen", price: 1.29, discountPrice: 1.59 }
        ],
        badge: "15% OFF",
        freshness: "Morning Harvest"
    },
    {
        id: "64a7c1b50000000000000005",
        name: "Farm Fresh Whole Milk",
        category: "dairy",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "1L", price: 1.89, discountPrice: 2.19 },
            { weight: "2L", price: 3.60, discountPrice: 4.20 }
        ],
        badge: "Pasteurized",
        freshness: "Morning Harvest"
    },
    {
        id: "64a7c1b50000000000000006",
        name: "Organic Brown Eggs",
        category: "dairy",
        image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "6 Pcs", price: 1.30, discountPrice: 1.60 },
            { weight: "12 Pcs", price: 2.49, discountPrice: 2.99 }
        ],
        badge: "Free Range",
        freshness: "Morning Harvest"
    },
    {
        id: "64a7c1b50000000000000007",
        name: "Fresh Boneless Chicken Breast",
        category: "grocery",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 2.60, discountPrice: 3.10 },
            { weight: "1kg", price: 4.99, discountPrice: 5.99 }
        ],
        badge: "Antibiotic-Free",
        freshness: "Morning Harvest"
    },
    {
        id: "64a7c1b50000000000000008",
        name: "Atlantic Salmon Fillet",
        category: "grocery",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 4.60, discountPrice: 5.60 },
            { weight: "1kg", price: 8.99, discountPrice: 10.99 }
        ],
        badge: "Chilled",
        freshness: "Morning Harvest"
    }
];

export const FeaturedProducts: React.FC = () => {
    const {
        wishlist,
        toggleWishlist,
        addToCart,
        searchQuery,
        activeFilter,
        setActiveFilter
    } = useCart();

    const [productsList, setProductsList] = useState<any[]>(PRODUCTS);
    const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState<{code: string, name: string, id: string}[]>([]);

    useEffect(() => {
        // Fetch products
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.products)) {
                    // Filter out daily-bazaar items for this component
                    const featured = data.products.filter((p: any) => {
                        // Keep backwards compatibility for daily-bazaar (might be by code or by dynamic id)
                        // If it has code 'daily-bazaar', we filter it later based on actual categories.
                        // For now we trust the filter logic below, but we exclude hardcoded "daily-bazaar" as fallback.
                        return p.category !== "daily-bazaar";
                    }).map((p: any) => ({ ...p, id: p._id || p.id }));
                    setProductsList(featured);
                }
            })
            .catch(err => console.error("Error fetching products:", err));

        // Fetch categories
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.categories)) {
                    const mappedCats = data.categories.map((c: any) => ({
                        code: c.code,
                        name: c.name,
                        id: c._id
                    }));
                    setCategories(mappedCats);
                }
            })
            .catch(err => console.error("Error fetching categories:", err));
    }, []);

    const handleWeightChange = (productId: string, weight: string) => {
        setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
    };

    const filtered = productsList.filter(p => {
        // Filter out daily-bazaar dynamically if we have categories
        const dailyBazaarCat = categories.find(c => c.code === "daily-bazaar");
        if (dailyBazaarCat && p.category === dailyBazaarCat.id) {
            return false;
        }

        const matchesCategory = activeFilter === "all" || p.category === activeFilter || p.category === categories.find(c => c.id === activeFilter)?.code;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Dynamic filters
    const filters = [
        { id: "all", name: "All Products" },
        ...categories.filter(c => c.code !== "daily-bazaar").map(c => ({
            id: c.id,
            name: c.name
        }))
    ];
    
    // Fallback if categories are not loaded yet
    if (filters.length === 1 && categories.length === 0) {
        filters.push(
            { id: "vegetables", name: "Vegetables" },
            { id: "fruits", name: "Fruits" },
            { id: "dairy", name: "Dairy" },
            { id: "grocery", name: "Grocery" }
        );
    }

    return (
        <section className="featured-products-section" id="featured-products-section">
            <div className="container">
                <div className="section-header-row">
                    <div className="section-title-wrapper">
                        <span className="subtitle">Best Deals For You</span>
                        <h2 className="section-title">Featured Products</h2>
                    </div>
                    
                    {/* Filter tabs */}
                    <div className="product-filters" role="tablist">
                        {filters.map(f => (
                            <button 
                                key={f.id}
                                className={`filter-tab ${activeFilter === f.id ? "active" : ""}`}
                                onClick={() => setActiveFilter(f.id)}
                                role="tab" 
                                aria-selected={activeFilter === f.id}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="products-grid">
                    {filtered.length === 0 ? (
                        <div className="empty-products" style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                            <SearchCode style={{ width: "48px", height: "48px", color: "var(--color-text-muted)", opacity: 0.5, marginBottom: "12px" }} />
                            <p style={{ fontWeight: 700, fontSize: "1.15rem" }}>No products found</p>
                            <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Try adjusting your search query or click another filter.</span>
                        </div>
                    ) : (
                        filtered.map(p => {
                            const isWished = wishlist.includes(p.id);
                            
                            // Compatibility logic for legacy data schema vs new variants schema
                            const variants = Array.isArray(p.variants) && p.variants.length > 0 
                                ? p.variants 
                                : [{ weight: p.weights?.[0] || p.weight || "1kg", price: p.price, discountPrice: p.discountPrice }];
                                
                            const currentWeight = selectedWeights[p.id] || variants[0].weight;
                            const activeVariant = variants.find((v: any) => v.weight === currentWeight) || variants[0];
                            
                            return (
                                <div key={p.id} className="product-card">
                                    {p.badge && <span className="product-badge">{p.badge}</span>}
                                    <button 
                                        className={`wishlist-btn ${isWished ? "active" : ""}`} 
                                        onClick={() => toggleWishlist(p.id)}
                                        aria-label="Add to wishlist"
                                    >
                                        <Heart size={18} fill={isWished ? "currentColor" : "none"} />
                                    </button>
                                    
                                    <div className="product-img-wrapper">
                                        <div style={{ position: "relative", width: "100%", height: "140px" }}>
                                            <Image 
                                                src={p.image} 
                                                alt={p.name} 
                                                fill
                                                sizes="(max-width: 768px) 100vw, 200px"
                                                style={{ objectFit: "contain" }}
                                                className="product-img"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                    
                                    <h3 className="product-name">{p.name}</h3>
                                    
                                    <div className="product-weight-selector">
                                        <select 
                                            className="product-weight-select" 
                                            value={currentWeight}
                                            onChange={(e) => handleWeightChange(p.id, e.target.value)}
                                            aria-label="Product weight"
                                        >
                                            {variants.map((v: any) => (
                                                <option key={v.weight} value={v.weight}>{v.weight}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="weight-chevron" />
                                    </div>
                                    
                                    <div className="product-price-row">
                                        <span className="price-current">{toBanglaPrice(activeVariant.price)}</span>
                                        {activeVariant.discountPrice && (
                                            <span className="price-discount">{toBanglaPrice(activeVariant.discountPrice)}</span>
                                        )}
                                    </div>
                                    
                                    <button 
                                        className="btn add-cart-btn" 
                                        onClick={() => addToCart(p, currentWeight, activeVariant.price)}
                                    >
                                        <ShoppingCart size={18} />
                                        <span>Add to Cart</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
};
