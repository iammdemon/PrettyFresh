"use client";

import React, { useState } from "react";
import { 
    WelcomeScreen, LoginScreen, OtpScreen, RegisterScreen, 
    CompleteProfileScreen, AddressSetupScreen, ForgotLoginScreen, AccountSuccessScreen 
} from "@/components/AuthScreens";

type AuthScreenState = "welcome" | "login" | "otp" | "register" | "profile" | "address" | "forgot" | "success";

export default function AuthPage() {
    const [screen, setScreen] = useState<AuthScreenState>("welcome");
    const [history, setHistory] = useState<AuthScreenState[]>(["welcome"]);

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
            case "welcome": return 10;
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

    const handleLoginContinue = (phone: string) => {
        setMobileNumber(phone);
        navigateTo("otp");
    };

    const handleRegisterContinue = (data: { name: string; phone: string; email: string }) => {
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

    const handleAddressContinue = (fullAddress: string) => {
        setAddress(fullAddress);
        navigateTo("success");
    };

    // Screen Selector compiles correct layouts
    const renderActiveScreen = () => {
        switch (screen) {
            case "welcome":
                return <WelcomeScreen onNavigate={(s) => navigateTo(s as AuthScreenState)} />;
            case "login":
                return (
                    <LoginScreen 
                        onBack={navigateBack} 
                        onNext={handleLoginContinue} 
                        onRegisterLink={() => navigateTo("register")} 
                    />
                );
            case "forgot":
                return (
                    <ForgotLoginScreen 
                        onBack={navigateBack} 
                        onNext={handleLoginContinue} 
                    />
                );
            case "otp":
                return (
                    <OtpScreen 
                        mobileNumber={mobileNumber} 
                        onBack={navigateBack} 
                        onVerifySuccess={() => {
                            // If the user name is empty, it means they are registering for the first time
                            if (!name) {
                                navigateTo("register");
                            } else {
                                navigateTo("success");
                            }
                        }} 
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
                        onSkip={() => navigateTo("success")} 
                        onNext={handleAddressContinue} 
                    />
                );
            case "success":
                return <AccountSuccessScreen />;
            default:
                return <WelcomeScreen onNavigate={(s) => navigateTo(s as AuthScreenState)} />;
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
