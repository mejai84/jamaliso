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
                        <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-900">JAMALI <span className="text-orange-500">PAYROLL</span></h1>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1 md:mt-2 italic shadow-sm flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Motor de Liquidación de Élite
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => toast.info("REPORTE CONTABLE: Procesando...")}
                        variant="ghost"
                        className="h-14 px-8 bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl"
                    >
                        REPORTE CONTABLE
                    </Button>
                    <Button
                        onClick={() => toast.info("MÓDULO DE CONTRATACIÓN: Cargando perfiles...")}
                        className="h-14 px-8 bg-orange-600 text-black font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-500"
                    >
                        <UserPlus className="w-5 h-5 mr-3" /> NUEVO COLABORADOR
                    </Button>
                </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white/40 p-2 rounded-2xl border border-slate-200 shrink-0 font-sans">
                {menuTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 font-sans">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/80 transition-all border-l-4 border-l-orange-500 shadow-sm">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className={cn("text-2xl font-black italic", s.color)}>{s.val}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <s.icon className={cn("w-5 h-5 opacity-40 group-hover:opacity-80 transition-opacity", s.color)} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
