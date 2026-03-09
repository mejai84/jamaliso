'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function clearRestaurantCache() {
    try {
        revalidateTag('restaurants-cache')
        revalidatePath('/[slug]', 'layout')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateRestaurantProfile(restaurantId: string, updates: any) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('restaurants')
            .update(updates)
            .eq('id', restaurantId)

        if (error) throw error

        // Limpiamos caché para que la landing se actualice inmediatamente
        revalidateTag('restaurants-cache')
        revalidatePath('/[slug]', 'layout')

        return { success: true }
    } catch (error: any) {
        console.error("Error updating restaurant:", error)
        return { success: false, error: error.message }
    }
}
