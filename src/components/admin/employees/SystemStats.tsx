"use client"

import { ShieldCheck } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { Employee } from "@/app/admin/employees/types"

interface SystemStatsProps {
    employees: Employee[]
}

export function SystemStats({ employees }: SystemStatsProps) {
    return (
        <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm relative overflow-hidden group font-sans">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-40 h-40 text-slate-500" />
            </div>
            <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-slate-900">Consola de <span className="text-orange-500">Acceso</span></h3>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest italic opacity-70">Monitoreo de privilegios del sistema.</p>
                </div>

                <div className="space-y-3">
                    {[
                        { label: 'ADMINS ACTIVOS', val: employees.filter(e => e.role === 'admin').length, color: 'bg-orange-500', bg: 'bg-orange-50 border-orange-100', text: 'text-orange-600' },
                        { label: 'STAFF OPERATIVO', val: employees.filter(e => e.role !== 'admin').length, color: 'bg-slate-300', bg: 'bg-slate-50 border-slate-100', text: 'text-slate-900' },
                        { label: 'DISC_POOL TOTAL', val: `${employees.reduce((acc, e) => acc + (e.food_discount_pct || 0), 0)}%`, color: 'bg-slate-400', bg: 'bg-slate-50 border-slate-100', text: 'text-slate-900' }
                    ].map((stat, i) => (
                        <div key={i} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all", stat.bg)}>
                            <div className="flex items-center gap-3">
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", stat.color)} />
                                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{stat.label}</span>
                            </div>
                            <span className={cn("text-xs md:text-sm font-black italic", stat.text)}>{stat.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
