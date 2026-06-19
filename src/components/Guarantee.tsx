"use client";

import React from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, BadgeCheck, HelpCircle } from "lucide-react";

export const Guarantee: React.FC = () => {
    const { setRefundOpen } = useCart();

    return (
        <section className="guarantee-section">
            <div className="container">
                <div className="guarantee-banner-card">
                    <div className="guarantee-content">
                        <span className="guarantee-badge">
                            <ShieldCheck size={14} /> Quality Verified
                        </span>
                        <h2 className="guarantee-title">Our Strict Freshness Guarantee</h2>
                        <p className="guarantee-subtitle">
                            If you are not 100% satisfied with the quality of any produce item, we will instantly replace it or credit your wallet. No long discussions, no returns hassle.
                        </p>
                        
                        <div className="guarantee-checks">
                            <div className="check-item">
                                <BadgeCheck size={20} />
                                <span>No questions asked replacement</span>
                            </div>
                            <div className="check-item">
                                <BadgeCheck size={20} />
                                <span>Direct delivery-rider verification</span>
                            </div>
                        </div>
                        
                        <button 
                            className="btn btn-accent btn-lg" 
                            onClick={() => setRefundOpen(true)}
                        >
                            <span>Claim Replacement / Refund</span>
                            <HelpCircle size={18} />
                        </button>
                    </div>
                    
                    <div className="guarantee-image-wrapper">
                        {/* Standard Image used from public asset directory */}
                        <div className="guarantee-img" style={{ position: 'relative', width: '260px', height: '260px' }}>
                            <Image 
                                src="/assets/guarantee-promo.png" 
                                alt="Freshness guarantee certification badge" 
                                fill
                                sizes="(max-width: 768px) 100vw, 260px"
                                style={{ objectFit: 'contain' }}
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
