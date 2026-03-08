"use client"

import { Search, Check, VolumeX, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminTranslations } from "@/lib/i18n/admin"

interface StockManagerModalProps {
    isOpen: boolean
    onClose: () => void
    products: any[]
    onToggleAvailability: (id: string, current: boolean) => void
    searchQuery: string
    onSearchChange: (q: string) => void
    lang?: 'en' | 'es'
}

export function StockManagerModal({
    isOpen,
    onClose,
    products,
    onToggleAvailability,
    searchQuery,
    onSearchChange,
    lang = 'es'
}: StockManagerModalProps) {
    if (!isOpen) return null
    const t = adminTranslations[lang].kds

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl pointer-events-auto" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-12 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">{t.stock.title.split(' ')[0]} <span className="text-orange-600">{t.stock.title.split(' ')[1]}</span></h2>
                        <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1 italic">{t.stock.desc}</p>
                    </div>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={3} />
                        <input
                            type="text"
                            placeholder={t.stock.search}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 bg-white border-2 border-slate-200 rounded-3xl font-black italic text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products
                            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => onToggleAvailability(product.id, product.is_available)}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-4 text-left group",
                                        product.is_available
                                            ? "bg-white border-slate-200 hover:border-orange-500"
                                            : "bg-rose-50 border-rose-200 hover:border-rose-400"
                                    )}
                                >
                                    <div className="flex w-full justify-between items-start">
                                        <span className={cn(
                                            "text-[13px] font-black uppercase tracking-tight italic flex-1 pr-4",
                                            product.is_available ? "text-slate-900" : "text-rose-900"
                                        )}>{product.name}</span>
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-active:scale-95",
                                            product.is_available ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                        )}>
                                            {product.is_available ? <Check className="w-5 h-5" strokeWidth={4} /> : <VolumeX className="w-5 h-5" strokeWidth={4} />}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            product.is_available ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                        )}>
                                            {product.is_available ? t.stock.available : t.stock.sold_out}
                                        </div>
                                        {!product.is_available && <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />}
                                    </div>
                                </button>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
