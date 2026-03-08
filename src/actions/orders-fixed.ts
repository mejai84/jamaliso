/**
 * ACCIONES PARA GESTIÓN DE PEDIDOS - CORRECCIONES DE PRODUCCIÓN
 * 
 * Implementa funcionalidades corregidas:
 * - Creación de pedidos (Bypass RLS con PG directo)
 * - Transferencia de pedidos
 * - División de cuentas (Split Check)
 * - Gestión de observaciones
 * - Auditoría
 * 
 * Fecha: 27 de enero de 2026
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Pool } from 'pg'
import { validateUserRestaurant } from '@/lib/security'

// Configuración de conexión directa a BD (Bypass RLS & Transaction Support)
let pool: Pool;
try {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Necesario para Supabase en producción
    })
} catch (e) {
    console.error("Critical: Failed to initialize PG Pool. Check DATABASE_URL.", e);
}

// ============================================================================
// TIPOS
// ============================================================================

export interface OrderItemWithNotes {
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    notes?: string;
}

export interface CreateOrderData {
    restaurant_id: string;
    user_id: string;
    waiter_id: string;
    table_id?: string;
    items: OrderItemWithNotes[];
    subtotal: number;
    tax?: number;
    service_charge?: number;
    total: number;
    notes?: string;
    priority?: boolean;
}

export interface TransferOrderData {
    order_id: string;
    target_table_id: string;
    user_id: string;
    reason?: string;
}

export interface Receipt {
    order_id: string;
    customer_name?: string;
    customer_tax_id?: string;
    generate_pdf?: boolean;
}

// ============================================================================
// 1. CREAR PEDIDO (PG DIRECTO)
// ============================================================================

export async function createOrderWithNotes(orderData: CreateOrderData) {
    let client;
    try {
        // 🛡️ Security Check & Context Retrieval
        const { user } = await validateUserRestaurant(orderData.restaurant_id)

        client = await pool.connect()
        await client.query('BEGIN')

        // 🛡️ Integrity Check: Force IDs from session to prevent impersonation
        const finalUserId = user.id
        const finalWaiterId = user.id // For now, the one who creates it is the waiter

        // 1. Insertar Orden
        const insertOrderQuery = `
            INSERT INTO orders (
                restaurant_id, user_id, waiter_id, table_id, 
                order_type, status, subtotal, tax, service_charge, total, notes, priority
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `
        const orderValues = [
            orderData.restaurant_id,
            finalUserId,
            finalWaiterId,
            orderData.table_id || null,
            orderData.table_id ? 'dine_in' : 'pos',
            'pending',
            orderData.subtotal,
            orderData.tax || 0,
            orderData.service_charge || 0,
            orderData.total,
            orderData.notes || null,
            orderData.priority || false
        ]

        const { rows: orderRows } = await client.query(insertOrderQuery, orderValues)
        const order = orderRows[0]

        // 2. Insertar Items
        if (orderData.items.length > 0) {
            const insertItemsQuery = `
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price, notes
                ) VALUES ($1, $2, $3, $4, $5)
            `

            for (const item of orderData.items) {
                await client.query(insertItemsQuery, [
                    order.id,
                    item.product_id,
                    item.quantity,
                    item.unit_price,
                    item.notes || null
                ])
            }
        }

        await client.query('COMMIT')

        revalidatePath('/admin/orders')
        if (orderData.table_id) revalidatePath('/admin/tables')

        return { success: true, data: { ...order, created_at: undefined }, message: 'Pedido creado exitosamente' }

    } catch (dbError: any) {
        if (client) await client.query('ROLLBACK')
        console.error('Error DB Directo (createOrder):', dbError)
        return { success: false, error: dbError.message || 'Error desconocido al crear pedido' }
    } finally {
        if (client) client.release()
    }
}

// ============================================================================
// 2. TRANSFERIR PEDIDO (PG DIRECTO)
// ============================================================================

export async function transferOrderBetweenTables(transferData: TransferOrderData) {
    let client;
    try {
        client = await pool.connect()
        // 🛡️ Security Check: Validate order belongs to restaurant
        const { rows: [order] } = await client.query('SELECT restaurant_id FROM orders WHERE id = $1', [transferData.order_id])
        if (!order) throw new Error('Orden no encontrada')
        await validateUserRestaurant(order.restaurant_id)

        await client.query('BEGIN')

        const transferQuery = `SELECT transfer_order_to_table($1, $2, $3, $4) as result`
        const transferValues = [
            transferData.order_id,
            transferData.target_table_id,
            transferData.user_id,
            transferData.reason || 'Cambio de mesa'
        ]

        const { rows } = await client.query(transferQuery, transferValues)
        const result = rows[0].result

        await client.query('COMMIT')

        revalidatePath('/admin/tables')
        revalidatePath('/admin/orders')

        return {
            success: true,
            data: result,
            message: result.merged
                ? 'Pedido fusionado con orden existente en mesa destino'
                : 'Pedido transferido a nueva mesa'
        }

    } catch (dbError: any) {
        if (client) await client.query('ROLLBACK')
        console.error('Error DB Directo (transfer):', dbError)
        return { success: false, error: dbError.message || 'Error al transferir pedido' }
    } finally {
        if (client) client.release()
    }
}

// ============================================================================
// 3. AGREGAR OBSERVACIONES (SUPABASE CLIENT)
// ============================================================================

export async function updateOrderItemNotes(
    orderItemId: string,
    notes: string,
    userId: string
) {
    const supabase = await createClient()
    try {
        const { error } = await supabase
            .from('order_items')
            .update({ notes: notes, updated_at: new Date().toISOString() })
            .eq('id', orderItemId)

        if (error) throw new Error(error.message)

        revalidatePath('/admin/orders')
        revalidatePath('/admin/kitchen')
        return { success: true, message: 'Observaciones actualizadas' }
    } catch (error: any) {
        console.error('Error actualizando observaciones:', error)
        throw new Error(error.message)
    }
}

// ============================================================================
// 4. DIVIDIR CUENTA (SPLIT CHECK) - NUEVO
// ============================================================================

/**
 * Divide una orden moviendo items seleccionados a una nueva orden.
 * Útil para cobrar por separado.
 */
export async function splitOrder(
    sourceOrderId: string,
    itemsToMove: { itemId: string, quantity: number }[],
    userId: string
) {
    let client;
    try {
        client = await pool.connect()
        // 🛡️ Security Check
        const { rows: [order] } = await client.query('SELECT restaurant_id FROM orders WHERE id = $1', [sourceOrderId])
        if (!order) throw new Error('Orden no encontrada')
        await validateUserRestaurant(order.restaurant_id)

        await client.query('BEGIN')

        // 1. Obtener orden original
        const { rows: [sourceOrder] } = await client.query('SELECT * FROM orders WHERE id = $1', [sourceOrderId])
        if (!sourceOrder) throw new Error('Orden original no encontrada')

        // 2. Crear nueva orden (Clonada)
        const newOrderQuery = `
            INSERT INTO orders (
                restaurant_id, table_id, user_id, waiter_id, 
                order_type, status, notes, created_at, subtotal, tax, service_charge, total, payment_status
            ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW(), 0, 0, 0, 0, 'pending')
            RETURNING *
        `
        const newOrderValues = [
            sourceOrder.restaurant_id,
            sourceOrder.table_id,
            userId, // Usuario que realiza el split es el nuevo 'creador' temporal
            sourceOrder.waiter_id,
            sourceOrder.order_type,
            `Sub-cuenta de Orden #${sourceOrder.id.substring(0, 8)}`
        ]

        const { rows: [newOrder] } = await client.query(newOrderQuery, newOrderValues)

        // 3. Mover items
        for (const item of itemsToMove) {
            const { rows: [dbItem] } = await client.query('SELECT * FROM order_items WHERE id = $1', [item.itemId])
            if (!dbItem) continue

            if (item.quantity >= dbItem.quantity) {
                // Mover item completo
                await client.query('UPDATE order_items SET order_id = $1, updated_at = NOW() WHERE id = $2', [newOrder.id, item.itemId])
            } else {
                // Dividir item
                const remainingQty = dbItem.quantity - item.quantity
                const remainingSub = remainingQty * dbItem.unit_price

                // Actualizar original
                await client.query('UPDATE order_items SET quantity = $1, subtotal = $2, updated_at = NOW() WHERE id = $3', [remainingQty, remainingSub, item.itemId])

                // Crear nuevo item en nueva orden
                await client.query(`
                    INSERT INTO order_items (order_id, product_id, quantity, unit_price, notes)
                    VALUES ($1, $2, $3, $4, $5)
                `, [newOrder.id, dbItem.product_id, item.quantity, dbItem.unit_price, dbItem.notes])
            }
        }

        // 4. Recalcular totales (Original)
        await client.query(`
            UPDATE orders 
            SET subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1),
                total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1) + COALESCE(tax, 0) + COALESCE(service_charge, 0)
            WHERE id = $1
        `, [sourceOrderId])

        // 5. Recalcular totales (Nueva)
        await client.query(`
            UPDATE orders 
            SET subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1),
                total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1) + COALESCE(tax, 0) + COALESCE(service_charge, 0)
            WHERE id = $1
        `, [newOrder.id])

        await client.query('COMMIT')

        revalidatePath('/admin/orders')
        revalidatePath('/admin/waiter')

        return {
            success: true,
            data: { ...newOrder, created_at: undefined, updated_at: undefined },
            message: 'Cuenta dividida exitosamente. Nueva orden creada.'
        }

    } catch (e: any) {
        if (client) await client.query('ROLLBACK')
        console.error('Error splitOrder:', e)
        throw new Error(e.message || 'Error al dividir la cuenta')
    } finally {
        if (client) client.release()
    }
}

// ============================================================================
// 5. GENERAR COMPROBANTE (SUPABASE CLIENT)
// ============================================================================

export async function generateReceipt(receiptData: Receipt) {
    const supabase = await createClient()

    try {
        const { data: order } = await supabase.from('orders').select('*').eq('id', receiptData.order_id).single()
        if (!order) throw new Error('Orden no encontrada')

        const { data: lastReceipt } = await supabase.from('receipts').select('receipt_number').order('created_at', { ascending: false }).limit(1).maybeSingle()

        let nextNumber = 1
        if (lastReceipt) nextNumber = parseInt(lastReceipt.receipt_number.replace(/\D/g, '')) + 1
        const receiptNumber = `REC-${nextNumber.toString().padStart(8, '0')}`

        const { data: receipt } = await supabase.from('receipts').insert({
            order_id: order.id,
            receipt_number: receiptNumber,
            customer_name: receiptData.customer_name,
            customer_tax_id: receiptData.customer_tax_id,
            subtotal: order.subtotal,
            tax: order.tax || 0,
            total: order.total,
            payment_method: order.payment_method
        }).select().single()

        revalidatePath('/admin/orders')
        return { success: true, data: receipt, message: `Comprobante ${receiptNumber} generado` }

    } catch (error: any) {
        console.error('Error recibo:', error)
        throw new Error(error.message)
    }
}

/**
 * Adiciona items a un pedido existente (para mesas ocupadas)
 */
export async function addItemsToOrder(orderId: string, items: OrderItemWithNotes[]) {
    let client;
    try {
        client = await pool.connect()
        // 🛡️ Security Check
        const { rows: [order] } = await client.query('SELECT restaurant_id FROM orders WHERE id = $1', [orderId])
        if (!order) throw new Error('Orden no encontrada')
        await validateUserRestaurant(order.restaurant_id)

        await client.query('BEGIN')
        const insertItemsQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, notes)
            VALUES ($1, $2, $3, $4, $5)
        `
        for (const item of items) {
            await client.query(insertItemsQuery, [
                orderId, item.product_id, item.quantity, item.unit_price, item.notes || null
            ])
        }
        await client.query(`
            UPDATE orders 
            SET subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1),
                total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1) + COALESCE(tax, 0) + COALESCE(service_charge, 0),
                updated_at = NOW()
            WHERE id = $1
        `, [orderId])
        await client.query('COMMIT')

        revalidatePath('/admin/orders')
        revalidatePath('/admin/tables')

        return { success: true, message: 'Productos adicionados exitosamente' }
    } catch (dbError: any) {
        if (client) await client.query('ROLLBACK')
        console.error('Error Adicionando Items:', dbError)
        return { success: false, error: dbError.message || 'Error al adicionar items' }
    } finally {
        if (client) client.release()
    }
}

/**
 * Une dos mesas fusionando sus órdenes activas.
 */
export async function mergeTables(sourceTableId: string, targetTableId: string, userId: string) {
    let client;
    try {
        client = await pool.connect()
        await client.query('BEGIN')

        // 1. Obtener órdenes activas
        const { rows: [sourceOrder] } = await client.query('SELECT id FROM orders WHERE table_id = $1 AND status IN (\'pending\', \'preparing\', \'ready\')', [sourceTableId])
        const { rows: [targetOrder] } = await client.query('SELECT id FROM orders WHERE table_id = $1 AND status IN (\'pending\', \'preparing\', \'ready\')', [targetTableId])

        if (!sourceOrder || !targetOrder) throw new Error('Ambas mesas deben tener órdenes activas')

        // 2. Mover items de la fuente al destino
        await client.query('UPDATE order_items SET order_id = $1 WHERE order_id = $2', [targetOrder.id, sourceOrder.id])

        // 3. Eliminar (o cancelar) la orden fuente
        await client.query('UPDATE orders SET status = \'cancelled\', notes = \'Fusionada con Mesa \' || $1 WHERE id = $2', [targetTableId, sourceOrder.id])
        await client.query('UPDATE tables SET status = \'free\' WHERE id = $1', [sourceTableId])

        // 4. Recalcular totales destino
        await client.query(`
            UPDATE orders 
            SET subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1),
                total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1) + COALESCE(tax, 0) + COALESCE(service_charge, 0),
                updated_at = NOW()
            WHERE id = $1
        `, [targetOrder.id])

        await client.query('COMMIT')
        revalidatePath('/admin/tables')
        return { success: true, message: 'Mesas fusionadas exitosamente' }
    } catch (e: any) {
        if (client) await client.query('ROLLBACK')
        return { success: false, error: e.message }
    } finally {
        if (client) client.release()
    }
}

/**
 * Transfiere un item específico de una mesa a otra.
 */
export async function transferOrderItem(sourceOrderId: string, targetTableId: string, itemId: string, quantity: number, userId: string) {
    let client;
    try {
        client = await pool.connect()
        await client.query('BEGIN')

        // 1. Obtener o crear orden en mesa destino
        let { rows: [targetOrder] } = await client.query('SELECT * FROM orders WHERE table_id = $1 AND status IN (\'pending\', \'preparing\', \'ready\')', [targetTableId])

        if (!targetOrder) {
            const { rows: [sourceOrder] } = await client.query('SELECT * FROM orders WHERE id = $1', [sourceOrderId])
            const { rows: [newOrder] } = await client.query(`
                INSERT INTO orders (restaurant_id, table_id, user_id, waiter_id, order_type, status, subtotal, total)
                VALUES ($1, $2, $3, $4, \'dine_in\', \'pending\', 0, 0) RETURNING *
            `, [sourceOrder.restaurant_id, targetTableId, userId, sourceOrder.waiter_id])
            targetOrder = newOrder
            await client.query('UPDATE tables SET status = \'occupied\' WHERE id = $1', [targetTableId])
        }

        // 2. Mover item logic (similar a split)
        const { rows: [dbItem] } = await client.query('SELECT * FROM order_items WHERE id = $1', [itemId])
        if (quantity >= dbItem.quantity) {
            await client.query('UPDATE order_items SET order_id = $1 WHERE id = $2', [targetOrder.id, itemId])
        } else {
            await client.query('UPDATE order_items SET quantity = quantity - $1 WHERE id = $2', [quantity, itemId])
            await client.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price, notes) VALUES ($1, $2, $3, $4, $5)',
                [targetOrder.id, dbItem.product_id, quantity, dbItem.unit_price, dbItem.notes])
        }

        // 3. Recalcular ambos
        const ordersToRecalc = [sourceOrderId, targetOrder.id]
        for (const id of ordersToRecalc) {
            await client.query(`
                UPDATE orders 
                SET subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1),
                    total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_items WHERE order_id = $1) + COALESCE(tax, 0) + COALESCE(service_charge, 0),
                    updated_at = NOW()
                WHERE id = $1
            `, [id])
        }

        await client.query('COMMIT')
        revalidatePath('/admin/tables')
        return { success: true, message: 'Ítem transferido exitosamente' }
    } catch (e: any) {
        if (client) await client.query('ROLLBACK')
        return { success: false, error: e.message }
    } finally {
        if (client) client.release()
    }
}

/**
 * Envía un mensaje a la cocina.
 */
export async function sendKitchenMessage(restaurantId: string, sender: string, message: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('notifications').insert({
        restaurant_id: restaurantId,
        title: `MENSAJE DE ${sender.toUpperCase()}`,
        message: message,
        type: 'kitchen_msg',
        status: 'unread'
    })
    if (error) return { success: false, error: error.message }
    revalidatePath('/admin/kitchen')
    return { success: true, message: 'Mensaje enviado a cocina' }
}
