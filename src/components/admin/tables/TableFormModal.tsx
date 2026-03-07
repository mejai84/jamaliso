"use client"

import { Button } from "@/components/ui/button"
import { X, LayoutGrid, Box, ChevronRight, Square as SquareIcon, Circle, ArrowRight } from "lucide-react"
import { Table } from "@/app/admin/tables/types"

interface TableFormModalProps {
    isOpen: boolean
    table: Table | null
    onSubmit: (e: React.FormEvent) => void
    onClose: () => void
}

export function TableFormModal({ isOpen, table, onSubmit, onClose }: TableFormModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card border-4 border-primary/20 rounded-[5rem] w-full max-w-2xl p-16 shadow-[0_0_150px_rgba(255,102,0,0.15)] relative overflow-hidden group/modal animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/modal:scale-110 transition-transform duration-1000 rotate-12">
                    <LayoutGrid className="w-[450px] h-[450px]" />
                </div>

                <div className="flex justify-between items-start mb-16 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-primary text-black flex items-center justify-center shadow-3xl">
                                <Box className="w-8 h-8" />
                            </div>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                {table ? 'MODULAR ' : 'CALIBRAR '}
                                <span className="text-primary italic">NODO_MESA</span>
                            </h2>
                        </div>
                        <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic pl-20 italic">
                            {table ? `IDENTIDAD: ${table.table_name.toUpperCase()}` : 'PARÁMETROS DE ARQUITECTURA DIGITAL'}
                        </p>
                    </div>
                    <Button variant="ghost" className="h-16 w-16 rounded-[1.5rem] bg-muted/40 hover:bg-primary hover:text-white transition-all active:scale-90" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <form className="space-y-12 relative z-10" onSubmit={onSubmit}>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4 group/field">
                            <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic">N° DE SISTEMA</label>
                            <input name="table_number" type="number" defaultValue={table?.table_number} required className="w-full h-20 bg-muted/40 border-4 border-border rounded-[2.5rem] px-10 outline-none text-foreground focus:border-primary font-black italic text-2xl shadow-inner transition-all tracking-tighter" />
                        </div>
                        <div className="space-y-4 group/field">
                            <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic">ALIAS EN SALÓN</label>
                            <input name="table_name" placeholder="EJ: VIP ZONA_ALPHA" defaultValue={table?.table_name} required className="w-full h-20 bg-muted/40 border-4 border-border rounded-[2.5rem] px-10 outline-none text-foreground focus:border-primary font-black italic text-xs tracking-[0.4em] shadow-inner transition-all uppercase placeholder:text-muted-foreground/10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4 group/field">
                            <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic">AFORO COMENSALES</label>
                            <input name="capacity" type="number" defaultValue={table?.capacity || 4} className="w-full h-20 bg-muted/40 border-4 border-border rounded-[2.5rem] px-10 outline-none text-foreground focus:border-primary font-black italic text-2xl shadow-inner transition-all tracking-tighter" />
                        </div>
                        <div className="space-y-4 group/field">
                            <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic">ZONA_CLUSTER</label>
                            <div className="relative">
                                <select name="location" defaultValue={table?.location || "Interior"} className="w-full h-20 bg-muted/40 border-4 border-border rounded-[2.5rem] px-10 outline-none text-foreground focus:border-primary font-black uppercase italic tracking-[0.3em] text-xs cursor-pointer shadow-inner appearance-none transition-all">
                                    <option value="Interior" className="bg-card">INTERIOR_SYS</option>
                                    <option value="Terraza" className="bg-card">TERRAZA_HUB</option>
                                    <option value="Barra" className="bg-card">BARRA_FLUX</option>
                                    <option value="VIP" className="bg-card">VIP_EXCLUSIVE</option>
                                </select>
                                <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 pointer-events-none rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic">MATRIZ GEOMÉTRICA</label>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { id: 'rectangle', label: 'RADIAL', icon: SquareIcon },
                                { id: 'circle', label: 'ESFÉRICA', icon: Circle },
                                { id: 'square', label: 'MATRIX', icon: LayoutGrid },
                            ].map((sh) => (
                                <label key={sh.id} className="flex flex-col items-center gap-4 p-8 bg-muted/20 rounded-[3rem] border-4 border-border/40 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-all hover:bg-muted/40 shadow-xl relative overflow-hidden group/opt active:scale-95">
                                    <input type="radio" name="shape" value={sh.id} className="hidden" defaultChecked={table?.shape === sh.id || (!table && sh.id === 'rectangle')} />
                                    <sh.icon className="w-10 h-10 text-muted-foreground/40 group-hover/opt:text-primary transition-all group-has-[:checked]/opt:text-primary group-has-[:checked]/opt:scale-120 group-has-[:checked]/opt:rotate-12" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 group-hover/opt:text-primary group-has-[:checked]/opt:text-primary">{sh.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-8 pt-10">
                        <Button type="button" variant="ghost" className="flex-1 h-24 rounded-[2.5rem] font-black italic uppercase tracking-[0.5em] text-muted-foreground/40 hover:bg-muted/10 transition-all" onClick={onClose}>ABORTAR</Button>
                        <Button type="submit" className="flex-[2] h-24 bg-foreground text-background hover:bg-primary hover:text-white font-black rounded-[3rem] uppercase italic tracking-[0.4em] shadow-5xl transition-all border-none text-xl group active:scale-95">
                            <span className="flex items-center gap-5">
                                {table ? 'SALVAR CALIBRACIÓN' : 'CONSTRUIR NODO'} <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
                            </span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
