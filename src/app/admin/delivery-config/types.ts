export interface DeliverySettings {
    id: string
    delivery_fee_enabled: boolean
    delivery_fee: number
    free_delivery_threshold: number | null
    max_delivery_radius_km: number
    estimated_delivery_time_min: number
    estimated_delivery_time_max: number
    restaurant_address: string
    restaurant_lat: number | null
    restaurant_lng: number | null
    restaurant_phone: string
    delivery_active: boolean
    pickup_active: boolean
    notes: string
    active_provider?: 'JAMALI_FLEET' | 'RAPPI' | 'UBER_EATS'
    rappi_store_id?: string | null
    uber_store_id?: string | null
}
