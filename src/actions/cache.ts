'use server'

import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

/**
 * Caching centralizado con Upstash / Next.js Native Cache
 * Usamos unstable_cache para cachear la configuración del restaurante y
 * el menú en memoria o Edge de forma que soporten miles de requests por segundo
 * reduciendo dramáticamente lecturas directas a Supabase.
 */

// 1. OBTENER PERFIL/CONFIG DE RESTAURANTE CACHEADO
export const getCachedRestaurantBySlug = unstable_cache(
    async (slug: string) => {
        if (!slug) return null;

        try {
            const supabase = await createClient()
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .or(`slug.eq.${slug},subdomain.eq.${slug}`)
                .maybeSingle()

            if (error) {
                console.error("Cache Error: getCachedRestaurantBySlug -", error.message)
                return null
            }
            return data;
        } catch (error) {
            console.error("Cache FATAL:", error)
            return null
        }
    },
    ['restaurant-profile-by-slug'], // Base cache key
    {
        revalidate: 3600, // Revalida (refresca de DB) cada hora (modificable a 15 mins o 1 min)
        tags: ['restaurants-cache'] // Tag para poder hacer revalidateTag() manual en cambios
    }
)

// 2. OBTENER MENÚ GLOBAL (CATEGORÍAS + PRODUCTOS) CACHEADO
export const getCachedMenu = unstable_cache(
    async (restaurantId: string) => {
        if (!restaurantId) return { categories: [], products: [] };

        try {
            const supabase = await createClient()

            // Obtener categorías activas
            const { data: categories, error: catError } = await supabase
                .from('categories')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('is_active', true)
                .order('sort_order', { ascending: true })

            if (catError) console.error("Error Categories Cache:", catError.message)

            // Obtener productos activos
            const { data: products, error: prodError } = await supabase
                .from('products')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .eq('is_active', true)

            if (prodError) console.error("Error Products Cache:", prodError.message)

            return {
                categories: categories || [],
                products: products || []
            }
        } catch (error) {
            console.error("Cache FATAL en Menu:", error)
            return { categories: [], products: [] }
        }
    },
    ['restaurant-catalog-cache'],
    {
        revalidate: 3600, // Cada 1 hora refresca los precios o disponibilidad si nadie forzó invalidación
        tags: ['menu-cache']
    }
)
