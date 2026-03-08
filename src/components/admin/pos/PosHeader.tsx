"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, UserCircle2 } from "lucide-react"
import Link from "next/link"

interface PosHeaderProps {
    currentTime: Date
}

export function PosHeader({ currentTime }: PosHeaderProps) {
    return (
        <div className="relative z-20 p-6 flex items-center justify-between border-b-2 border-slate-200 bg-white/80 backdrop-blur-xl shrink-0 font-sans text-slate-900 shadow-sm">
            <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin">
                    <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all active:scale-90 group">
                        <ArrowLeft className="w-5 h-5 text-slate-900 group-hover:text-orange-600 transition-colors" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">TERMINAL <span className="text-orange-600">POS</span> </h1>
                    <div className="hidden md:flex items-center gap-2 mt-1.5">
                        <div className="w-8 h-px bg-slate-200" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">NODO VENTA_DIRECTA_ACTIVE</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-8">
                <div className="text-right hidden md:block">
                    <p className="text-xl font-black italic tracking-tighter text-slate-900 font-mono">
                        {currentTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                    <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest italic">Sincronización Realmente en Vivo</p>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 md:h-12 px-3 md:px-6 flex items-center gap-2 md:gap-3 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-sm">
                        <UserCircle2 className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                        <span className="text-[10px] md:text-xs font-black italic uppercase text-slate-900">Cajero: Admin</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
