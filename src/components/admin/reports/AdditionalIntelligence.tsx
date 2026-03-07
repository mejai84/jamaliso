"use client"

import { Wallet, Target, ShoppingBag, Loader2 } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { KPI } from "@/app/admin/reports/types"

interface AdditionalIntelligenceProps {
    kpis: KPI | null
    loading: boolean
}

export function AdditionalIntelligence({ kpis, loading }: AdditionalIntelligenceProps) {
    const items = [
        {
            label: 'SALDO EN CAJA',
            val: formatPrice(kpis?.current_cash_balance || 0),
            icon: Wallet,
            desc: 'Conciliación en tiempo real',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 border-emerald-100'
        },
        {
            label: 'TICKET PROMEDIO',
            val: formatPrice(kpis?.avg_ticket || 0),
            icon: Target,
            desc: 'Valor medio por orden del mes',
            color: 'text-orange-500',
            bg: 'bg-orange-50 border-orange-100'
        },
        {
            label: 'ÓRDENES DEL MES',
            val: String(kpis?.total_orders_month || 0),
            icon: ShoppingBag,
            desc: 'Total de pedidos confirmados',
            color: 'text-blue-500',
            bg: 'bg-blue-50 border-blue-100'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 shrink-0 pb-10 px-8 md:px-12 font-sans w-full">
            {items.map((item, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-2xl border border-slate-200 rounded-3xl p-8 flex items-center gap-6 group hover:border-orange-500/20 transition-all shadow-sm">
                    <div className={cn("p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-all border", item.bg, item.color)}>
                        <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</h4>
                        <div className={cn("text-2xl font-black italic tracking-tighter leading-none text-slate-900")}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : item.val}
                        </div>
                        <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
