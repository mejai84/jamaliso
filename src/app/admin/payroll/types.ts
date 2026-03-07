export type Employee = {
    id: string
    full_name: string
    role: string
    is_active: boolean
    email?: string
    contract_type?: string
    base_salary?: number
    commission_percentage?: number
    last_shift?: string
}

export type Concept = {
    id: string
    name: string
    type: string
    category: string
    percentage?: number
    is_legal: boolean
}

export type Shift = {
    id: string
    profiles?: { full_name: string }
    started_at: string
}
