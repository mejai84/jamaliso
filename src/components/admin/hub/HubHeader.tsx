"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Zap, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/admin/notification-bell"

interface HubHeaderProps {
    businessInfo: { name: string, logo: string | null }
    refreshing: boolean
    onReload: () => void
}

export function HubHeader({ businessInfo, refreshing, onReload }: HubHeaderProps) {
    return (
        <header className="sticky top-0 z-[100] bg-white/60 backdrop-blur-2xl border-b border-slate-200 p-6 flex items-center justify-between shadow-sm font-sans">
            <div className="flex items-center gap-5">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-90 shadow-sm group">
                        <ArrowLeft className="w-6 h-6 text-slate-900 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {businessInfo.logo ? (
                            <img src={businessInfo.logo} alt="Logo" className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500/20 shadow-2xl" />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border-2 border-orange-500/20 shadow-2xl">
                                <Zap className="w-6 h-6 text-orange-500 drop-shadow-[0_0_8px_rgba(255,102,0,0.5)]" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="space-y-0 pb-1">
                        <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic leading-none border-b border-orange-500/20 pb-0.5 text-slate-900">{businessInfo.name}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-orange-500 italic">Core Live Engine</span>
                            <span className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest">• Hub v5.0</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={onReload}
                    className={cn("h-14 w-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center transition-all active:scale-90 text-slate-400 hover:text-orange-500 shadow-sm overflow-hidden relative group", refreshing && "animate-spin text-orange-500")}
                >
                    <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <RefreshCcw className="w-6 h-6 relative z-10" />
                </button>
                <NotificationBell variant="header" />
            </div>
        </header>
    )
}
