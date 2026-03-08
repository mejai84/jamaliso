"use client"

import { BadgeCheck, AlertTriangle, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ZReportModalProps {
    isOpen: boolean
    data: any
    onPrint: () => void
    onExit: () => void
    restaurant: any
}

export function ZReportModal({ isOpen, data, onPrint, onExit, restaurant }: ZReportModalProps) {
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

            {/* PRINT TEMPLATE (Thermal 80mm) */}
            <div className="z-report-print opacity-0 pointer-events-none absolute left-0 top-0 text-black bg-white p-4 font-mono w-[80mm] leading-tight text-center">
                <div className="space-y-1 mb-4 border-b border-black pb-2">
                    {restaurant?.logo_url && (
                        <div className="flex justify-center mb-2">
                            <img src={restaurant.logo_url} alt="Logo" className="h-12 w-auto object-contain grayscale" />
                        </div>
                    )}
                    <h2 className="text-lg font-bold uppercase">{restaurant?.name}</h2>
                    <p className="text-[9px] uppercase">{restaurant?.address_text}</p>
                    <p className="text-[9px] font-bold">REPORTE Z - CIERRE DE CAJA</p>
                    <p className="text-[8px] italic">FECHA CIERRE: {new Date().toLocaleString()}</p>
                </div>

                <div className="text-left space-y-2 mb-4 border-b border-black pb-2">
                    <div className="flex justify-between text-[10px]">
                        <span>VENTAS TOTALES:</span>
                        <span className="font-bold">${data.sales?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>EGRESOS/GASTOS:</span>
                        <span className="font-bold text-rose-600">-${data.expenses?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] border-t border-dotted border-black pt-1">
                        <span>EFECTIVO ESPERADO:</span>
                        <span>${data.systemAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>EFECTIVO CONTADO:</span>
                        <span>${data.countedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-t border-black pt-1">
                        <span>DIFERENCIA CIERRE:</span>
                        <span className={data.difference === 0 ? "text-emerald-600" : "text-rose-600"}>
                            ${data.difference > 0 ? '+' : ''}{data.difference.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="text-[9px] italic space-y-1">
                    <p className="font-bold uppercase">ESTADO DE CIERRE: {data.difference === 0 ? "SIN NOVEDAD" : "CON NOVEDAD"}</p>
                    <div className="h-10 mt-4 border-b border-black w-full" />
                    <p className="text-[7px] uppercase tracking-widest mt-1">FIRMA RESPONSABLE CIERRE</p>
                </div>

                <div className="mt-6 pt-2 border-t border-dashed border-black text-[7px] uppercase tracking-widest opacity-50">
                    <p>JAMALI OS FINANCIAL CORE v2.0</p>
                    <p>Propiedad de Jaime Jaramillo © 2026</p>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    .no-print { display: none !important; }
                    .z-report-print, .z-report-print * {
                        visibility: visible !important;
                    }
                    .z-report-print { 
                        opacity: 1 !important;
                        position: fixed !important; 
                        left: 0 !important; 
                        top: 0 !important;
                        width: 80mm !important;
                        background: white !important;
                        z-index: 9999;
                    }
                }
            `}</style>
        </div>
    )
}
