"use client"

import { BadgeCheck, AlertTriangle, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ZReportModalProps {
    isOpen: boolean
    data: any
    onPrint: () => void
    onExit: () => void
}

export function ZReportModal({ isOpen, data, onPrint, onExit }: ZReportModalProps) {
    if (!isOpen || !data) return null

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-[100px] flex items-center justify-center p-8 animate-in zoom-in-90 duration-700">
            <div className="bg-card w-full max-w-2xl rounded-[6rem] p-20 text-center relative overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.8)] border-4 border-white/10 group/final">
                <div className={cn(
                    "absolute top-0 left-0 w-full h-4",
                    data.difference === 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"
                )} />

                <div className="mb-12 flex justify-center relative">
                    {data.difference === 0 ? (
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 scale-150 animate-pulse" />
                            <div className="w-32 h-32 bg-emerald-500 rounded-[3rem] flex items-center justify-center text-white shadow-3xl relative z-10 animate-in bounce-in">
                                <BadgeCheck className="w-16 h-16" />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 scale-150 animate-pulse" />
                            <div className="w-32 h-32 bg-rose-500 rounded-[3rem] flex items-center justify-center text-white shadow-3xl relative z-10 animate-in shake">
                                <AlertTriangle className="w-16 h-16" />
                            </div>
                        </div>
                    )}
                </div>

                <h2 className="text-6xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none">
                    {data.difference === 0 ? "PROTOCOLO <span className='text-emerald-500'>LIMPIO</span>" : "NOVEDAD EN <span className='text-rose-500'>CIERRE</span>"}
                </h2>
                <p className="text-white/20 font-black text-[12px] uppercase tracking-[0.4em] mb-16 italic px-10">
                    {data.difference === 0 ? "SISTEMA FÍSICO Y LÓGICO EN PERFECTA SINCRONÍA. INTEGRIDAD FORENSE VERIFICADA." : "DISCREPANCIA DETECTADA EN EL FLUJO FÍSICO DE CAJA. SE HA GENERADO UNA ALERTA EN EL PANEL DE AUDITORÍA."}
                </p>

                <div className="space-y-6 bg-white/5 p-12 rounded-[4rem] border-4 border-white/5 mb-16 shadow-inner relative group/data">
                    <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover/data:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.6em] text-white/20 italic">
                        <span>SALDO TEÓRICO_SESSION</span>
                        <span className="text-white tracking-tighter text-2xl">${data.systemAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.6em] text-white/20 italic">
                        <span>CONTEO FÍSICO_MANUAL</span>
                        <span className="text-white tracking-tighter text-2xl">${data.countedAmount.toLocaleString()}</span>
                    </div>
                    <div className={cn("flex justify-between items-center text-4xl font-black uppercase tracking-tighter pt-8 border-t-4 border-white/5 italic",
                        data.difference === 0 ? "text-emerald-500" : "text-rose-500")}>
                        <span className="text-[12px] tracking-[0.8em]">DIFERENCIA_NETA</span>
                        <span>{data.difference > 0 ? '+' : ''}${data.difference.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-6 mt-16">
                    <Button
                        onClick={onPrint}
                        className="flex-1 h-28 rounded-[3rem] bg-white/5 border-4 border-white/5 text-white font-black uppercase italic tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-4"
                    >
                        <Printer className="w-8 h-8" />
                        IMPRIMIR REPORTE
                    </Button>
                    <Button
                        onClick={onExit}
                        className="flex-1 h-28 rounded-[3rem] bg-foreground text-background font-black uppercase italic tracking-[0.5em] hover:bg-primary hover:text-black transition-all hover:scale-105 active:scale-95 border-none text-xl shadow-3xl relative group/exit overflow-hidden"
                    >
                        FINALIZAR OPERACIÓN
                    </Button>
                </div>
            </div>
        </div>
    )
}
