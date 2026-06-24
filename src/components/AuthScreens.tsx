"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
    Leaf, ArrowLeft, Smartphone, ArrowRight, ShieldCheck, 
    Camera, User, MapPin, Navigation, AlertCircle, Eye, EyeOff, Lock, Mail
} from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// ==========================================
// HELPER CHEVRON & TOAST TRIGGERS (SIMULATION)
// ==========================================
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 9l-7 7-7-7" />
    </svg>
);

const triggerToast = (msg: string) => {
    const toast = document.getElementById("toast-notif");
    const toastMsg = toast?.querySelector(".toast-message");
    if (toast && toastMsg) {
        toastMsg.textContent = msg;
        toast.classList.add("active");
        setTimeout(() => toast.classList.remove("active"), 3000);
    }
};

// ==========================================
// 1. WELCOME SCREEN
// ==========================================
interface WelcomeProps {
    onNavigate: (screen: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeProps> = ({ onNavigate }) => {
    return (
        <div className="fade-transition" style={{ textAlign: "center" }}>
            <div className="logo" style={{ justifyContent: "center", marginBottom: "32px" }}>
                <img src="/logo.png" alt="TAZA Logo" height="32" style={{ maxHeight: "32px", width: "auto" }} />
            </div>
            
            <div style={{ position: "relative", width: "100%", height: "200px", marginBottom: "32px" }}>
                <Image 
                    src="/assets/auth-ill.png" 
                    alt="Groceries illustration" 
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                />
            </div>
            
            <h2 className="auth-title">Fresh Groceries Delivered To Your Doorstep</h2>
            <p className="auth-subtitle" style={{ marginBottom: "36px" }}>
                Order vegetables, fruits, meat, fish, and daily essentials with fast delivery.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <button className="btn btn-primary btn-lg btn-block" onClick={() => onNavigate("login")}>
                    <span>Login with Mobile</span>
                    <Smartphone size={18} />
                </button>
                
                <button className="btn btn-secondary btn-lg btn-block" onClick={() => onNavigate("register")}>
                    <span>Create An Account</span>
                    <ArrowRight size={18} />
                </button>
                
                <button 
                    className="btn btn-block" 
                    style={{ color: "var(--color-primary)", fontWeight: 700, marginTop: "12px" }}
                    onClick={() => window.location.href = "/"}
                >
                    Continue as Guest
                </button>
            </div>
        </div>
    );
};

// ==========================================
// 2. LOGIN SCREEN
// ==========================================
interface LoginProps {
    onBack: () => void;
    onNext: (phone: string) => void;
    onLoginSuccess: (user: any) => void;
    onForgotLink: () => void;
    onRegisterLink: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({ onBack, onNext, onLoginSuccess, onForgotLink, onRegisterLink }) => {
    const [loginMethod, setLoginMethod] = useState<"password" | "mobile">("password");
    
    // Email & Password login states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // Mobile number state
    const [phone, setPhone] = useState("");
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simple validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setError("");
        setLoading(true);
        
        try {
            // First call server-side route handler
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            setLoading(false);
            
            if (!res.ok || data.error) {
                setError(data.error || "Invalid credentials.");
                return;
            }

            onLoginSuccess(data.user);
        } catch (err: any) {
            console.error("Database Login Error:", err);
            setLoading(false);
            setError("Connection failed. Attempting offline backup login...");
            // Simulate fallback
            setTimeout(() => {
                onLoginSuccess({
                    name: email.split("@")[0] || "Demo User",
                    email: email,
                    phone: "01712345678",
                    avatar: "/assets/default-avatar.png",
                    provider: "Password (Simulated)"
                });
            }, 1000);
        }
    };

    const handleMobileContinue = (e: React.FormEvent) => {
        e.preventDefault();
        
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            setError("Please enter a valid 10 or 11 digit mobile number.");
            return;
        }

        setError("");
        setLoading(true);
        
        setTimeout(() => {
            setLoading(false);
            // OTP is disabled, so we route directly:
            // Since it's simulated, treat it as a successful login with mobile provider
            onLoginSuccess({
                name: "PrettyFresh Customer",
                email: `${phone}@prettyfresh.com`,
                phone: phone,
                avatar: "/assets/default-avatar.png",
                provider: "Mobile OTP-Bypassed"
            });
        }, 1200);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        let googlePayload = {
            name: "Sajib Hassan",
            email: "sajib.hassan@example.com",
            avatar: "/assets/default-avatar.png",
            provider: "Google"
        };
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const user = userCredential.user;
            googlePayload = {
                name: user.displayName || "Google User",
                email: user.email || "google@prettyfresh.com",
                avatar: user.photoURL || "/assets/default-avatar.png",
                provider: "Google"
            };
        } catch (err: any) {
            console.error("Google Auth Error warning:", err);
            triggerToast("Google Auth unconfigured. Simulating sign-in.");
        }

        // Always sync the user profile with MongoDB
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(googlePayload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                onLoginSuccess(data.user);
            } else {
                throw new Error(data.error || "Failed upsert");
            }
        } catch (dbErr) {
            console.error("Database sync failed, falling back to client simulation:", dbErr);
            onLoginSuccess(googlePayload);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-transition">
            <div className="auth-header">
                <button className="auth-back-btn" onClick={onBack} aria-label="Go back">
                    <ArrowLeft size={18} />
                </button>
                <div className="logo" style={{ fontSize: "1.25rem" }}>
                    <img src="/logo.png" alt="TAZA Logo" height="32" style={{ maxHeight: "32px", width: "auto" }} />
                </div>
            </div>

            <div className="auth-title-row" style={{ textAlign: "left", marginBottom: "16px" }}>
                <h2 className="auth-title">Welcome Back!</h2>
                <p className="auth-subtitle">Log in to manage your fresh organic orders.</p>
            </div>

            {/* Login Method Tabs */}
            <div className="auth-tabs" style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--color-border)" }}>
                <button 
                    type="button"
                    style={{ 
                        flex: 1, 
                        padding: "10px 0", 
                        fontWeight: 700, 
                        fontSize: "0.9rem",
                        borderBottom: loginMethod === "password" ? "3px solid var(--color-primary)" : "3px solid transparent", 
                        color: loginMethod === "password" ? "var(--color-primary)" : "var(--color-text-muted)",
                        transition: "var(--transition-smooth)"
                    }}
                    onClick={() => { setLoginMethod("password"); setError(""); }}
                >
                    Email & Password
                </button>
                <button 
                    type="button"
                    style={{ 
                        flex: 1, 
                        padding: "10px 0", 
                        fontWeight: 700, 
                        fontSize: "0.9rem",
                        borderBottom: loginMethod === "mobile" ? "3px solid var(--color-primary)" : "3px solid transparent", 
                        color: loginMethod === "mobile" ? "var(--color-primary)" : "var(--color-text-muted)",
                        transition: "var(--transition-smooth)"
                    }}
                    onClick={() => { setLoginMethod("mobile"); setError(""); }}
                >
                    Mobile Sign-in
                </button>
            </div>

            {loginMethod === "password" ? (
                /* Username / Password Form */
                <form onSubmit={handlePasswordLogin} className="modal-form">
                    <div className="input-field">
                        <label htmlFor="login-email">Email Address</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Mail size={18} style={{ position: "absolute", left: "12px", color: "var(--color-text-muted)" }} />
                            <input 
                                type="email" 
                                id="login-email" 
                                placeholder="name@example.com" 
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError("");
                                }}
                                style={{ paddingLeft: "40px", width: "100%" }}
                                required 
                            />
                        </div>
                    </div>

                    <div className="input-field">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label htmlFor="login-pass">Password</label>
                            <button 
                                type="button" 
                                onClick={onForgotLink}
                                style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 600, marginBottom: "4px" }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Lock size={18} style={{ position: "absolute", left: "12px", color: "var(--color-text-muted)" }} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="login-pass" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError("");
                                }}
                                style={{ paddingLeft: "40px", paddingRight: "40px", width: "100%" }}
                                required 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: "absolute", right: "12px", color: "var(--color-text-muted)" }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <span className="field-error-msg" style={{ marginTop: "8px" }}>
                            <AlertCircle size={14} /> {error}
                        </span>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block btn-lg" 
                        disabled={loading}
                        style={{ marginTop: "20px" }}
                    >
                        {loading ? "Logging in..." : "Log In"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>
            ) : (
                /* Mobile OTP Bypassed Form */
                <form onSubmit={handleMobileContinue} className="modal-form">
                    <div className="input-field">
                        <label>Mobile Number</label>
                        <div className="phone-input-group">
                            <div className="country-select-wrapper">
                                <select className="country-select" defaultValue="+880">
                                    <option value="+880">+880 (BD)</option>
                                    <option value="+1">+1 (US)</option>
                                    <option value="+44">+44 (UK)</option>
                                </select>
                                <ChevronDown className="country-select-chevron" />
                            </div>
                            <input 
                                type="tel"
                                className="phone-raw-input"
                                placeholder="01700000000"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value.replace(/\D/g, ""));
                                    if (error) setError("");
                                }}
                                maxLength={11}
                                required
                            />
                        </div>
                        {error && (
                            <span className="field-error-msg">
                                <AlertCircle size={14} /> {error}
                            </span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block btn-lg" 
                        disabled={loading || phone.length < 10}
                        style={{ marginTop: "20px" }}
                    >
                        {loading ? "Verifying..." : "Continue"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>
            )}

            <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: "12px" }}>
                <hr style={{ flexGrow: 1, border: 0, height: "1px", backgroundColor: "var(--color-border)" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)" }}>OR</span>
                <hr style={{ flexGrow: 1, border: 0, height: "1px", backgroundColor: "var(--color-border)" }} />
            </div>

            <button 
                className="btn btn-secondary btn-block btn-lg"
                onClick={handleGoogleLogin}
                disabled={loading}
            >
                <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: "8px" }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
            </button>

            <p style={{ marginTop: "32px", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                Don't have an account?{" "}
                <button 
                    onClick={onRegisterLink}
                    style={{ color: "var(--color-primary)", fontWeight: 700 }}
                >
                    Register
                </button>
            </p>
        </div>
    );
};

// ==========================================
// 3. OTP VERIFICATION SCREEN
// ==========================================
interface OtpProps {
    mobileNumber: string;
    onBack: () => void;
    onVerifySuccess: () => void;
}

export const OtpScreen: React.FC<OtpProps> = ({ mobileNumber, onBack, onVerifySuccess }) => {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(59);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const inputRefs = useRef<HTMLInputElement[]>([]);

    // Ticking OTP Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Handle typing and backspaces
    const handleDigitChange = (index: number, val: string) => {
        const cleanVal = val.replace(/\D/g, "");
        if (!cleanVal) return;

        const newOtp = [...otp];
        newOtp[index] = cleanVal.slice(-1);
        setOtp(newOtp);
        setError("");

        // Auto Focus Next digit box
        if (index < 5 && cleanVal) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
            setError("");

            // Focus Previous digit box
            if (index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    // OTP paste handler
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (text.length === 6) {
            const newOtp = text.split("");
            setOtp(newOtp);
            setError("");
            inputRefs.current[5].focus();
        }
    };

    const handleVerify = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const otpStr = otp.join("");
        if (otpStr.length < 6) {
            setError("Please fill out all 6 digits.");
            return;
        }

        setLoading(true);

        // Mock verification check: Correct code is '123456'
        setTimeout(() => {
            setLoading(false);
            if (otpStr === "123456") {
                onVerifySuccess();
            } else {
                setError("Invalid OTP! Try using correct passcode: 123456");
                // Animate clear inputs on error
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0].focus();
            }
        }, 1500);
    };

    // Auto submit when all 6 digits filled
    useEffect(() => {
        if (otp.every(d => d !== "")) {
            handleVerify();
        }
    }, [otp]);

    return (
        <div className="fade-transition">
            <div className="auth-header">
                <button className="auth-back-btn" onClick={onBack} aria-label="Go back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 700 }}>OTP Verification</span>
            </div>

            <div className="auth-title-row" style={{ textAlign: "center" }}>
                <div style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", backgroundColor: "var(--color-accent-light)", color: "var(--color-primary)", marginBottom: "16px" }}>
                    <ShieldCheck size={36} />
                </div>
                <h2 className="auth-title">Verify Your Number</h2>
                <p className="auth-subtitle">We have sent a verification code to +880 {mobileNumber}</p>
            </div>

            <form onSubmit={handleVerify}>
                <div className="otp-input-row">
                    {otp.map((digit, idx) => (
                        <input 
                            key={idx}
                            ref={el => { inputRefs.current[idx] = el as HTMLInputElement; }}
                            type="text"
                            inputMode="numeric"
                            className={`otp-digit-input ${error ? "error" : ""}`}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            onPaste={handlePaste}
                            autoFocus={idx === 0}
                            aria-label={`Digit ${idx + 1}`}
                            required
                        />
                    ))}
                </div>

                {error && (
                    <span className="field-error-msg" style={{ justifyContent: "center", marginBottom: "20px" }}>
                        <AlertCircle size={14} /> {error}
                    </span>
                )}

                <button 
                    type="submit" 
                    className="btn btn-primary btn-block btn-lg" 
                    disabled={loading || otp.some(d => d === "")}
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>
            </form>

            <div style={{ marginTop: "32px", textAlign: "center", fontSize: "0.9rem" }}>
                {timeLeft > 0 ? (
                    <span style={{ color: "var(--color-text-muted)" }}>Resend code in <strong style={{ color: "var(--color-primary)" }}>{timeLeft}s</strong></span>
                ) : (
                    <button 
                        onClick={() => {
                            setTimeLeft(59);
                            triggerToast("OTP Resent! Check your inbox.");
                        }}
                        style={{ color: "var(--color-primary)", fontWeight: 700 }}
                    >
                        Resend OTP Code
                    </button>
                )}
            </div>
        </div>
    );
};

// ==========================================
// 4. REGISTRATION SCREEN
// ==========================================
interface RegisterProps {
    onBack: () => void;
    onNext: (data: { name: string; phone: string; email: string; password?: string }) => void;
}

export const RegisterScreen: React.FC<RegisterProps> = ({ onBack, onNext }) => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [referral, setReferral] = useState("");
    
    const [nameError, setNameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let valid = true;

        if (name.length < 3) {
            setNameError("Full name must be at least 3 characters.");
            valid = false;
        }

        if (!/^[0-9]{10,11}$/.test(phone)) {
            setPhoneError("Valid 10 or 11 digit number is required.");
            valid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Please enter a valid email address.");
            valid = false;
        }

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            valid = false;
        }

        if (valid) {
            setLoading(true);
            
            // 1. Try registering via Firebase Auth client-side first
            try {
                await createUserWithEmailAndPassword(auth, email, password);
            } catch (err: any) {
                console.error("Firebase SignUp client warning:", err);
            }

            // 2. Persist the registration details in MongoDB
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, email, password })
                });
                const data = await res.json();
                
                setLoading(false);
                
                if (res.ok && data.success) {
                    onNext({ name, phone, email, password });
                } else {
                    setEmailError(data.error || "Failed to create account. Try a different email.");
                }
            } catch (dbErr) {
                console.error("Database registration failed, falling back to simulation:", dbErr);
                setLoading(false);
                triggerToast("DB connection error. Simulating local signup.");
                onNext({ name, phone, email, password });
            }
        }
    };

    return (
        <div className="fade-transition">
            <div className="auth-header">
                <button className="auth-back-btn" onClick={onBack} aria-label="Go back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 700 }}>Create Account</span>
            </div>

            <div className="auth-title-row" style={{ textAlign: "left", marginBottom: "16px" }}>
                <h2 className="auth-title">Get Started</h2>
                <p className="auth-subtitle">Register to enjoy fresh groceries delivered immediately.</p>
            </div>

            <form onSubmit={handleRegister} className="modal-form">
                <div className="input-field">
                    <label htmlFor="reg-name">Full Name</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <User size={18} style={{ position: "absolute", left: "12px", color: "var(--color-text-muted)" }} />
                        <input 
                            type="text" 
                            id="reg-name" 
                            placeholder="John Doe" 
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (nameError) setNameError("");
                            }}
                            style={{ paddingLeft: "40px", width: "100%" }}
                            required 
                        />
                    </div>
                    {nameError && <span className="field-error-msg"><AlertCircle size={14} /> {nameError}</span>}
                </div>

                <div className="input-field">
                    <label htmlFor="reg-phone">Mobile Number</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <Smartphone size={18} style={{ position: "absolute", left: "12px", color: "var(--color-text-muted)" }} />
                        <input 
                            type="tel" 
                            id="reg-phone" 
                            placeholder="e.g. 01700000000" 
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value.replace(/\D/g, ""));
                                if (phoneError) setPhoneError("");
                            }}
                            maxLength={11}
                            style={{ paddingLeft: "40px", width: "100%" }}
                            required 
                        />
                    </div>
                    {phoneError && <span className="field-error-msg"><AlertCircle size={14} /> {phoneError}</span>}
                </div>

                <div className="input-field">
                    <label htmlFor="reg-email">Email Address</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <Mail size={18} style={{ position: "absolute", left: "12px", color: "var(--color-text-muted)" }} />
                        <input 
                            type="email" 
                            id="reg-email" 
                            placeholder="john@example.com" 
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) setEmailError("");
                            }}
                            style={{ paddingLeft: "40px", width: "100%" }}
                            required
                        />
                    </div>
                    {emailError && <span className="field-error-msg"><AlertCircle size={14} /> {emailError}</span>}
                </div>

                <div className="input-field">
                    <label htmlFor="reg-password">Password</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <Lock size={18} style={{ position: "absolute", left: "12px", color: "var(--color-text-muted)" }} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="reg-password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (passwordError) setPasswordError("");
                            }}
                            style={{ paddingLeft: "40px", paddingRight: "40px", width: "100%" }}
                            required 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "12px", color: "var(--color-text-muted)" }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {passwordError && <span className="field-error-msg"><AlertCircle size={14} /> {passwordError}</span>}
                </div>

                <div className="input-field">
                    <label htmlFor="reg-referral">Referral Code (Optional)</label>
                    <input 
                        type="text" 
                        id="reg-referral" 
                        placeholder="e.g. FRESH100" 
                        value={referral}
                        onChange={(e) => setReferral(e.target.value.toUpperCase())}
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: "12px" }} disabled={loading}>
                    <span>{loading ? "Creating..." : "Create Account"}</span>
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>
        </div>
    );
};

// ==========================================
// 5. COMPLETE PROFILE SCREEN
// ==========================================
interface ProfileProps {
    defaultName: string;
    onSkip: () => void;
    onNext: (profile: { avatar: string; gender: string; dob: string }) => void;
}

export const CompleteProfileScreen: React.FC<ProfileProps> = ({ defaultName, onSkip, onNext }) => {
    const [avatar, setAvatar] = useState("/assets/default-avatar.png");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Mock Image file upload trigger
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCropImage(url);
            setShowCropper(true);
        }
    };

    const handleSaveCrop = () => {
        if (cropImage) {
            setAvatar(cropImage); // Apply cropped mockup url
        }
        setShowCropper(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onNext({ avatar, gender, dob });
    };

    return (
        <div className="fade-transition">
            <div className="auth-header" style={{ justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>Complete Profile</span>
                <button onClick={onSkip} style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.9rem" }}>
                    Skip
                </button>
            </div>

            <div className="auth-title-row" style={{ textAlign: "center", marginBottom: "16px" }}>
                <h2 className="auth-title">Tell Us More</h2>
                <p className="auth-subtitle">Add details to personalize your grocery deliveries.</p>
            </div>

            <form onSubmit={handleSave} className="modal-form">
                {/* Photo Upload Circle */}
                <div className="profile-photo-uploader">
                    <div className="avatar-preview-wrap">
                        {avatar === "/assets/default-avatar.png" ? (
                            <User size={44} className="avatar-upload-icon" />
                        ) : (
                            <img src={avatar} alt="Profile photo preview" />
                        )}
                        <label htmlFor="avatar-file" className="avatar-upload-trigger">
                            <Camera size={14} />
                            <input 
                                type="file" 
                                id="avatar-file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                style={{ display: "none" }} 
                            />
                        </label>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
                        Upload Profile Photo
                    </span>
                </div>

                {/* Cropper Mockup Modal */}
                {showCropper && cropImage && (
                    <div className="crop-modal-overlay">
                        <h4 style={{ color: "white", marginBottom: "12px" }}>Crop Profile Picture</h4>
                        <div className="crop-canvas-box">
                            <img src={cropImage} alt="Canvas source" />
                            <div className="crop-grid-bounds"></div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "240px" }}>
                            <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowCropper(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary btn-block" onClick={handleSaveCrop}>Save Crop</button>
                        </div>
                    </div>
                )}

                <div className="input-field">
                    <label>Gender</label>
                    <div className="gender-picker">
                        {["Male", "Female", "Other"].map(g => (
                            <div 
                                key={g}
                                className={`gender-option ${gender === g ? "active" : ""}`}
                                onClick={() => setGender(g)}
                            >
                                {g}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="input-field">
                    <label htmlFor="prof-dob">Date Of Birth</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input 
                            type="date" 
                            id="prof-dob" 
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: "16px" }}>
                    Save & Continue
                </button>
            </form>
        </div>
    );
};

// ==========================================
// 6. ADDRESS SETUP SCREEN
// ==========================================
interface AddressProps {
    onSkip: () => void;
    onNext: (address: string) => void;
}

export const AddressSetupScreen: React.FC<AddressProps> = ({ onSkip, onNext }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [house, setHouse] = useState("");
    const [area, setArea] = useState("");
    const [landmark, setLandmark] = useState("");
    const [instructions, setInstructions] = useState("");
    const [gpsLoading, setGpsLoading] = useState(false);

    // Mock GPS Location detection
    const handleGPSDetect = () => {
        setGpsLoading(true);
        setTimeout(() => {
            setGpsLoading(false);
            setSearchQuery("Gulshan 2 Central Park Road, Dhaka");
            setHouse("Flat 4B, Building 12");
            setArea("Gulshan 2");
            setLandmark("Near Westin Hotel");
            setInstructions("Call upon arriving at the main gate. Leave with security.");
            triggerToast("Location auto-detected successfully!");
        }, 1500);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const fullAddress = `${house}, ${area}, ${searchQuery} (Landmark: ${landmark})`;
        onNext(fullAddress);
    };

    return (
        <div className="fade-transition">
            <div className="auth-header" style={{ justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>Address Setup</span>
                <button onClick={onSkip} style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.9rem" }}>
                    Skip
                </button>
            </div>

            <div className="auth-title-row" style={{ textAlign: "left", marginBottom: "16px" }}>
                <h2 className="auth-title">Delivery Location</h2>
                <p className="auth-subtitle">Add your address to configure delivery logistics.</p>
            </div>

            <button 
                type="button" 
                className="gps-detect-btn btn-block" 
                onClick={handleGPSDetect}
                disabled={gpsLoading}
            >
                <Navigation size={18} className={gpsLoading ? "animate-pulse" : ""} />
                <span>{gpsLoading ? "Locating..." : "Use Current GPS Location"}</span>
            </button>

            {/* Google Maps Visual Preview Bounding */}
            <div className="map-visual-preview">
                <div className="map-grid-bg"></div>
                <div className="map-pin-badge">
                    <MapPin className="icon-green animate-bounce" size={16} />
                    <span>{searchQuery ? "Pinned Location" : "Centering Maps pin..."}</span>
                </div>
            </div>

            <form onSubmit={handleSave} className="modal-form">
                <div className="input-field">
                    <label htmlFor="addr-search">Search Area / Road</label>
                    <input 
                        type="text" 
                        id="addr-search" 
                        placeholder="e.g. Gulshan Road 12" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        required 
                    />
                </div>

                <div className="input-field">
                    <label htmlFor="addr-house">House / Road / Flat No.</label>
                    <input 
                        type="text" 
                        id="addr-house" 
                        placeholder="e.g. Flat 5C, Building 4" 
                        value={house}
                        onChange={(e) => setHouse(e.target.value)}
                        required 
                    />
                </div>

                <div className="input-field">
                    <label htmlFor="addr-area">Area / Zip Code</label>
                    <input 
                        type="text" 
                        id="addr-area" 
                        placeholder="e.g. Banani, Dhaka" 
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        required 
                    />
                </div>

                <div className="input-field">
                    <label htmlFor="addr-landmark">Landmark (Optional)</label>
                    <input 
                        type="text" 
                        id="addr-landmark" 
                        placeholder="e.g. Near Lake park" 
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                    />
                </div>

                <div className="input-field">
                    <label htmlFor="addr-notes">Delivery Instructions (Optional)</label>
                    <textarea 
                        id="addr-notes" 
                        rows={2} 
                        placeholder="e.g. Ring bell, do not phone..." 
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: "12px" }}>
                    Save Address
                </button>
            </form>
        </div>
    );
};

// ==========================================
// 7. FORGOT LOGIN SCREEN
// ==========================================
interface ForgotProps {
    onBack: () => void;
    onNext: (phone: string) => void;
}

export const ForgotLoginScreen: React.FC<ForgotProps> = ({ onBack, onNext }) => {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!/^[0-9]{10,11}$/.test(phone)) {
            setError("Please enter a valid 10 or 11 digit mobile number.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onNext(phone);
        }, 1200);
    };

    return (
        <div className="fade-transition">
            <div className="auth-header">
                <button className="auth-back-btn" onClick={onBack} aria-label="Go back">
                    <ArrowLeft size={18} />
                </button>
                <span style={{ fontWeight: 700 }}>Reset Password</span>
            </div>

            <div className="auth-title-row" style={{ textAlign: "left" }}>
                <h2 className="auth-title">Forgot Account?</h2>
                <p className="auth-subtitle">Enter your registered mobile number to receive a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
                <div className="input-field">
                    <label htmlFor="forgot-phone">Registered Phone Number</label>
                    <input 
                        type="tel" 
                        id="forgot-phone" 
                        placeholder="01700000000" 
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value.replace(/\D/g, ""));
                            if (error) setError("");
                        }}
                        maxLength={11}
                        required 
                    />
                    {error && <span className="field-error-msg"><AlertCircle size={14} /> {error}</span>}
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: "16px" }} disabled={loading}>
                    {loading ? "Sending..." : "Send OTP Code"}
                </button>
            </form>
        </div>
    );
};

// ==========================================
// 8. ACCOUNT SUCCESS SCREEN
// ==========================================
export const AccountSuccessScreen: React.FC = () => {
    const handleDashboard = () => {
        window.location.href = "/dashboard";
    };

    return (
        <div className="fade-transition" style={{ textAlign: "center" }}>
            <div className="success-checkmark-wrapper animate-bounce">
                <ShieldCheck size={44} />
            </div>
            
            <h2 className="auth-title">Account Created!</h2>
            <p className="auth-subtitle" style={{ marginBottom: "36px", padding: "0 10px" }}>
                Your account has been created successfully. Access your dashboard to track your orders, points, and delivery logistics.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <button className="btn btn-primary btn-lg btn-block" onClick={handleDashboard}>
                    Go to Dashboard
                </button>
                <button 
                    className="btn btn-secondary btn-lg btn-block" 
                    onClick={() => window.location.href = "/"}
                >
                    Start Shopping
                </button>
            </div>
        </div>
    );
};


