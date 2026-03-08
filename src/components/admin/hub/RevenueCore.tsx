import { DollarSign } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { HubStats } from "@/app/admin/hub/types"
import { adminTranslations } from "@/lib/i18n/admin"

interface RevenueCoreProps {
    stats: HubStats
    lang: 'en' | 'es'
}

export function RevenueCore({ stats, lang }: RevenueCoreProps) {
    const t = adminTranslations[lang].hub

    return (
        <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 shadow-sm relative overflow-hidden group/rev font-sans">
            <div className="absolute -top-12 -right-12 opacity-[0.05] group-hover/rev:scale-110 group-hover/rev:rotate-12 transition-all duration-1000">
                <DollarSign className="w-48 h-48 md:w-64 md:h-64 text-orange-500" />
            </div>

            <div className="relative z-10 text-center space-y-6 md:space-y-8 font-sans">
                <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] md:tracking-[0.5em] italic leading-none">{t.revenue}</p>
                    <p className="text-[7px] md:text-[8px] font-bold text-slate-700 uppercase tracking-widest">{t.ledger}</p>
                </div>

                <div className="relative inline-block">
                    <div className="absolute -inset-4 bg-orange-500/10 blur-2xl rounded-full scale-150 animate-pulse opacity-0 group-hover/rev:opacity-100 transition-opacity" />
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter italic leading-none text-slate-900 drop-shadow-sm whitespace-nowrap">
                        {formatPrice(stats.revenue)}
                    </h2>
                </div>

                <div className="pt-6 md:pt-10 border-t border-slate-100 flex justify-center gap-8 md:gap-12 items-center">
                    <div className="text-center space-y-1">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic opacity-60">{t.avg_ticket}</p>
                        <p className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 leading-none">{formatPrice(stats.avgTicket)}</p>
                    </div>
                    <div className="w-px h-10 md:h-14 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                    <div className="text-center space-y-1">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic opacity-60">{t.orders}</p>
                        <p className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 leading-none">{stats.orders}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
