"use client"

import { Wallet, AlertTriangle, TrendingUp, TrendingDown, Banknote } from "lucide-react"
import { cn } from "@/lib/utils"

interface BalanceSummaryProps {
    balance: {
        total: number
        sales: number
        expenses: number
        incomes: number
    }
    cashLimit: number
}

export function BalanceSummary({ balance, cashLimit }: BalanceSummaryProps) {
    return (
        <div className="bg-white border-2 border-slate-100 rounded-[3.5rem] p-10 md:p-12 shadow-2xl shadow-slate-900/5 relative overflow-hidden group/bal">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none -mr-8 -mt-8 group-hover/bal:scale-110 transition-transform duration-1000 rotate-12">
                <Banknote className="w-64 h-64 text-slate-900" />
            </div>

            <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border-2 border-slate-100 shadow-sm group-hover/bal:bg-slate-900 group-hover/bal:text-white group-hover/bal:border-slate-900 transition-all duration-500">
                            <Wallet className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] italic mb-1 group-hover/bal:text-slate-900 transition-colors">CAPITAL OPERATIVO</span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none italic opacity-60">SALDO_ESTIMADO_ACTUAL</p>
                        </div>
                    </div>
                    {balance.total > cashLimit && (
                        <div className="flex items-center gap-2 bg-rose-500/10 border-2 border-rose-500/20 px-4 py-2 rounded-full animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span className="text-[9px] font-black text-rose-500 uppercase italic tracking-widest">RECOGIDA_RECOMENDADA</span>
                        </div>
                    )}
                </div>
                <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter text-slate-900 leading-none group-hover/bal:text-orange-600 transition-colors duration-500">
                    {balance.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </h2>

                <div className="grid grid-cols-2 gap-8 pt-10 border-t-2 border-slate-50">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-60">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">VENTAS BRUTAS</p>
                        </div>
                        <p className="text-2xl md:text-3xl font-black italic text-slate-900 tracking-tighter">{balance.sales.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-60">
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">EGRESOS CAJA</p>
                        </div>
                        <p className="text-2xl md:text-3xl font-black italic text-slate-900 tracking-tighter">{balance.expenses.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
