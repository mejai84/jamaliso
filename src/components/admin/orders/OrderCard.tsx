"use client"

import { ShoppingBag, Layers, MapPin, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Order } from "@/app/admin/orders/types"

interface OrderCardProps {
    order: Order
    onView: () => void
    delay: number
    isCritical?: boolean
}

const getElapsed = (dateString: string) => {
    const start = new Date(dateString).getTime()
    const now = new Date().getTime()
    const diff = Math.floor((now - start) / 60000) // minutos
    if (diff < 1) return "Ahora"
    if (diff < 60) return `${diff} min`
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return `${hours}h ${mins}m`
}

export function OrderCard({ order, onView, delay, isCritical }: OrderCardProps) {
    const elapsed = getElapsed(order.created_at)
    return (
        <div
            onClick={onView}
            className={cn(
                "group/card bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl hover:border-orange-500/30 transition-all duration-500 cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-8",
                isCritical ? "border-rose-500/30 shadow-rose-500/5" : ""
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-orange-500 rotate-12 group-hover/card:scale-110 group-hover/card:opacity-[0.05] transition-all">
                <ShoppingBag className="w-48 h-48 -mr-16 -mt-16" />
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            order.status === 'pending' ? 'bg-blue-500 animate-pulse' :
                                order.status === 'preparing' ? 'bg-amber-500 animate-pulse' :
                                    order.status === 'ready' || order.status === 'payment_pending' ? 'bg-orange-500 animate-bounce shadow-[0_0_10px_rgba(255,102,0,0.5)]' : 'bg-emerald-500'
                        )} />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 italic leading-none">{order.tables?.table_name || 'HUB_PICKUP'}</span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover/card:text-orange-500 transition-colors leading-none">#{order.id.split('-')[0].toUpperCase()}</h3>
                </div>
                <div className="px-4 py-1.5 bg-white/5 border border-white/5 text-[8px] font-black text-slate-500 italic rounded-xl tracking-widest">{elapsed}</div>
            </div>

            <div className="space-y-2 mb-10 relative z-10">
                <p className="text-lg font-black italic uppercase text-white group-hover/card:translate-x-1 transition-transform">{order.guest_info?.name || 'ANÓNIMO_SYC'}</p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest italic"><Layers className="w-3 h-3" /> {order.order_items?.length || 0} SKU</div>
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest italic"><MapPin className="w-3 h-3" /> {order.order_type === 'pickup' ? 'CASA' : 'HUB'}</div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-between items-end relative z-10">
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] italic leading-none">VALOR_ORDEN</p>
                    <p className="text-2xl font-black italic tracking-tighter text-orange-500">${order.total.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-white flex items-center justify-center group-hover/card:bg-orange-600 group-hover/card:text-black transition-all shadow-xl active:scale-75">
                    <ArrowUpRight className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}
