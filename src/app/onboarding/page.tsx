"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Navigation, ArrowRight, Home, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function Onboarding() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [area, setArea] = useState("");
    const [houseNo, setHouseNo] = useState("");

    // Geolocation state
    const [isLocating, setIsLocating] = useState(false);

    const { user: authUser, isLoading: isAuthLoading, login } = useAuth();

    useEffect(() => {
        if (!isAuthLoading) {
            if (authUser) {
                // If they are fully onboarded, no need to be here
                if (authUser.phone && authUser.phone !== "" && authUser.address && authUser.address !== "Not Provided") {
                    router.push("/dashboard");
                    return;
                }
                
                setUser(authUser);
                setName(authUser.name || "");
                setPhone(authUser.phone || "");
                // Try to parse existing address if it's not the default
                if (authUser.address && authUser.address !== "Not Provided") {
                    setArea(authUser.address);
                }
            } else {
                router.push("/auth");
            }
            setLoading(false);
        }
    }, [authUser, isAuthLoading, router]);

    const handleAutoLocate = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Use OpenStreetMap Nominatim for free reverse geocoding
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    
                    if (data && data.address) {
                        // Extract useful parts
                        const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || "";
                        const city = data.address.city || data.address.town || data.address.county || "";
                        const road = data.address.road || "";
                        
                        let formattedArea = [suburb, city].filter(Boolean).join(", ");
                        if (formattedArea) setArea(formattedArea);
                        if (road) setHouseNo(road); // Pre-fill road as house/street info
                    }
                } catch (err) {
                    console.error("Geocoding failed:", err);
                    toast.error("Could not automatically find your location. Please enter manually.");
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast.error("Location access denied or unavailable. Please enter manually.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !phone || !area || !houseNo) {
            toast.error("Please fill in all fields.");
            return;
        }

        setSubmitting(true);
        try {
            const combinedAddress = `${houseNo}, ${area}`;
            
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    name: name.trim(),
                    phone: phone.trim(),
                    address: combinedAddress,
                    gender: user.gender,
                    dob: user.dob,
                    avatar: user.avatar
                })
            });
            const data = await res.json();
            if (data.success) {
                const freshUser = { ...user, name: name.trim(), phone: phone.trim(), address: combinedAddress };
                login(freshUser);
                
                // Onboarding complete!
                toast.success("Profile setup complete!");
                router.push("/dashboard");
            } else {
                toast.error("Failed to save profile: " + data.error);
                setSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
            setSubmitting(false);
        }
    };

    if (loading || !user) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
                <Loader2 size={40} className="animate-spin" color="var(--color-primary)" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div style={{
                backgroundColor: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                width: "100%",
                maxWidth: "500px",
                overflow: "hidden",
                border: "1px solid var(--color-border)"
            }}>
                {/* Header Banner */}
                <div style={{ 
                    backgroundColor: "var(--color-primary)", 
                    padding: "32px 24px",
                    textAlign: "center",
                    color: "white"
                }}>
                    <div style={{ 
                        width: "64px", height: "64px", 
                        backgroundColor: "rgba(255,255,255,0.2)", 
                        borderRadius: "50%", 
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 16px"
                    }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 8px 0" }}>Welcome to PrettyFresh!</h1>
                    <p style={{ opacity: 0.9, fontSize: "0.95rem", margin: 0 }}>
                        Let's finish setting up your account so we can deliver fresh groceries right to your door.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: "32px 24px" }}>
                    
                    {/* Basic Info */}
                    <div style={{ marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", color: "var(--color-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <User size={18} className="icon-green" /> Personal Details
                        </h2>
                        
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Full Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "0.95rem", outline: "none" }}
                                required
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Mobile Number</label>
                            <div style={{ position: "relative" }}>
                                <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 01700000000"
                                    style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "0.95rem", outline: "none" }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <hr style={{ border: 0, height: "1px", backgroundColor: "var(--color-border)", margin: "24px 0" }} />

                    {/* Delivery Info */}
                    <div style={{ marginBottom: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                                <MapPin size={18} className="icon-green" /> Delivery Address
                            </h2>
                            <button 
                                type="button"
                                onClick={handleAutoLocate}
                                disabled={isLocating}
                                style={{ 
                                    display: "flex", alignItems: "center", gap: "6px", 
                                    background: "transparent", border: "none", color: "var(--color-primary)", 
                                    fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", padding: "4px 8px", borderRadius: "4px"
                                }}
                            >
                                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                                {isLocating ? "Locating..." : "Auto-Locate"}
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>City / Area</label>
                            <input 
                                type="text" 
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder="e.g. Uttara, Dhaka"
                                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "0.95rem", outline: "none" }}
                                required
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>House & Street Info</label>
                            <div style={{ position: "relative" }}>
                                <Home size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                                <input 
                                    type="text" 
                                    value={houseNo}
                                    onChange={(e) => setHouseNo(e.target.value)}
                                    placeholder="e.g. House 12, Road 5, Block C"
                                    style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "0.95rem", outline: "none" }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="btn btn-primary" 
                        style={{ width: "100%", padding: "14px", fontSize: "1.05rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                    >
                        {submitting ? "Saving Profile..." : "Complete Setup"} 
                        {!submitting && <ArrowRight size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
