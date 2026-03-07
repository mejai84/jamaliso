"use client"

import { cn } from "@/lib/utils"

interface OrderKPIProps {
    label: string
    value: number | string
    color: string
    icon: React.ReactNode
    sub?: string
    delay: number
    highlight?: boolean
}

export function OrderKPI({ label, value, color, icon, sub, delay, highlight }: OrderKPIProps) {
    return (
        <div className={cn(
            "bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-3xl relative overflow-hidden group transition-all duration-700 animate-in fade-in slide-in-from-bottom-8",
            highlight ? "border-orange-500/30 shadow-orange-500/10 bg-orange-500/[0.03]" : "hover:border-orange-500/20"
        )} style={{ animationDelay: `${delay}ms` }}>
            <div className={cn(
                "absolute -top-6 -right-6 p-12 opacity-[0.03] group-hover:scale-125 group-hover:rotate-12 group-hover:opacity-10 transition-all duration-1000",
                color
            )}>
                {icon}
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", color.replace('text', 'bg'))} />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">{label}</p>
                </div>
                <div className="space-y-2">
                    <span className={cn("text-5xl font-black tracking-tighter italic leading-none text-white", highlight ? "text-orange-500" : "")}>{value}</span>
                    {sub && <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] italic leading-none">{sub}</p>}
                </div>
            </div>
        </div>
    )
}
