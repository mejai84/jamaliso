"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import { usePathname, useSearchParams } from "next/navigation"

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
    is_web_active?: boolean
    web_mode?: 'menu' | 'ecommerce'
    allow_pickup?: boolean
    allow_delivery?: boolean
    instagram_url?: string
    facebook_url?: string
    tiktok_url?: string
    youtube_url?: string
    pinterest_url?: string
    cuisine_type?: string
    custom_seo_title?: string
    custom_seo_description?: string
    whatsapp_float_enabled?: boolean
    whatsapp_custom_message?: string
    promo_banner_text?: string
    promo_banner_enabled?: boolean
    address_text?: string
    google_maps_link?: string
    online_hours_config?: any
    tenant_id?: string
    language?: 'en' | 'es'
}

interface RestaurantContextType {
    restaurant: Restaurant | null
    loading: boolean
    lang: 'en' | 'es'
    accessibleRestaurants: Restaurant[]
    refreshRestaurant: () => Promise<void>
    setLanguage: (lang: 'en' | 'es') => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType>({
    restaurant: null,
    loading: true,
    lang: 'en',
    accessibleRestaurants: [],
    refreshRestaurant: async () => { },
    setLanguage: async () => { }
})

export const useRestaurant = () => useContext(RestaurantContext)

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [loading, setLoading] = useState(true)
    const [lang, setLang] = useState<'en' | 'es'>('en')
    const [accessibleRestaurants, setAccessibleRestaurants] = useState<Restaurant[]>([])

    const MOCK_RESTAURANT: Restaurant = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'JAMALI Sandbox',
        subdomain: 'demo',
        logo_url: '/images/jamali-os-logo.png',
        primary_color: '#F97316',
        theme: 'light',
        currency_symbol: '$',
        tax_percentage: 19,
        apply_service_charge: true,
        service_charge_percentage: 10,
        language: 'en'
    }

    const setUpdateLanguage = async (newLang: 'en' | 'es') => {
        setLang(newLang)
        if (restaurant?.id && restaurant.id !== MOCK_RESTAURANT.id) {
            try {
                await supabase
                    .from('restaurants')
                    .update({ language: newLang })
                    .eq('id', restaurant.id)
            } catch (err) {
                console.error("Error updating language:", err)
            }
        }
    }

    const pathname = usePathname()
    const searchParams = useSearchParams()

    const initRestaurant = async () => {
        try {
            setLoading(true)
            const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
            const isDemo = searchParams.get('demo') === 'true'

            if (isDemo) {
                setRestaurant(MOCK_RESTAURANT)
                setAccessibleRestaurants([MOCK_RESTAURANT])
                applyBranding(MOCK_RESTAURANT)
                setLoading(false)
                return
            }

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

            // 2. Resolver por Slug en la URL: /[slug], /[slug]/menu, /[slug]/admin, etc.
            if (!currentRes && pathname && pathname !== '/') {
                const segments = pathname.split('/').filter(Boolean)
                const firstSegment = segments[0]

                // Lista de palabras reservadas del SaaS que NO son slugs de restaurante
                const reserved = ['register', 'login', 'landing', 'checkout', 'pricing', 'about', 'contact', 'support', 'api']

                if (firstSegment && !reserved.includes(firstSegment)) {
                    const { data: resBySlug } = await supabase
                        .from('restaurants')
                        .select('*')
                        .or(`slug.eq.${firstSegment},subdomain.eq.${firstSegment}`)
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
                            .order('name')
                        if (allRes) setAccessibleRestaurants(allRes)
                    } else {
                        // Regular Admin - fetch all restaurants in the same tenant
                        const tId = currentRes?.tenant_id || (profile as any)?.restaurants?.tenant_id
                        if (tId) {
                            const { data: tenantRes } = await supabase
                                .from('restaurants')
                                .select('*')
                                .eq('tenant_id', tId)
                                .order('name')
                            if (tenantRes) setAccessibleRestaurants(tenantRes)
                        } else if (currentRes) {
                            setAccessibleRestaurants([currentRes])
                        } else if ((profile as any)?.restaurants) {
                            setAccessibleRestaurants([(profile as any).restaurants])
                        }
                    }
                }
            }

            if (currentRes) {
                setRestaurant(currentRes)
                applyBranding(currentRes)

                // Detectar Lenguaje: Prioridad BD > Navegador > English (Default)
                if (currentRes.language) {
                    setLang(currentRes.language)
                } else if (typeof window !== 'undefined') {
                    const browserLang = navigator.language.split('-')[0]
                    const detected = (browserLang === 'es' || browserLang === 'en') ? browserLang : 'en'
                    setLang(detected)
                }
            }

        } catch (error) {
            console.error("Error context initializing:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        initRestaurant()
    }, [pathname, searchParams])

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
        <RestaurantContext.Provider value={{
            restaurant,
            loading,
            lang,
            accessibleRestaurants,
            refreshRestaurant: initRestaurant,
            setLanguage: setUpdateLanguage
        }}>
            {children}
        </RestaurantContext.Provider>
    )
}
