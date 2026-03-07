"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface CouponsHeaderProps {
    onAddOpen: () => void
}

export function CouponsHeader({ onAddOpen }: CouponsHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-border/50 pb-10 font-sans">
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">SISTEMA DE FIDELIZACIÓN v5.0</span>
                </div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">CUPONES <span className="text-orange-500 italic">& OFERTAS</span></h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest italic opacity-70">Protocolos de fidelización y campañas de conversión</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" className="h-16 px-8 bg-white/[0.02] border border-white/5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] italic shadow-xl transition-all gap-3 hover:bg-white/5 active:scale-95 group text-white">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> VOLVER
                    </Button>
                </Link>
                <Button
                    onClick={onAddOpen}
                    className="h-16 px-10 bg-orange-600 text-black hover:bg-orange-500 font-black uppercase text-[10px] tracking-[0.2em] italic rounded-2xl shadow-3xl shadow-orange-500/20 transition-all gap-3 border-none active:scale-95 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> CREAR PROTOCOLO DE DESCUENTO
                </Button>
            </div>
        </div>
    )
}
