"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";

export const Testimonials: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const reviews = [
        {
            text: "PrettyFresh is a game-changer! The vegetables were extremely fresh, crisp, and clean. Delivery took just 45 minutes to my flat. Recommended for daily items.",
            name: "Sajid Al Hasan",
            role: "Verified Customer, Banani",
            initials: "S.A",
            avatarClass: "bg-avatar-1"
        },
        {
            text: "I love their replacement policy. Last week one papaya was slightly overripe. I requested a refund, and within 10 minutes they replaced it for free! Amazing service.",
            name: "Farhana Jahan",
            role: "Verified Customer, Gulshan",
            initials: "F.J",
            avatarClass: "bg-avatar-2"
        },
        {
            text: "Excellent quality of meats and fish. They are properly gutted and packed in chilled packages. Buying fish was never this easy. The app is fast too!",
            name: "Niaz Islam",
            role: "Verified Customer, Dhanmondi",
            initials: "N.I",
            avatarClass: "bg-avatar-3"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [reviews.length]);

    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="section-header">
                    <div className="section-title-wrapper">
                        <span className="subtitle">Customer Reviews</span>
                        <h2 className="section-title">What Our Customers Say</h2>
                    </div>
                    <p className="section-desc">We take pride in our service. See what our local customers are saying about us.</p>
                </div>

                <div className="testimonials-carousel-wrapper">
                    <div className="carousel-container">
                        <div 
                            className="carousel-track" 
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {reviews.map((rev, idx) => (
                                <div key={idx} className="testimonial-slide">
                                    <div className="testi-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={18} className="fill" fill="#FFD54F" stroke="#FFD54F" />
                                        ))}
                                    </div>
                                    <p className="testi-text">"{rev.text}"</p>
                                    <div className="testi-user">
                                        <div className={`user-avatar ${rev.avatarClass}`}>
                                            {rev.initials}
                                        </div>
                                        <div className="user-meta">
                                            <h4 className="user-name">{rev.name}</h4>
                                            <span className="user-role">{rev.role}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Navigation Dots */}
                    <div className="carousel-dots">
                        {reviews.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`dot ${activeIndex === idx ? "active" : ""}`}
                                onClick={() => setActiveIndex(idx)}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
