"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toBanglaPrice } from "@/lib/bangla";

export interface CartItem {
    id: number;
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
    wishlist: number[];
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
    checkoutSuccessOpen: boolean;
    setCheckoutSuccessOpen: (open: boolean) => void;
    
    // Order Summary
    successOrderId: string;
    successTotal: string;
    
    // Toast Alert
    toast: ToastState;
    triggerToast: (msg: string) => void;
    
    // Actions
    addToCart: (product: any, weight: string) => void;
    updateQuantity: (index: number, delta: number) => void;
    removeItem: (index: number) => void;
    toggleWishlist: (id: number) => void;
    checkout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [wishlist, setWishlist] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [currentLocation, setCurrentLocation] = useState("Dhaka, Banani");
    
    const [cartOpen, setCartOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [refundOpen, setRefundOpen] = useState(false);
    const [checkoutSuccessOpen, setCheckoutSuccessOpen] = useState(false);
    
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

    const addToCart = (product: any, weight: string) => {
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
                    price: product.price,
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

    const toggleWishlist = (id: number) => {
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

    const checkout = () => {
        if (cart.length === 0) return;
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + 2.00;
        
        setSuccessTotal(toBanglaPrice(total));
        setSuccessOrderId("PF-" + Math.floor(10000 + Math.random() * 90000));
        
        setCartOpen(false);
        setCheckoutSuccessOpen(true);
        setCart([]);
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
            checkoutSuccessOpen,
            setCheckoutSuccessOpen,
            successOrderId,
            successTotal,
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
