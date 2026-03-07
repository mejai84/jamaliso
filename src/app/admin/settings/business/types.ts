export type BusinessInfo = {
    business_name: string
    identification_number: string
    phone: string
    email: string
    address: string
    website: string
    currency: string
    currency_symbol: string
}

export type TaxSettings = {
    tax_name: string
    tax_percentage: number
    consumption_tax: number
    include_tax_in_price: boolean
    invoice_prefix: string
    invoice_start_number: number
    legal_text: string
}
