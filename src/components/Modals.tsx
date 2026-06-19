"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, PartyPopper, CheckCircle } from "lucide-react";
import { toBanglaNumber } from "@/lib/bangla";

export const Modals: React.FC = () => {
    const {
        loginOpen,
        setLoginOpen,
        refundOpen,
        setRefundOpen,
        checkoutSuccessOpen,
        setCheckoutSuccessOpen,
        successOrderId,
        successTotal,
        triggerToast
    } = useCart();

    const [loginPhone, setLoginPhone] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    
    const [claimOrderId, setClaimOrderId] = useState("");
    const [claimReason, setClaimReason] = useState("");

    const handleCloseAll = () => {
        setLoginOpen(false);
        setRefundOpen(false);
        setCheckoutSuccessOpen(false);
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginOpen(false);
        triggerToast("Logged in successfully!");
        setLoginPhone("");
        setLoginPassword("");
    };

    const handleRefundSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRefundOpen(false);
        triggerToast("Claim submitted! Our support team will call you within 15 mins.");
        setClaimOrderId("");
        setClaimReason("");
    };

    const isAnyOpen = loginOpen || refundOpen || checkoutSuccessOpen;

    return (
        <>
            {/* Modal Overlay */}
            <div 
                className={`modal-overlay ${isAnyOpen ? "active" : ""}`}
                onClick={handleCloseAll}
            ></div>
            
            {/* Login Modal */}
            <div className={`modal-card ${loginOpen ? "active" : ""}`}>
                <button className="modal-close" onClick={() => setLoginOpen(false)} aria-label="Close modal">
                    <X size={16} />
                </button>
                <div className="modal-header">
                    <h3>Login to PrettyFresh</h3>
                    <p>Welcome back! Enter details to manage your orders.</p>
                </div>
                <form className="modal-form" onSubmit={handleLoginSubmit}>
                    <div className="input-field">
                        <label htmlFor="login-phone">Mobile Number</label>
                        <input 
                            type="tel" 
                            id="login-phone" 
                            placeholder="e.g. +8801700000000" 
                            value={loginPhone}
                            onChange={(e) => setLoginPhone(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-field">
                        <label htmlFor="login-password">Password</label>
                        <input 
                            type="password" 
                            id="login-password" 
                            placeholder="••••••••" 
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Log In</button>
                </form>
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

            {/* Checkout Success Modal */}
            <div className={`modal-card ${checkoutSuccessOpen ? "active" : ""}`}>
                <button className="modal-close" onClick={() => setCheckoutSuccessOpen(false)} aria-label="Close modal">
                    <X size={16} />
                </button>
                <div className="modal-success-icon">
                    <PartyPopper size={32} />
                </div>
                <div className="modal-header text-center">
                    <h3>Order Placed Successfully!</h3>
                    <p>Thank you for shopping with PrettyFresh.</p>
                </div>
                <div className="order-summary-box">
                    <p>Your Order ID: <strong>{toBanglaNumber(successOrderId)}</strong></p>
                    <p>Rider will arrive in <strong className="text-green">{toBanglaNumber("58")} Minutes</strong></p>
                    <p>Total Charge: <strong id="success-total-price">{successTotal}</strong> (Cash on Delivery)</p>
                </div>
                <button className="btn btn-primary btn-block" onClick={() => setCheckoutSuccessOpen(false)}>
                    Track Order
                </button>
            </div>
        </>
    );
};
