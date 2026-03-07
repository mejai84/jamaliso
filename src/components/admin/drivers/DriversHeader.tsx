"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Signal, Bike, Search, UserPlus, AlertTriangle, Truck } from "lucide-react"
import Link from "next/link"

interface DriversHeaderProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    onOpenModal: () => void
    activeProvider?: string
}

export function DriversHeader({ searchQuery, onSearchChange, onOpenModal, activeProvider }: DriversHeaderProps) {
    const isExternal = activeProvider && activeProvider !== 'JAMALI_FLEET'
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 border-b border-border/50 pb-12 font-sans">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2.5rem] bg-card border border-border shadow-3xl hover:bg-muted active:scale-90 transition-all group overflow-hidden relative">
                        <ArrowLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform relative z-10" />
                    </Button>
                </Link>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground">FLOTA <span className="text-primary italic">REPARTO</span></h1>

                        {!isExternal ? (
                            <div className="px-5 py-2 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[1.5rem] text-[11px] font-black text-emerald-500 tracking-[0.3em] italic uppercase shadow-xl animate-pulse flex items-center gap-3">
                                <Signal className="w-4 h-4" />
                                JAMALI FLEET ACTIVE
                            </div>
                        ) : (
                            <div className="px-5 py-2 bg-amber-500/10 border-2 border-amber-500/20 rounded-[1.5rem] text-[11px] font-black text-amber-500 tracking-[0.3em] italic uppercase shadow-xl flex items-center gap-3">
                                <AlertTriangle className="w-4 h-4" />
                                {activeProvider} LOGISTICS ACTIVE
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.5em] italic flex items-center gap-4 opacity-60">
                        <Bike className="w-5 h-5 text-primary" /> Gestión de Flota de Reparto, Calificaciones & Desempeño Logístico
                    </p>

                    {isExternal && (
                        <div className="flex items-center gap-4 py-3 px-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl animate-in fade-in slide-in-from-left-4">
                            <Truck className="w-4 h-4 text-amber-500" />
                            <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                                ATENCIÓN: LA LOGÍSTICA ESTÁ DERIVADA A <span className="underline">{activeProvider}</span>. LOS REPARTIDORES LOCALES NO RECIBIRÁN PEDIDOS AUTOMÁTICOS.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 bg-card border border-border p-3 rounded-[3rem] shadow-3xl">
                <div className="relative group/search shrink-0">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                    <input
                        placeholder="IDENTIFICAR REPARTIDOR..."
                        className="h-20 w-[350px] bg-muted/20 border border-border rounded-[2.5rem] pl-16 pr-8 outline-none focus:border-primary font-black italic text-xs tracking-[0.2em] uppercase transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Button
                    onClick={onOpenModal}
                    className="h-20 px-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black uppercase text-xs tracking-[0.4em] italic rounded-[2.5rem] shadow-3xl shadow-primary/20 transition-all gap-5 border-none group active:scale-95"
                >
                    <UserPlus className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    ALTA DE REPARTIDOR
                </Button>
            </div>
        </div>
    )
}
