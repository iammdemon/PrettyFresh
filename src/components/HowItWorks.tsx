"use client";

import React from "react";
import { Search, ShoppingCart, Calendar, PackageCheck } from "lucide-react";

export const HowItWorks: React.FC = () => {
    const steps = [
        {
            num: 1,
            icon: Search,
            title: "Browse Products",
            desc: "Explore 500+ fresh items and load them to your virtual cart."
        },
        {
            num: 2,
            icon: ShoppingCart,
            title: "Add To Cart",
            desc: "Review details, customize item weights and choose quantity."
        },
        {
            num: 3,
            icon: Calendar,
            title: "Choose Time",
            desc: "Select convenient delivery slots, ranging from instant (60m) to late evening."
        },
        {
            num: 4,
            icon: PackageCheck,
            title: "Receive Order",
            desc: "Our delivery partner arrives at your gate. Verify fresh checklist, then pay."
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="container">
                <div className="section-header">
                    <div className="section-title-wrapper">
                        <span className="subtitle">Simple Steps</span>
                        <h2 className="section-title">How It Works</h2>
                    </div>
                    <p className="section-desc">Get fresh vegetables and organic groceries in four easy steps.</p>
                </div>
                
                <div className="timeline-container">
                    <div className="timeline-progress"></div>
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={idx} className="timeline-step">
                                <div className="step-num">{step.num}</div>
                                <div className="step-icon">
                                    <Icon size={32} />
                                </div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-desc">{step.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
