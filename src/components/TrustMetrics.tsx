"use client";

import React from "react";
import { Users, Sprout, Truck, ShieldCheck } from "lucide-react";

export const TrustMetrics: React.FC = () => {
    return (
        <section className="trust-metrics-section">
            <div className="container">
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon-wrapper">
                            <Users />
                        </div>
                        <div className="metric-info">
                            <h3 className="metric-number">10,000+</h3>
                            <p className="metric-label">Happy Customers</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon-wrapper">
                            <Sprout />
                        </div>
                        <div className="metric-info">
                            <h3 className="metric-number">500+</h3>
                            <p className="metric-label">Fresh Products</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon-wrapper">
                            <Truck />
                        </div>
                        <div className="metric-info">
                            <h3 className="metric-number">Same Day</h3>
                            <p className="metric-label">Superfast Delivery</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon-wrapper">
                            <ShieldCheck />
                        </div>
                        <div className="metric-info">
                            <h3 className="metric-number">100%</h3>
                            <p className="metric-label">Freshness Guarantee</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
