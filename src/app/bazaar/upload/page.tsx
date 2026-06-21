"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Camera, CheckCircle2, XCircle, Loader2, ArrowLeft, Plus, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function BazaarUpload() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    const { user: authUser, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (authUser) {
                setUser(authUser);
            } else {
                router.push("/auth?redirect=/bazaar/upload");
            }
        }
    }, [authUser, isLoading, router]);

    
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            setFile(droppedFile);
            setPreviewUrl(URL.createObjectURL(droppedFile));
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        try {
            const base64 = await convertToBase64(file);
            const response = await fetch("/api/bazaar/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: base64 })
            });

            const data = await response.json();
            if (data.success) {
                setResults(data.results);
                toast.success("List analyzed successfully!");
            } else {
                toast.error(data.error || "Analysis failed.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddToList = () => {
        // Here we would typically save to the database as a template
        // For now, we'll store in localStorage to pass to the manual builder or checkout
        const validItems = results?.filter(r => r.matchedProduct).map(r => ({
            ...r.matchedProduct,
            quantity: 1 // Default to 1 unit, could parse the detected quantity better
        })) || [];

        if (validItems.length === 0) {
            toast.error("No valid products to add.");
            return;
        }

        localStorage.setItem("bazaar_draft", JSON.stringify(validItems));
        toast.success("Items added to Monthly Bazaar!");
        router.push("/bazaar/manual"); // Send them to the manual builder to review and save
    };

    return (
        <main style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", minHeight: "100vh" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "32px", fontSize: "1rem" }}>
                <ArrowLeft size={18} /> Back to Bazaar Builder
            </button>

            {!results ? (
                // --- UPLOAD STATE ---
                <div style={{ textAlign: "center" }}>
                    <h1 style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--color-primary-dark)", marginBottom: "16px" }}>Upload Your Bazaar List</h1>
                    <p style={{ fontSize: "1.1rem", color: "var(--color-text-muted)", marginBottom: "40px" }}>Our AI will read your handwriting and match products instantly.</p>
                    
                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{
                            border: "2px dashed var(--color-border)",
                            borderRadius: "var(--radius-xl)",
                            padding: "60px 40px",
                            backgroundColor: "var(--color-white)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        onClick={() => !file && fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            style={{ display: "none" }} 
                        />
                        
                        {previewUrl ? (
                            <div style={{ width: "100%", position: "relative" }}>
                                <img src={previewUrl} alt="Preview" style={{ maxHeight: "400px", maxWidth: "100%", borderRadius: "var(--radius-lg)", objectFit: "contain" }} />
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                                    style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", padding: "8px", cursor: "pointer" }}
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <UploadCloud size={40} />
                                </div>
                                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>Click to upload or drag & drop</div>
                                <p style={{ color: "var(--color-text-muted)" }}>Supports PNG, JPG, JPEG (Max 5MB)</p>
                            </>
                        )}
                    </div>

                    <div style={{ marginTop: "32px" }}>
                        <button 
                            onClick={handleAnalyze}
                            disabled={!file || isAnalyzing}
                            className="btn btn-primary"
                            style={{ fontSize: "1.1rem", padding: "16px 40px", borderRadius: "var(--radius-full)" }}
                        >
                            {isAnalyzing ? (
                                <><Loader2 className="animate-spin" size={20} /> Analyzing Image...</>
                            ) : (
                                <><Zap size={20} /> Build My Cart</>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                // --- REVIEW STATE ---
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary-dark)", marginBottom: "8px" }}>Review Your Bazaar</h1>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: "32px" }}>We've matched your list with our catalog. Please verify before continuing.</p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", alignItems: "start" }}>
                        {/* Original Image */}
                        <div style={{ backgroundColor: "var(--color-white)", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                            <div style={{ fontWeight: 600, marginBottom: "12px", fontSize: "0.9rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Original List</div>
                            <img src={previewUrl!} alt="Original List" style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }} />
                        </div>

                        {/* Matches */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {results.map((item, idx) => (
                                <div key={idx} style={{ 
                                    backgroundColor: "var(--color-white)", 
                                    borderRadius: "var(--radius-lg)", 
                                    padding: "20px", 
                                    border: `1px solid ${item.matchedProduct ? "var(--color-primary)" : "#f44336"}`,
                                    boxShadow: "var(--shadow-sm)"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <div>
                                            <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Detected Text</div>
                                            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{item.originalName} <span style={{ color: "var(--color-primary)" }}>{item.originalQuantity}</span></div>
                                        </div>
                                        {item.matchedProduct ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: 600, fontSize: "0.85rem", backgroundColor: "var(--color-primary-light)", padding: "4px 12px", borderRadius: "12px" }}>
                                                <CheckCircle2 size={16} /> Matched
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d32f2f", fontWeight: 600, fontSize: "0.85rem", backgroundColor: "#ffcdd2", padding: "4px 12px", borderRadius: "12px" }}>
                                                <XCircle size={16} /> No Match
                                            </div>
                                        )}
                                    </div>

                                    {item.matchedProduct && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px", backgroundColor: "var(--color-bg)", padding: "12px", borderRadius: "var(--radius-md)" }}>
                                            {item.matchedProduct.image && <img src={item.matchedProduct.image} alt="Product" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />}
                                            <div style={{ flexGrow: 1 }}>
                                                <div style={{ fontWeight: 600 }}>{item.matchedProduct.name}</div>
                                                <div style={{ color: "var(--color-primary)", fontWeight: 700 }}>৳{item.matchedProduct.price}</div>
                                            </div>
                                        </div>
                                    )}

                                    {item.alternatives && item.alternatives.length > 0 && !item.matchedProduct && (
                                        <div style={{ marginTop: "12px" }}>
                                            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "8px" }}>Suggested Alternatives:</div>
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                {item.alternatives.map((alt: any) => (
                                                    <div key={alt.id} style={{ fontSize: "0.8rem", padding: "6px 12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", cursor: "pointer" }}>
                                                        {alt.name} - ৳{alt.price}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                                <button onClick={() => setResults(null)} className="btn btn-secondary">Upload Another</button>
                                <button onClick={handleAddToList} className="btn btn-primary" style={{ paddingLeft: "32px", paddingRight: "32px" }}>Continue to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
