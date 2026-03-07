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
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
                    {mergeMode.active ? (
                        <span className="text-indigo-600 animate-pulse flex items-center gap-2">
                            <Link2 className="w-6 h-6" /> SELECCIONA MESA DESTINO
                        </span>
                    ) : (
                        <>Gestión de <span className="text-orange-600">Salón</span></>
                    )}
                </h2>
                <div className="flex gap-2">
                    {mergeMode.active ? (
                        <Button onClick={onCancelMerge} className="bg-rose-500 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase italic">CANCELAR UNIÓN</Button>
                    ) : (
                        <>
                            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase">
                                {tables.filter(t => t.status === 'free').length} Libres
                            </div>
                            <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[9px] font-black text-orange-600 uppercase">
                                {tables.filter(t => t.status === 'occupied').length} Ocupadas
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Sincronizando Disponibilidad...</p>
                    </div>
                ) : tables.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {tables.map(table => {
                            const isActive = table.status === 'occupied' && table.active_order;
                            const elapsedMs = isActive ? currentTime.getTime() - new Date(table.active_order!.created_at).getTime() : 0;
                            const elapsedMins = Math.floor(elapsedMs / 60000);

                            return (
                                <div
                                    key={table.id}
                                    onClick={() => {
                                        if (mergeMode.active) {
                                            if (table.id === mergeMode.sourceId) return;
                                            if (table.status !== 'occupied') {
                                                // toast should be handled where the callback is defined, or pass a toast function
                                                onMerge(table.id);
                                                return;
                                            }
                                            onMerge(table.id);
                                            return;
                                        }
                                        onTableClick(table)
                                    }}
                                    className={cn(
                                        "relative aspect-square rounded-[2rem] p-6 flex flex-col justify-between border transition-all cursor-pointer active:scale-[0.98] group overflow-hidden shadow-sm",
                                        mergeMode.active && table.id !== mergeMode.sourceId && table.status === 'occupied' ? "border-indigo-400 ring-4 ring-indigo-500/20 animate-pulse" : "",
                                        mergeMode.active && table.id === mergeMode.sourceId ? "opacity-40 grayscale pointer-events-none" : "",
                                        !mergeMode.active && table.status === 'free'
                                            ? "bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-100/50 hover:border-emerald-300 shadow-emerald-500/5"
                                            : cn(
                                                "bg-white shadow-xl",
                                                table.active_order?.status === 'ready' ? "border-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" : "border-orange-200/50",
                                                table.active_order?.priority && "border-amber-400 ring-4 ring-amber-400/20",
                                                elapsedMins >= 20 && table.active_order?.status !== 'ready' && "border-rose-500 ring-4 ring-rose-500/30 animate-pulse-red"
                                            )
                                    )}
                                >
                                    {elapsedMins >= 20 && table.active_order?.status !== 'ready' && (
                                        <div className="absolute inset-0 bg-rose-500/5 border-2 border-rose-500 rounded-[2rem] pointer-events-none flex items-center justify-center opacity-40">
                                            <AlertCircle className="w-12 h-12 text-rose-500" strokeWidth={1} />
                                        </div>
                                    )}
                                    {table.active_order?.status === 'ready' && (
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 animate-bounce" />
                                    )}
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center border font-black italic text-xs",
                                            table.status === 'free' ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "bg-orange-100 border-orange-200 text-orange-600"
                                        )}>
                                            {table.capacity}
                                        </div>
                                        {table.status === 'occupied' && (
                                            <div className="flex flex-col items-end gap-1">
                                                <div className={cn(
                                                    "px-2 py-1 rounded-lg animate-pulse flex items-center gap-1",
                                                    table.active_order?.status === 'ready' ? "bg-emerald-500" : "bg-orange-500"
                                                )}>
                                                    {table.active_order?.status === 'ready' && <Bell className="w-2.5 h-2.5 text-white animate-ring" />}
                                                    <p className="text-[7px] font-black text-white italic tracking-tighter truncate">
                                                        {table.active_order?.status === 'ready' ? 'READY' : 'BUSY'}
                                                    </p>
                                                </div>
                                                {isActive && (
                                                    <div className="flex items-center gap-1 text-orange-600">
                                                        <Zap className="w-3 h-3 fill-orange-600" />
                                                        <span className="text-[10px] font-mono font-black">{elapsedMins}m</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={cn(
                                                "text-[8px] font-black uppercase tracking-[0.2em]",
                                                table.status === 'free' ? "text-emerald-500" : "text-orange-500"
                                            )}>
                                                {table.status === 'free' ? 'DISPONIBLE' : 'EN SERVICIO'}
                                            </p>
                                            {table.active_order?.priority && (
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                            )}
                                        </div>
                                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">{table.table_name}</h3>
                                        {isActive && (
                                            <div className={cn(
                                                "mt-2 flex items-center gap-2 font-black italic font-mono text-sm",
                                                elapsedMins >= 20 ? "text-rose-600 bg-rose-50 px-2 py-1 rounded-lg animate-bounce" : "text-orange-600"
                                            )}>
                                                <Activity className="w-3.5 h-3.5" />
                                                {formatPrice(table.active_order!.total)}
                                                {elapsedMins >= 20 && <span className="text-[10px] ml-1 uppercase">¡CRÍTICO!</span>}
                                            </div>
                                        )}
                                    </div>
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
