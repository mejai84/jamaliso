export type EmployeeRole = 'admin' | 'staff' | 'waiter' | 'cook' | 'cashier' | 'customer';

export interface Employee {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    role: EmployeeRole
    document_id: string | null
    hire_date: string | null
    waiter_pin: string | null
    food_discount_pct: number
    max_credit: number
    current_credit_spent: number
    base_salary: number
    commission_percentage: number
    contract_type: string
    created_at: string
}
