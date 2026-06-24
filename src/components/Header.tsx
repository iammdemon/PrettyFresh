"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Leaf, MapPin, Grid, ChevronDown, Search, X, User, ShoppingCart, ShieldCheck } from "lucide-react";
import { toBanglaPrice } from "@/lib/bangla";

export const Header: React.FC = () => {
    const {
        cart,
        searchQuery,
        setSearchQuery,
        currentLocation,
        setCurrentLocation,
        setCartOpen,
        setLoginOpen,
        setActiveFilter
    } = useCart();

    const [locationMenuOpen, setLocationMenuOpen] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user } = useAuth();

    // Track scroll event to change style
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menus on outside click
    useEffect(() => {
        const handleOutsideClick = () => {
            setLocationMenuOpen(false);
            setCategoryMenuOpen(false);
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCategoryClick = (category: string) => {
        setActiveFilter(category);
        const section = document.getElementById("featured-products-section");
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 90,
                behavior: "smooth"
            });
        }
    };

    return (
        <header className={`sticky-header ${scrolled ? "scrolled" : ""}`} id="main-header">
            <div className="header-container">
                {/* Logo */}
                <a href="#" className="logo" aria-label="PrettyFresh Home">
                    <img src="/logo.png" alt="TAZA Logo" height="32" style={{ maxHeight: "32px", width: "auto" }} />
                </a>


                {/* Categories Dropdown Trigger */}
                <div className={`categories-dropdown-container ${categoryMenuOpen ? "active" : ""}`}>
                    <button 
                        className="categories-btn" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setCategoryMenuOpen(!categoryMenuOpen);
                            setLocationMenuOpen(false);
                        }}
                        aria-haspopup="true" 
                        aria-expanded={categoryMenuOpen}
                    >
                        <Grid />
                        <span>Categories</span>
                        <ChevronDown className="chevron" />
                    </button>
                    <div className="categories-menu">
                        <ul>
                            {[
                                { code: "vegetables", name: "Vegetables" },
                                { code: "fruits", name: "Fruits" },
                                { code: "grocery", name: "Grocery" },
                                { code: "dairy", name: "Dairy" }
                            ].map(cat => (
                                <li key={cat.code}>
                                    <button onClick={() => handleCategoryClick(cat.code)}>
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="search-bar">
                    <Search className="search-icon" />
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        placeholder="Search for fresh vegetables, fruits, groceries..." 
                        aria-label="Search products"
                    />
                    <button 
                        className={`search-clear-btn ${searchQuery.length > 0 ? "visible" : ""}`} 
                        onClick={() => setSearchQuery("")} 
                        aria-label="Clear search"
                    >
                        <X />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="header-actions">
                    {user && (user.role === "super_admin" || user.role === "admin") && (
                        <button 
                            className="login-btn" 
                            onClick={() => window.location.href = "/admin"}
                            style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
                        >
                            <ShieldCheck className="icon-green" />
                            <span>Admin</span>
                        </button>
                    )}
                    {user ? (
                        <button className="login-btn" onClick={() => window.location.href = "/dashboard"}>
                            <User className="icon-green" />
                            <span>{user.name.split(" ")[0]}</span>
                        </button>
                    ) : (
                        <button className="login-btn" onClick={() => window.location.href = "/auth"}>
                            <User />
                            <span>Login</span>
                        </button>
                    )}
                    <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Open cart">
                        <div className="cart-icon-wrapper">
                            <ShoppingCart />
                            <span className="cart-badge">{totalItems}</span>
                        </div>
                        <span className="cart-text">{toBanglaPrice(subtotal)}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
