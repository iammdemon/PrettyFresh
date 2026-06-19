"use client";

import React from "react";
import { Smartphone, Navigation, CreditCard, Bell, Play, Apple, Leaf, Truck } from "lucide-react";

export const MobileApp: React.FC = () => {
    return (
        <section className="mobile-app-section" id="mobile-app-section">
            <div className="container">
                <div className="app-layout">
                    <div className="app-info">
                        <span className="app-badge">
                            <Smartphone size={16} /> PrettyFresh Mobile App
                        </span>
                        <h2 className="app-title">Get The PrettyFresh App For Better Experience</h2>
                        <p className="app-desc">Order on the go, track live orders, and receive active discounts from your pocket.</p>
                        
                        <ul className="app-features-list">
                            <li>
                                <div className="list-icon"><Navigation size={20} /></div>
                                <div className="list-text">
                                    <h4>Live Order Tracking</h4>
                                    <p>Track your rider path from the packaging center directly to your door.</p>
                                </div>
                            </li>
                            <li>
                                <div className="list-icon"><CreditCard size={20} /></div>
                                <div className="list-text">
                                    <h4>Easy Checkout & Payments</h4>
                                    <p>Store your cards or pay securely with bKash, card, or cash-on-delivery.</p>
                                </div>
                            </li>
                            <li>
                                <div className="list-icon"><Bell size={20} /></div>
                                <div className="list-text">
                                    <h4>Instant Notifications</h4>
                                    <p>Receive order updates, receipt invoices, and special discount vouchers instantly.</p>
                                </div>
                            </li>
                        </ul>

                        <div className="download-stores">
                            <a href="#" className="store-btn" aria-label="Download on App Store">
                                <Apple className="store-logo" />
                                <div className="store-text">
                                    <span className="store-sub">Download on the</span>
                                    <span className="store-name">App Store</span>
                                </div>
                            </a>
                            <a href="#" className="store-btn" aria-label="Download on Google Play">
                                <Play className="store-logo" />
                                <div className="store-text">
                                    <span className="store-sub">GET IT ON</span>
                                    <span className="store-name">Google Play</span>
                                </div>
                            </a>
                        </div>
                    </div>
                    
                    <div className="app-mockup-wrapper">
                        {/* Phone frame mockup with visual elements inside */}
                        <div className="phone-frame">
                            <div className="phone-notch"></div>
                            <div className="phone-screen">
                                <div className="phone-header">
                                    <span className="phone-logo">
                                        <Leaf size={14} className="icon-green" /> PrettyFresh
                                    </span>
                                    <Bell size={16} className="phone-bell" />
                                </div>
                                <div className="phone-banner">
                                    <h4>Fresh Veggies</h4>
                                    <p>20% Discount Code: <strong>VEG20</strong></p>
                                </div>
                                <div className="phone-sections">
                                    <h5 style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "8px" }}>Categories</h5>
                                    <div className="phone-cat-grid">
                                        <div className="p-cat">
                                            <span style={{ fontSize: "12px", color: "var(--color-primary)" }}>🥬</span>
                                            <span>Veg</span>
                                        </div>
                                        <div className="p-cat">
                                            <span style={{ fontSize: "12px", color: "var(--color-primary)" }}>🍎</span>
                                            <span>Fruit</span>
                                        </div>
                                        <div className="p-cat">
                                            <span style={{ fontSize: "12px", color: "var(--color-primary)" }}>🥛</span>
                                            <span>Dairy</span>
                                        </div>
                                    </div>
                                    <h5 style={{ marginTop: "15px", fontWeight: 700, fontSize: "0.8rem", marginBottom: "8px" }}>Live Track Rider</h5>
                                    <div className="phone-track-card">
                                        <div className="rider-info">
                                            <div className="rider-icon animate-pulse">
                                                <Truck size={16} />
                                            </div>
                                            <div>
                                                <h6 style={{ fontWeight: 700, fontSize: "0.75rem" }}>Rahman K.</h6>
                                                <p style={{ fontSize: "0.6rem", color: "var(--color-text-muted)" }}>Arriving in 12 Mins</p>
                                            </div>
                                        </div>
                                        <div className="track-indicator"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-glow"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};
