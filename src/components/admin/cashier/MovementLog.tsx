"use client"

import { History, Search, Receipt, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Movement } from "@/app/admin/cashier/types"

interface MovementLogProps {
    movements: Movement[]
    refreshing: boolean
}

export function MovementLog({ movements, refreshing }: MovementLogProps) {
    return (
        <div className="bg-card border border-border rounded-[4.5rem] shadow-3xl min-h-[700px] flex flex-col relative overflow-hidden group/log transition-all hover:border-primary/20">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-12 -mt-12 group-hover/log:scale-110 transition-all duration-1000">
                <History className="w-[600px] h-[600px]" />
            </div>

            <div className="p-12 border-b border-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="space-y-1 border-l-8 border-primary px-8">
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none">Matriz de Movimientos</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic leading-none">CHRONOLOGICAL TRANSACTION LEDGER</p>
                </div>
                <div className="relative group/search">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                    <input
                        type="search"
                        placeholder="BUSCAR MOVIMIENTO..."
                        className="h-16 w-[300px] bg-muted/40 border border-border rounded-[2rem] pl-16 pr-8 outline-none focus:border-primary font-black italic text-[10px] tracking-[0.2em] uppercase transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 relative z-10 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-4">
                        {movements.map((move) => (
                            <div key={move.id} className="group/row bg-muted/20 border border-border/40 rounded-[2.5rem] p-8 flex items-center justify-between hover:bg-muted/40 hover:border-primary/20 transition-all active:scale-[0.99] cursor-default">
                                <div className="flex items-center gap-8">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl group-hover/row:scale-110",
                                        move.movement_type === 'SALE' ? "bg-emerald-500 text-white" :
                                            move.movement_type === 'WITHDRAWAL' ? "bg-rose-500 text-white" :
                                                "bg-primary text-black"
                                    )}>
                                        {move.movement_type === 'SALE' ? <Receipt className="w-8 h-8" /> :
                                            move.movement_type === 'WITHDRAWAL' ? <TrendingDown className="w-8 h-8" /> :
                                                <TrendingUp className="w-8 h-8" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest italic leading-none",
                                                move.movement_type === 'SALE' ? "text-emerald-500" :
                                                    move.movement_type === 'WITHDRAWAL' ? "text-rose-500" :
                                                        "text-primary"
                                            )}>{move.movement_type}</span>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase opacity-30 italic">{new Date(move.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <h4 className="text-xl font-black italic text-foreground uppercase tracking-tight group-hover/row:text-primary transition-colors underline-offset-4 decoration-primary/20">{move.description || 'CONCEPTO NO ESPECIFICADO'}</h4>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">TOTAL NETO</p>
                                    <p className={cn(
                                        "text-3xl font-black italic tracking-tighter leading-none transition-all group-hover/row:scale-105",
                                        move.movement_type === 'WITHDRAWAL' ? 'text-rose-500' : 'text-foreground group-hover/row:text-primary'
                                    )}>
                                        {move.movement_type === 'WITHDRAWAL' ? '-' : ''}${move.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {movements.length === 0 && !refreshing && (
                            <div className="py-32 flex flex-col items-center justify-center gap-8 border-4 border-dashed border-border/50 rounded-[4.5rem]">
                                <History className="w-20 h-20 text-muted-foreground/10" />
                                <div className="text-center space-y-3">
                                    <p className="text-3xl font-black italic uppercase tracking-tighter text-muted-foreground/40">Sin Registros en Sesión</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">EL KERNEL DE MOVIMIENTOS SE ENCUENTRA EN ESTADO VIRGINAL.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
