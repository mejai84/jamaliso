import { Activity, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { HubStats } from "@/app/admin/hub/types"
import { adminTranslations } from "@/lib/i18n/admin"

interface RapidAnalyticsProps {
    stats: HubStats
    lang: 'en' | 'es'
}

export function RapidAnalytics({ stats, lang }: RapidAnalyticsProps) {
    const t = adminTranslations[lang].hub

    return (
        <div className="grid grid-cols-2 gap-4 md:gap-6 font-sans">
            <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-2xl md:rounded-[3rem] p-6 md:p-8 space-y-4 md:space-y-6 shadow-sm relative overflow-hidden group">
                <div className="absolute -bottom-6 -right-6 opacity-[0.05] group-hover:scale-110 transition-transform">
                    <Activity className="w-20 h-20 md:w-24 md:h-24 text-orange-500" />
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                    <Activity className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] italic mb-1">{t.live_occupancy}</p>
                    <p className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 leading-none group-hover:text-orange-500 transition-colors">
                        {stats.activeTables} <span className="text-[9px] md:text-[11px] text-slate-500 uppercase tracking-widest ml-1">Nodes</span>
                    </p>
                </div>
            </div>

            <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-2xl md:rounded-[3rem] p-6 md:p-8 space-y-4 md:space-y-6 shadow-sm relative overflow-hidden group">
                <div className="absolute -bottom-6 -right-6 opacity-[0.05] group-hover:scale-110 transition-transform">
                    <Wallet className="w-20 h-20 md:w-24 md:h-24 text-orange-500" />
                </div>
                <div className={cn(
                    "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-500",
                    stats.cashboxStatus === 'OPEN' ? "bg-orange-50 border-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white" : "bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white"
                )}>
                    <Wallet className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <div>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] italic mb-1">{t.cashbox_status}</p>
                    <p className={cn(
                        "text-[10px] md:text-lg font-black italic tracking-[0.1em] uppercase leading-none flex items-center gap-2",
                        stats.cashboxStatus === 'OPEN' ? "text-orange-500" : "text-rose-500"
                    )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-sm" />
                        {stats.cashboxStatus === 'OPEN' ? t.open : t.offline}
                    </p>
                </div>
            </div>
        </div>
    )
}
