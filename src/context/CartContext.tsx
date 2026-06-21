"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toBanglaPrice } from "@/lib/bangla";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    weight: string;
    quantity: number;
}

interface ToastState {
    open: boolean;
    message: string;
}

interface CartContextType {
    cart: CartItem[];
    wishlist: string[];
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    activeFilter: string;
    setActiveFilter: (f: string) => void;
    currentLocation: string;
    setCurrentLocation: (loc: string) => void;
    
    // UI Drawer / Modals Toggles
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    loginOpen: boolean;
    setLoginOpen: (open: boolean) => void;
    refundOpen: boolean;
    setRefundOpen: (open: boolean) => void;
    // Order Summary
    successOrderId: string;
    successTotal: string;
    setSuccessOrderId: (id: string) => void;
    setSuccessTotal: (total: string) => void;
    
    // Toast Alert
    toast: ToastState;
    triggerToast: (msg: string) => void;
    
    // Actions
    addToCart: (product: any, weight: string, price?: number) => void;
    updateQuantity: (index: number, delta: number) => void;
    removeItem: (index: number) => void;
    toggleWishlist: (id: string) => void;
    checkout: (address: string, phone: string, paymentMethod: string) => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [currentLocation, setCurrentLocation] = useState("Dhaka, Banani");
    
    const [cartOpen, setCartOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [refundOpen, setRefundOpen] = useState(false);
    
    const [successOrderId, setSuccessOrderId] = useState("");
    const [successTotal, setSuccessTotal] = useState("");
    
    const [toast, setToast] = useState<ToastState>({ open: false, message: "" });

    // Toast Timer auto close
    useEffect(() => {
        if (toast.open) {
            const timer = setTimeout(() => {
                setToast({ open: false, message: "" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.open]);

    const triggerToast = (message: string) => {
        setToast({ open: true, message });
    };

    const addToCart = (product: any, weight: string, price?: number) => {
        const itemPrice = price !== undefined ? price : product.price;
        setCart(prevCart => {
            const existingIdx = prevCart.findIndex(item => item.id === product.id && item.weight === weight);
            if (existingIdx > -1) {
                const newCart = [...prevCart];
                newCart[existingIdx].quantity += 1;
                return newCart;
            } else {
                return [...prevCart, {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: itemPrice,
                    weight,
                    quantity: 1
                }];
            }
        });
        
        triggerToast(`Added ${product.name} (${weight}) to Cart!`);
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart[index].quantity += delta;
            if (newCart[index].quantity <= 0) {
                newCart.splice(index, 1);
            }
            return newCart;
        });
    };

    const removeItem = (index: number) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            const name = newCart[index].name;
            newCart.splice(index, 1);
            triggerToast(`Removed ${name} from Cart`);
            return newCart;
        });
    };

    const toggleWishlist = (id: string) => {
        setWishlist(prev => {
            if (prev.includes(id)) {
                triggerToast("Removed from wishlist");
                return prev.filter(x => x !== id);
            } else {
                triggerToast("Added to wishlist!");
                return [...prev, id];
            }
        });
    };

    const checkout = async (address: string, phone: string, paymentMethod: string): Promise<string> => {
        if (cart.length === 0) return "";
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + 2.00;
        const orderId = "PF-" + Math.floor(10000 + Math.random() * 90000);
        
        setSuccessTotal(toBanglaPrice(total));
        setSuccessOrderId(orderId);
        
        // User is already coming from useAuth
        
        const orderData = {
            orderId,
            customerName: user?.name || "Guest Customer",
            customerEmail: user?.email || "guest@prettyfresh.com",
            customerPhone: phone || user?.phone || "Not Provided",
            address: address || user?.address || "Not Provided",
            items: cart,
            subtotal,
            deliveryFee: 2.00,
            total,
            status: "Pending",
            paymentMethod: paymentMethod
        };
        
        try {
            await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });
        } catch (err) {
            console.error("Failed to submit checkout order to MongoDB:", err);
        }
        
        setCartOpen(false);
        setCart([]);
        return orderId;
    };

    return (
        <CartContext.Provider value={{
            cart,
            wishlist,
            searchQuery,
            setSearchQuery,
            activeFilter,
            setActiveFilter,
            currentLocation,
            setCurrentLocation,
            cartOpen,
            setCartOpen,
            loginOpen,
            setLoginOpen,
            refundOpen,
            setRefundOpen,
            successOrderId,
            successTotal,
            setSuccessOrderId,
            setSuccessTotal,
            toast,
            triggerToast,
            addToCart,
            updateQuantity,
            removeItem,
            toggleWishlist,
            checkout
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
