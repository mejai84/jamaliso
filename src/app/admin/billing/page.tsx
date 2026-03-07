"use client"

import { useState } from "react"
import { ElectronicInvoice } from "@/components/admin/billing/types"
import { BillingHeader } from "@/components/admin/billing/BillingHeader"
import { BillingMetrics } from "@/components/admin/billing/BillingMetrics"
import { BillingTable } from "@/components/admin/billing/BillingTable"
import { toast } from "sonner"

const MOCK_INVOICES: ElectronicInvoice[] = [
    {
        id: "INV-001", order_id: "ORD-9912", customer_name: "Empresa Cliente SAS", customer_nit: "901.234.567-8", amount: 154000, status: "emitida",
        cufe_uuid: "e2f1a6b0c9...", created_at: new Date(Date.now() - 3600000).toISOString(), provider: "DIAN"
    },
    {
        id: "INV-002", order_id: "ORD-9915", customer_name: "Consumidor Final", customer_nit: "222222222222", amount: 45000, status: "pendiente",
        created_at: new Date(Date.now() - 1800000).toISOString(), provider: "DIAN"
    },
    {
        id: "INV-003", order_id: "ORD-9918", customer_name: "Restaurante Prueba", customer_nit: "800.123.456-1", amount: 320000, status: "error",
        created_at: new Date(Date.now() - 600000).toISOString(), provider: "DIAN"
    }
]

export default function BillingPage() {
    const [invoices, setInvoices] = useState<ElectronicInvoice[]>(MOCK_INVOICES);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        toast.info("Iniciando transmisión masiva con Proveedor Tecnológico...");

        setTimeout(() => {
            setInvoices(prev => prev.map(inv => {
                if (inv.status === 'pendiente') {
                    return { ...inv, status: 'emitida', cufe_uuid: Math.random().toString(36).substring(2, 15) }
                }
                return inv;
            }));
            setIsSyncing(false);
            toast.success("Documentos sincornizados y sellados por DIAN/SAT exitosamente.");
        }, 2000);
    }

    const handleEmitSingle = (id: string) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Generando XML y firmando...',
                success: () => {
                    setInvoices(prev => prev.map(inv =>
                        inv.id === id ? { ...inv, status: 'emitida', cufe_uuid: 'mock-uuid-' + Math.random().toString(36).substring(7) } : inv
                    ));
                    return 'Factura emitida y autorizada correctamente.';
                },
                error: 'Error de comunicación local.'
            }
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground p-6 md:p-12 font-sans overflow-hidden">
            {/* AMBIANCE */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-primary/[0.01] to-transparent pointer-events-none z-0" />

            <div className="max-w-[1600px] mx-auto space-y-12 relative z-10 animate-in fade-in duration-700">
                <BillingHeader onSync={handleSync} isSyncing={isSyncing} />
                <BillingMetrics invoices={invoices} />
                <div className="animate-in slide-in-from-bottom-12 duration-1000">
                    <BillingTable invoices={invoices} onEmit={handleEmitSingle} />
                </div>
            </div>
        </div>
    )
}
