"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/store/footer"
import { CartSheet } from "@/components/store/cart-sheet"
import { WhatsAppButton } from "@/components/store/whatsapp-button"
import { ClientBot } from "@/components/store/client-bot"

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Lista de rutas SaaS donde NO queremos mostrar componentes de restaurante (Footer global, Bot, WhatsApp, etc.)
    const isSaaSRoute = pathname === "/" ||
        pathname.startsWith("/landing") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/admin") // Admin portal has its own layout or elements

    if (isSaaSRoute) {
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
