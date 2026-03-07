"use client"

import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { TopProduct } from "@/app/admin/reports/types"
import { toast } from "sonner"

interface ContributionMarginProps {
    topProducts: TopProduct[]
}

export function ContributionMargin({ topProducts }: ContributionMarginProps) {
    return (
        <div className="flex-1 bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-10 flex flex-col overflow-hidden relative shadow-sm font-sans">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-100">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-slate-900">Margen de <span className="text-orange-500">Contribución</span></h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Ingreso Real vs Costo Receta</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4">
                {topProducts.map((p, i) => (
                    <div key={i} className="group relative flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-orange-500/20 transition-all cursor-pointer shadow-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-black italic text-slate-300 group-hover:text-orange-500/40 transition-colors">0{i + 1}</span>
                            <div>
                                <p className="text-sm font-black italic uppercase tracking-tight text-slate-900">{p.product_name}</p>
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Utilidad: {formatPrice(p.contribution_margin || 0)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black italic font-mono text-slate-900">{formatPrice(p.total_revenue)}</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase">Rev.</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <Button
                    onClick={() => toast.info("CARGANDO REPORTE DETALLADO DE PRODUCTOS")}
                    className="w-full h-14 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black uppercase text-[10px] italic tracking-widest rounded-2xl shadow-sm"
                >
                    VER REPORTE COMPLETO
                </Button>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(0, 0, 0, 0.1); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
