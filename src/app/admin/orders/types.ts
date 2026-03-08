export interface Product {
    id: string
    name: string
    price: number
    description: string | null
    image_url: string | null
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    unit_price: number
    products: {
        name: string
    } | null
}

export interface Order {
    id: string
    created_at: string
    status: 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'payment_requested' | 'cancelled' | 'payment_pending'
    order_type: 'pickup' | 'delivery'
    total: number
    subtotal: number
    guest_info: {
        name: string
        phone?: string
    }
    user_id?: string
    order_items: OrderItem[]
    payment_method: string
    payment_status: string
    delivery_address?: {
        street: string
        city: string
        phone: string
    }
    notes?: string
    waiter_id?: string
    table_id?: string
    waiter?: { full_name: string }
    tables?: { table_name: string }
}
