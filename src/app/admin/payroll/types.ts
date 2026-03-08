export type Employee = {
    id: string
    full_name: string
    role: string
    is_active: boolean
    email?: string
    contract_type?: string
    monthly_salary?: number
    hourly_rate?: number
    commission_percentage?: number
    last_shift?: string
    document_id?: string
    arl_risk_level?: number
    transport_allowance_eligible?: boolean
    is_integral_salary?: boolean
    restaurant_id: string
}

export type Concept = {
    id: string
    name: string
    type: 'EARNING' | 'DEDUCTION'
    category: string
    percentage?: number
    is_legal: boolean
}

export type Shift = {
    id: string
    profiles?: { full_name: string }
    started_at: string
}
