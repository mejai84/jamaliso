"use client"

import { supabase } from "./supabase/client"

export interface OfflineOrder {
    id: string
    table_id?: string
    waiter_id: string
    total: number
    items: any[]
    guest_info: any
    created_at: string
}

class OfflineEngine {
    private static instance: OfflineEngine
    private isOnline: boolean = typeof window !== 'undefined' ? window.navigator.onLine : true

    private constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.handleStatusChange(true))
            window.addEventListener('offline', () => this.handleStatusChange(false))
        }
    }

    public static getInstance(): OfflineEngine {
        if (!OfflineEngine.instance) {
            OfflineEngine.instance = new OfflineEngine()
        }
        return OfflineEngine.instance
    }

    private handleStatusChange(status: boolean) {
        this.isOnline = status
        if (status) {
            console.log("⚡ JAMALI OS: Conexión restaurada. Iniciando sincronización...")
            this.syncPendingOrders()
        } else {
            console.warn("⚠️ JAMALI OS: Modo Offline activado.")
        }
    }

    public getStatus() {
        return this.isOnline
    }

    public async saveOrderOffline(order: Omit<OfflineOrder, 'id' | 'created_at'>) {
        const offlineOrder: OfflineOrder = {
            ...order,
            id: `OFF-${crypto.randomUUID()}`,
            created_at: new Date().toISOString()
        }

        const pending = this.getPendingOrders()
        pending.push(offlineOrder)
        localStorage.setItem('jamali_offline_orders', JSON.stringify(pending))

        return offlineOrder
    }

    public getPendingOrders(): OfflineOrder[] {
        if (typeof window === 'undefined') return []
        const stored = localStorage.getItem('jamali_offline_orders')
        return stored ? JSON.parse(stored) : []
    }

    public async syncPendingOrders() {
        const pending = this.getPendingOrders()
        if (pending.length === 0) return

        console.log(`🔄 Sincronizando ${pending.length} pedidos pendientes...`)

        for (const order of pending) {
            try {
                // 1. Create Order
                const { data: newOrder, error: orderErr } = await supabase.from('orders').insert([{
                    table_id: order.table_id,
                    waiter_id: order.waiter_id,
                    total: order.total,
                    status: 'pending',
                    order_type: 'pickup',
                    guest_info: order.guest_info,
                    payment_status: 'pending',
                    created_at: order.created_at
                }]).select().single()

                if (orderErr) throw orderErr

                // 2. Create Items
                const itemsToInsert = order.items.map(item => ({
                    order_id: newOrder.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    customizations: item.notes ? { notes: item.notes } : null,
                    created_at: order.created_at
                }))

                const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert)
                if (itemsErr) throw itemsErr

                // 3. Remove from local if success
                this.removeOrderFromLocal(order.id)
                console.log(`✅ Pedido ${order.id} sincronizado con éxito.`)

            } catch (err) {
                console.error(`❌ Error sincronizando pedido ${order.id}:`, err)
            }
        }
    }

    private removeOrderFromLocal(id: string) {
        const pending = this.getPendingOrders()
        const updated = pending.filter(o => o.id !== id)
        localStorage.setItem('jamali_offline_orders', JSON.stringify(updated))
    }
}

export const jamaliOffline = OfflineEngine.getInstance()
