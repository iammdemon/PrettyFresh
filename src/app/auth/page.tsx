"use client";

import React, { useState } from "react";
import { 
    LoginScreen, OtpScreen, RegisterScreen, 
    CompleteProfileScreen, AddressSetupScreen, ForgotLoginScreen, AccountSuccessScreen 
} from "@/components/AuthScreens";
import { useAuth } from "@/context/AuthContext";

type AuthScreenState = "login" | "otp" | "register" | "profile" | "address" | "forgot" | "success";

export default function AuthPage() {
    const [screen, setScreen] = useState<AuthScreenState>("login");
    const [history, setHistory] = useState<AuthScreenState[]>(["login"]);

    // Temporary User contexts
    const [mobileNumber, setMobileNumber] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [address, setAddress] = useState("");

    // Screen transition helpers
    const navigateTo = (nextScreen: AuthScreenState) => {
        setScreen(nextScreen);
        setHistory(prev => [...prev, nextScreen]);
    };

    const navigateBack = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop(); // Remove current screen
            const prevScreen = newHistory[newHistory.length - 1];
            setScreen(prevScreen);
            setHistory(newHistory);
        } else {
            window.location.href = "/";
        }
    };

    // Calculate onboarding step progress bar values
    const getProgress = () => {
        switch (screen) {
            case "login": return 25;
            case "forgot": return 25;
            case "otp": return 45;
            case "register": return 65;
            case "profile": return 80;
            case "address": return 90;
            case "success": return 100;
            default: return 0;
        }
    };

    const { login } = useAuth();

    const handleLoginContinue = (phone: string) => {
        setMobileNumber(phone);
        // OTP is disabled, so mobile login proceeds directly to register (as a new flow)
        navigateTo("register");
    };

    const handleLoginSuccess = (userData: any) => {
        login(userData);
        
        // Onboarding Check
        if (!userData.phone || userData.phone === "" || !userData.address || userData.address === "Not Provided") {
            window.location.href = "/onboarding";
        } else {
            window.location.href = "/dashboard";
        }
    };

    const handleForgotContinue = (phone: string) => {
        if (typeof window !== "undefined") {
            const toast = document.getElementById("toast-notif");
            const toastMsg = toast?.querySelector(".toast-message");
            if (toast && toastMsg) {
                toastMsg.textContent = `Reset link sent to +880 ${phone}`;
                toast.classList.add("active");
                setTimeout(() => toast.classList.remove("active"), 3000);
            }
        }
        navigateTo("login");
    };

    const handleRegisterContinue = (data: { name: string; phone: string; email: string; password?: string }) => {
        setName(data.name);
        setMobileNumber(data.phone);
        setEmail(data.email);
        navigateTo("profile");
    };

    const handleProfileContinue = (data: { avatar: string; gender: string; dob: string }) => {
        setAvatar(data.avatar);
        setGender(data.gender);
        setDob(data.dob);
        navigateTo("address");
    };

    const handleAddressContinue = async (fullAddress: string) => {
        setAddress(fullAddress);
        
        // Save the completed session user data to localStorage
        const userData = {
            name: name || "PrettyFresh Member",
            email: email || "member@prettyfresh.com",
            phone: mobileNumber || "",
            avatar: avatar || "/assets/default-avatar.png",
            gender: gender || "Not Specified",
            dob: dob || "",
            address: fullAddress,
            provider: "Email & Password",
            role: "customer"
        };
        login(userData);

        try {
            await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });
        } catch (e) {
            console.error("Failed to sync profile to MongoDB:", e);
        }
        
        navigateTo("success");
    };

    // Screen Selector compiles correct layouts
    const renderActiveScreen = () => {
        switch (screen) {
            case "login":
                return (
                    <LoginScreen 
                        onBack={navigateBack} 
                        onNext={handleLoginContinue} 
                        onLoginSuccess={handleLoginSuccess}
                        onForgotLink={() => navigateTo("forgot")}
                        onRegisterLink={() => navigateTo("register")} 
                    />
                );
            case "forgot":
                return (
                    <ForgotLoginScreen 
                        onBack={navigateBack} 
                        onNext={handleForgotContinue} 
                    />
                );
            case "otp":
                // Kept for type safety, but bypassed
                return (
                    <OtpScreen 
                        mobileNumber={mobileNumber} 
                        onBack={navigateBack} 
                        onVerifySuccess={() => navigateTo("success")} 
                    />
                );
            case "register":
                return (
                    <RegisterScreen 
                        onBack={navigateBack} 
                        onNext={handleRegisterContinue} 
                    />
                );
            case "profile":
                return (
                    <CompleteProfileScreen 
                        defaultName={name} 
                        onSkip={() => navigateTo("address")} 
                        onNext={handleProfileContinue} 
                    />
                );
            case "address":
                return (
                    <AddressSetupScreen 
                        onSkip={async () => {
                            // On skip address, save user with current address info or default
                            const userData = {
                                name: name || "PrettyFresh Member",
                                email: email || "member@prettyfresh.com",
                                phone: mobileNumber || "",
                                avatar: avatar || "/assets/default-avatar.png",
                                gender: gender || "Not Specified",
                                dob: dob || "",
                                address: "Not Provided",
                                provider: "Email & Password",
                                role: "customer"
                            };
                            login(userData);
                            try {
                                await fetch("/api/user/profile", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(userData)
                                });
                            } catch (e) {
                                console.error("Failed to sync skipped profile to MongoDB:", e);
                            }
                            navigateTo("success");
                        }} 
                        onNext={handleAddressContinue} 
                    />
                );
            case "success":
                return <AccountSuccessScreen />;
            default:
                return (
                    <LoginScreen 
                        onBack={navigateBack} 
                        onNext={handleLoginContinue} 
                        onLoginSuccess={handleLoginSuccess}
                        onForgotLink={() => navigateTo("forgot")}
                        onRegisterLink={() => navigateTo("register")} 
                    />
                );
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* Onboarding progress bar (Except success screen) */}
                {screen !== "success" && (
                    <div className="auth-progress-bar" role="progressbar" aria-valuenow={getProgress()} aria-valuemin={0} aria-valuemax={100}>
                        <div className="auth-progress-fill" style={{ width: `${getProgress()}%` }}></div>
                    </div>
                )}
                
                {renderActiveScreen()}
            </div>
            
            {/* Toast Box structure matches the page.tsx configuration */}
            <div className="toast-notification" id="toast-notif">
                <span className="toast-message">Action processed!</span>
            </div>
        </div>
    );
}
