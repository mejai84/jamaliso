"use client"

import { DollarSign, Wallet, Target, Users, Activity } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { KPI } from "@/app/admin/reports/types"

interface KPIsGridProps {
    kpis: KPI | null
}

export function KPIsGrid({ kpis }: KPIsGridProps) {
    const cards = [
        { label: 'INGRESOS MES', val: formatPrice(kpis?.total_revenue_month || 0), icon: DollarSign, trend: '+12.5%', color: 'text-orange-500' },
        { label: 'CONCILIACIÓN CAJA', val: formatPrice(kpis?.current_cash_balance || 0), icon: Wallet, trend: 'Fuerte', color: 'text-emerald-500' },
        { label: 'TICKET PROMEDIO', val: formatPrice(kpis?.avg_ticket || 0), icon: Target, trend: '-2.1%', color: 'text-emerald-500' },
        { label: 'CLIENTES ÚNICOS', val: kpis?.total_customers || 0, icon: Users, trend: '+15.4%', color: 'text-blue-500' },
    ]

    return (
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1800px] mx-auto w-full font-sans">
            {cards.map((card, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <card.icon className={cn("w-5 h-5", card.color)} />
                        </div>
                        <span className={cn("text-[10px] font-black px-2 py-1 rounded-full", card.trend.startsWith('+') || card.trend === 'Fuerte' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100")}>
                            {card.trend}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                    <p className={cn("text-3xl font-black italic tracking-tighter", card.color)}>{card.val}</p>

                    {/* Decorative Graph */}
                    <div className="absolute bottom-0 left-0 right-0 h-10 opacity-5">
                        <Activity className="w-full h-full text-slate-900" />
                    </div>
                </div>
            ))}
        </div>
    )
}
