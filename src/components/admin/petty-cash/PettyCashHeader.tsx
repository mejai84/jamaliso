"use client"

import { Button } from "@/components/ui/button"
import { Wallet, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface PettyCashHeaderProps {
    onEmit: () => void
}

export function PettyCashHeader({ onEmit }: PettyCashHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-10">
            <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Financial Governance v3.0</span>
                </div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Caja <span className="text-orange-500 italic">Menor</span></h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest italic opacity-70">Auditoría y control de egresos operativos</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" className="h-16 px-8 bg-white/5 border border-white/5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] italic text-white transition-all gap-3 hover:bg-white/10 active:scale-95 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RETORNO
                    </Button>
                </Link>
                <Button
                    onClick={onEmit}
                    className="h-16 px-10 bg-orange-600 text-black hover:bg-orange-500 font-black uppercase text-[10px] tracking-[0.2em] italic rounded-2xl shadow-2xl shadow-orange-500/20 transition-all gap-3 border-none group active:scale-95"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> EMITIR PROTOCOLO DE GASTO
                </Button>
            </div>
        </div>
    )
}
