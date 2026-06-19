"use client";

import React from "react";
import { Sprout, Zap, BadgeDollarSign, Undo2 } from "lucide-react";

export const WhyChooseUs: React.FC = () => {
    const features = [
        {
            icon: Sprout,
            title: "Farm Fresh Products",
            desc: "Sourced directly from local certified organic farms to assure quality and taste."
        },
        {
            icon: Zap,
            title: "Super Fast Delivery",
            desc: "Our dedicated rider network delivers your daily essentials in less than 60 minutes."
        },
        {
            icon: BadgeDollarSign,
            title: "Affordable Pricing",
            desc: "Best market rates and bundle discounts, ensuring you save on every weekly purchase."
        },
        {
            icon: Undo2,
            title: "Easy Replacement",
            desc: "Not happy with freshness? We offer instant return or exchange at your doorstep."
        }
    ];

    return (
        <section className="why-choose-us-section">
            <div className="container">
                <div className="section-header">
                    <div className="section-title-wrapper">
                        <span className="subtitle font-green">Why PrettyFresh</span>
                        <h2 className="section-title text-white">Why Choose Us?</h2>
                    </div>
                    <p className="section-desc text-light">We make grocery shopping effortless, fast, and healthy for your family.</p>
                </div>
                <div className="why-grid">
                    {features.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <div key={idx} className="why-card">
                                <div className="why-icon bg-green-light">
                                    <Icon className="icon-green" size={28} />
                                </div>
                                <h3 className="why-title">{feat.title}</h3>
                                <p className="why-desc">{feat.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
