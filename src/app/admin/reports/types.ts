export type KPI = {
    total_revenue_month: number
    total_orders_month: number
    avg_ticket: number
    total_customers: number
    current_cash_balance?: number
}

export type DailySales = {
    day: string
    total_sales: number
    order_count: number
}

export type TopProduct = {
    product_name: string
    total_quantity: number
    total_revenue: number
    contribution_margin?: number
}

export type WasteData = {
    day: string
    amount: number
}
