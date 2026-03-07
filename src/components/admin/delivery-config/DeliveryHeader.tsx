"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Activity, Truck, AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DeliveryHeaderProps {
    onSave: () => void
    saving: boolean
    message: { type: 'success' | 'error', text: string } | null
}

export function DeliveryHeader({ onSave, saving, message }: DeliveryHeaderProps) {
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
                        <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground">CONFIG <span className="text-primary italic">LOGÍSTICA</span></h1>
                        <div className="px-5 py-2 bg-primary/10 border-2 border-primary/20 rounded-[1.5rem] text-[11px] font-black text-primary tracking-[0.3em] italic uppercase shadow-xl animate-pulse flex items-center gap-3">
                            <Activity className="w-3 h-3" />
                            REAL-TIME DISPATCH ENGINE
                        </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.5em] italic flex items-center gap-4 opacity-60">
                        <Truck className="w-5 h-5 text-primary" /> Maestro de Parámetros para Domicilios & Recogidas en Local
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8">
                {message && (
                    <div className={cn(
                        "hidden lg:flex items-center gap-4 px-8 py-4 rounded-[2rem] border-2 font-black italic text-[10px] uppercase tracking-widest animate-in slide-in-from-right duration-500",
                        message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                    </div>
                )}
                <Button
                    onClick={onSave}
                    disabled={saving}
                    className="h-20 px-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black uppercase text-xs tracking-[0.4em] italic rounded-[2.5rem] shadow-3xl shadow-primary/20 transition-all gap-5 border-none group active:scale-95"
                >
                    {saving ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                        <>
                            <Save className="w-7 h-7 group-hover:scale-110 transition-transform" />
                            ACTUALIZAR PROTOCOLO
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
