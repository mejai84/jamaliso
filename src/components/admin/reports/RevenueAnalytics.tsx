"use client"

import { formatPrice } from "@/lib/utils"
import { DailySales } from "@/app/admin/reports/types"

interface RevenueAnalyticsProps {
    dailySales: DailySales[]
}

export function RevenueAnalytics({ dailySales }: RevenueAnalyticsProps) {
    return (
        <div className="flex-1 bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-10 flex flex-col relative overflow-hidden shadow-sm font-sans">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2 text-slate-900">Revenue <span className="text-orange-500">Analytics</span></h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Análisis Comparativo de Ventas Semanales</p>
                </div>
            </div>

            {/* Simulación de Gráfico Pro */}
            <div className="flex-1 flex items-end gap-6 relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                    {[1, 2, 3, 4, 5].map(l => <div key={l} className="h-px bg-slate-900 w-full" />)}
                </div>

                {dailySales.map((s, i) => {
                    const maxVal = Math.max(...dailySales.map(d => d.total_sales), 1000)
                    const height = (s.total_sales / maxVal) * 100
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 relative z-10 group">
                            <div className="absolute -top-12 bg-orange-500 text-white px-2 py-1 rounded-lg text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-xl shadow-orange-500/40 -translate-y-2 group-hover:translate-y-0">
                                {formatPrice(s.total_sales)}
                            </div>
                            <div
                                className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-2xl group-hover:brightness-110 transition-all shadow-sm"
                                style={{ height: `${height}%` }}
                            />
                            <span className="text-[11px] font-black uppercase text-slate-500 group-hover:text-slate-900 transition-colors italic tracking-widest">{s.day}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
