"use client"

import { Zap, Sparkles } from "lucide-react"

export function SmartInsight() {
    return (
        <div className="p-8 bg-orange-600 rounded-[2.5rem] shadow-xl shadow-orange-600/20 relative overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all font-sans text-white">
            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:scale-125 transition-all">
                <Zap className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-4 text-white">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/80">AI REVENUE PREDICTION</span>
                </div>
                <h3 className="text-3xl font-black italic leading-none uppercase tracking-tighter">Se proyecta un crecimiento del 18% para el fin de semana</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/80">Basado en el histórico de Jueves de JAMALI OS.</p>
            </div>
        </div>
    )
}
