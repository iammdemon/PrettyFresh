"use client";

import React, { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustMetrics } from "@/components/TrustMetrics";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { DailyBazaar } from "@/components/DailyBazaar";
import { HowItWorks } from "@/components/HowItWorks";
import { MobileApp } from "@/components/MobileApp";
import { Testimonials } from "@/components/Testimonials";
import { Guarantee } from "@/components/Guarantee";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Modals } from "@/components/Modals";
import { CheckCircle } from "lucide-react";

export default function Home() {
    const { toast } = useCart();

    // Scroll reveal animation implementation in React
    useEffect(() => {
        const revealElements = document.querySelectorAll(
            ".trust-metrics-section, .category-card, .why-card, .timeline-step, .testimonial-slide, .product-card, .bazaar-card"
        );
        
        revealElements.forEach(el => {
            el.classList.add("scroll-reveal");
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });

        return () => {
            revealElements.forEach(el => {
                revealObserver.unobserve(el);
            });
        };
    }, []);

    return (
        <>
            {/* Navigation Header */}
            <Header />

            {/* Main Sections */}
            <main>
                <Hero />
                <TrustMetrics />
                <CategorySection />
                <FeaturedProducts />
                <WhyChooseUs />
                <DailyBazaar />
                <HowItWorks />
                <MobileApp />
                <Testimonials />
                <Guarantee />
                <Newsletter />
            </main>

            {/* Footer */}
            <Footer />

            {/* Cart Drawer & Dialog Modals */}
            <CartDrawer />
            <Modals />

            {/* Notification Toast Alert */}
            <div className={`toast-notification ${toast.open ? "active" : ""}`} id="toast-notif">
                <CheckCircle className="toast-icon" />
                <span className="toast-message">{toast.message}</span>
            </div>
        </>
    );
}
