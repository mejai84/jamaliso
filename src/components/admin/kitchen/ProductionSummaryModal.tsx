"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingBag, Zap } from "lucide-react"
import { adminTranslations } from "@/lib/i18n/admin"

interface ProductionSummaryModalProps {
    isOpen: boolean
    onClose: () => void
    productionSummary: Record<string, number>
    lang?: 'en' | 'es'
}

export function ProductionSummaryModal({ isOpen, onClose, productionSummary, lang = 'es' }: ProductionSummaryModalProps) {
    if (!isOpen) return null
    const t = adminTranslations[lang].kds

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-6 md:p-10 pointer-events-none">
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-md pointer-events-auto" onClick={onClose} />
            <div className="relative w-full max-w-md h-full bg-white rounded-[3rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-right-10 duration-500">
                <div className="p-10 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">{t.summary.title.split(' ')[0]} <span className="text-orange-600">{t.summary.title.split(' ')[1]}</span></h2>
                            <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1 italic">{t.summary.desc}</p>
                        </div>
                        <Button onClick={onClose} variant="ghost" className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-200">
                            <ArrowLeft className="w-6 h-6 text-slate-900" strokeWidth={3} />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-4">
                    {Object.entries(productionSummary).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                            <ShoppingBag className="w-20 h-20 mb-6 text-slate-300" strokeWidth={1} />
                            <p className="text-sm font-black italic uppercase tracking-[0.2em]">{t.summary.empty}</p>
                        </div>
                    ) : (
                        Object.entries(productionSummary).map(([name, qty]: any) => (
                            <div key={name} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl group hover:border-orange-200 transition-all">
                                <span className="text-[15px] font-black italic uppercase tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">{name}</span>
                                <div className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black italic text-lg shadow-lg group-hover:bg-orange-600 transition-colors">
                                    {qty}x
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-10 bg-slate-900 text-white">
                    <div className="flex items-center gap-4">
                        <Zap className="w-8 h-8 text-orange-500 fill-orange-500" />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">{t.summary.proactive}</p>
                            <p className="text-sm font-bold italic tracking-tight">{t.summary.ready_mass}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
