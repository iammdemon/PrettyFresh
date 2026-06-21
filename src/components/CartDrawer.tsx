"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { X, ShoppingBasket, Trash2, CreditCard } from "lucide-react";
import { toBanglaPrice, toBanglaNumber } from "@/lib/bangla";
import { useRouter } from "next/navigation";

export const CartDrawer: React.FC = () => {
    const {
        cart,
        cartOpen,
        setCartOpen,
        updateQuantity,
        removeItem,
        triggerToast
    } = useCart();
    
    const router = useRouter();

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = totalItems > 0 ? 2.00 : 0.00;
    const total = subtotal + deliveryCharge;

    const handleClose = () => setCartOpen(false);

    const handleShopNow = () => {
        setCartOpen(false);
        const section = document.getElementById("featured-products-section");
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 90,
                behavior: "smooth"
            });
        }
    };

    const { user } = useAuth();

    const handleProceedCheckout = () => {
        if (user) {
            setCartOpen(false);
            router.push("/checkout");
        } else {
            setCartOpen(false);
            triggerToast("Please login or create an account to place an order.");
            router.push("/auth");
        }
    };

    return (
        <>
            {/* Drawer Overlay */}
            <div 
                className={`cart-drawer-overlay ${cartOpen ? "active" : ""}`} 
                onClick={handleClose}
            ></div>
            
            {/* Drawer Content */}
            <div 
                className={`cart-drawer ${cartOpen ? "active" : ""}`}
                aria-hidden={!cartOpen}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping Cart"
            >
                <div className="cart-drawer-header">
                    <h3>My Shopping Cart ({toBanglaNumber(totalItems)})</h3>
                    <button className="close-cart-btn" onClick={handleClose} aria-label="Close cart">
                        <X />
                    </button>
                </div>
                
                <div className="cart-drawer-body">
                    {cart.length === 0 ? (
                        <div className="empty-cart-state active">
                            <ShoppingBasket className="empty-cart-icon" />
                            <p>Your cart is empty!</p>
                            <span>Add delicious fresh organic vegetables to start.</span>
                            <button className="btn btn-primary" onClick={handleShopNow}>
                                Shop Vegetables
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items-list">
                            {cart.map((item, index) => (
                                <div key={`${item.id}-${item.weight}`} className="cart-item">
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-details">
                                        <h4 className="cart-item-name">{item.name}</h4>
                                        <span className="cart-item-weight">{item.weight}</span>
                                        <span className="cart-item-price">{toBanglaPrice(item.price * item.quantity)}</span>
                                        <div className="cart-item-controls" style={{ marginTop: "8px" }}>
                                            <button 
                                                className="cart-control-btn"
                                                onClick={() => updateQuantity(index, -1)}
                                            >
                                                -
                                            </button>
                                            <span className="cart-qty-value">{toBanglaNumber(item.quantity)}</span>
                                            <button 
                                                className="cart-control-btn"
                                                onClick={() => updateQuantity(index, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        className="remove-item-btn" 
                                        onClick={() => removeItem(index)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="subtotal-row">
                            <span>Subtotal:</span>
                            <span className="subtotal-amount">{toBanglaPrice(subtotal)}</span>
                        </div>
                        <div className="delivery-row">
                            <span>Delivery Charge:</span>
                            <span className="delivery-charge">{toBanglaPrice(deliveryCharge)}</span>
                        </div>
                        <hr className="cart-divider" />
                        <div className="total-row">
                            <span>Estimated Total:</span>
                            <span className="total-amount">{toBanglaPrice(total)}</span>
                        </div>
                        
                        <button className="btn btn-primary btn-block" onClick={handleProceedCheckout}>
                            <span>Proceed to Checkout</span>
                            <CreditCard size={18} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
