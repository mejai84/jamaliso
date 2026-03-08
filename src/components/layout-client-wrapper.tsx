"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/store/footer"
import { CartSheet } from "@/components/store/cart-sheet"
import { WhatsAppButton } from "@/components/store/whatsapp-button"
import { ClientBot } from "@/components/store/client-bot"

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const isSaaSRoute = pathname === "/" ||
        pathname.startsWith("/landing") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/pricing")

    // Si NO es una ruta reservada del SaaS, asumimos que es una página de un restaurante
    // o una landing personalizada. En estos casos no queremos el footer genérico de JAMALI OS.
    const isRestaurantPage = !isSaaSRoute && pathname !== "/"

    if (isSaaSRoute || isRestaurantPage) {
        return <>{children}</>
    }

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
            <CartSheet />
            <ClientBot />
            <WhatsAppButton />
        </>
    )
}
