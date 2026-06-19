"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Flame, Plus, ChevronDown } from "lucide-react";
import { toBanglaPrice } from "@/lib/bangla";

export const BAZAAR_PRODUCTS = [
    {
        id: "64a7c1b50000000000000009",
        name: "Crisp Green Bell Pepper",
        image: "https://images.unsplash.com/photo-1580201006675-4131b3157790?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "250g", price: 0.99, discountPrice: 1.49 }
        ],
        freshness: "98% Freshness Score"
    },
    {
        id: "64a7c1b5000000000000000a",
        name: "Organic Strawberries Box",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "250g Box", price: 3.49, discountPrice: 4.49 }
        ],
        freshness: "Picked Today"
    },
    {
        id: "64a7c1b5000000000000000b",
        name: "Pure Clover Honey",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 5.99, discountPrice: 7.49 }
        ],
        freshness: "100% Organic"
    },
    {
        id: "64a7c1b5000000000000000c",
        name: "Fresh Garden Broccoli",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80",
        variants: [
            { weight: "500g", price: 1.19, discountPrice: 1.69 }
        ],
        freshness: "Morning Harvest"
    }
];

export const DailyBazaar: React.FC = () => {
    const { addToCart } = useCart();
    const [timeLeft, setTimeLeft] = useState(3 * 60 * 60 + 24 * 60 + 15); // 3h 24m 15s
    const [bazaarList, setBazaarList] = useState<any[]>(BAZAAR_PRODUCTS);
    const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({});

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.products)) {
                    const dailyBazaar = data.products.filter((p: any) => p.category === "daily-bazaar").map((p: any) => ({ ...p, id: p._id || p.id }));
                    if (dailyBazaar.length > 0) {
                        setBazaarList(dailyBazaar);
                    }
                }
            })
            .catch(err => console.error("Error fetching daily bazaar products:", err));
    }, []);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const handleWeightChange = (productId: string, weight: string) => {
        setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
    };

    const pad = (num: number) => String(num).padStart(2, "0");

    return (
        <section className="daily-bazaar-section" id="daily-bazaar">
            <div className="container">
                <div className="bazaar-banner">
                    <div className="bazaar-content">
                        <span className="bazaar-tag">
                            <Flame size={14} /> Today's Hot Bargains
                        </span>
                        <h2 className="bazaar-title">Daily Bazaar: Today's Fresh Market</h2>
                        <p className="bazaar-subtitle">Picked early this morning, delivered fresh. Flash discounts valid until stock lasts!</p>
                        
                        <div className="bazaar-timer">
                            <span className="timer-label">Deals end in:</span>
                            <div className="timer-countdown" id="bazaar-countdown">
                                <span className="time-block">{pad(hours)}</span> : 
                                <span className="time-block">{pad(minutes)}</span> : 
                                <span className="time-block">{pad(seconds)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bazaar-grid">
                        {bazaarList.map(p => {
                            const variants = Array.isArray(p.variants) && p.variants.length > 0 
                                ? p.variants 
                                : [{ weight: p.weight || p.weights?.[0] || "500g", price: p.price, discountPrice: p.discountPrice }];
                                
                            const currentWeight = selectedWeights[p.id] || variants[0].weight;
                            const activeVariant = variants.find((v: any) => v.weight === currentWeight) || variants[0];
                            
                            return (
                                <div key={p.id} className="bazaar-card">
                                    <div className="card-top">
                                        <span className="fresh-badge">{p.freshness || "Morning Harvest"}</span>
                                        <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.8rem" }}>-30%</span>
                                    </div>
                                    
                                    <div style={{ position: "relative", width: "100%", height: "100px", margin: "10px 0" }}>
                                        <Image 
                                            src={p.image} 
                                            alt={p.name} 
                                            fill
                                            sizes="(max-width: 768px) 100vw, 150px"
                                            style={{ objectFit: "contain" }}
                                            className="bazaar-img"
                                            loading="lazy"
                                        />
                                    </div>
                                    
                                    <h3 className="product-name" style={{ fontSize: "0.95rem", height: "auto", marginBottom: "4px" }}>
                                        {p.name}
                                    </h3>
                                    
                                    {variants.length > 1 ? (
                                        <div className="product-weight-selector" style={{ margin: "4px 0 8px 0" }}>
                                            <select 
                                                className="product-weight-select" 
                                                value={currentWeight}
                                                onChange={(e) => handleWeightChange(p.id, e.target.value)}
                                                style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                                            >
                                                {variants.map((v: any) => (
                                                    <option key={v.weight} value={v.weight}>{v.weight}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="weight-chevron" size={12} style={{ right: "8px" }} />
                                        </div>
                                    ) : (
                                        <span className="weight-lbl" style={{ marginBottom: "8px", display: "inline-block" }}>{currentWeight}</span>
                                    )}
                                    
                                    <div className="price-row">
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span className="price-current">{toBanglaPrice(activeVariant.price)}</span>
                                            {activeVariant.discountPrice && (
                                                <span className="price-discount" style={{ fontSize: "0.8rem" }}>{toBanglaPrice(activeVariant.discountPrice)}</span>
                                            )}
                                        </div>
                                        <button 
                                            className="add-mini-btn" 
                                            onClick={() => addToCart(p, currentWeight, activeVariant.price)}
                                            aria-label="Add item"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
