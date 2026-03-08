// ==============================
// POS TYPES — JAMALI OS
// ==============================

export type Product = {
    id: string
    name: string
    price: number
    category_id: string
    image_url?: string
    description?: string
    modifier_groups?: ModifierGroup[]
}

export type Category = {
    id: string
    name: string
}

export type ModifierGroup = {
    id: string
    name: string
    selection_type: 'single' | 'multiple'
    min_selections: number
    max_selections: number
    is_required: boolean
    sort_order: number
    options: ModifierOption[]
}

export type ModifierOption = {
    id: string
    name: string
    price_adjustment: number
    is_default: boolean
    is_available: boolean
}

export type SelectedModifier = {
    option_id: string
    name: string
    price_adjustment: number
    quantity: number
}

export type CartItem = {
    product: Product
    qty: number
    notes?: string
    modifiers?: SelectedModifier[]
    // Unique key for cart deduplication (product_id + modifiers combo)
    cartKey?: string
}

// Helper: Generates a unique cart key based on product + selected modifiers
export function generateCartKey(productId: string, modifiers?: SelectedModifier[]): string {
    if (!modifiers || modifiers.length === 0) return productId
    const modKey = modifiers
        .map(m => m.option_id)
        .sort()
        .join('_')
    return `${productId}__${modKey}`
}

// Helper: Calculate total price for a cart item (base + modifiers)
export function getItemTotal(item: CartItem): number {
    const modifiersCost = (item.modifiers || []).reduce(
        (sum, m) => sum + (m.price_adjustment * m.quantity), 0
    )
    return (item.product.price + modifiersCost) * item.qty
}

// Helper: Format modifiers as string for display
export function formatModifiers(modifiers?: SelectedModifier[]): string {
    if (!modifiers || modifiers.length === 0) return ''
    return modifiers.map(m => m.name).join(', ')
}
