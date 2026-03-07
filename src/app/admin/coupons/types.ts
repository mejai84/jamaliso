import { Tag, Ghost, Heart, Snowflake, Gift, LucideIcon } from "lucide-react"

export type Coupon = {
    id: string
    code: string
    description: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    min_purchase: number
    usage_limit: number | null
    usage_count: number
    active: boolean
    start_date: string
    end_date: string | null
    customer_id: string | null
    seasonal_tag: string | null
    category?: string | null
}

export type Profile = {
    id: string
    full_name: string | null
    email: string
}

export type SeasonalOption = {
    label: string
    value: string
    icon: LucideIcon
}

export const SEASONAL_OPTIONS: SeasonalOption[] = [
    { label: 'General', value: '', icon: Tag },
    { label: 'Halloween', value: 'halloween', icon: Ghost },
    { label: 'Madres / Amor', value: 'mothers_day', icon: Heart },
    { label: 'Navidad', value: 'christmas', icon: Snowflake },
    { label: 'Especial / Regalo', value: 'gift', icon: Gift },
];
