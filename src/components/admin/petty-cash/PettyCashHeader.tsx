"use client"

import { Button } from "@/components/ui/button"
import { Wallet, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface PettyCashHeaderProps {
    onEmit: () => void
}

export function PettyCashHeader({ onEmit }: PettyCashHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 border-b-2 border-slate-100 pb-12 relative z-20">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Financial Governance v3.0</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                    Caja <span className="text-orange-600">Menor</span>
                </h1>
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] italic opacity-80">Gobernanza y control de egresos operativos</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" className="h-16 px-8 bg-white border-2 border-slate-100 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] italic text-slate-400 transition-all gap-3 hover:bg-slate-50 hover:text-slate-900 active:scale-95 group shadow-sm">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RETORNO
                    </Button>
                </Link>
                <Button
                    onClick={onEmit}
                    className="h-16 px-10 bg-orange-600 text-white hover:bg-orange-500 font-black uppercase text-[10px] tracking-[0.2em] italic rounded-[2rem] shadow-2xl shadow-orange-600/20 transition-all gap-3 border-none group active:scale-95"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> EMITIR PROTOCOLO DE GASTO
                </Button>
            </div>
        </div>
    )
}
