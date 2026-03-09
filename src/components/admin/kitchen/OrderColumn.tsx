"use client"

import { useState } from "react"
import { Package, ChevronDown, ChevronUp } from "lucide-react"
import { Order, OrderStatus, PrepStation } from "@/app/admin/kitchen/types"
import { adminTranslations } from "@/lib/i18n/admin"
import { OrderCard } from "./OrderCard"
import { cn } from "@/lib/utils"

interface OrderColumnProps {
    status: OrderStatus
    label: string
    orders: Order[]
    expandedOrders: string[]
    onToggleOrderExpand: (id: string) => void
    onUpdateStatus: (id: string, newStatus: OrderStatus) => void
    onUpdateItemStatus: (itemId: string, newStatus: string, orderId: string, currentStatus: OrderStatus) => void
    getElapsedFormatted: (date: string) => string
    getMinutes: (date: string) => number
    getTimeStyles: (mins: number) => { text: string, border: string, bg: string }
    stations: PrepStation[]
    activeStationId: string
    lang?: 'en' | 'es'
}

export function OrderColumn({
    status,
    label,
    orders,
    expandedOrders,
    onToggleOrderExpand,
    onUpdateStatus,
    onUpdateItemStatus,
    getElapsedFormatted,
    getMinutes,
    getTimeStyles,
    stations,
    activeStationId,
    lang = 'es'
}: OrderColumnProps) {
    const t = adminTranslations[lang].kds
    const columnOrders = orders.filter(o => o.status === status)
    const [isMobileExpanded, setIsMobileExpanded] = useState(true)

    return (
        <div className={cn(
            "flex flex-col bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-900/5 transition-all duration-500",
            !isMobileExpanded && "md:h-auto max-h-[90px] md:max-h-none"
        )}>
            <div
                className="px-8 py-6 border-b-2 border-slate-50 flex items-center justify-between bg-white relative cursor-pointer md:cursor-default"
                onClick={() => {
                    if (window.innerWidth < 768) setIsMobileExpanded(!isMobileExpanded)
                }}
            >
                <div className={cn(
                    "absolute top-0 left-0 w-1 h-full transition-colors",
                    status === 'pending' ? "bg-orange-500" : status === 'preparing' ? "bg-blue-500" : "bg-emerald-500"
                )} />
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{label}</h2>
                        <p className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic opacity-60">{t.column.active_monitoring}</p>
                    </div>
                    {/* Indicador Mobile */}
                    <div className="md:hidden">
                        {isMobileExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>
                <div className={cn(
                    "w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-black text-white shadow-lg text-lg italic transition-all",
                    status === 'pending' ? "bg-orange-600 border-orange-500" : status === 'preparing' ? "bg-blue-600 border-blue-500" : "bg-emerald-600 border-emerald-500",
                    columnOrders.length === 0 && "opacity-20 grayscale"
                )}>
                    {columnOrders.length}
                </div>
            </div>

            <div className={cn(
                "flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar transition-all duration-500",
                !isMobileExpanded && "hidden md:block"
            )}>
                {columnOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                        <Package className="w-12 h-12 md:w-16 md:h-16 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">{t.column.no_active_orders}</p>
                    </div>
                ) : (
                    columnOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            expanded={expandedOrders.includes(order.id)}
                            onToggleExpand={() => onToggleOrderExpand(order.id)}
                            onUpdateStatus={onUpdateStatus}
                            onUpdateItemStatus={(itemId, newStatus) => onUpdateItemStatus(itemId, newStatus, order.id, order.status)}
                            getElapsedFormatted={getElapsedFormatted}
                            getMinutes={getMinutes}
                            getTimeStyles={getTimeStyles}
                            stations={stations}
                            activeStationId={activeStationId}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
