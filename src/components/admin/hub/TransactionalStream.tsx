import { Clock, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { RecentSale } from "@/app/admin/hub/types"
import { adminTranslations } from "@/lib/i18n/admin"

interface TransactionalStreamProps {
    recentSales: RecentSale[]
    lang: 'en' | 'es'
}

export function TransactionalStream({ recentSales, lang }: TransactionalStreamProps) {
    const t = adminTranslations[lang].hub

    return (
        <div className="space-y-8 font-sans">
            <div className="flex items-center justify-between px-6">
                <div className="space-y-0.5">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.5em] italic flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-500" /> {t.stream}
                    </h3>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest pl-7">{t.stream_desc}</p>
                </div>
                <Link href="/admin/orders">
                    <Button variant="ghost" className="h-10 px-4 text-[9px] font-black text-orange-500 uppercase italic hover:bg-orange-50 transition-all gap-2 group">
                        {t.analyze_stream} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {recentSales.map((sale) => (
                    <div key={sale.id} className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex items-center justify-between group active:scale-[0.97] transition-all shadow-sm hover:border-orange-500/20 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-orange-500 transition-colors" />
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:border-orange-500/20 transition-all">
                                <span className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase italic leading-none mb-1">ID-HEX</span>
                                <span className="text-[9px] md:text-[11px] font-black text-orange-500 italic leading-none">#{sale.id.split('-')[0].toUpperCase().slice(0, 5)}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-base md:text-lg font-black italic uppercase tracking-tighter text-slate-900 group-hover:text-orange-500 transition-colors leading-none truncate max-w-[120px] md:max-w-none">{sale.guest_info?.name || t.quick_sale}</p>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/40" />
                                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.2em] italic">
                                        {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <p className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 group-hover:text-orange-500 transition-all leading-none">{formatPrice(sale.total)}</p>
                            <span className="text-[6px] md:text-[8px] font-black uppercase text-emerald-600 italic px-1.5 py-0.5 bg-emerald-50 rounded-lg border border-emerald-100">VERIFIED</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
