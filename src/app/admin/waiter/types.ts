export type Table = {
    id: string
    table_name: string
    status: 'free' | 'occupied' | 'reserved'
    capacity: number
    active_order?: {
        id: string
        total: number
        status: string
        priority: boolean
        created_at: string
    }
}

export type Product = {
    id: string
    name: string
    price: number
    category_id: string
    stock_quantity?: number
    use_inventory?: boolean
}

export type Category = {
    id: string
    name: string
}

export type CartItem = {
    product: Product
    qty: number
    notes?: string
}
