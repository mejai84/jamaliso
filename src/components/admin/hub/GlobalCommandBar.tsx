"use client"

import { Zap, ShoppingBag, Activity, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export function GlobalCommandBar() {
    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-lg h-20 bg-white/90 backdrop-blur-3xl border border-slate-200 rounded-[2rem] flex items-center justify-around px-8 z-[100] shadow-lg font-sans">
            <Link href="/admin/hub">
                <div className="flex flex-col items-center gap-1.5 text-orange-500 group cursor-pointer active:scale-90 transition-all border-t-2 border-orange-500 pt-2 -mt-2">
                    <Zap className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,102,0,0.3)]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">HUB</span>
                </div>
            </Link>
            <Link href="/admin/orders">
                <div className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-orange-500 group cursor-pointer active:scale-90 transition-all pt-2 -mt-2">
                    <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">Ventas</span>
                </div>
            </Link>
            <Link href="/admin/employees">
                <div className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-orange-500 group cursor-pointer active:scale-90 transition-all pt-2 -mt-2">
                    <Activity className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">Staff</span>
                </div>
            </Link>
            <Link href="/admin/reports">
                <div className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-orange-500 group cursor-pointer active:scale-90 transition-all pt-2 -mt-2">
                    <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">Stats</span>
                </div>
            </Link>
            <Link href="/admin/settings">
                <div className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-orange-500 group cursor-pointer active:scale-90 transition-all pt-2 -mt-2">
                    <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">Core</span>
                </div>
            </Link>
        </nav>
    )
}
