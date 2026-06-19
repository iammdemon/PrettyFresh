"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, Download, CheckCircle, Clock, Percent } from "lucide-react";

export const Hero: React.FC = () => {
    const handleShopNow = (e: React.MouseEvent) => {
        e.preventDefault();
        const section = document.getElementById("featured-products-section");
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 90,
                behavior: "smooth"
            });
        }
    };

    const handleDownloadApp = (e: React.MouseEvent) => {
        e.preventDefault();
        const section = document.getElementById("mobile-app-section");
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 90,
                behavior: "smooth"
            });
        }
    };

    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-content">
                    <span className="hero-badge animate-fade-in">
                        <Sparkles size={16} /> 100% Organic & Fresh Essentials
                    </span>
                    <h1 className="hero-title">
                        Fresh Groceries Delivered <br />
                        <span className="highlight-text">To Your Doorstep</span>
                    </h1>
                    <p className="hero-subtitle">
                        Order vegetables, fruits, groceries, meat, fish, and daily essentials with fast delivery.
                    </p>
                    <div className="hero-ctas">
                        <a href="#featured-products-section" onClick={handleShopNow} className="btn btn-primary btn-lg">
                            <span>Shop Now</span>
                            <ArrowRight size={18} />
                        </a>
                        <a href="#mobile-app-section" onClick={handleDownloadApp} className="btn btn-secondary btn-lg">
                            <Download size={18} />
                            <span>Download App</span>
                        </a>
                    </div>
                    <div className="hero-features">
                        <div className="hero-feat-item">
                            <CheckCircle className="feat-icon" />
                            <span>No Minimum Order</span>
                        </div>
                        <div className="hero-feat-item">
                            <CheckCircle className="feat-icon" />
                            <span>Easy Cancellation</span>
                        </div>
                    </div>
                </div>
                
                <div className="hero-image-wrapper">
                    {/* Standard Image used from public asset directory */}
                    <div className="hero-main-img" style={{ position: 'relative', width: '540px', height: '400px' }}>
                        <Image 
                            src="/assets/hero-fresh.png" 
                            alt="Fresh vegetable basket with happy family background" 
                            fill
                            sizes="(max-width: 768px) 100vw, 540px"
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                    
                    {/* Floating delivery badge */}
                    <div className="floating-badge delivery-badge animate-bounce">
                        <div className="badge-icon">
                            <Clock />
                        </div>
                        <div className="badge-text">
                            <span className="badge-title">Delivery Within</span>
                            <span className="badge-value">60 Minutes</span>
                        </div>
                    </div>
                    
                    <div className="floating-badge discount-badge animate-float">
                        <div className="badge-icon green">
                            <Percent />
                        </div>
                        <div className="badge-text">
                            <span className="badge-title">Mega Discount</span>
                            <span className="badge-value">Up to 30% Off</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
