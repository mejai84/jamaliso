"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, UserCircle2 } from "lucide-react"
import Link from "next/link"

interface PosHeaderProps {
    currentTime: Date
}

export function PosHeader({ currentTime }: PosHeaderProps) {
    return (
        <div className="relative z-20 p-6 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-xl shrink-0 font-sans text-white">
            <div className="flex items-center gap-4 md:gap-6">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">TERMINAL <span className="text-orange-500">POS</span> </h1>
                    <p className="hidden md:block text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">NODO VENTA_DIRECTA_ACTIVE</p>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-8">
                <div className="text-right hidden md:block">
                    <p className="text-xl font-black italic tracking-tighter font-mono">
                        {currentTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest">SISTEMA EN LÍNEA</p>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 md:h-12 px-3 md:px-6 flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 rounded-xl">
                        <UserCircle2 className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                        <span className="text-[10px] md:text-xs font-black italic uppercase">Cajero: Admin</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
