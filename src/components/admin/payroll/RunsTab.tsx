"use client"

import { Wallet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Employee } from "@/app/admin/payroll/types"

interface RunsTabProps {
    employees: Employee[]
    isCalculating: boolean
    onCalculatePayroll: () => void
}

export function RunsTab({ employees, isCalculating, onCalculatePayroll }: RunsTabProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 p-4 font-sans">
            <div className="max-w-xl w-full text-center space-y-8 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-600 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
                    <Wallet className="w-24 h-24 md:w-32 md:h-32 text-orange-500 mx-auto relative z-10 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-slate-900">EJECUTAR <span className="text-orange-500">LIQUIDACIÓN</span></h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] italic">PROCESO MAESTRO DE NÓMINA - PERIODO ACTUAL</p>
                </div>
                <div className="p-8 md:p-10 bg-white/60 border border-slate-200 rounded-[2rem] md:rounded-[3rem] space-y-6 shadow-sm">
                    <div className="flex justify-between text-left">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Empleados a Liquidar</p>
                            <p className="text-2xl md:text-3xl font-black italic uppercase">{employees.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Estimada</p>
                            <p className="text-2xl md:text-3xl font-black italic uppercase text-orange-500">$9.240.000</p>
                        </div>
                    </div>
                    <Button
                        onClick={onCalculatePayroll}
                        disabled={isCalculating}
                        className="w-full h-16 md:h-20 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-sm md:text-base italic tracking-widest rounded-2xl md:rounded-3xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    >
                        {isCalculating ? (
                            <><Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-3 animate-spin" /> PROCESANDO NÓMINA...</>
                        ) : (
                            "EJECUTAR CÁLCULO"
                        )}
                    </Button>
                    <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-4">INICIAR DISPERSIÓN DE PAGOS</p>
                </div>
            </div>
        </div>
    )
}
