export type Movement = {
    id: string
    movement_type: 'SALE' | 'REFUND' | 'DEPOSIT' | 'WITHDRAWAL' | 'OPENING'
    amount: number
    payment_method?: string
    description: string
    created_at: string
}

export const DENOMINATIONS = [
    { value: 100000, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { value: 50000, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    { value: 20000, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { value: 10000, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
    { value: 5000, color: "bg-muted text-muted-foreground border-border" },
    { value: 2000, color: "bg-muted text-muted-foreground border-border" },
    { value: 1000, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { value: 500, color: "bg-muted/50 text-muted-foreground/80 border-border/50", isCoin: true },
    { value: 200, color: "bg-muted/50 text-muted-foreground/80 border-border/50", isCoin: true },
    { value: 100, color: "bg-muted/50 text-muted-foreground/80 border-border/50", isCoin: true },
    { value: 50, color: "bg-muted/50 text-muted-foreground/80 border-border/50", isCoin: true }
]
