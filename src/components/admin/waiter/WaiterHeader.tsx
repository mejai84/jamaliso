"use client"

import { MessageSquare, ArrowLeft } from "lucide-react"

interface WaiterHeaderProps {
    view: 'tables' | 'order' | 'options'
    onBack: () => void
    onOpenChat: () => void
}

export function WaiterHeader({ view, onBack, onOpenChat }: WaiterHeaderProps) {
    return (
        <header className="p-6 border-b border-slate-200 bg-white/40 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
                {view !== 'tables' && (
                    <button onClick={onBack} className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                        WAITER <span className="text-orange-600">PRO</span>
                    </h1>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">SISTEMA DE COMANDAS MÓVIL</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenChat}
                    className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all shadow-sm"
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                    <span className="text-[8px] font-black uppercase text-emerald-500">LIVE SYNC</span>
                </div>
            </div>
        </header>
    )
}
