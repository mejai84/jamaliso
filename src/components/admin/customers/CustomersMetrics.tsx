import { Users, Star, Trophy, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Customer } from "./types"

interface CustomersMetricsProps {
    customers: Customer[]
}

export function CustomersMetrics({ customers }: CustomersMetricsProps) {
    return (
        <div className="grid grid-cols-4 gap-8 shrink-0">
            {[
                { label: 'CLIENTES TOTALES', val: customers.length, icon: Users, color: 'text-orange-600', sub: 'Nodes_Active' },
                { label: 'CLIENTES VIP', val: customers.filter(c => c.totalSpent > 500000).length, icon: Star, color: 'text-amber-500', sub: 'High_LTV' },
                { label: 'PUNTOS CIRCULANTES', val: customers.reduce((acc, c) => acc + c.points, 0).toLocaleString(), icon: Trophy, color: 'text-indigo-500', sub: 'Eco_System' },
                { label: 'FIDELIZACIÓN RATE', val: '64%', icon: Heart, color: 'text-rose-500', sub: 'Brand_Pulse' },
            ].map((card, i) => (
                <div key={i} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 flex items-center gap-8 group hover:border-slate-900 hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 transition-all pointer-events-none">
                        <card.icon className="w-24 h-24 text-slate-900" />
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all shadow-sm">
                        <card.icon className={cn("w-7 h-7 transition-colors group-hover:text-white", card.color)} />
                    </div>
                    <div className="relative z-10 space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none group-hover:text-orange-600 transition-colors uppercase">{card.label}</p>
                        <p className={cn("text-5xl font-black italic tracking-tighter text-slate-900 leading-none group-hover:scale-110 transition-transform origin-left")}>{card.val}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic opacity-60 mt-1">{card.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
