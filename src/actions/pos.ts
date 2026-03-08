'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { Pool } from 'pg'

// Configuración de conexión directa a BD (Bypass RLS)
let pool: Pool;
try {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })
} catch (e) {
    console.error("Critical: Failed to initialize PG Pool in pos.ts", e);
}

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM'

export interface PosStatus {
    hasActiveShift: boolean
    activeShift: any | null
    hasOpenCashbox: boolean
    activeCashboxSession: any | null
    canSell: boolean
}

/**
 * Obtiene el estado actual del operador POS.
 * Verifica si tiene turno activo y si tiene caja abierta.
 */
export async function getPosStatus(targetUserId?: string, restaurantId?: string): Promise<PosStatus> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const userId = targetUserId || user.id

    // Security: only allow looking up own status unless you are an admin
    if (targetUserId && targetUserId !== user.id) {
        const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (!['admin', 'owner', 'manager'].includes(myProfile?.role || '')) {
            throw new Error("Unauthorized to view other's POS status")
        }
    }

    // 1. Buscar turno activo
    let shiftQuery = supabase
        .from('shifts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'OPEN')

    if (restaurantId) {
        shiftQuery = shiftQuery.eq('restaurant_id', restaurantId)
    }

    const { data: shift, error: shiftError } = await shiftQuery.maybeSingle()

    if (shiftError) console.warn("Aviso: Error buscando turno activo:", shiftError.message)

    // 2. Si hay turno, buscar sesión de caja activa para ese turno
    let cashboxSession = null
    if (shift) {
        let sessionQuery = supabase
            .from('cashbox_sessions')
            .select('*, cashbox:cashboxes(*)')
            .eq('shift_id', shift.id)
            .eq('status', 'OPEN')

        if (restaurantId) {
            sessionQuery = sessionQuery.eq('restaurant_id', restaurantId)
        }

        const { data: session, error: sessionError } = await sessionQuery.maybeSingle()

        if (sessionError) console.warn("Aviso: Error buscando caja activa:", sessionError.message)
        cashboxSession = session
    }

    return {
        hasActiveShift: !!shift,
        activeShift: shift,
        hasOpenCashbox: !!cashboxSession,
        activeCashboxSession: cashboxSession,
        canSell: !!shift && !!cashboxSession
    }
}


/**
 * Inicia un nuevo turno de trabajo basado en una definición configurada.
 * Valida que no exista uno previo.
 */
export async function startShift(shiftDefinitionId: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { success: false, error: "ERROR CRÍTICO: Variables de entorno Supabase no configuradas en el servidor." }
    }

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log("COOKIES RECIBIDAS EN SERVIDOR:", allCookies.map((c: any) => c.name))

    console.log("Iniciando startShift para:", shiftDefinitionId)
    const supabase = await createClient()

    try {
        // Obtener el usuario de la sesión con diagnóstico
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error("Auth Error en startShift:", authError)
            // Intento de respaldo: getSession (menos seguro pero útil para diagnóstico)
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                console.log("Sesión recuperada vía getSession (getUser falló)")
                var userId = session.user.id
            } else {
                return {
                    success: false,
                    error: `Sesión no encontrada. (Detalle: ${authError?.message || 'No hay usuario activo'})`
                }
            }
        } else {
            var userId = user.id
        }

        // Obtener restaurant_id del perfil de forma segura
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('restaurant_id')
            .eq('id', userId)
            .maybeSingle()

        if (profileError) {
            console.error("Error perfil:", profileError)
            return { success: false, error: "Error al consultar perfil: " + profileError.message }
        }

        if (!profile?.restaurant_id) {
            return { success: false, error: "Tu usuario no tiene un restaurante asignado. Contacta al administrador." }
        }

        // Validar si ya existe un turno abierto
        const { data: existing, error: existingError } = await supabase
            .from('shifts')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'OPEN')
            .maybeSingle()

        if (existingError) console.error("Error validando turno previo:", existingError)
        if (existing) {
            return { success: false, error: "Ya tienes un turno activo abierto." }
        }

        // Obtener info de la definición del turno
        const { data: def, error: defError } = await supabase
            .from('shift_definitions')
            .select('name')
            .eq('id', shiftDefinitionId)
            .maybeSingle()

        if (defError || !def) {
            return { success: false, error: "La definición del turno no es válida o fue eliminada." }
        }

        const { data, error: insertError } = await supabase
            .from('shifts')
            .insert({
                user_id: userId,
                restaurant_id: profile.restaurant_id,
                shift_type: def.name,
                shift_definition_id: shiftDefinitionId,
                status: 'OPEN',
                started_at: new Date().toISOString()
            })
            .select()
            .maybeSingle()

        if (insertError) {
            console.error("Error inserción turno:", insertError)
            return { success: false, error: "Error de Base de Datos: " + insertError.message }
        }

        console.log("Turno iniciado con éxito:", data?.id)
        revalidatePath('/admin/cashier')
        revalidatePath('/admin')

        return { success: true, data }

    } catch (e: any) {
        console.error("Excepción fatal en startShift:", e)
        return { success: false, error: "Ocurrió un error inesperado en el servidor: " + e.message }
    }
}

export async function openCashbox(
    shiftId: string,
    openingAmount: number,
    notes?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const userId = user.id

    console.log("Iniciando apertura de caja para usuario:", userId)

    try {
        // 1. Validar que el turno pertenezca al usuario y esté abierto
        const { data: shift, error: shiftError } = await supabase
            .from('shifts')
            .select('status, restaurant_id')
            .eq('id', shiftId)
            .eq('user_id', userId)
            .maybeSingle()

        if (shiftError) {
            console.error("Error validando turno:", shiftError)
            return { success: false, error: "Error al validar jornada: " + shiftError.message }
        }

        if (!shift || shift.status !== 'OPEN') {
            return { success: false, error: "La jornada actual no es válida o ya se encuentra cerrada." }
        }

        // 2. Buscar caja disponible (Por ahora asignamos la 'Caja Principal' por defecto)
        // Buscamos que pertenezca al restaurante del turno
        const { data: cashbox, error: cbError } = await supabase
            .from('cashboxes')
            .select('id, current_status')
            .eq('name', 'Caja Principal')
            .eq('restaurant_id', shift.restaurant_id)
            .maybeSingle()

        if (cbError) {
            console.error("Error buscando caja:", cbError)
        }

        if (!cashbox) {
            return { success: false, error: "No se encontró la 'Caja Principal' configurada para este restaurante." }
        }

        // Ya no validamos cashbox.current_status ciegamente porque no es tan confiable como cashbox_sessions

        // 2.5 Verificar si existe una sesión de caja ABIERTA real usando PG directo para evadir RLS y solucionar el unique constraint
        if (pool) {
            const client = await pool.connect()
            try {
                const { rows } = await client.query(`
                    SELECT s.id, s.user_id, s.shift_id, sh.status as shift_status, p.first_name, p.last_name
                    FROM cashbox_sessions s
                    LEFT JOIN shifts sh ON s.shift_id = sh.id
                    LEFT JOIN profiles p ON s.user_id = p.id
                    WHERE s.cashbox_id = $1 AND s.status = 'OPEN'
                `, [cashbox.id])

                if (rows.length > 0) {
                    const activeSession = rows[0]
                    if (activeSession.shift_status !== 'OPEN') {
                        console.warn(`Sesión huérfana detectada vía BD directa (${activeSession.id}). Cerrando automáticamente...`)
                        await client.query(`
                            UPDATE cashbox_sessions 
                            SET status = 'CLOSED', closing_notes = 'Cierre forzado automático (sesión huérfana BD directa)', closing_time = NOW() 
                            WHERE id = $1
                        `, [activeSession.id])
                    } else {
                        const userName = `${activeSession.first_name || ''} ${activeSession.last_name || ''}`.trim() || 'otro usuario'
                        return { success: false, error: `La caja fuerte ya está en uso por ${userName}. Realicen el Cierre de Caja primero.` }
                    }
                }
            } catch (pgError) {
                console.error("Error validando sesión activa en PG directa:", pgError)
            } finally {
                client.release()
            }
        } else {
            // Fallback to Supabase client if pool is not available
            const { data: activeSession } = await supabase
                .from('cashbox_sessions')
                .select('id, user_id, shift:shifts(status), user:profiles(first_name, last_name)')
                .eq('cashbox_id', cashbox.id)
                .eq('status', 'OPEN')
                .maybeSingle()

            if (activeSession) {
                const typedSession = activeSession as any;
                if (typedSession.shift?.status !== 'OPEN' && (!Array.isArray(typedSession.shift) || typedSession.shift[0]?.status !== 'OPEN')) {
                    await supabase.from('cashbox_sessions').update({
                        status: 'CLOSED',
                        closing_notes: 'Cierre forzado automático (sesión huérfana)',
                        closing_time: new Date().toISOString()
                    }).eq('id', typedSession.id)
                } else {
                    const userObj = Array.isArray(typedSession.user) ? typedSession.user[0] : typedSession.user;
                    const userName = `${userObj?.first_name || ''} ${userObj?.last_name || ''}`.trim() || 'otro usuario'
                    return { success: false, error: `La caja fuerte ya está siendo operada por ${userName}. Realicen Cierre de Caja antes de abrir turno.` }
                }
            }
        }

        // 3. Crear la sesión de caja
        const { data: session, error: sessionError } = await supabase
            .from('cashbox_sessions')
            .insert({
                cashbox_id: cashbox.id,
                shift_id: shiftId,
                user_id: userId,
                restaurant_id: shift.restaurant_id, // SaaS isolation
                opening_amount: openingAmount,
                opening_notes: notes,
                status: 'OPEN',
                opening_time: new Date().toISOString()
            })
            .select()
            .maybeSingle()

        if (sessionError || !session) {
            console.error("Error insertando sesión caja:", sessionError)
            return { success: false, error: "Error al abrir sesión de caja: " + (sessionError?.message || "Error desconocido") }
        }

        // 4. Registrar el movimiento inicial de dinero (Saldo Inicial)
        const { error: movementError } = await supabase.from('cash_movements').insert({
            cashbox_session_id: session.id,
            user_id: userId,
            restaurant_id: shift.restaurant_id, // SaaS isolation
            movement_type: 'OPENING',
            amount: openingAmount,
            description: 'Saldo inicial de apertura'
        })

        if (movementError) {
            console.error("Error registrando saldo inicial:", movementError)
            // No bloqueamos el éxito porque la sesión ya se creó, pero avisamos.
        }

        console.log("Caja abierta exitosamente:", session.id)
        revalidatePath('/admin')
        revalidatePath('/admin/cashier')

        return { success: true, data: session }

    } catch (e: any) {
        console.error("Excepción fatal en openCashbox:", e)
        return { success: false, error: "Error interno del servidor: " + e.message }
    }
}

/**
 * Cierra la sesión de caja actual y el turno asociado.
 */
export async function closeCashbox(
    sessionId: string,
    closingAmount: number,
    notes?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const userId = user.id

    // 1. Obtener la sesión y sus movimientos para calcular el balance teórico
    const { data: sessionData, error: sessionError } = await supabase
        .from('cashbox_sessions')
        .select('*, cash_movements(*)')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()

    if (sessionError || !sessionData) {
        throw new Error("No se encontró la sesión de caja activa.")
    }

    // Calcular el saldo teórico basado en movimientos
    const movements = sessionData.cash_movements || []
    const systemAmount = movements.reduce((acc: number, m: any) => {
        if (['OPENING', 'SALE', 'DEPOSIT'].includes(m.movement_type)) {
            return acc + Number(m.amount)
        } else if (['WITHDRAWAL', 'REFUND'].includes(m.movement_type)) {
            return acc - Number(m.amount)
        }
        return acc
    }, 0)

    // 2. Cerrar la sesión de caja
    const { error: closeError } = await supabase
        .from('cashbox_sessions')
        .update({
            status: 'CLOSED',
            closing_amount: closingAmount,
            system_amount: systemAmount,
            closing_notes: notes,
            closing_time: new Date().toISOString()
        })
        .eq('id', sessionId)

    if (closeError) throw new Error("Error al cerrar la sesión de caja: " + closeError.message)

    // 3. Cerrar automáticamente el turno asociado
    await supabase
        .from('shifts')
        .update({
            status: 'CLOSED',
            ended_at: new Date().toISOString()
        })
        .eq('id', sessionData.shift_id)

    revalidatePath('/admin/cashier')
    revalidatePath('/admin')

    return { success: true, systemAmount, difference: closingAmount - systemAmount }
}

/**
 * Realiza un arqueo parcial (conteo físico) sin cerrar la caja.
 */
export async function performPartialAudit(
    sessionId: string,
    countedAmount: number,
    notes?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const userId = user.id

    // 1. Calcular el saldo teórico actual
    const { data: movements, error: movesError } = await supabase
        .from('cash_movements')
        .select('amount, movement_type')
        .eq('cashbox_session_id', sessionId)

    if (movesError) throw new Error("Error al obtener movimientos: " + movesError.message)

    const systemAmount = (movements || []).reduce((acc: number, m: any) => {
        if (['OPENING', 'SALE', 'DEPOSIT'].includes(m.movement_type)) {
            return acc + Number(m.amount)
        } else if (['WITHDRAWAL', 'REFUND'].includes(m.movement_type)) {
            return acc - Number(m.amount)
        }
        return acc
    }, 0)

    // 2. Registrar el arqueo
    const { data, error } = await supabase
        .from('cashbox_audits')
        .insert({
            cashbox_session_id: sessionId,
            user_id: userId,
            counted_amount: countedAmount,
            system_amount: systemAmount,
            notes: notes
        })
        .select()
        .single()

    if (error) throw new Error("Error al registrar arqueo: " + error.message)

    return { ...data, difference: countedAmount - systemAmount }
}

import { deductInventoryFromOrder } from './inventory-actions'

/**
 * Procesa el pago de una orden existente de forma atómica.
 */
export async function processOrderPayment(
    orderId: string,
    paymentMethod: 'cash' | 'card' | 'transfer' | 'credit',
    amount: number,
    tipAmount: number = 0
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")
        const userId = user.id

        // 1. Obtener estado POS para asegurar que hay caja abierta (si es efectivo)
        const posStatus = await getPosStatus(userId)

        if (paymentMethod === 'cash' && !posStatus.hasOpenCashbox) {
            return {
                success: false,
                error: "No hay caja abierta. Debos abrir caja para recibir efectivo."
            }
        }

        const sessionId = posStatus.activeCashboxSession?.id || null
        const restaurantId = posStatus.activeCashboxSession?.restaurant_id

        // 2. Ejecutar RPC de Pago
        const { data, error } = await supabase.rpc('pay_order_atomic', {
            p_order_id: orderId,
            p_user_id: userId,
            p_cashbox_session_id: sessionId,
            p_payment_method: paymentMethod,
            p_amount: amount,
            p_tip_amount: tipAmount
        })

        if (error) {
            console.error("Error paying order (RPC):", error)
            return { success: false, error: error.message }
        }

        // 3. 🚀 DEDUCCIÓN AUTOMÁTICA DE INVENTARIO (Recetas)
        if (restaurantId) {
            await deductInventoryFromOrder(orderId, restaurantId)
        }

        revalidatePath('/admin/orders')
        revalidatePath('/admin/cashier')
        revalidatePath('/admin/tables')

        return {
            success: true,
            data,
            message: `Venta en ${paymentMethod.toUpperCase()} registrada exitosamente`
        }
    } catch (e: any) {
        console.error("Excepción fatal en processOrderPayment:", e)
        Sentry.captureException(e, { extra: { orderId, paymentMethod, amount } })
        return {
            success: false,
            error: e.message || "Error interno inesperado al procesar el pago"
        }
    }
}
/**
 * Transfiere dinero de la Caja Principal a la Caja Menor.
 */
export async function transferToPettyCash(
    sessionId: string,
    amount: number,
    description: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
    const userId = user.id

    // 1. Obtener restaurante de la sesión
    const { data: session } = await supabase.from('cashbox_sessions').select('restaurant_id').eq('id', sessionId).single()
    if (!session) throw new Error("Sesión no encontrada")

    // 2. Registrar retiro en Caja Principal
    const { error: moveError } = await supabase.from('cash_movements').insert({
        cashbox_session_id: sessionId,
        user_id: userId,
        restaurant_id: session.restaurant_id,
        movement_type: 'WITHDRAWAL',
        amount,
        description: `TRANSFERENCIA A CAJA MENOR: ${description}`
    })

    if (moveError) throw new Error("Error al registrar movimiento: " + moveError.message)

    revalidatePath('/admin/cashier')
    return { success: true }
}
