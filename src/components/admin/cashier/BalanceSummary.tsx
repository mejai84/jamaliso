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
        <div className="bg-foreground rounded-[4.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group/bal">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none -mr-8 -mt-8 group-hover/bal:scale-110 transition-transform duration-1000 rotate-12">
                <Banknote className="w-64 h-64 text-white" />
            </div>

            <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black shadow-2xl">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">SALDO ESTIMADO</p>
                    </div>
                    {balance.total > cashLimit && (
                        <div className="flex items-center gap-2 bg-rose-500/20 px-3 py-1 rounded-full animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <span className="text-[10px] font-black text-rose-500 uppercase italic">RECOGIDA RECOMENDADA</span>
                        </div>
                    )}
                </div>
                <h2 className="text-7xl font-black italic tracking-tighter text-background leading-none drop-shadow-2xl">
                    {balance.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </h2>

                <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-40">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <p className="text-[9px] font-black text-white uppercase tracking-widest italic">VENTAS BRUTAS</p>
                        </div>
                        <p className="text-2xl font-black italic text-white tracking-tighter">{balance.sales.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-40">
                            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                            <p className="text-[9px] font-black text-white uppercase tracking-widest italic">GASTOS OPERATIVOS</p>
                        </div>
                        <p className="text-2xl font-black italic text-white tracking-tighter">{balance.expenses.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
