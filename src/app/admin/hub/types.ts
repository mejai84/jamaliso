export type HubStats = {
    revenue: number
    orders: number
    activeTables: number
    avgTicket: number
    cashboxStatus: string
}

export type PeakHour = {
    hour: number
    count: number
    intensity: number
}

export type RecentSale = {
    id: string
    total: number
    created_at: string
    guest_info?: {
        name?: string
    }
}
