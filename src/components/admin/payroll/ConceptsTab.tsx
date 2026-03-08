"use client"

import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Concept } from "@/app/admin/payroll/types"

interface ConceptsTabProps {
    concepts: Concept[]
}

export function ConceptsTab({ concepts }: ConceptsTabProps) {
    return (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[2rem] p-6 md:p-8 h-full flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-8 shrink-0">
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">CONFIGURACIÓN LEGAL</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Catálogo de Devengados y Deducciones</p>
                    </div>
                    <Button className="bg-white border border-slate-200 text-slate-900 font-black uppercase text-[9px] tracking-widest h-10 px-4 rounded-xl hover:bg-slate-50 shadow-sm">
                        AÑADIR CONCEPTO
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {concepts.length > 0 ? concepts.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 group hover:border-orange-500/30 transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center font-black",
                                    c.type === 'EARNING' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {c.type === 'EARNING' ? '+' : '-'}
                                </div>
                                <div>
                                    <p className="text-xs font-black italic uppercase tracking-tight">{c.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs font-black italic">{c.percentage ? `${c.percentage}%` : 'VALOR FIJO'}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{c.is_legal ? 'BASE_DIAN' : 'OPCIONAL'}</p>
                                </div>
                                {c.is_legal && (
                                    <div className="bg-orange-600/10 border border-orange-600/20 p-2 rounded-md">
                                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
                            <ShieldCheck className="w-12 h-12 mb-3 text-slate-400" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Cargando configuración legal...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
