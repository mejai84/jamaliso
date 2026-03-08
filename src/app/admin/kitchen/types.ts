export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'payment_requested' | 'cancelled';

export type OrderItem = {
    id: string
    quantity: number
    customizations: any
    notes?: string
    status?: string
    products: {
        id: string
        name: string
        is_available: boolean
        preparation_time?: number
        station_id?: string
    } | null
}

export type Order = {
    id: string
    created_at: string
    status: OrderStatus
    order_items: OrderItem[]
    tables?: {
        table_name: string
    }
    notes?: string
    priority?: boolean
    order_type?: 'dine_in' | 'takeout' | 'delivery' | 'online'
    guest_info?: { name?: string; platform?: string; phone?: string }
}

export type PrepStation = {
    id: string
    name: string
    description?: string
}

export const STATUS_COLUMNS = [
    { id: 'pending' as const, label: 'PEDIDOS PENDIENTES', color: 'text-slate-200' },
    { id: 'preparing' as const, label: 'ORDENES EN MARCHA', color: 'text-slate-200' },
    { id: 'ready' as const, label: 'LISTO / ENTREGA', color: 'text-slate-200' }
];
