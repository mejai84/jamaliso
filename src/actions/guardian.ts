"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function authorizeEvent(alertId: string, action: 'APPROVED' | 'REJECTED') {
    const supabase = await createClient()

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error("No session found")

        // Role Check (Security Layer)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (!profile || !['owner', 'developer', 'admin'].includes(profile.role)) {
            throw new Error("Unauthorized to authorize events")
        }

        const { error } = await supabase
            .from('security_audit')
            .update({
                status: action
            })
            .eq('id', alertId)

        if (error) throw error

        revalidatePath('/admin/guardian')
        return { success: true, message: `Evento ${action === 'APPROVED' ? 'Autorizado' : 'Rechazado'} correctamente` }
    } catch (err: any) {
        console.error("Guardian Authorization Failed:", err)
        return { success: false, error: err.message }
    }
}

export async function getGuardianKPIs(restaurantId?: string) {
    const supabase = await createClient()

    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const isoToday = today.toISOString()

        let query = supabase.from('orders').select('total, subtotal, tax').gte('created_at', isoToday).neq('status', 'cancelled')
        if (restaurantId) query = query.eq('restaurant_id', restaurantId)

        const { data: orders } = await query

        const revenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

        // 2. LABOR COST (Active Shifts + Closed Today)
        let shiftsQuery = supabase.from('shifts').select(`started_at, profiles(hourly_rate)`).eq('status', 'OPEN').is('ended_at', null)
        if (restaurantId) shiftsQuery = shiftsQuery.eq('restaurant_id', restaurantId)

        const { data: openShifts } = await shiftsQuery

        let laborCost = 0
        const now = new Date()
        openShifts?.forEach((s: any) => {
            const start = new Date(s.started_at)
            const hours = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60))
            const rate = s.profiles?.hourly_rate || 0
            laborCost += hours * rate
        })

        let closedShiftsQuery = supabase.from('shifts').select('total_payment').gte('created_at', isoToday).eq('status', 'CLOSED')
        if (restaurantId) closedShiftsQuery = closedShiftsQuery.eq('restaurant_id', restaurantId)

        const { data: closedShiftsToday } = await closedShiftsQuery

        laborCost += closedShiftsToday?.reduce((sum, s) => sum + (s.total_payment || 0), 0) || 0

        // 3. COGS ESTIMATION (Standard 35%)
        const cogs = revenue * 0.35

        // 4. MARGINS
        const bruttoMargin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0
        const realizationMargin = revenue > 0 ? ((revenue - cogs - laborCost) / revenue) * 100 : 0

        // 5. SHRINKAGE (Merma hoy)
        let wasteQuery = supabase.from('inventory_movements').select('cost').eq('movement_type', 'merma').gte('created_at', isoToday)
        if (restaurantId) wasteQuery = wasteQuery.eq('restaurant_id', restaurantId)

        const { data: waste } = await wasteQuery

        const totalWaste = waste?.reduce((sum, w) => sum + (w.cost || 0), 0) || 0

        return {
            success: true,
            kpis: {
                revenue,
                bruttoMargin,
                realizationMargin,
                laborCost,
                totalWaste,
                ordersCount: orders?.length || 0
            }
        }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function getEmployeeRiskView(restaurantId?: string) {
    const supabase = await createClient()

    try {
        let query = supabase.from('guardian_employee_risk').select('*')
        if (restaurantId) query = query.eq('restaurant_id', restaurantId)

        const { data, error } = await query

        if (error) throw error

        return { success: true, riskData: data }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function getGuardianRestaurants() {
    const supabase = await createClient()

    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error("Unauthorized")

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()

        if (!profile || !['owner', 'developer', 'admin'].includes(profile.role)) {
            return { success: false, error: "Unauthorized" }
        }

        const { data: restaurants, error } = await supabase.from('restaurants').select('id, name').order('name')
        if (error) throw error

        return { success: true, restaurants }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
