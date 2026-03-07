"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeftRight, ChevronRight, ArrowRight } from "lucide-react"
import { Table } from "@/app/admin/tables/types"

interface TransferTableModalProps {
    isOpen: boolean
    sourceTable: Table | null
    targetTableId: string
    onTargetChange: (id: string) => void
    tables: Table[]
    onSubmit: (e: React.FormEvent) => void
    onClose: () => void
}

export function TransferTableModal({
    isOpen,
    sourceTable,
    targetTableId,
    onTargetChange,
    tables,
    onSubmit,
    onClose
}: TransferTableModalProps) {
    if (!isOpen || !sourceTable) return null

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[250] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-card border-4 border-blue-500/20 rounded-[5rem] w-full max-w-2xl p-16 shadow-[0_0_150px_rgba(59,130,246,0.15)] animate-in zoom-in-105 duration-500 shadow-black/50 relative group/transfer">
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/transfer:scale-110 transition-transform duration-1000 rotate-12">
                    <ArrowLeftRight className="w-[450px] h-[450px]" />
                </div>

                <div className="space-y-6 mb-16 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-3xl">
                            <ArrowLeftRight className="w-8 h-8" />
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">MIGRACIÓN DE <span className="text-blue-500 italic">FLUJO</span></h1>
                    </div>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic pl-20 italic">
                        ORIGEN: MESA {sourceTable.table_number.toString().padStart(2, '0')}_NODE — ESTADO: ACTIVO
                    </p>
                </div>

                <form className="space-y-12 relative z-10" onSubmit={onSubmit}>
                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-12 italic">DEFINIR DESTINO COMERCIAL</label>
                        <div className="relative">
                            <select
                                className="w-full h-24 bg-muted/40 border-4 border-border rounded-[3rem] px-12 outline-none text-foreground focus:border-blue-500 font-black italic text-3xl tracking-tighter appearance-none shadow-inner transition-all"
                                value={targetTableId}
                                onChange={(e) => onTargetChange(e.target.value)}
                                required
                            >
                                <option value="" className="bg-card">SELECCIONAR NODO DESTINO...</option>
                                {tables
                                    .filter(t => t.id !== sourceTable.id)
                                    .sort((a, b) => a.table_number - b.table_number)
                                    .map(t => (
                                        <option key={t.id} value={t.id} className="bg-card text-lg py-4">
                                            MESA {t.table_number.toString().padStart(2, '0')} — Cluster: {t.location.toUpperCase()} ({t.status === 'available' ? 'LIBRE' : 'OCUPADA'})
                                        </option>
                                    ))
                                }
                            </select>
                            <ChevronRight className="absolute right-10 top-1/2 -translate-y-1/2 w-8 h-8 text-white/5 pointer-events-none rotate-90" />
                        </div>
                        <div className="p-8 bg-blue-500/5 rounded-[3rem] border-4 border-blue-500/20 flex gap-6 items-start shadow-inner">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 shrink-0 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                            <p className="text-[10px] text-blue-500/80 font-black leading-relaxed italic uppercase tracking-[0.2em]">
                                PROTOCOL_SYNC: El proceso de migración transferirá todas las comandas, cargos y estado de servicio de la cuenta original a la entidad seleccionada. Si el destino posee un proceso activo, se ejecutará una FUSIÓN_FLUJO.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-8 pt-8">
                        <Button type="button" variant="ghost" className="flex-1 h-24 rounded-[2.5rem] font-black italic uppercase tracking-[0.6em] text-muted-foreground/40 hover:bg-muted/10 transition-all" onClick={onClose}>ABORTAR_SYNC</Button>
                        <Button type="submit" className="flex-[2] h-24 bg-blue-600 text-white hover:bg-blue-500 font-black rounded-[3rem] uppercase italic tracking-[0.4em] shadow-5xl transition-all border-none text-xl group active:scale-95">
                            <span className="flex items-center gap-5">CONFIRMAR MIGRACIÓN <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" /></span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
