"use client"

import { Activity, ShieldAlert, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuditLog } from "@/app/admin/audit/types"

interface AuditStatsProps {
    logs: AuditLog[]
    onExport: () => void
}

export function AuditStats({ logs, onExport }: AuditStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
            <div className="bg-slate-900 border-none p-10 rounded-[3.5rem] text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-orange-500/40 transition-all" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4 text-left">
                        <p className="text-[11px] font-black italic text-orange-500 uppercase tracking-[0.4em]">Eventos en Registro</p>
                        <p className="text-6xl font-black italic tracking-tighter uppercase leading-none">{logs.length}<span className="text-xl ml-3 opacity-30 text-white">UNIT</span></p>
                    </div>
                    <Activity className="w-20 h-20 text-orange-500 opacity-20 group-hover:rotate-[30deg] transition-transform duration-1000" />
                </div>
            </div>

            <div className="bg-white border border-slate-200 p-10 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all duration-500">
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4 text-left">
                        <p className="text-[11px] font-black italic text-slate-500 uppercase tracking-[0.4em]">Eliminaciones (Crítico)</p>
                        <p className="text-6xl font-black italic tracking-tighter uppercase text-rose-500 leading-none">
                            {logs.filter(l => l.action === 'DELETE').length}
                            <span className="text-xl ml-3 text-slate-300">FAIL</span>
                        </p>
                    </div>
                    <ShieldAlert className="w-20 h-20 text-rose-500 opacity-10 group-hover:scale-110 transition-all duration-700" />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all duration-500 flex items-center justify-center p-12">
                <Button
                    variant="ghost"
                    onClick={onExport}
                    className="w-full h-full text-[12px] font-black uppercase italic tracking-[0.3em] gap-5 text-slate-500 hover:text-slate-900 transition-all flex flex-col items-center justify-center group-hover:bg-slate-50 rounded-[2.5rem]"
                >
                    <Download className="w-10 h-10 text-orange-500/40 group-hover:text-orange-500 transition-all mb-2 animate-bounce" />
                    DESCARGAR DATA FORENSE (.CSV)
                </Button>
            </div>
        </div>
    )
}
