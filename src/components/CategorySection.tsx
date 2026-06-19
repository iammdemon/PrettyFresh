"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { Carrot, Apple, ShoppingBag, Waves, Beef, Egg, Milk, CupSoda, ChevronRight } from "lucide-react";

export const CategorySection: React.FC = () => {
    const { setActiveFilter } = useCart();

    const categories = [
        { id: "vegetables", name: "Vegetables", count: "120+ Items", icon: Carrot, colorClass: "bg-veg" },
        { id: "fruits", name: "Fruits", count: "80+ Items", icon: Apple, colorClass: "bg-fruits" },
        { id: "grocery", name: "Grocery", count: "250+ Items", icon: ShoppingBag, colorClass: "bg-grocery" },
        { id: "fish", name: "Fish", count: "40+ Items", icon: Waves, colorClass: "bg-fish" },
        { id: "meat", name: "Meat", count: "35+ Items", icon: Beef, colorClass: "bg-meat" },
        { id: "eggs", name: "Eggs", count: "15+ Items", icon: Egg, colorClass: "bg-eggs" },
        { id: "dairy", name: "Dairy", count: "60+ Items", icon: Milk, colorClass: "bg-dairy" },
        { id: "beverages", name: "Beverages", count: "90+ Items", icon: CupSoda, colorClass: "bg-beverages" }
    ];

    const handleCategorySelect = (categoryId: string) => {
        setActiveFilter(categoryId);
        const section = document.getElementById("featured-products-section");
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 90,
                behavior: "smooth"
            });
        }
    };

    return (
        <section className="category-section" id="category-section">
            <div className="container">
                <div className="section-header">
                    <div className="section-title-wrapper">
                        <span className="subtitle">Explore Categories</span>
                        <h2 className="section-title">Shop By Category</h2>
                    </div>
                    <p className="section-desc">Select from our wide range of premium quality organic categories.</p>
                </div>
                <div className="category-grid">
                    {categories.map(cat => {
                        const IconComponent = cat.icon;
                        return (
                            <div 
                                key={cat.id} 
                                className="category-card" 
                                onClick={() => handleCategorySelect(cat.id)}
                            >
                                <div className={`category-icon-bg ${cat.colorClass}`}>
                                    <IconComponent size={28} />
                                </div>
                                <h3 className="category-name">{cat.name}</h3>
                                <span className="category-count">{cat.count}</span>
                                <button 
                                    className="category-link" 
                                    aria-label={`Shop ${cat.name}`}
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
