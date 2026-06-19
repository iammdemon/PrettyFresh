"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Mail, Send } from "lucide-react";

export const Newsletter: React.FC = () => {
    const { triggerToast } = useCart();
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            triggerToast(`Discount Voucher sent to ${email}!`);
            setEmail("");
        }
    };

    return (
        <section className="newsletter-section">
            <div className="container">
                <div className="newsletter-card">
                    <div className="newsletter-bg-glow"></div>
                    <div className="newsletter-content">
                        <Mail className="mail-icon" size={48} />
                        <h2 className="newsletter-title">Get Exclusive Deals & Weekly Discounts</h2>
                        <p className="newsletter-subtitle">
                            Subscribe to our newsletter and get <strong>$10 discount</strong> on your first grocery delivery order.
                        </p>
                        
                        <form className="newsletter-form" onSubmit={handleSubmit}>
                            <div className="input-wrapper">
                                <Mail size={20} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address" 
                                    required 
                                    aria-label="Newsletter email address" 
                                />
                            </div>
                            <button type="submit" className="btn btn-dark">
                                <span>Subscribe Now</span>
                                <Send size={16} />
                            </button>
                        </form>
                        <p className="newsletter-privacy">We respect your privacy. Unsubscribe at any time.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
