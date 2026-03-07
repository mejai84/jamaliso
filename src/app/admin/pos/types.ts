export type Product = {
    id: string
    name: string
    price: number
    category_id: string
    image_url?: string
}

export type Category = {
    id: string
    name: string
}

export type CartItem = {
    product: Product
    qty: number
}
