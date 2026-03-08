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
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                    {mergeMode.active ? (
                        <span className="text-indigo-600 animate-pulse flex items-center gap-2">
                            <Link2 className="w-8 h-8" /> PULSA LA MESA PARA UNIR
                        </span>
                    ) : (
                        <>Mapa de <span className="text-orange-600">Mesas</span></>
                    )}
                </h2>
                <div className="flex gap-4">
                    {mergeMode.active ? (
                        <Button onClick={onCancelMerge} className="h-14 px-8 bg-rose-500 text-white font-black rounded-2xl text-xs uppercase italic shadow-lg shadow-rose-500/20 active:scale-95 transition-all">CANCELAR UNIÓN</Button>
                    ) : (
                        <>
                            <div className="px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest italic shadow-sm">
                                {tables.filter(t => t.status === 'free' || !t.active_order).length} MESAS LIBRES
                            </div>
                            <div className="px-5 py-3 bg-orange-500/10 border-2 border-orange-500/20 rounded-2xl text-[10px] font-black text-orange-600 uppercase tracking-widest italic shadow-sm">
                                {tables.filter(t => t.status === 'occupied' && t.active_order).length} MESAS EN SERVICIO
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 pb-10">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Sincronizando Disponibilidad...</p>
                    </div>
                ) : tables.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
                                        "relative aspect-square rounded-[3rem] p-8 flex flex-col justify-between border-2 transition-all cursor-pointer active:scale-95 group overflow-hidden bg-white shadow-sm",
                                        mergeMode.active && table.id !== mergeMode.sourceId && table.status === 'occupied'
                                            ? "border-indigo-500 ring-8 ring-indigo-500/20 animate-pulse bg-indigo-50"
                                            : "border-slate-100 hover:border-slate-900 hover:shadow-2xl hover:-translate-y-2",
                                        mergeMode.active && table.id === mergeMode.sourceId ? "opacity-30 grayscale pointer-events-none" : "",
                                        table.active_order?.status === 'ready' && "border-emerald-500 ring-4 ring-emerald-500/10",
                                        elapsedMins >= 20 && table.active_order?.status !== 'ready' && "border-rose-600 ring-4 ring-rose-600/10"
                                    )}
                                >
                                    {/* BACKGROUND ICON (Same as Dashboard) */}
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all pointer-events-none">
                                        <TableIcon className="w-40 h-40 text-slate-900" />
                                    </div>

                                    <div className="flex justify-between items-start relative z-10 w-full">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center border-2 font-black italic text-sm transition-all duration-300",
                                            table.status === 'free'
                                                ? "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                                                : "bg-slate-900 border-slate-900 text-white"
                                        )}>
                                            {table.capacity}
                                        </div>

                                        {isActive && (
                                            <div className="flex flex-col items-end gap-2">
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-sm bg-white/80 backdrop-blur-sm",
                                                    table.active_order?.status === 'ready' ? "border-emerald-200 text-emerald-600 ring-4 ring-emerald-500/10" :
                                                        table.active_order?.status === 'delivered' ? "border-amber-200 text-amber-600 ring-4 ring-amber-500/10" :
                                                            "border-slate-200 text-slate-900"
                                                )}>
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                                        table.active_order?.status === 'ready' ? "bg-emerald-500" :
                                                            table.active_order?.status === 'delivered' ? "bg-amber-500" :
                                                                "bg-orange-600"
                                                    )} />
                                                    <p className="text-[8px] font-black italic tracking-widest uppercase">
                                                        {table.active_order?.status === 'ready' ? 'LISTO' :
                                                            table.active_order?.status === 'delivered' ? 'CUENTA PEDIDA' :
                                                                'EN SERVICIO'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                !isActive ? "bg-emerald-500" : "bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.4)]"
                                            )} />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic leading-none">
                                                {!isActive ? 'DISPONIBLE' : 'MESA OCUPADA'}
                                            </p>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none group-hover:text-orange-600 transition-colors">
                                            {table.table_name}
                                        </h3>

                                        {isActive && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Zap className={cn(
                                                        "w-4 h-4 transition-colors",
                                                        elapsedMins >= 20 ? "text-rose-500 animate-pulse" : "text-slate-300 group-hover:text-orange-500"
                                                    )} />
                                                    <span className="text-xl font-black italic tracking-tighter text-slate-900">
                                                        {formatPrice(table.active_order!.total)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                                    <Activity className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] font-mono font-bold text-slate-500">{elapsedMins}m</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ALERT OVERLAY FOR LATE ORDERS */}
                                    {elapsedMins >= 20 && table.active_order?.status !== 'ready' && (
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-600 animate-pulse" />
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
