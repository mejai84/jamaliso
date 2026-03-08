"use client"

import { MessageSquare, ArrowLeft } from "lucide-react"

interface WaiterHeaderProps {
    view: 'tables' | 'order' | 'options'
    onBack: () => void
    onOpenChat: () => void
}

export function WaiterHeader({ view, onBack, onOpenChat }: WaiterHeaderProps) {
    return (
        <header className="p-6 border-b-2 border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-4">
                {view !== 'tables' && (
                    <button onClick={onBack} className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md hover:border-orange-500 hover:bg-orange-50 transition-all group">
                        <ArrowLeft className="w-6 h-6 text-slate-900 group-hover:text-orange-600 transition-colors" />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                        JAMALI <span className="text-orange-600">OS</span> | <span className="text-slate-400">WAITER</span>
                    </h1>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                        <div className="w-8 h-px bg-slate-200" /> SISTEMA PROFESIONAL DE COMANDAS
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenChat}
                    className="p-3.5 bg-slate-900 border-2 border-slate-800 rounded-2xl flex items-center justify-center text-white hover:bg-orange-600 hover:border-orange-500 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
                <div className="px-4 py-2 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">SINCRONIZACIÓN ACTIVA</span>
                </div>
            </div>
        </header>
    )
}
