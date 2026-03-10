"use client"

import { MessageSquare, ArrowLeft, ShieldCheck, Globe } from "lucide-react"
import { useRestaurant } from "@/providers/RestaurantProvider"
import Image from "next/image"

interface WaiterHeaderProps {
    view: 'tables' | 'order' | 'options'
    onBack: () => void
    onOpenChat: () => void
}

export function WaiterHeader({ view, onBack, onOpenChat }: WaiterHeaderProps) {
    const { restaurant } = useRestaurant()

    return (
        <header className="px-6 py-4 bg-white/80 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-sm relative z-30 border-b-2 border-slate-50">
            <div className="flex items-center gap-6">
                {view !== 'tables' ? (
                    <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-slate-900 rounded-2xl border-2 border-slate-100 transition-all group">
                        <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-2xl border-2 border-slate-50 ring-4 ring-slate-50/50">
                            {restaurant?.logo_url ? (
                                <Image
                                    src={restaurant.logo_url}
                                    alt={restaurant.name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            ) : (
                                <Globe className="w-6 h-6 text-slate-200" />
                            )}
                        </div>
                    </div>
                )}

                <div className="hidden md:block h-8 w-px bg-slate-100 mx-2" />

                <div>
                    <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                        {restaurant?.name || 'JAMALI'} <span className="text-orange-600 italic">OS</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="px-2 py-0.5 bg-slate-50 border-2 border-slate-100 rounded-md">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">WAITER_PORTAL_v2.0</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                {/* Status Pills */}
                <div className="hidden sm:flex items-center gap-4 mr-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1 italic">Sistema En Línea</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Live Sync</span>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={onOpenChat}
                    className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group"
                >
                    <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>

                <div className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-2xl hidden xs:block ring-2 ring-slate-50">
                    <Image
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="User"
                        width={48}
                        height={48}
                    />
                </div>
            </div>
        </header>
    )
}
