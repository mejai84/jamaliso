"use client"

import { ElectronicInvoice } from "./types"
import { CheckCircle2, Clock, AlertOctagon } from "lucide-react"

export function BillingMetrics({ invoices }: { invoices: ElectronicInvoice[] }) {
    const emitted = invoices.filter(i => i.status === "emitida").length
    const pending = invoices.filter(i => i.status === "pendiente").length
    const errors = invoices.filter(i => i.status === "error").length

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-10 rounded-3xl border border-border shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Facturas Emitidas</p>
                    <p className="text-4xl font-black text-emerald-500 italic">{emitted}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex flex-col items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
            </div>

            <div className="bg-card p-10 rounded-3xl border border-border flex items-center justify-between">
                <div>
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2">Pendientes Sincro</p>
                    <p className="text-4xl font-black text-foreground italic">{pending}</p>
                </div>
                <div className="w-16 h-16 bg-muted/20 rounded-full flex flex-col items-center justify-center text-muted-foreground">
                    <Clock className="w-8 h-8" />
                </div>
            </div>

            <div className="bg-card p-10 rounded-3xl border border-rose-500/20 shadow-rose-500/5 flex items-center justify-between">
                <div>
                    <p className="text-xs font-black uppercase text-rose-500/70 tracking-widest mb-2">Con Errores DIAN</p>
                    <p className="text-4xl font-black text-rose-500 italic">{errors}</p>
                </div>
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex flex-col items-center justify-center text-rose-500">
                    <AlertOctagon className="w-8 h-8" />
                </div>
            </div>
        </div>
    )
}
