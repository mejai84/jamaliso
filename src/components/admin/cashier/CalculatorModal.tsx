"use client"

import { useState, useEffect } from "react"
import { X, Calculator, Minus, Plus, Signal, Target, BadgeCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DENOMINATIONS } from "@/app/admin/cashier/types"

interface CalculatorModalProps {
    isOpen: boolean
    mode: 'audit' | 'close' | null
    onSubmit: (amount: number, reason: string) => Promise<void>
    onClose: () => void
    submitting: boolean
}

export function CalculatorModal({ isOpen, mode, onSubmit, onClose, submitting }: CalculatorModalProps) {
    const [billCounts, setBillCounts] = useState<Record<number, number>>({})
    const [reason, setReason] = useState("")

    const updateBillCount = (denom: number, delta: number) => {
        setBillCounts(prev => {
            const current = prev[denom] || 0
            const next = Math.max(0, current + delta)
            return { ...prev, [denom]: next }
        })
    }

    const calculatedTotal = Object.entries(billCounts).reduce((acc, [denom, count]) => acc + (Number(denom) * count), 0)

    if (!isOpen || !mode) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-[1700px] h-[90vh] bg-card border-4 border-border/40 rounded-[5rem] overflow-hidden flex flex-col xl:flex-row shadow-[0_0_150px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-20 duration-700 relative">

                {/* Left Side: Calculator Mesh */}
                <div className="flex-1 p-16 overflow-y-auto custom-scrollbar bg-black/20 relative group/calc">
                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover/calc:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-10 mb-20 relative z-10">
                        <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center text-black shadow-3xl">
                            <Calculator className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Kernel <span className="text-primary italic">Calculadora</span></h2>
                            <p className="text-[11px] font-black text-primary/40 uppercase tracking-[0.6em] italic leading-none pl-2">PROTOCOLO DE ARQUEO FÍSICO DE DIVISAS</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
                        {DENOMINATIONS.map(d => (
                            <div key={d.value} className={cn(
                                "bg-card border-4 border-white/5 p-8 rounded-[3.5rem] flex flex-col items-center justify-between gap-8 transition-all duration-500 hover:border-primary/40 hover:bg-primary/5 group/denom",
                                d.color.split(' ')[0]
                            )}>
                                <div className="flex justify-between w-full opacity-40">
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">{(d as any).isCoin ? 'MONEDA_M0' : 'BILLETE_B0'}</span>
                                    <Signal className="w-4 h-4" />
                                </div>
                                <h3 className="text-4xl font-black italic tracking-tighter text-white group-hover/denom:scale-110 transition-transform">${d.value.toLocaleString()}</h3>
                                <div className="flex items-center justify-between w-full bg-black/40 p-3 rounded-[2rem] shadow-inner">
                                    <button type="button" onClick={() => updateBillCount(d.value, -1)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-white/40 active:scale-75 shadow-lg"><Minus className="w-6 h-6" /></button>
                                    <span className="text-3xl font-black italic text-white/60 group-hover/denom:text-white transition-colors tabular-nums">{billCounts[d.value] || 0}</span>
                                    <button type="button" onClick={() => updateBillCount(d.value, 1)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center text-white/40 active:scale-75 shadow-lg"><Plus className="w-6 h-6" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Control & Summary */}
                <div className="xl:w-[500px] p-16 bg-card border-l-4 border-border/40 flex flex-col relative z-20 shadow-[-50px_0_100px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-12 -mt-12 group-hover:scale-110 transition-all duration-1000">
                        <Target className="w-[500px] h-[500px]" />
                    </div>

                    <div className="flex justify-between items-center mb-20 relative z-10">
                        <h3 className="text-[11px] font-black uppercase text-white/20 tracking-[0.5em] italic">Resumen de Escaneo</h3>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl h-16 w-16 bg-white/5 hover:bg-red-500 hover:text-white transition-all"><X className="w-8 h-8" /></Button>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-16 relative z-10">
                        <div className="text-center space-y-4 group/total">
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.8em] italic leading-none pl-2 animate-pulse">TOTAL CONTADO</p>
                            <h2 className="text-8xl font-black italic tracking-tighter text-white leading-none tabular-nums group-hover/total:scale-110 transition-transform duration-700">${calculatedTotal.toLocaleString()}</h2>
                        </div>

                        <div className="p-10 bg-amber-500/10 rounded-[4rem] border-4 border-amber-500/20 text-center space-y-6 shadow-3xl group/warn overflow-hidden relative">
                            <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                            <div className="w-12 h-12 text-amber-500 mx-auto group-hover/warn:rotate-12 transition-transform relative z-10 flex items-center justify-center">
                                <BadgeCheck className="w-10 h-10" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <p className="text-[12px] font-black text-amber-500 uppercase tracking-[0.4em] italic leading-none">CIERRE CIEGO ACTIVADO</p>
                                <p className="text-[10px] font-black text-amber-500/40 uppercase italic leading-relaxed px-4">
                                    EL SISTEMA NO REVELARÁ EL SALDO TEÓRICO HASTA LA CONFIRMACIÓN FINAL PARA GARANTIZAR INTEGRIDAD FORENSE.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 group/notes">
                            <label className="text-[11px] font-black text-white/20 uppercase tracking-[0.6em] ml-10 italic flex items-center gap-4">
                                NOVEDADES OPERATIVAS
                            </label>
                            <textarea
                                className="w-full h-48 bg-white/5 border-4 border-white/5 rounded-[4rem] p-10 font-black text-lg italic text-white placeholder:text-white/5 outline-none resize-none transition-all shadow-inner uppercase tracking-tight focus:border-primary/40"
                                placeholder="REGISTRA FACTURAS, GASTOS MENORES O ANOMALÍAS..."
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-16 relative z-10">
                        <Button
                            disabled={submitting || calculatedTotal === 0}
                            onClick={() => onSubmit(calculatedTotal, reason)}
                            className={cn(
                                "w-full h-28 rounded-[3rem] text-white font-black uppercase italic tracking-[0.4em] text-xl transition-all active:scale-95 border-none group",
                                mode === 'audit' ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30" : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30"
                            )}
                        >
                            {submitting ? <Loader2 className="w-10 h-10 animate-spin" /> : (
                                mode === 'audit' ? "EJECUTAR ARQUEO PARCIAL" : "SUBIR REPORTE Z Y CERRAR"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
