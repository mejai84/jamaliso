"use client"

import { Button } from "@/components/ui/button"
import { Map as MapIcon, Flame, Loader2, Save, RotateCcw, Maximize2, ArrowLeftRight, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table } from "@/app/admin/tables/types"
import { useRef } from "react"

interface FloorPlanViewProps {
    tables: Table[]
    activeZone: string
    isHeatmapMode: boolean
    onToggleHeatmap: () => void
    onSaveLayout: () => void
    savingLayout: boolean
    tableSales: Record<string, number>
    onMouseDown: (e: React.MouseEvent, id: string) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: () => void
    updateTableDimension: (id: string, field: keyof Table, value: number) => void
    initiateTransfer: (t: Table) => void
    onEdit: (t: Table) => void
    onDelete: (t: Table) => void
    containerRef: React.RefObject<any>
    draggedTableId: string | null
}

export function FloorPlanView({
    tables,
    activeZone,
    isHeatmapMode,
    onToggleHeatmap,
    onSaveLayout,
    savingLayout,
    tableSales,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    updateTableDimension,
    initiateTransfer,
    onEdit,
    onDelete,
    containerRef,
    draggedTableId
}: FloorPlanViewProps) {

    const getHeatColor = (tableId: string) => {
        const revenue = tableSales[tableId] || 0
        if (revenue === 0) return "bg-slate-500/10 border-slate-500/20 text-slate-500"
        const maxRevenue = Math.max(...Object.values(tableSales), 1)
        const intensity = (revenue / maxRevenue) * 100
        if (intensity > 80) return "bg-rose-500 border-rose-400 text-white shadow-[0_0_40px_rgba(244,63,94,0.4)]"
        if (intensity > 50) return "bg-orange-500 border-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)]"
        if (intensity > 20) return "bg-amber-400 border-amber-300 text-black shadow-[0_0_20px_rgba(251,191,36,0.2)]"
        return "bg-emerald-500/40 border-emerald-400/50 text-emerald-950"
    }

    return (
        <div className="space-y-12 animate-in zoom-in-95 duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-card/40 backdrop-blur-3xl p-8 rounded-[4rem] border-4 border-border/20 shadow-3xl">
                <div className="flex flex-wrap items-center gap-10">
                    <div className="flex items-center gap-4 text-[11px] font-black text-primary uppercase italic tracking-[0.4em]">
                        <MapIcon className="w-6 h-6" /> {isHeatmapMode ? "MODO: ANÁLISIS DE FLUJO_MONETARIO" : "MODO: ARQUITECTURA ESPACIAL ACTIVE"}
                    </div>
                    <div className="h-10 w-px bg-border/40 hidden md:block" />
                    <div className="flex items-center gap-8">
                        {!isHeatmapMode ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 italic tracking-widest">LIBRE</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 italic tracking-widest">OCUPADA</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-rose-500" />
                                    <span className="text-[10px] font-black uppercase text-rose-500 italic tracking-widest">HOT ZONE</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-black uppercase text-blue-500 italic tracking-widest">COLD ZONE</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Button
                        onClick={onToggleHeatmap}
                        className={cn(
                            "h-16 px-8 rounded-2xl border-4 font-black uppercase text-[10px] tracking-widest italic transition-all gap-4 shadow-3xl relative overflow-hidden group/heat",
                            isHeatmapMode
                                ? "bg-rose-500 border-rose-500 text-white"
                                : "bg-card border-border/40 text-muted-foreground hover:border-rose-500/40 hover:text-rose-500"
                        )}
                    >
                        <Flame className={cn("w-5 h-5", isHeatmapMode && "animate-pulse")} />
                        {isHeatmapMode ? "DESACTIVAR ANÁLISIS" : "MAPA DE CALOR"}
                    </Button>
                    <Button
                        onClick={onSaveLayout}
                        disabled={savingLayout}
                        className="h-16 px-8 bg-emerald-500 text-white hover:bg-emerald-600 border-none rounded-2xl font-black uppercase text-[10px] tracking-widest italic transition-all gap-4 shadow-3xl shadow-emerald-500/20 active:scale-95"
                    >
                        {savingLayout ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        SINCRONIZAR ARQUITECTURA
                    </Button>
                </div>
            </div>

            <div
                ref={containerRef}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                className="relative w-full h-[900px] bg-card/60 backdrop-blur-md rounded-[5rem] border-4 border-border/40 overflow-hidden shadow-3xl blueprint-grid"
            >
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {tables
                    .filter(t => activeZone === "TODAS" || t.location === activeZone)
                    .map(table => (
                        <div
                            key={table.id}
                            onMouseDown={(e) => onMouseDown(e, table.id)}
                            style={{
                                left: table.x_pos,
                                top: table.y_pos,
                                width: table.width,
                                height: table.height,
                                transform: `rotate(${table.rotation}deg)`,
                            }}
                            className={cn(
                                "absolute cursor-move transition-all duration-300 flex items-center justify-center font-black italic select-none group border-4 z-10",
                                table.shape === 'circle' ? "rounded-full" : "rounded-[3.5rem]",
                                isHeatmapMode ? getHeatColor(table.id) : (
                                    table.status === 'occupied' || table.status === 'paying'
                                        ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse"
                                        : table.status === 'reserved'
                                            ? "bg-amber-500 text-white border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                                            : "bg-card/80 backdrop-blur-md border-border/60 text-foreground hover:border-primary/50 transition-colors"
                                ),
                                draggedTableId === table.id && "z-50 ring-8 ring-primary/20 shadow-5xl opacity-80 cursor-grabbing scale-[1.05]",
                            )}
                        >
                            <div className="text-center relative z-10 w-full p-4 overflow-hidden">
                                <p className={cn("text-4xl font-black tracking-tighter leading-none transition-all duration-500",
                                    (table.status === 'occupied' || table.status === 'paying' || table.status === 'reserved' || isHeatmapMode) ? "text-white scale-110" : "text-foreground group-hover:text-primary"
                                )}>{table.table_number}</p>
                                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mt-3 border-t-2 border-current/10 pt-2 transition-opacity group-hover:scale-110",
                                    (table.status === 'occupied' || table.status === 'paying' || table.status === 'reserved' || isHeatmapMode) ? "text-white/40" : "text-muted-foreground/30"
                                )}>
                                    {isHeatmapMode ? `$${(tableSales[table.id] || 0).toLocaleString()}` : `${table.capacity} PAX`}
                                </p>
                            </div>

                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-foreground text-background rounded-[2rem] p-2 gap-2 shadow-5xl z-50 animate-in slide-in-from-bottom-4 duration-500">
                                <button type="button" onClick={(e) => { e.stopPropagation(); updateTableDimension(table.id, 'rotation', (table.rotation + 45) % 360) }} className="w-12 h-12 rounded-2xl hover:bg-primary hover:text-black flex items-center justify-center transition-all bg-muted/10" title="ROTAR ENTIDAD"><RotateCcw className="w-6 h-6" /></button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); updateTableDimension(table.id, 'width', table.width + 20) }} className="w-12 h-12 rounded-2xl hover:bg-primary hover:text-black flex items-center justify-center transition-all bg-muted/10" title="ESCALA HORIZONTAL"><Maximize2 className="w-6 h-6" /></button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); updateTableDimension(table.id, 'height', table.height + 20) }} className="w-12 h-12 rounded-2xl hover:bg-primary hover:text-black flex items-center justify-center transition-all rotate-90 bg-muted/10" title="ESCALA VERTICAL"><Maximize2 className="w-6 h-6" /></button>
                                <div className="w-px h-8 bg-background/20 self-center mx-1" />
                                {table.status !== 'available' && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); initiateTransfer(table); }} className="w-12 h-12 rounded-2xl hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all bg-muted/10" title="TRASLADAR FLUJO"><ArrowLeftRight className="w-6 h-6" /></button>
                                )}
                                <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(table); }} className="w-12 h-12 rounded-2xl hover:bg-primary hover:text-black flex items-center justify-center transition-all bg-muted/10" title="CALIBRAR ATRIBUTOS"><Edit className="w-6 h-6" /></button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(table); }} className="w-12 h-12 rounded-2xl hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all bg-muted/10" title="PURGAR ENTIDAD"><Trash2 className="w-6 h-6" /></button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}
