'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { emitFiscalDocument } from './billing-actions'

export async function createKioskOrder(orderData: {
    restaurant_id: string;
    customer_name: string;
    payment_method: 'card' | 'cash';
    cart: any[];
    total: number;
}) {
    const supabase = await createClient()

    try {
        // 1. Insertar la orden principal
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                restaurant_id: orderData.restaurant_id,
                total: orderData.total,
                subtotal: orderData.total,
                status: 'pending',
                payment_method: orderData.payment_method,
                payment_status: orderData.payment_method === 'card' ? 'paid' : 'pending',
                order_type: 'KIOSK',
                guest_info: { name: orderData.customer_name },
                notes: `Pedido desde Kiosco - Cliente: ${orderData.customer_name}`
            })
            .select()
            .single()

        if (orderError) throw orderError

        // 2. Insertar los items de la orden
        const orderItems = orderData.cart.map(item => ({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
            status: 'pending'
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) throw itemsError

        // 4. 📑 Emisión Fiscal si ya está pagado (Tarjeta)
        if (orderData.payment_method === 'card') {
            emitFiscalDocument(order.id, orderData.restaurant_id, true).catch(e => {
                console.error("🔥 Error fiscal en kiosco:", e)
            })
        }

        // 3. Notificar al KDS (esto suele pasar por triggers o realtime, pero revalidamos)
        revalidatePath('/admin/orders')

        return { success: true, orderId: order.id }
    } catch (error: any) {
        console.error("Error creating kiosk order:", error)
        return { success: false, error: error.message }
    }
}
