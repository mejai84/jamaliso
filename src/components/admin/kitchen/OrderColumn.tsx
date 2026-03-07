"use client"

import { Package } from "lucide-react"
import { Order, OrderStatus, PrepStation } from "@/app/admin/kitchen/types"
import { OrderCard } from "./OrderCard"

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
    activeStationId
}: OrderColumnProps) {
    const columnOrders = orders.filter(o => o.status === status)

    return (
        <div className="flex flex-col bg-white/40 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 underline decoration-orange-500/30 decoration-4 underline-offset-4">{label}</h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">SISTEMA DE MONITOREO ACTIVO</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center font-black text-white shadow-lg">
                    {columnOrders.length}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {columnOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                        <Package className="w-16 h-16 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest italic">Sin pedidos activos</p>
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
