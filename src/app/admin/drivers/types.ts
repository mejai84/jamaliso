export type Driver = {
    id: string
    user_id: string
    full_name: string
    phone: string
    vehicle_type: string
    license_plate: string
    is_active: boolean
    rating: number
    total_deliveries: number
    created_at: string
}

export type PotentialDriver = {
    id: string
    full_name: string
    email: string
    phone: string
}
