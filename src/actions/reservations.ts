"use server"

import { supabase } from "@/lib/supabase/client"
import { revalidatePath } from "next/cache"

export type ReservationInput = {
    restaurant_id: string
    customer_name: string
    customer_email?: string
    customer_phone: string
    reservation_date: string
    reservation_time: string
    num_people: number
    notes?: string
}

export async function createReservation(input: ReservationInput) {
    try {
        const { data, error } = await supabase
            .from('reservations')
            .insert([input])
            .select()
            .single()

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        console.error("Error creating reservation:", error)
        return { success: false, error: error.message }
    }
}

export async function getReservationsByRestaurant(restaurantId: string) {
    try {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('reservation_date', { ascending: true })
            .order('reservation_time', { ascending: true })

        if (error) throw error
        return { success: true, data }
    } catch (error: any) {
        console.error("Error fetching reservations:", error)
        return { success: false, error: error.message }
    }
}

export async function updateReservationStatus(id: string, status: string) {
    try {
        const { error } = await supabase
            .from('reservations')
            .update({ status })
            .eq('id', id)

        if (error) throw error
        revalidatePath('/admin/reservations')
        return { success: true }
    } catch (error: any) {
        console.error("Error updating reservation:", error)
        return { success: false, error: error.message }
    }
}
