"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck, Briefcase, Save, Loader2 } from "lucide-react"
import Link from "next/link"

interface BusinessSettingsHeaderProps {
    saving: boolean
    onSave: () => void
}

export function BusinessSettingsHeader({ saving, onSave }: BusinessSettingsHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 border-b border-border/50 pb-12 font-sans">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                <Link href="/admin/settings">
                    <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2.5rem] bg-card border border-border shadow-3xl hover:bg-muted active:scale-90 transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ArrowLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform relative z-10" />
                    </Button>
                </Link>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground">PERFIL <span className="text-primary italic">COMERCIAL</span></h1>
                        <div className="px-5 py-2 bg-primary/10 border-2 border-primary/20 rounded-[1.5rem] text-[11px] font-black text-primary tracking-[0.3em] italic uppercase shadow-xl animate-pulse flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4" />
                            VERIFIED ENTITY
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.5em] italic flex items-center gap-4 opacity-60">
                            <Briefcase className="w-5 h-5 text-primary" /> Maestro de Identidad Jurídica & Matriz Fiscal Certificada
                        </p>
                        <div className="w-2 h-2 rounded-full bg-border" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.3em] italic">Vencimiento Licencia: 12/26</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 bg-card border border-border p-3 rounded-[3rem] shadow-3xl">
                <Link href="/admin/settings">
                    <Button variant="ghost" className="h-20 px-10 bg-muted/20 border border-border/50 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] italic shadow-xl transition-all gap-4 hover:bg-muted active:scale-95 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> RETORNO PROTOCOLO
                    </Button>
                </Link>
                <Button
                    onClick={onSave}
                    disabled={saving}
                    className="h-20 px-12 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black uppercase text-xs tracking-[0.4em] italic rounded-[2.5rem] shadow-3xl shadow-primary/20 transition-all gap-5 border-none group active:scale-95"
                >
                    {saving ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                        <>
                            <Save className="w-7 h-7 group-hover:scale-110 transition-transform" />
                            SINCRONIZAR LEDGER
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
