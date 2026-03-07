import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/store/cart-context";
import { RestaurantProvider } from "@/providers/RestaurantProvider";
import LayoutClientWrapper from "@/components/layout-client-wrapper";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "JAMALI SO | Restaurante",
    description: "Sistema de gestión para restaurantes. Con tecnología Antigravity.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="light" suppressHydrationWarning>
            <body className={`${outfit.className} bg-background text-foreground antialiased`}>
                <RestaurantProvider>
                    <CartProvider>
                        <LayoutClientWrapper>
                            {children}
                        </LayoutClientWrapper>
                    </CartProvider>
                </RestaurantProvider>
            </body>
        </html>
    );
}
