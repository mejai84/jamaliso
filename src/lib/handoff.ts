import { supabase } from '@/lib/supabase/client'

// ── 1. CAJERA SALIENTE: iniciar cierre de turno ──────────────
export async function initiateShiftClose({
    sessionId,
    physicalCashCounted,
    incomingUserId,
    notes
}: {
    sessionId: string
    physicalCashCounted: number
    incomingUserId: string
    notes?: string
}) {

    // 1. Obtener ventas del turno (lo que el sistema esperaba)
    const { data: session } = await supabase
        .from('cashbox_sessions')
        .select('id, opening_amount, restaurant_id')
        .eq('id', sessionId)
        .single()

    const { data: payments } = await supabase
        .from('sale_payments')
        .select('amount')
        .eq('cashbox_session_id', sessionId)

    const systemExpected = payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0

    // 2. Snapshot de mesas abiertas (con deuda pendiente)
    const { data: pendingTables } = await supabase
        .from('orders')
        .select(`
      id, table_id, status, total, created_at,
      tables (table_number),
      profiles (full_name)
    `)
        .eq('restaurant_id', session!.restaurant_id)
        .in('status', ['pending', 'preparing', 'ready', 'delivered'])
        .is('payment_status', 'pending')

    // 3. Snapshot de pedidos en cocina aún no entregados
    const { data: pendingOrders } = await supabase
        .from('orders')
        .select(`
      id, status, total,
      tables (table_number),
      order_items (quantity, products(name))
    `)
        .eq('restaurant_id', session!.restaurant_id)
        .in('status', ['preparing', 'ready'])

    // 4. Crear acta de traspaso
    const { data: handoff, error } = await supabase
        .from('shift_handoffs')
        .insert({
            restaurant_id: session!.restaurant_id,
            outgoing_session_id: sessionId,
            outgoing_user_id: (await supabase.auth.getUser()).data.user?.id,
            physical_cash_counted: physicalCashCounted,
            system_cash_expected: systemExpected,
            incoming_user_id: incomingUserId,
            pending_tables: pendingTables ?? [],
            pending_orders: pendingOrders ?? [],
            status: 'pending'
        })
        .select()
        .single()

    if (error) throw error

    // 5. Marcar la sesión actual como cerrada con pendientes
    await supabase
        .from('cashbox_sessions')
        .update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            closed_with_pending: true,
            transferred_to: incomingUserId,
            closing_amount: physicalCashCounted,
            difference_amount: physicalCashCounted - systemExpected
        })
        .eq('id', sessionId)

    return handoff
}

// ── 2. CAJERA ENTRANTE: aceptar el traspaso ──────────────────
export async function acceptHandoff({
    handoffId,
    signature
}: {
    handoffId: string
    signature: string
}) {
    const userId = (await supabase.auth.getUser()).data.user?.id

    if (!userId) throw new Error("No user ID found")

    // 1. Aceptar el traspaso
    const { data: handoff, error: updateError } = await supabase
        .from('shift_handoffs')
        .update({
            incoming_accepted: true,
            incoming_at: new Date().toISOString(),
            incoming_signature: signature,
            status: 'accepted'
        })
        .eq('id', handoffId)
        .eq('incoming_user_id', userId)
        .select()
        .single()

    if (updateError || !handoff) throw new Error("Could not accept handoff. Verify permissions.")

    // 2. Crear nueva sesión de caja para el turno entrante
    const { data: newSession, error: newSessionError } = await supabase
        .from('cashbox_sessions')
        .insert({
            restaurant_id: handoff.restaurant_id,
            opened_by: userId,
            opening_amount: handoff.physical_cash_counted,
            status: 'open'
        })
        .select()
        .single()

    if (newSessionError) throw newSessionError

    // 3. Reasignar las mesas pendientes a la nueva sesión - Requires updating the active orders with new cashbox session when they are paid, this typically is done at payment time not order time in this schema.

    return { handoff, newSession }
}

// ── 3. OBTENER TRASPASO PENDIENTE para la cajera entrante ────
export async function getPendingHandoff(userId: string) {

    const { data } = await supabase
        .from('shift_handoffs')
        .select(`
      *,
      outgoing_profile:profiles!shift_handoffs_outgoing_user_id_fkey(full_name),
      incoming_profile:profiles!shift_handoffs_incoming_user_id_fkey(full_name)
    `)
        .eq('incoming_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    return data
}
