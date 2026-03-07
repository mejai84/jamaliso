"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

/**
 * StoreFooterWrapper
 * 
 * Muestra el Footer público de la tienda SOLO en rutas que NO son /admin*.
 * Esto evita que el footer de la store aparezca en el panel de operaciones.
 */
export function StoreFooterWrapper() {
    const pathname = usePathname()

    // No renderizar en ninguna ruta admin
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
        return null
    }

    return <Footer />
}
