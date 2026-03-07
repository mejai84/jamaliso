export type Profile = {
    id: string
    full_name: string
    role: string
    waiter_pin: string
}

export type UserProfile = {
    id: string
    email?: string
    profile: Profile
}

export type Stats = {
    shiftsThisMonth: number
    hoursWorked: number
    tipsEstimated: number
    rank: string
}

export type TipOrder = {
    id: string
    total: number
    tip_amount: number
    created_at: string
}
