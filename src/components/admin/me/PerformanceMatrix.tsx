"use client"

import { Wallet, Clock, Award, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Stats } from "@/app/admin/me/types"

interface PerformanceMatrixProps {
    stats: Stats
    onOpenDetails: () => void
}

export function PerformanceMatrix({ stats, onOpenDetails }: PerformanceMatrixProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
            {/* LIQUIDITY GAUGE */}
            <div className="bg-card p-10 rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-700">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500 rotate-12 group-hover:scale-125 transition-transform duration-1000">
                    <Wallet className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-background transition-all duration-500">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Incentivos Generados</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-emerald-500 leading-none">
                            {formatPrice(stats.tipsEstimated)}
                        </h3>
                    </div>
                    <div className="pt-6 border-t border-border/50">
                        <Button
                            onClick={onOpenDetails}
                            variant="ghost"
                            className="w-full justify-between h-14 bg-emerald-500/5 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 hover:text-background hover:bg-emerald-500 transition-all italic border border-emerald-500/10"
                        >
                            AUDITAR DETALLE <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* OPERATIONAL TIME */}
            <div className="bg-card p-10 rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden group hover:border-primary/40 transition-all duration-700">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-primary -rotate-12 group-hover:scale-125 transition-transform duration-1000">
                    <Clock className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-background transition-all duration-500">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Carga Horaria (MES)</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-foreground leading-none">
                            {stats.hoursWorked}<span className="text-xl ml-2 opacity-30">HRS</span>
                        </h3>
                    </div>
                    <div className="pt-6 border-t border-border/50 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] italic text-muted-foreground/60">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-primary" />
                                Métricas de Eficiencia
                            </div>
                            <span className="text-primary">{stats.shiftsThisMonth} TURNOS</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden border border-border/30">
                            <div className="h-full bg-primary w-[75%] animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* RANKING ENGINE */}
            <div className="bg-card p-10 rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-700">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-500 rotate-6 group-hover:scale-125 transition-transform duration-1000">
                    <Award className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-background transition-all duration-500">
                        <Award className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Nivel de Reputación</p>
                        <h3 className="text-4xl font-black italic tracking-tighter text-amber-500 leading-none">
                            {stats.rank}
                        </h3>
                    </div>
                    <div className="pt-6 border-t border-border/50 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] italic text-muted-foreground/60 px-1">
                            <span>XP PROGRESS</span>
                            <span className="text-amber-500">920 / 1000</span>
                        </div>
                        <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border/30">
                            <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-[92%] shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
