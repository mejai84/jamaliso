"use client"

import { Loader2, Table as TableIcon, ArrowRight, RefreshCw, Link2, Bell, Zap, Activity, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn, formatPrice } from "@/lib/utils"
import { Table as TableType } from "@/app/admin/waiter/types"

interface TableGridProps {
    loading: boolean
    tables: TableType[]
    mergeMode: { active: boolean, sourceId: string | null }
    onCancelMerge: () => void
    onMerge: (targetId: string) => void
    onTableClick: (table: TableType) => void
    onFetchData: () => void
    currentTime: Date
}

export function TableGrid({
    loading,
    tables,
    mergeMode,
    onCancelMerge,
    onMerge,
    onTableClick,
    onFetchData,
    currentTime
}: TableGridProps) {
    return (
        <div className="h-full flex flex-col p-4 md:p-10 space-y-6 md:space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Live Status</span>
                    </div>
                    <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                        {mergeMode.active ? (
                            <span className="text-indigo-600 animate-pulse flex items-center gap-3">
                                <Link2 className="w-8 h-8 md:w-12 md:h-12" /> UNIR DESTINO
                            </span>
                        ) : (
                            <>Protocolo <span className="text-orange-600">Salón</span></>
                        )}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    {mergeMode.active ? (
                        <Button onClick={onCancelMerge} className="h-12 md:h-14 px-6 md:px-8 bg-rose-50 text-rose-600 font-black rounded-2xl text-[9px] md:text-[10px] uppercase italic border-2 border-rose-100 hover:bg-rose-100 transition-all">CANCELAR</Button>
                    ) : (
                        <div className="flex gap-2">
                            <div className="px-4 py-2.5 md:px-6 md:py-3 bg-white border-2 border-slate-50 rounded-2xl text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest italic shadow-sm">
                                {tables.filter(t => t.status === 'free' || !t.active_order).length} LIBRES
                            </div>
                            <div className="px-4 py-2.5 md:px-6 md:py-3 bg-orange-50 border-2 border-orange-100 rounded-2xl text-[9px] md:text-[10px] font-black text-orange-600 uppercase tracking-widest italic shadow-sm">
                                {tables.filter(t => t.status === 'occupied' && t.active_order).length} ACTIVAS
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-10">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] italic text-slate-400">Sincronizando...</p>
                    </div>
                ) : tables.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {tables.map(table => {
                            const isActive = table.status === 'occupied' && table.active_order;
                            const orderDate = table.active_order?.created_at ? new Date(table.active_order.created_at) : null;
                            const isValidDate = orderDate && !isNaN(orderDate.getTime());
                            const elapsedMs = (isActive && isValidDate) ? currentTime.getTime() - orderDate.getTime() : 0;
                            const elapsedMins = Math.floor(elapsedMs / 60000);

                            return (
                                <div
                                    key={table.id}
                                    onClick={() => {
                                        if (mergeMode.active) {
                                            if (table.id === mergeMode.sourceId) return;
                                            onMerge(table.id);
                                            return;
                                        }
                                        onTableClick(table)
                                    }}
                                    className={cn(
                                        "relative min-h-[140px] md:min-h-[180px] rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 flex flex-col justify-between border-2 transition-all cursor-pointer active:scale-[0.98] group overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1",
                                        mergeMode.active && table.id !== mergeMode.sourceId && table.status === 'occupied'
                                            ? "border-indigo-500 ring-4 ring-indigo-500/10 bg-indigo-50/30"
                                            : "border-slate-50",
                                        mergeMode.active && table.id === mergeMode.sourceId ? "opacity-30 grayscale pointer-events-none" : "",
                                        table.active_order?.status === 'ready' && "border-emerald-500 ring-4 ring-emerald-500/10",
                                        elapsedMins >= 20 && table.active_order?.status !== 'ready' && "border-rose-200 ring-4 ring-rose-500/5 shadow-rose-100 shadow-xl"
                                    )}
                                >
                                    {/* BACKGROUND ICON */}
                                    <div className="absolute -top-4 -right-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all pointer-events-none">
                                        <TableIcon className="w-24 h-24 md:w-44 md:h-44 text-slate-900" />
                                    </div>

                                    <div className="flex justify-between items-start relative z-10 w-full mb-2">
                                        <div className={cn(
                                            "w-8 h-8 md:w-12 md:h-12 rounded-[1rem] flex items-center justify-center border-2 font-black italic text-[10px] md:text-sm transition-all duration-300",
                                            table.status === 'free'
                                                ? "bg-slate-50 border-slate-50 text-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                                                : "bg-slate-900 border-slate-900 text-white shadow-lg"
                                        )}>
                                            {table.capacity}
                                        </div>

                                        {isActive && (
                                            <div className="flex flex-col items-end gap-2">
                                                {/* Parallel Accounts Indicator */}
                                                {(table as any).active_orders?.length > 1 && (
                                                    <div className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-[7px] font-black animate-bounce shadow-lg shadow-indigo-200">
                                                        <Link2 className="w-2 h-2" />
                                                        {(table as any).active_orders.length} CUENTAS
                                                    </div>
                                                )}

                                                <div className={cn(
                                                    "px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border flex items-center gap-1 md:gap-1.5 shadow-sm bg-white/90 backdrop-blur-sm transition-colors",
                                                    table.active_order?.status === 'ready' ? "border-emerald-100 text-emerald-600" :
                                                        table.active_order?.status === 'delivered' ? "border-amber-100 text-amber-600" :
                                                            "border-slate-50 text-slate-300 font-black italic"
                                                )}>
                                                    <div className={cn(
                                                        "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full animate-pulse",
                                                        table.active_order?.status === 'ready' ? "bg-emerald-500" :
                                                            table.active_order?.status === 'delivered' ? "bg-amber-500" :
                                                                "bg-orange-500"
                                                    )} />
                                                    <span className="text-[6px] md:text-[8px] font-black italic tracking-widest uppercase">
                                                        {table.active_order?.status === 'ready' ? 'OK' :
                                                            table.active_order?.status === 'delivered' ? 'BILL' :
                                                                'BUSY'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10 space-y-0.5 md:space-y-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn(
                                                "w-1 h-1 rounded-full",
                                                !isActive ? "bg-emerald-400" : "bg-orange-400"
                                            )} />
                                            <p className="text-[7px] md:text-[9px] font-black text-slate-200 uppercase tracking-[0.2em] italic truncate max-w-[80px]">
                                                {!isActive ? 'FREE' : 'BUSY'}
                                            </p>
                                        </div>
                                        <h3 className="text-lg md:text-4xl font-black italic tracking-tighter text-slate-900 uppercase leading-none group-hover:text-orange-600 transition-colors truncate">
                                            {table.table_name}
                                        </h3>

                                        {isActive && (
                                            <div className="pt-2 md:pt-4 flex items-center justify-between border-t border-slate-50 mt-1 md:mt-2">
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    <Zap className={cn(
                                                        "w-3 h-3 md:w-4 md:h-4 opacity-50",
                                                        elapsedMins >= 20 ? "text-rose-500 animate-pulse opacity-100" : "text-slate-300 group-hover:text-orange-500 group-hover:opacity-100"
                                                    )} />
                                                    <span className="text-sm md:text-2xl font-black italic tracking-tighter text-slate-900">
                                                        {formatPrice(table.active_order!.total)}
                                                    </span>
                                                </div>
                                                <div className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-50 rounded-lg">
                                                    <Activity className="w-2 h-2 text-slate-200" />
                                                    <span className="text-[7px] md:text-[10px] font-black text-slate-300 italic">{elapsedMins}M</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CRITICAL WARNING INDICATOR */}
                                    {elapsedMins >= 20 && table.active_order?.status !== 'ready' && (
                                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 animate-pulse" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-700">
                        <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-200 grayscale opacity-40">
                            <TableIcon className="w-16 h-16 text-slate-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Salón sin Configurar</h3>
                            <p className="text-xs text-slate-400 font-medium max-w-[280px]">No hemos detectado mesas activas asignadas a este restaurante. Por favor, configura tu salón en el panel de control.</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full max-w-xs">
                            <Link href="/admin/tables" className="w-full">
                                <Button className="w-full bg-slate-900 text-white font-black uppercase h-12 rounded-xl text-[10px] tracking-widest italic group">
                                    CONFIGURAR MESAS <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button onClick={onFetchData} variant="ghost" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-12 group">
                                <RefreshCw className="w-3 h-3 mr-2 group-hover:rotate-180 transition-transform duration-500" /> REINTENTAR CONEXIÓN
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
