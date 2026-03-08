"use client"

import { Button } from "@/components/ui/button"
import { Flame, List, ShoppingBag, VolumeX, Volume2, ArrowLeft } from "lucide-react"
import { adminTranslations } from "@/lib/i18n/admin"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PrepStation } from "@/app/admin/kitchen/types"

interface KitchenHeaderProps {
    stations: PrepStation[]
    activeStationId: string
    onStationChange: (id: string) => void
    activePreparingCount: number
    onOpenSummary: () => void
    onOpenStock: () => void
    isMuted: boolean
    onToggleMute: () => void
    lang?: 'en' | 'es'
}

export function KitchenHeader({
    stations,
    activeStationId,
    onStationChange,
    activePreparingCount,
    onOpenSummary,
    onOpenStock,
    isMuted,
    onToggleMute,
    lang = 'es'
}: KitchenHeaderProps) {
    const t = adminTranslations[lang].kds
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 relative z-10">
            <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
                        KDS <span className="text-orange-600">PRODUCTION</span>
                    </h1>
                    <div className="px-4 py-1.5 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full flex items-center gap-2 w-fit">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em] italic">ACTIVE_CORE_SYNC</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex bg-white/60 p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-[400px]">
                    <button
                        onClick={() => onStationChange(t.all_stations)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap",
                            activeStationId === t.all_stations
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white"
                        )}
                    >
                        {t.all_stations}
                    </button>
                    {stations.map(station => (
                        <button
                            key={station.id}
                            onClick={() => onStationChange(station.id)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap",
                                activeStationId === station.id
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white"
                            )}
                        >
                            {station.name}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 bg-white/60 px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase mb-0.5">{t.header.status_title}</p>
                        <p className="text-lg font-black italic text-slate-900 tracking-tight">{activePreparingCount} {t.header.running}</p>
                    </div>
                    <Flame className="w-6 h-6 text-orange-500" />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={onOpenSummary}
                        className="h-12 px-5 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black italic text-[10px] uppercase tracking-widest flex gap-2"
                    >
                        <List className="w-4 h-4" /> {t.summary.title.split(' ')[0]}
                    </Button>
                    <Button
                        onClick={onOpenStock}
                        className="h-12 px-5 bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 rounded-2xl font-black italic text-[10px] uppercase tracking-widest flex gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" strokeWidth={3} /> {t.stock.title.split(' ')[1] || t.stock.title}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onToggleMute}
                        className="h-12 w-12 bg-white/60 hover:bg-white border border-slate-200 rounded-2xl shadow-sm"
                    >
                        {isMuted ? <VolumeX className="w-6 h-6 text-rose-500" strokeWidth={3} /> : <Volume2 className="w-6 h-6 text-emerald-500" strokeWidth={3} />}
                    </Button>
                </div>

                <Link href="/admin">
                    <Button variant="ghost" className="h-12 w-12 bg-white/60 hover:bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </Button>
                </Link>
            </div>
        </div>
    )
}
