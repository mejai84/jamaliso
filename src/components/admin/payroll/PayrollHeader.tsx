"use client"

import { ArrowLeft, ShieldCheck, UserPlus, Zap, Wallet, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Stat {
    label: string
    val: string
    icon: any
    color: string
}

interface PayrollHeaderProps {
    stats: Stat[]
    menuTabs: any[]
    activeTab: string
    setActiveTab: (tab: any) => void
}

export function PayrollHeader({ stats, menuTabs, activeTab, setActiveTab }: PayrollHeaderProps) {
    return (
        <>
            {/* HEADER */}
            <div className="flex items-center justify-between shrink-0 font-sans">
                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/60 border border-slate-200">
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">JAMALI <span className="text-orange-600">PAYROLL_PRO</span></h1>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-1 md:mt-3 italic flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> ACTIVE_CORE_SETTLEMENT_CORE v2.0
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => {
                            console.log("REPORTE CONTABLE CLICKED")
                            toast.info("REPORTE CONTABLE: Procesando exportación global...")
                        }}
                        variant="ghost"
                        type="button"
                        className="h-14 px-8 bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl"
                    >
                        REPORTE CONTABLE
                    </Button>
                    <Button
                        onClick={() => {
                            console.log("NUEVO COLABORADOR CLICKED")
                            setActiveTab('employees')
                            toast.success("MÓDULO DE PERSONAL ACTIVADO", {
                                description: "Use el botón 'AGREGAR' en la pestaña de empleados."
                            })
                        }}
                        type="button"
                        className="h-14 px-8 bg-orange-600 text-black font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-500"
                    >
                        <UserPlus className="w-5 h-5 mr-3" /> NUEVO COLABORADOR
                    </Button>
                </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white/40 p-2 rounded-2xl border border-slate-200 shrink-0 font-sans relative z-50">
                {menuTabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                            console.log(`SWITCHING TO TAB: ${tab.id}`)
                            setActiveTab(tab.id)
                        }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 max-md:py-3 py-3 rounded-xl transition-all font-black uppercase italic text-[9px] tracking-widest",
                            activeTab === tab.id
                                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 font-sans">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-slate-900 hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 transition-all pointer-events-none">
                            <s.icon className="w-24 h-24 text-slate-900" />
                        </div>
                        <div className="relative z-10 transition-all group-hover:translate-x-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 italic opacity-60 group-hover:text-orange-600 transition-colors">{s.label}</p>
                            <p className={cn("text-4xl font-black italic tracking-tighter transition-colors group-hover:text-slate-900", s.color)}>{s.val}</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all shadow-sm">
                            <s.icon className={cn("w-7 h-7 transition-colors group-hover:text-white", s.color)} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
