export type Table = {
    id: string
    table_number: number
    table_name: string
    capacity: number
    qr_code: string
    status: string
    location: string
    active: boolean
    parent_table_id?: string
    is_merged?: boolean
    x_pos: number
    y_pos: number
    width: number
    height: number
    rotation: number
    shape: 'rectangle' | 'circle' | 'square'
    restaurant_id: string
}

export const ZONES = ["TODAS", "Interior", "Terraza", "Barra", "VIP"];
