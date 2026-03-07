"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Activity, LayoutGrid, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ZONES } from "@/app/admin/tables/types"

interface TablesHeaderProps {
    activeZone: string
    onZoneChange: (zone: string) => void
    isVisualView: boolean
    onViewToggle: (isVisual: boolean) => void
    onAddTable: () => void
}

export function TablesHeader({ activeZone, onZoneChange, isVisualView, onViewToggle, onAddTable }: TablesHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 border-b border-border/50 pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2.5rem] bg-card border border-border shadow-3xl hover:bg-muted active:scale-90 transition-all group overflow-hidden relative">
                        <ArrowLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform relative z-10" />
                    </Button>
                </Link>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground">GEOMETRÍA <span className="text-primary italic">SALÓN</span></h1>
                        <div className="px-5 py-2 bg-primary/10 border-2 border-primary/20 rounded-[1.5rem] text-[11px] font-black text-primary tracking-[0.3em] italic uppercase shadow-xl animate-pulse flex items-center gap-3">
                            <Activity className="w-3 h-3" />
                            FLOOR_PLAN_ENGINE_V2
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.5em] italic flex items-center gap-4 opacity-60">
                        <LayoutGrid className="w-5 h-5 text-primary" /> Visualización Dinámica, Control de Aforo & Mapas de Calor
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
                <div className="flex bg-card/60 backdrop-blur-md p-2 rounded-[2rem] border-2 border-border/40 shadow-xl">
                    {ZONES.map(zone => (
                        <button
                            key={zone}
                            onClick={() => onZoneChange(zone)}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                                (activeZone === zone) ? "bg-primary text-black shadow-lg" : "text-muted-foreground/40 hover:text-foreground"
                            )}
                        >
                            {zone}
                        </button>
                    ))}
                </div>

                <div className="flex bg-card/60 backdrop-blur-md p-2 rounded-[2rem] border-2 border-border/40 shadow-xl">
                    <button
                        onClick={() => onViewToggle(false)}
                        className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic", !isVisualView ? "bg-primary text-black shadow-lg" : "text-muted-foreground/40 hover:text-foreground")}
                    >
                        LISTA
                    </button>
                    <button
                        onClick={() => onViewToggle(true)}
                        className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic", isVisualView ? "bg-primary text-black shadow-lg" : "text-muted-foreground/40 hover:text-foreground")}
                    >
                        DISEÑO 2D
                    </button>
                </div>

                <Button
                    onClick={onAddTable}
                    className="h-20 px-10 bg-foreground text-background hover:bg-primary hover:text-white font-black uppercase text-xs tracking-[0.4em] italic rounded-[2.5rem] shadow-3xl transition-all gap-5 border-none group active:scale-95"
                >
                    <Plus className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    NUEVA ENTIDAD_MESA
                </Button>
            </div>
        </div>
    )
}
