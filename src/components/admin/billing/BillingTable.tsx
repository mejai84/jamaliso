"use client"

import { ElectronicInvoice } from "./types"
import { CheckCircle2, Clock, Terminal, AlertOctagon } from "lucide-react"

export function BillingTable({ invoices, onEmit }: { invoices: ElectronicInvoice[], onEmit: (id: string) => void }) {

    const getStatusStyle = (status: string) => {
        if (status === 'emitida') return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        if (status === 'error') return "bg-rose-500/10 text-rose-500 border-rose-500/20";
        return "bg-muted text-muted-foreground border-border";
    }

    const getStatusIcon = (status: string) => {
        if (status === 'emitida') return <CheckCircle2 className="w-4 h-4" />;
        if (status === 'error') return <AlertOctagon className="w-4 h-4" />;
        return <Clock className="w-4 h-4" />;
    }

    return (
        <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-border/50">
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground italic flex items-center gap-4">
                    <Terminal className="w-6 h-6 text-primary" /> Log de Transmisiones Fiscales
                </h2>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border/50">
                            <th className="p-6 text-xs font-black uppercase text-muted-foreground tracking-widest">ID Pedido / Fecha</th>
                            <th className="p-6 text-xs font-black uppercase text-muted-foreground tracking-widest">Cliente / NIT</th>
                            <th className="p-6 text-xs font-black uppercase text-muted-foreground tracking-widest">Monto</th>
                            <th className="p-6 text-xs font-black uppercase text-muted-foreground tracking-widest">CUFE / UUID</th>
                            <th className="p-6 text-xs font-black uppercase text-muted-foreground tracking-widest text-center">Estado</th>
                            <th className="p-6 text-xs font-black uppercase text-muted-foreground tracking-widest text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-muted/20 transition-colors group">
                                <td className="p-6">
                                    <p className="font-bold text-sm">#{inv.order_id}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleString('es-CO')}</p>
                                </td>
                                <td className="p-6">
                                    <p className="font-bold text-sm uppercase">{inv.customer_name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">NIT: {inv.customer_nit}</p>
                                </td>
                                <td className="p-6 font-black text-sm">
                                    ${inv.amount.toLocaleString('es-CO')}
                                </td>
                                <td className="p-6">
                                    {inv.cufe_uuid ? (
                                        <p className="text-[10px] font-mono bg-muted p-1.5 rounded-md break-all text-primary w-48">
                                            {inv.cufe_uuid}
                                        </p>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">No generado</span>
                                    )}
                                </td>
                                <td className="p-6 text-center">
                                    <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border rounded-full inline-flex items-center gap-2 ${getStatusStyle(inv.status)}`}>
                                        {getStatusIcon(inv.status)}
                                        {inv.status}
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    {inv.status === 'pendiente' || inv.status === 'error' ? (
                                        <button
                                            onClick={() => onEmit(inv.id)}
                                            className="px-6 py-2 bg-foreground text-background font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary transition-colors"
                                        >
                                            Generar XML
                                        </button>
                                    ) : (
                                        <button className="px-6 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-colors">
                                            Descargar PDF
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-muted-foreground">
                                    No hay registros fiscales recientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
