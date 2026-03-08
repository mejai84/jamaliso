import { Suspense } from "react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/store/cart-context";
import { RestaurantProvider } from "@/providers/RestaurantProvider";
import LayoutClientWrapper from "@/components/layout-client-wrapper";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "JAMALI OS | El sistema operativo de tu restaurante",
    description: "Sistema de gestión integral para restaurantes. Con tecnología Antigravity.",
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.png',
        apple: '/icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="light" suppressHydrationWarning>
            <body className={`${outfit.className} bg-background text-foreground antialiased`}>
                <Suspense fallback={null}>
                    <RestaurantProvider>
                        <CartProvider>
                            <LayoutClientWrapper>
                                {children}
                            </LayoutClientWrapper>
                        </CartProvider>
                    </RestaurantProvider>
                </Suspense>
            </body>
        </html>
    );
}
