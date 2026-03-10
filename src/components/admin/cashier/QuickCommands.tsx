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
        <div className="grid grid-cols-2 gap-6">
            <Button
                onClick={onIncome}
                className="h-40 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-slate-900 hover:shadow-2xl transition-all flex flex-col items-start p-8 gap-6 group active:scale-95 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 transition-all pointer-events-none">
                    <Plus className="w-24 h-24 text-slate-900" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-emerald-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                    <Plus className="w-7 h-7" />
                </div>
                <div className="text-left relative z-10">
                    <span className="font-black uppercase text-xl md:text-2xl italic tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors block leading-none">INGRESO</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 italic block opacity-60">DEPOSIT_FLOW</span>
                </div>
            </Button>

            <Button
                onClick={onExpense}
                className="h-40 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-slate-900 hover:shadow-2xl transition-all flex flex-col items-start p-8 gap-6 group active:scale-95 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 transition-all pointer-events-none">
                    <Minus className="w-24 h-24 text-slate-900" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-rose-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                    <Minus className="w-7 h-7" />
                </div>
                <div className="text-left relative z-10">
                    <span className="font-black uppercase text-xl md:text-2xl italic tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors block leading-none">EGRESO</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 italic block opacity-60">WITHDRAWAL_FLOW</span>
                </div>
            </Button>

            <Button
                onClick={onPettyCash}
                className="h-32 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-slate-900 hover:shadow-2xl transition-all flex flex-col items-start p-8 gap-4 group active:scale-95 relative overflow-hidden"
            >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-amber-500 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                    <HandCoins className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <span className="font-black uppercase text-sm md:text-base italic tracking-tighter group-hover:text-orange-600 transition-colors block leading-none">CAJA MENOR</span>
                </div>
            </Button>

            <Button
                onClick={onAudit}
                className="h-32 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-slate-900 hover:shadow-2xl transition-all flex flex-col items-start p-8 gap-4 group active:scale-95 relative overflow-hidden"
            >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-indigo-500 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                    <Scale className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <span className="font-black uppercase text-sm md:text-base italic tracking-tighter group-hover:text-orange-600 transition-colors block leading-none">ARQUEO PARCIAL</span>
                </div>
            </Button>

            <Link href="/admin/caja/cierre" className="col-span-1">
                <Button className="w-full h-24 rounded-[2.5rem] bg-orange-600 hover:bg-orange-500 text-white transition-all flex flex-col items-center justify-center gap-2 shadow-xl shadow-orange-600/20 group active:scale-95">
                    <Clock className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span className="font-black uppercase text-[10px] tracking-[0.2em] italic text-center leading-tight">CERRAR PENDIENTES</span>
                </Button>
            </Link>
            <Link href="/admin/cashier/close-shift" className="col-span-1">
                <Button className="w-full h-24 rounded-[2.5rem] bg-slate-900 text-white hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-2 shadow-xl group active:scale-95">
                    <Lock className="w-6 h-6 group-hover:rotate-12 transition-transform text-orange-500" />
                    <span className="font-black uppercase text-[10px] tracking-[0.2em] italic text-center leading-tight">CERRAR JORNADA</span>
                </Button>
            </Link>
        </div>
    )
}
