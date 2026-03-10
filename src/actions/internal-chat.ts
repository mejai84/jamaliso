'use server'

/**
 * JAMALI OS: Acciones del Sistema de Chat Interno Multi-Área
 * Permite enviar y consultar mensajes entre áreas del restaurante.
 * (Mesero ↔ Cocina ↔ Caja ↔ Admin ↔ Bar)
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { AreaType, MessageType, AREA_LABELS } from '@/lib/constants/chat'

export interface SendMessageParams {
    restaurantId: string
    fromArea: AreaType
    fromName: string
    toArea: AreaType
    message: string
    messageType?: MessageType
    metadata?: Record<string, any>
}

export interface InternalMessage {
    id: string
    restaurant_id: string
    from_area: AreaType
    from_name: string
    to_area: AreaType
    message: string
    message_type: MessageType
    is_read: boolean
    read_at: string | null
    metadata: Record<string, any>
    created_at: string
}

/**
 * Envía un mensaje interno entre áreas del restaurante.
 */
export async function sendInternalMessage(params: SendMessageParams) {
    const supabase = await createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Sesión no válida' }

        const { error } = await supabase.from('internal_messages').insert({
            restaurant_id: params.restaurantId,
            from_area: params.fromArea,
            from_name: params.fromName,
            to_area: params.toArea,
            message: params.message,
            message_type: params.messageType || 'text',
            metadata: params.metadata || {},
            is_read: false,
        })

        if (error) return { success: false, error: error.message }

        // Revalidar paths relevantes según el área destino
        if (params.toArea === 'kitchen' || params.toArea === 'all') revalidatePath('/admin/kitchen')
        if (params.toArea === 'waiter' || params.toArea === 'all') revalidatePath('/admin/waiter')
        if (params.toArea === 'cashier' || params.toArea === 'all') revalidatePath('/admin/cash')

        return { success: true, message: 'Mensaje enviado' }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * Obtiene los mensajes del chat para un área específica.
 * Incluye mensajes recibidos (to_area = myArea | 'all') y enviados (from_area = myArea).
 */
export async function getInternalMessages(
    restaurantId: string,
    myArea: AreaType,
    limit: number = 50
): Promise<{ success: boolean; data?: InternalMessage[]; error?: string }> {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase
            .from('internal_messages')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .or(`to_area.eq.${myArea},to_area.eq.all,from_area.eq.${myArea}`)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) return { success: false, error: error.message }

        // Eliminar duplicados (si un mensaje tiene from_area = myArea Y to_area = myArea)
        const unique = data?.filter((msg, idx, arr) =>
            arr.findIndex(m => m.id === msg.id) === idx
        ) || []

        return { success: true, data: unique.reverse() as InternalMessage[] }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * Marca todos los mensajes de un área como leídos.
 */
export async function markMessagesAsRead(restaurantId: string, myArea: AreaType) {
    const supabase = await createClient()
    try {
        await supabase
            .from('internal_messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('restaurant_id', restaurantId)
            .or(`to_area.eq.${myArea},to_area.eq.all`)
            .eq('is_read', false)

        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * Cuenta los mensajes no leídos para un área.
 */
export async function getUnreadCount(restaurantId: string, myArea: AreaType) {
    const supabase = await createClient()
    try {
        const { count, error } = await supabase
            .from('internal_messages')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurantId)
            .or(`to_area.eq.${myArea},to_area.eq.all`)
            .eq('is_read', false)
            .neq('from_area', myArea)

        if (error) return { success: false, count: 0 }
        return { success: true, count: count || 0 }
    } catch (e: any) {
        return { success: false, count: 0 }
    }
}
