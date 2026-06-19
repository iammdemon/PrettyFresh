"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Heart, ChevronDown, ShoppingCart, SearchCode } from "lucide-react";

export const PRODUCTS = [
    {
        id: 1,
        name: "Fresh Red Tomatoes",
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=80",
        price: 1.49,
        discountPrice: 1.99,
        badge: "Organic",
        weights: ["500g", "1kg", "2kg"]
    },
    {
        id: 2,
        name: "Organic Sweet Carrots",
        category: "vegetables",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80",
        price: 1.99,
        discountPrice: 2.49,
        badge: "Farm Fresh",
        weights: ["1kg", "2kg"]
    },
    {
        id: 3,
        name: "Crisp Royal Gala Apples",
        category: "fruits",
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
        price: 2.99,
        discountPrice: 3.49,
        badge: "Imported",
        weights: ["1kg", "1.5kg", "3kg"]
    },
    {
        id: 4,
        name: "Premium Bananas",
        category: "fruits",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80",
        price: 1.29,
        discountPrice: 1.59,
        badge: "15% OFF",
        weights: ["1 Dozen", "6 Pcs"]
    },
    {
        id: 5,
        name: "Farm Fresh Whole Milk",
        category: "dairy",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80",
        price: 1.89,
        discountPrice: 2.19,
        badge: "Pasteurized",
        weights: ["1L", "2L"]
    },
    {
        id: 6,
        name: "Organic Brown Eggs",
        category: "dairy",
        image: "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop&q=80",
        price: 2.49,
        discountPrice: 2.99,
        badge: "Free Range",
        weights: ["12 Pcs", "6 Pcs"]
    },
    {
        id: 7,
        name: "Fresh Boneless Chicken Breast",
        category: "grocery",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80",
        price: 4.99,
        discountPrice: 5.99,
        badge: "Antibiotic-Free",
        weights: ["1kg", "500g"]
    },
    {
        id: 8,
        name: "Atlantic Salmon Fillet",
        category: "grocery",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
        price: 8.99,
        discountPrice: 10.99,
        badge: "Chilled",
        weights: ["500g", "1kg"]
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

    const [selectedWeights, setSelectedWeights] = useState<Record<number, string>>({
        1: "500g",
        2: "1kg",
        3: "1kg",
        4: "1 Dozen",
        5: "1L",
        6: "12 Pcs",
        7: "1kg",
        8: "500g"
    });

    const handleWeightChange = (productId: number, weight: string) => {
        setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
    };

    const filtered = PRODUCTS.filter(p => {
        const matchesCategory = activeFilter === "all" || p.category === activeFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const filters = [
        { code: "all", name: "All Products" },
        { code: "vegetables", name: "Vegetables" },
        { code: "fruits", name: "Fruits" },
        { code: "dairy", name: "Dairy" },
        { code: "grocery", name: "Grocery" }
    ];

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
                                key={f.code}
                                className={`filter-tab ${activeFilter === f.code ? "active" : ""}`}
                                onClick={() => setActiveFilter(f.code)}
                                role="tab" 
                                aria-selected={activeFilter === f.code}
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
                            const currentWeight = selectedWeights[p.id] || p.weights[0];
                            
                            return (
                                <div key={p.id} className="product-card">
                                    <span className="product-badge">{p.badge}</span>
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
                                            {p.weights.map(w => (
                                                <option key={w} value={w}>{w}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="weight-chevron" />
                                    </div>
                                    
                                    <div className="product-price-row">
                                        <span className="price-current">${p.price.toFixed(2)}</span>
                                        <span className="price-discount">${p.discountPrice.toFixed(2)}</span>
                                    </div>
                                    
                                    <button 
                                        className="btn add-cart-btn" 
                                        onClick={() => addToCart(p, currentWeight)}
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
