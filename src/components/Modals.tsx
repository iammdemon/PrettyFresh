"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, PartyPopper, CheckCircle } from "lucide-react";
import { toBanglaNumber } from "@/lib/bangla";
import { LoginScreen, RegisterScreen, ForgotLoginScreen } from "@/components/AuthScreens";

export const Modals: React.FC = () => {
    const {
        loginOpen,
        setLoginOpen,
        refundOpen,
        setRefundOpen,
        triggerToast
    } = useCart();

    const [loginPhone, setLoginPhone] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    
    const [claimOrderId, setClaimOrderId] = useState("");
    const [claimReason, setClaimReason] = useState("");

    const [authView, setAuthView] = useState<"login" | "register" | "forgot">("login");

    const handleCloseAll = () => {
        setLoginOpen(false);
        setRefundOpen(false);
        setAuthView("login");
    };

    const handleAuthSuccess = (userData: any) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("prettyfresh_user", JSON.stringify(userData));
        }
        triggerToast("Logged in successfully!");
        setLoginOpen(false);
        setAuthView("login");
    };

    const handleRegisterSuccess = async (data: { name: string; phone: string; email: string; password?: string }) => {
        const userData = {
            name: data.name || "PrettyFresh Member",
            email: data.email || "member@prettyfresh.com",
            phone: data.phone || "",
            avatar: "/assets/default-avatar.png",
            gender: "Not Specified",
            dob: "",
            address: "Not Provided",
            provider: "Email & Password",
            role: "customer"
        };
        
        if (typeof window !== "undefined") {
            localStorage.setItem("prettyfresh_user", JSON.stringify(userData));
        }

        try {
            await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        } catch (e) {}
        
        triggerToast("Registered successfully!");
        setLoginOpen(false);
        setAuthView("login");
    };

    const handleRefundSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRefundOpen(false);
        triggerToast("Claim submitted! Our support team will call you within 15 mins.");
        setClaimOrderId("");
        setClaimReason("");
    };

    const isAnyOpen = loginOpen || refundOpen;

    return (
        <>
            {/* Modal Overlay */}
            <div 
                className={`modal-overlay ${isAnyOpen ? "active" : ""}`}
                onClick={handleCloseAll}
            ></div>
            
            {/* Auth Modal */}
            <div className={`modal-card ${loginOpen ? "active" : ""}`} style={{ padding: "30px", maxHeight: "90vh", overflowY: "auto" }}>
                <button className="modal-close" onClick={() => { setLoginOpen(false); setAuthView("login"); }} aria-label="Close modal">
                    <X size={16} />
                </button>
                
                {authView === "login" && (
                    <LoginScreen 
                        onBack={() => { setLoginOpen(false); setAuthView("login"); }} 
                        onNext={() => setAuthView("register")} 
                        onLoginSuccess={handleAuthSuccess}
                        onForgotLink={() => setAuthView("forgot")}
                        onRegisterLink={() => setAuthView("register")} 
                    />
                )}
                {authView === "register" && (
                    <RegisterScreen 
                        onBack={() => setAuthView("login")} 
                        onNext={handleRegisterSuccess} 
                    />
                )}
                {authView === "forgot" && (
                    <ForgotLoginScreen 
                        onBack={() => setAuthView("login")} 
                        onNext={(phone: string) => {
                            triggerToast(`Reset link sent to ${phone}!`);
                            setAuthView("login");
                        }} 
                    />
                )}
            </div>

            {/* Refund Modal */}
            <div className={`modal-card ${refundOpen ? "active" : ""}`}>
                <button className="modal-close" onClick={() => setRefundOpen(false)} aria-label="Close modal">
                    <X size={16} />
                </button>
                <div className="modal-header">
                    <h3>Refund & Exchange Claim</h3>
                    <p>We stand by our quality. Submit your claim below.</p>
                </div>
                <form className="modal-form" onSubmit={handleRefundSubmit}>
                    <div className="input-field">
                        <label htmlFor="claim-order-id">Order ID</label>
                        <input 
                            type="text" 
                            id="claim-order-id" 
                            placeholder="e.g. PF-98741" 
                            value={claimOrderId}
                            onChange={(e) => setClaimOrderId(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-field">
                        <label htmlFor="claim-reason">Issue Description</label>
                        <textarea 
                            id="claim-reason" 
                            rows={3} 
                            placeholder="Tell us which items were not fresh..." 
                            value={claimReason}
                            onChange={(e) => setClaimReason(e.target.value)}
                            required 
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-accent btn-block">Submit Claim</button>
                </form>
            </div>
        </>
    );
};
