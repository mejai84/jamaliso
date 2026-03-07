"use client"

import { formatPrice } from "@/lib/utils"
import { WasteData } from "@/app/admin/reports/types"

interface WasteWidgetProps {
    weeklyWaste: WasteData[]
}

export function WasteWidget({ weeklyWaste }: WasteWidgetProps) {
    return (
        <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-10 flex flex-col relative overflow-hidden h-64 shadow-sm font-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 text-red-500">Waste <span className="text-slate-900">Merma Semanal</span></h2>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Pérdida por Ingredientes en Pesos</p>
                </div>
            </div>

            <div className="flex-1 flex items-end gap-10">
                {weeklyWaste.length > 0 ? weeklyWaste.map((w, i) => {
                    const maxW = Math.max(...weeklyWaste.map(x => x.amount), 1000)
                    const h = (w.amount / maxW) * 100
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 relative group">
                            <div className="absolute -top-8 bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                {formatPrice(w.amount)}
                            </div>
                            <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden h-full flex flex-col justify-end">
                                <div className="bg-red-400 group-hover:bg-red-500 transition-all w-full" style={{ height: `${h}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase italic">{w.day}</span>
                        </div>
                    )
                }) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sin reportes de merma esta semana</div>
                )}
            </div>
        </div>
    )
}
