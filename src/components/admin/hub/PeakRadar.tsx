"use client"

import { TrendingUp, Activity, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PeakHour } from "@/app/admin/hub/types"

interface PeakRadarProps {
    peakHours: PeakHour[]
}

export function PeakRadar({ peakHours }: PeakRadarProps) {
    const peakArrayMax = (peaks: PeakHour[]) => {
        if (peaks.length === 0) return ""
        const max = [...peaks].sort((a, b) => b.count - a.count)[0]
        return `${max.hour}:00 Y ${max.hour + 1}:00`
    }

    return (
        <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[3.5rem] p-10 space-y-10 shadow-sm relative overflow-hidden group/peak font-sans">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] italic flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-orange-500 animate-bounce-slow" /> Radar de Afluencia
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-7 italic">PROYECCIÓN ÚLTIMOS 30 DÍAS</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-slate-100">
                    <Activity className="w-3 h-3 text-orange-500" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] italic">Optimizando Staff</span>
                </div>
            </div>

            <div className="h-32 flex items-end gap-2 px-2 relative min-h-[140px]">
                {peakHours.map((p, i) => (
                    <div key={i} className="flex-1 group/bar relative flex flex-col items-center h-full justify-end">
                        <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-[110%] mb-2 bg-slate-900 text-white p-3 rounded-2xl text-[9px] font-black whitespace-nowrap z-50 transition-all scale-75 group-hover/bar:scale-100 shadow-xl border border-slate-800 italic">
                            <div className="flex flex-col items-center">
                                <span className="text-primary">{p.hour}:00 HRS</span>
                                <span>{p.count} TRANSACCIONES</span>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                        </div>
                        <div
                            className={cn(
                                "w-full rounded-2xl transition-all duration-1000 relative overflow-hidden",
                                p.intensity > 80 ? "bg-primary shadow-[0_0_10px_rgba(255,107,0,0.3)]" :
                                    p.intensity > 40 ? "bg-orange-500/30 border border-orange-500/20" : "bg-slate-100 border border-slate-200"
                            )}
                            style={{ height: `${Math.max(12, p.intensity)}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                        </div>
                        <span className="text-[7px] font-black text-muted-foreground/30 mt-3 group-hover/bar:text-primary transition-colors">{p.hour}h</span>
                    </div>
                ))}
                {peakHours.length === 0 && (
                    <div className="w-full flex flex-col items-center justify-center py-12 space-y-4 opacity-10">
                        <BarChart3 className="w-12 h-12" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Calculando Red Neuronal de Demanda...</p>
                    </div>
                )}
            </div>

            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 text-center relative overflow-hidden">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-primary rounded-r-full" />
                <p className="text-[10px] text-foreground font-black italic uppercase tracking-tight leading-relaxed">
                    {peakHours.length > 0 ? (
                        <>PUNTO MÁXIMO DE CARGA DETECTADO ENTRE <span className="text-primary underline decoration-primary/30 underline-offset-4">{peakArrayMax(peakHours)}H</span>. RECOMIENDA REFUERZO DE OPERATIVOS.</>
                    ) : "INTEGRANDO DATOS DE AFLUENCIA PARA DETERMINAR CICLOS DE ALTO IMPACTO."}
                </p>
            </div>
            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
