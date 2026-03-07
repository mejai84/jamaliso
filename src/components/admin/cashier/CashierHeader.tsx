"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Activity, Wallet, RefreshCw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CashierHeaderProps {
    currentUser: any
    refreshing: boolean
    onRefresh: () => void
}

export function CashierHeader({ currentUser, refreshing, onRefresh }: CashierHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 border-b border-border/50 pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2.5rem] bg-card border border-border shadow-3xl hover:bg-muted active:scale-90 transition-all group overflow-hidden relative">
                        <ArrowLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform relative z-10" />
                    </Button>
                </Link>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground">CONTROL <span className="text-primary italic">CAJA</span></h1>
                        <div className="px-5 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[1.5rem] text-[11px] font-black text-emerald-500 tracking-[0.3em] italic uppercase shadow-xl animate-pulse flex items-center gap-3">
                            <Activity className="w-3 h-3" />
                            SESIÓN ACTIVA_HUB_01
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.5em] italic flex items-center gap-4 opacity-60">
                        <Wallet className="w-5 h-5 text-primary" /> Maestro de Movimientos, Flujo de Efectivo & Auditoría de Turno
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex flex-col items-end gap-2 px-8 border-r border-border/50">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic leading-none">TERMINAL OPERATOR</p>
                    <p className="text-xl font-black italic text-foreground tracking-tighter uppercase leading-none">{currentUser?.full_name}</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="w-20 h-20 rounded-[2.5rem] bg-card border border-border hover:bg-muted hover:text-primary transition-all shadow-3xl group"
                >
                    <RefreshCw className={cn("w-8 h-8 group-hover:rotate-180 transition-transform duration-700", refreshing && "animate-spin")} />
                </Button>
            </div>
        </div>
    )
}
