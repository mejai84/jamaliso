import { Users, Star, Trophy, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Customer } from "./types"

interface CustomersMetricsProps {
    customers: Customer[]
}

export function CustomersMetrics({ customers }: CustomersMetricsProps) {
    return (
        <div className="grid grid-cols-4 gap-10 shrink-0">
            {[
                { label: 'CLIENTES TOTALES', val: customers.length, icon: Users, color: 'text-white', sub: 'Nodes_Active' },
                { label: 'CLIENTES VIP', val: customers.filter(c => c.totalSpent > 500000).length, icon: Star, color: 'text-orange-500', sub: 'High_LTV' },
                { label: 'PUNTOS CIRCULANTES', val: customers.reduce((acc, c) => acc + c.points, 0).toLocaleString(), icon: Trophy, color: 'text-amber-500', sub: 'Eco_System' },
                { label: 'FIDELIZACIÓN RATE', val: '64%', icon: Heart, color: 'text-rose-500', sub: 'Brand_Pulse' },
            ].map((card, i) => (
                <div key={i} className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex items-center gap-8 group hover:border-orange-500/20 transition-all duration-700 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000">
                        <card.icon className="w-24 h-24" />
                    </div>
                    <div className="p-5 bg-white/5 rounded-2xl group-hover:bg-orange-600 group-hover:text-black transition-all">
                        <card.icon className={cn("w-7 h-7", card.color, "group-hover:text-inherit")} />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", card.color.replace('text', 'bg'))} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">{card.label}</p>
                        </div>
                        <p className={cn("text-5xl font-black italic tracking-tighter text-white leading-none")}>{card.val}</p>
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic group-hover:text-slate-500 transition-colors">{card.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
