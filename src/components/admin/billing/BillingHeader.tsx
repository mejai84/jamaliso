"use client"

import { FileText, AlertTriangle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface BillingHeaderProps {
    onSync: () => void;
    onConfig: () => void;
    isSyncing: boolean;
}

export function BillingHeader({ onSync, onConfig, isSyncing }: BillingHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tight uppercase text-foreground">
                        Facturación <span className="text-primary italic">Fiscal</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> API MOCKUP v1.0
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                    <span>ENTORNO DE DEMOSTRACIÓN</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-bold w-fit">
                    <AlertTriangle className="w-4 h-4" />
                    ESTOS DOCUMENTOS NO TIENEN VALIDEZ FISCAL REAL
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-border bg-card font-black uppercase italic tracking-widest text-xs hover:bg-muted transition-all"
                    onClick={onConfig}
                >
                    Configurar Proveedor
                </Button>
                <Button
                    className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase italic tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    onClick={onSync}
                    disabled={isSyncing}
                >
                    {isSyncing ? "Sincronizando..." : "Sincronizar Pendientes"}
                </Button>
            </div>
        </div>
    )
}
