"use client"

import { Sparkles, TrendingUp, LayoutDashboard, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { adminTranslations } from "@/lib/i18n/admin"
import { useSearchParams } from "next/navigation"

export function DemoBanner() {
    const { lang } = useRestaurant()
    const t = adminTranslations[lang]
    const searchParams = useSearchParams()

    // Sólo mostramos en demo. 
    const isDemo = searchParams.get('demo') === 'true'

    if (!isDemo) return null

    return (
        <div className="mb-10 relative group px-6 pt-6 max-w-[1600px] mx-auto z-50">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 rounded-[2rem] p-6 lg:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-6 justify-between">

                {/* Background Sparkles */}
                <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 pointer-events-none">
                    <Sparkles className="w-24 h-24 text-orange-400" />
                </div>

                <div className="flex-1 space-y-3 relative z-10 text-center md:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            {t.dashboard.demo.title}
                        </span>
                    </div>

                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                        {t.dashboard.demo.desc}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 relative z-10">
                    <Link
                        href="/landing#pricing"
                        className="w-full sm:w-auto px-6 h-12 bg-orange-500 hover:bg-orange-600 text-slate-900 rounded-xl flex items-center justify-center gap-2 font-black uppercase italic tracking-widest shadow-xl shadow-orange-500/25 transition-all active:scale-95 group/btn text-[10px]"
                    >
                        <TrendingUp className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                        {t.dashboard.demo.activate}
                    </Link>
                    <Link
                        href="/landing"
                        className="w-full sm:w-auto px-6 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center font-black uppercase italic tracking-widest transition-all border border-white/10 text-[10px]"
                    >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {t.dashboard.demo.back}
                    </Link>
                </div>
            </div>
        </div>
    )
}
