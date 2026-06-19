"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Flame, Plus } from "lucide-react";

export const BAZAAR_PRODUCTS = [
    {
        id: 9,
        name: "Crisp Green Bell Pepper",
        image: "https://images.unsplash.com/photo-1580201006675-4131b3157790?w=400&auto=format&fit=crop&q=80",
        price: 0.99,
        discountPrice: 1.49,
        weight: "250g",
        freshness: "98% Freshness Score"
    },
    {
        id: 10,
        name: "Organic Strawberries Box",
        image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80",
        price: 3.49,
        discountPrice: 4.49,
        weight: "250g Box",
        freshness: "Picked Today"
    },
    {
        id: 11,
        name: "Pure Clover Honey",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80",
        price: 5.99,
        discountPrice: 7.49,
        weight: "500g",
        freshness: "100% Organic"
    },
    {
        id: 12,
        name: "Fresh Garden Broccoli",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80",
        price: 1.19,
        discountPrice: 1.69,
        weight: "500g",
        freshness: "Morning Harvest"
    }
];

export const DailyBazaar: React.FC = () => {
    const { addToCart } = useCart();
    const [timeLeft, setTimeLeft] = useState(3 * 60 * 60 + 24 * 60 + 15); // 3h 24m 15s

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

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

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
                        {BAZAAR_PRODUCTS.map(p => (
                            <div key={p.id} className="bazaar-card">
                                <div className="card-top">
                                    <span className="fresh-badge">{p.freshness}</span>
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
                                <span className="weight-lbl">{p.weight}</span>
                                
                                <div className="price-row">
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span className="price-current">${p.price.toFixed(2)}</span>
                                        <span className="price-discount" style={{ fontSize: "0.8rem" }}>${p.discountPrice.toFixed(2)}</span>
                                    </div>
                                    <button 
                                        className="add-mini-btn" 
                                        onClick={() => addToCart(p, p.weight)}
                                        aria-label="Add item"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
