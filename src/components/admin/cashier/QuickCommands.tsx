"use client"

import { Button } from "@/components/ui/button"
import { Plus, Minus, HandCoins, Scale, Clock, Lock } from "lucide-react"
import Link from "next/link"

interface QuickCommandsProps {
    onIncome: () => void
    onExpense: () => void
    onPettyCash: () => void
    onAudit: () => void
}

export function QuickCommands({ onIncome, onExpense, onPettyCash, onAudit }: QuickCommandsProps) {
    return (
        <div className="grid grid-cols-2 gap-8">
            <Button
                onClick={onIncome}
                className="h-32 rounded-[3.5rem] bg-card border border-border hover:bg-primary/5 hover:border-primary/40 transition-all flex flex-col gap-4 shadow-3xl group active:scale-95 border-none"
            >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <Plus className="w-7 h-7" />
                </div>
                <span className="font-black uppercase text-[10px] tracking-[0.3em] italic text-foreground">INGRESO CAJA</span>
            </Button>
            <Button
                onClick={onExpense}
                className="h-32 rounded-[3.5rem] bg-card border border-border hover:bg-primary/5 hover:border-primary/40 transition-all flex flex-col gap-4 shadow-3xl group active:scale-95 border-none"
            >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                    <Minus className="w-7 h-7" />
                </div>
                <span className="font-black uppercase text-[10px] tracking-[0.3em] italic text-foreground">EGRESO CAJA</span>
            </Button>
            <Button
                onClick={onPettyCash}
                className="h-28 rounded-[3rem] bg-card border border-border hover:bg-amber-500/10 hover:border-amber-500/40 transition-all flex flex-col gap-3 shadow-3xl group active:scale-95 border-none"
            >
                <HandCoins className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-black uppercase text-[9px] tracking-[0.2em] italic text-foreground text-center px-4">TRANF. CAJA MENOR</span>
            </Button>
            <Button
                onClick={onAudit}
                className="h-28 rounded-[3rem] bg-card border border-border hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all flex flex-col gap-3 shadow-3xl group active:scale-95 border-none"
            >
                <Scale className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="font-black uppercase text-[9px] tracking-[0.3em] italic text-foreground text-center">ARQUEO PARCIAL</span>
            </Button>
            <Link href="/admin/caja/cierre" className="col-span-1">
                <Button className="w-full h-24 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all flex flex-col items-center justify-center gap-2 shadow-xl group active:scale-95">
                    <Clock className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase text-[9px] tracking-[0.2em] italic text-center leading-tight">CERRAR PENDIENTES<br />(TRASPASO)</span>
                </Button>
            </Link>
            <Link href="/admin/cashier/close-shift" className="col-span-1">
                <Button className="w-full h-24 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all flex flex-col items-center justify-center gap-2 shadow-xl group active:scale-95">
                    <Lock className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase text-[9px] tracking-[0.2em] italic text-center leading-tight">CERRAR TURNO Y<br />JORNADA</span>
                </Button>
            </Link>
        </div>
    )
}
