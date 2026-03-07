"use client"

import { Button } from "@/components/ui/button"
import { Clock, Star, Package, Flame, AlertTriangle, Timer, Play, CheckCircle, Bell, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { Order, OrderStatus, PrepStation } from "@/app/admin/kitchen/types"

interface OrderCardProps {
    order: Order
    expanded: boolean
    onToggleExpand: () => void
    onUpdateStatus: (id: string, newStatus: OrderStatus) => void
    onUpdateItemStatus: (itemId: string, newStatus: string) => void
    getElapsedFormatted: (date: string) => string
    getMinutes: (date: string) => number
    getTimeStyles: (mins: number) => { text: string, border: string, bg: string }
    stations: PrepStation[]
    activeStationId: string
}

export function OrderCard({
    order,
    expanded,
    onToggleExpand,
    onUpdateStatus,
    onUpdateItemStatus,
    getElapsedFormatted,
    getMinutes,
    getTimeStyles,
    stations,
    activeStationId
}: OrderCardProps) {
    const totalItems = order.order_items.length;
    const readyItems = order.order_items.filter(i => i.status === 'ready').length;
    const hasUnstartedItems = order.order_items.some(i => !i.status || i.status === 'pending');
    const progress = (readyItems / totalItems) * 100;
    const minutes = getMinutes(order.created_at);
    const styles = getTimeStyles(minutes);

    return (
        <div className={cn(
            "bg-white border-2 rounded-[2.2rem] p-7 shadow-xl transition-all flex flex-col gap-6 relative overflow-hidden",
            styles.border,
            minutes >= 10 && "animate-pulse ring-4 ring-rose-500/10",
            order.priority && "border-[#FFD700] ring-4 ring-[#FFD700]/20"
        )}>
            {order.priority && (
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#FFD700] text-slate-900 font-black italic text-[9px] uppercase tracking-widest rounded-bl-2xl flex items-center gap-2">
                    <Star className="w-3 h-3 fill-slate-900" /> PRIORIDAD VIP
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "min-w-[60px] px-4 h-14 rounded-2xl border-2 flex items-center justify-center font-black italic text-lg whitespace-nowrap shadow-sm",
                        styles.bg, styles.text, "border-slate-300"
                    )}>
                        #{order.tables?.table_name || 'H'}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className={cn(
                            "px-4 py-2 rounded-xl text-[12px] font-black border-2 flex items-center gap-2 shadow-sm bg-white",
                            styles.text, "border-slate-200"
                        )}>
                            <Clock className="w-4 h-4 text-slate-900" strokeWidth={3} />
                            <span className="text-slate-900">{getElapsedFormatted(order.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-3 justify-end">
                        <span className="text-lg font-black italic text-slate-900">{readyItems}/{totalItems}</span>
                        <Package className="w-6 h-6 text-slate-900" strokeWidth={3} />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">ITEMS LISTOS</p>
                </div>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                    className={cn(
                        "h-full transition-all duration-700",
                        progress === 100 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-orange-500"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <button
                onClick={onToggleExpand}
                className="w-full flex items-center justify-center py-2 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
                <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    expanded ? "text-slate-600" : "text-orange-600 animate-bounce"
                )}>
                    {expanded ? "Cerrar Detalles" : "Ver Pedido Completo"}
                    <Flame className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} strokeWidth={3} />
                </div>
            </button>

            {expanded && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {hasUnstartedItems && order.status === 'preparing' && (
                        <div className="bg-orange-500 border-2 border-orange-600 p-5 rounded-[1.5rem] flex items-center gap-4 animate-pulse shadow-lg">
                            <div className="bg-white p-2 rounded-full shadow-inner">
                                <AlertTriangle className="w-5 h-5 text-orange-600" strokeWidth={3} />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-[12px] font-black text-white uppercase tracking-widest leading-none">⚠️ ATENCIÓN COCINA</p>
                                <p className="text-[13px] font-black italic text-orange-50 uppercase mt-1">Hay productos sin iniciar en esta comanda</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {order.order_items.map((item, idx) => {
                            const station = stations.find(s => s.id === item.products?.station_id);
                            const isReady = item.status === 'ready';
                            const isPreparing = item.status === 'preparing';

                            return (
                                <div key={idx} className={cn(
                                    "p-4 rounded-[1.5rem] border-2 transition-all flex flex-col gap-3",
                                    isReady ? "bg-emerald-50/30 border-emerald-100/50 opacity-60" :
                                        isPreparing ? "bg-orange-50/50 border-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.1)] scale-[1.02]" :
                                            "bg-slate-50 border-slate-100 opacity-40 grayscale-[0.5]"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "text-xl font-black italic",
                                                isReady ? "text-emerald-600" : "text-orange-600"
                                            )}>{item.quantity}X</span>
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-[15px] font-black uppercase tracking-tight italic",
                                                    isReady ? "line-through text-slate-400" : "text-slate-900"
                                                )}>{item.products?.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {station && activeStationId === 'TODAS' && (
                                                        <span className="text-[9px] font-black text-white px-2 py-0.5 rounded bg-orange-600 shadow-sm">
                                                            {station.name.toUpperCase()}
                                                        </span>
                                                    )}
                                                    {item.products?.preparation_time && (
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded",
                                                            minutes > item.products.preparation_time ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            <Timer className="w-3 h-3" /> {item.products.preparation_time} MIN
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => onUpdateItemStatus(item.id, isReady ? 'preparing' : 'ready')}
                                            className={cn(
                                                "h-12 px-6 rounded-xl text-[12px] font-black uppercase italic transition-all flex items-center gap-2 shadow-lg",
                                                isReady
                                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                    : "bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-400 shadow-orange-500/20"
                                            )}
                                        >
                                            {isReady ? (
                                                <><CheckCircle className="w-5 h-5" strokeWidth={3} /> LISTO</>
                                            ) : (
                                                <><Play className="w-5 h-5 fill-white" strokeWidth={3} /> INICIAR</>
                                            )}
                                        </Button>
                                    </div>
                                    {item.notes && (
                                        <div className="ml-9 p-4 bg-orange-100 border-l-4 border-orange-500 rounded-lg shadow-inner">
                                            <p className="text-[12px] font-black italic text-orange-950 uppercase leading-snug">
                                                {item.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {order.notes && (
                        <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] flex items-start gap-3 shadow-inner">
                            <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic">Nota de Comanda</p>
                                <p className="text-xs font-black italic text-amber-950 uppercase leading-snug">"{order.notes}"</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                        {order.status === 'pending' && (
                            <Button onClick={() => onUpdateStatus(order.id, 'preparing')} className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black italic text-[11px] uppercase tracking-widest shadow-xl">
                                <Play className="w-4 h-4 mr-2 fill-white" />
                                INICIAR ESTA ORDEN
                            </Button>
                        )}
                        {order.status === 'preparing' && (
                            <Button
                                onClick={() => onUpdateStatus(order.id, 'ready')}
                                className={cn(
                                    "w-full h-14 font-black italic text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2",
                                    progress === 100
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30"
                                        : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30"
                                )}
                            >
                                {progress === 100 ? (
                                    <><CheckCircle className="w-4 h-4" /> MARCAR TODO LISTO</>
                                ) : (
                                    <><SkipForward className="w-4 h-4" /> TERMINAR FORZADO</>
                                )}
                            </Button>
                        )}
                        {order.status === 'ready' && (
                            <Button onClick={() => onUpdateStatus(order.id, 'delivered')} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black italic text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/30">
                                ENTREGAR A MESERO
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
