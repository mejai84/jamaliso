"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"

interface Restaurant {
    id: string
    name: string
    subdomain: string
    slug?: string
    logo_url: string | null
    primary_color: string
    theme?: 'light' | 'dark'
    apply_service_charge?: boolean
    service_charge_percentage?: number
    loyalty_points_per_1000?: number
    currency_symbol?: string
    tax_percentage?: number
    whatsapp_number?: string
    enable_whatsapp_receipts?: boolean
    landing_page_config?: any
    custom_domain?: string
    online_store_enabled?: boolean
}

interface RestaurantContextType {
    restaurant: Restaurant | null
    loading: boolean
    accessibleRestaurants: Restaurant[]
    refreshRestaurant: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType>({
    restaurant: null,
    loading: true,
    accessibleRestaurants: [],
    refreshRestaurant: async () => { }
})

export const useRestaurant = () => useContext(RestaurantContext)

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [loading, setLoading] = useState(true)
    const [accessibleRestaurants, setAccessibleRestaurants] = useState<Restaurant[]>([])

    const initRestaurant = async () => {
        try {
            setLoading(true)
            const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
            const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

            // 1. Resolver por Subdominio (Prioridad Máxima)
            let currentRes: Restaurant | null = null
            const isSystemDomain = hostname.includes('.vercel.app') || hostname === 'localhost' || hostname.includes('127.0.0.1')
            const isCustomDomain = hostname.includes('.jamalios.com')

            if (isCustomDomain || (!isSystemDomain && hostname.includes('.'))) {
                const subdomain = isCustomDomain ? hostname.split('.')[0] : hostname
                const { data: resBySub } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('subdomain', subdomain)
                    .maybeSingle()

                if (resBySub) currentRes = resBySub
            }

            // 2. Resolver por Slug en la URL: /[slug]/menu, /[slug]/admin, etc.
            if (!currentRes && pathname) {
                const slugMatch = pathname.match(/^\/([a-z0-9-]+)\/(menu|admin|login)/)
                if (slugMatch) {
                    const urlSlug = slugMatch[1]
                    const { data: resBySlug } = await supabase
                        .from('restaurants')
                        .select('*')
                        .or(`slug.eq.${urlSlug},subdomain.eq.${urlSlug}`)
                        .maybeSingle()

                    if (resBySlug) currentRes = resBySlug
                }
            }

            // 3. Fallback: No se asigna restaurante por defecto en dominios de sistema
            // para evitar que la landing SaaS cargue datos de un restaurante aleatorio.

            // 2. Obtener Sesión y Perfil
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*, restaurants(*)')
                    .eq('id', session.user.id)
                    .maybeSingle()

                // 3. Si no hay restaurante por subdominio, usar el del perfil
                if (!currentRes && profile?.restaurant_id) {
                    const { data: resData } = await supabase
                        .from('restaurants')
                        .select('*')
                        .eq('id', profile.restaurant_id)
                        .maybeSingle()
                    if (resData) currentRes = resData
                }

                // 4. Lógica Multi-Negocio para Propietarios/Admins
                if (profile?.role === 'admin' || profile?.role === 'super_admin') {
                    if (profile.role === 'super_admin') {
                        const { data: allRes } = await supabase
                            .from('restaurants')
                            .select('*')
                            .eq('is_active', true)
                            .order('name')
                        if (allRes) setAccessibleRestaurants(allRes)
                    } else {
                        if (currentRes) setAccessibleRestaurants([currentRes])
                    }
                }
            }

            if (currentRes) {
                setRestaurant(currentRes)
                applyBranding(currentRes)
            }

        } catch (error) {
            console.error("Error context initializing:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        initRestaurant()
    }, [])

    const applyBranding = (res: Restaurant) => {
        if (res.primary_color) {
            document.documentElement.style.setProperty('--primary', res.primary_color)
            const hex = res.primary_color.replace('#', '')
            const r = parseInt(hex.slice(0, 2), 16)
            const g = parseInt(hex.slice(2, 4), 16)
            const b = parseInt(hex.slice(4, 6), 16)
            document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`)
        }

        if (res.theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        if (res.landing_page_config?.styles?.background_color) {
            document.documentElement.style.setProperty('--background', res.landing_page_config.styles.background_color)
        } else {
            document.documentElement.style.removeProperty('--background')
        }
    }

    return (
        <RestaurantContext.Provider value={{ restaurant, loading, accessibleRestaurants, refreshRestaurant: initRestaurant }}>
            {children}
        </RestaurantContext.Provider>
    )
}
