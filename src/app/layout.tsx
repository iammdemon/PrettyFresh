import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PrettyFresh - Fresh Groceries Delivered In 60 Mins",
  description: "Order fresh vegetables, fruits, groceries, meat, fish, and daily essentials. Fast delivery to your doorstep within 60 minutes. 100% freshness guarantee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        <NextTopLoader color="var(--color-primary)" showSpinner={false} />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
