"use client"

import { Button } from "@/components/ui/button"
import { Tag, Percent, DollarSign, Calendar, Info, User, StopCircle, PlayCircle, Save, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Coupon, SEASONAL_OPTIONS, Profile } from "@/app/admin/coupons/types"

interface CouponCardProps {
    coupon: Coupon
    profiles: Profile[]
    onEdit: (coupon: Coupon) => void
    onToggleStatus: (id: string, current: boolean) => void
    onDelete: (id: string) => void
}

export function CouponCard({ coupon, profiles, onEdit, onToggleStatus, onDelete }: CouponCardProps) {
    const season = SEASONAL_OPTIONS.find(s => s.value === coupon.seasonal_tag)
    const SeasonIcon = season?.icon || Tag

    return (
        <div key={coupon.id} className={cn(
            "group relative p-10 rounded-[3.5rem] border transition-all duration-700 hover:border-orange-500/40 shadow-2xl bg-slate-900/40 backdrop-blur-3xl overflow-hidden flex flex-col justify-between min-h-[500px] border-white/5 font-sans",
            !coupon.active && "opacity-50 grayscale scale-[0.98]"
        )}>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-1000">
                <SeasonIcon className="w-32 h-32 text-white" />
            </div>

            <div className="space-y-8 relative z-10 text-white">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-2xl",
                            coupon.active ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : "bg-white/5 border-white/5 text-slate-600"
                        )}>
                            {coupon.discount_type === 'percentage' ? <Percent className="w-8 h-8" /> : <DollarSign className="w-8 h-8" />}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black tracking-tighter italic uppercase text-white leading-none group-hover:text-orange-500 transition-colors">{coupon.code}</h3>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic w-fit">
                                <SeasonIcon className="w-3 h-3" />
                                {season?.label || 'General'}
                            </div>
                        </div>
                    </div>
                    <div className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] border italic shadow-sm",
                        coupon.active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    )}>
                        {coupon.active ? 'LIVE' : 'IDLE'}
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-sm font-black italic text-slate-400 leading-relaxed uppercase tracking-tight line-clamp-3 min-h-[3rem]">
                        {coupon.description || "PROTOCOL DATA: OPERATIONAL DESCRIPTION NOT DEFINED."}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-inner group/val">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-2 italic">Valor Neto</div>
                            <div className="text-3xl font-black text-orange-500 leading-none tracking-tighter italic drop-shadow-sm group-hover/val:scale-110 transition-transform origin-left">
                                {coupon.discount_type === 'percentage'
                                    ? `${coupon.discount_value}%`
                                    : `$${coupon.discount_value.toLocaleString('es-CO')}`}
                            </div>
                        </div>
                        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-inner group/val">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-2 italic">Mín. Orden</div>
                            <div className="text-3xl font-black text-white leading-none tracking-tighter italic drop-shadow-sm group-hover/val:scale-110 transition-transform origin-left">
                                ${coupon.min_purchase.toLocaleString('es-CO')}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase italic tracking-widest px-2">
                            <div className="flex items-center gap-2 opacity-40">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                Cronología:
                            </div>
                            <span className="text-white">
                                {new Date(coupon.start_date).toLocaleDateString()} — {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'OPEN'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase italic tracking-widest px-2">
                            <div className="flex items-center gap-2 opacity-40">
                                <Info className="w-4 h-4 text-orange-500" />
                                Métricas de Uso:
                            </div>
                            <span className={cn(
                                "text-white",
                                coupon.usage_limit && coupon.usage_count >= coupon.usage_limit ? "text-rose-500 animate-pulse" : ""
                            )}>
                                [{coupon.usage_count} / {coupon.usage_limit || '∞'}]
                            </span>
                        </div>
                        {coupon.customer_id && (
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 mt-2 group/user transition-all">
                                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase italic tracking-widest leading-none">
                                    <User className="w-4 h-4" />
                                    Acceso Restringido:
                                </div>
                                <span className="text-orange-500 font-black uppercase italic text-[11px] truncate max-w-[120px] leading-none tracking-tighter group-hover/user:scale-105 transition-transform">
                                    {profiles.find(p => p.id === coupon.customer_id)?.full_name || 'TITULAR CRM'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-8 border-t border-white/5 relative z-10">
                <Button
                    variant="outline"
                    className="flex-1 rounded-2xl h-14 bg-white/5 border-white/5 text-white font-black uppercase text-[10px] tracking-[0.2em] italic gap-3 hover:bg-white hover:text-black transition-all active:scale-95"
                    onClick={() => onToggleStatus(coupon.id, coupon.active)}
                >
                    {coupon.active ? (
                        <>
                            <StopCircle className="w-4 h-4" />
                            DEBARE
                        </>
                    ) : (
                        <>
                            <PlayCircle className="w-4 h-4" />
                            REVIVE
                        </>
                    )}
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-2xl h-14 w-14 bg-white/5 border-white/5 text-white hover:bg-white hover:text-orange-500 transition-all active:scale-90"
                        onClick={() => onEdit(coupon)}
                    >
                        <Save className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-2xl h-14 w-14 bg-rose-500/5 border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                        onClick={() => onDelete(coupon.id)}
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
