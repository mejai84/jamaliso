"use client"

import { useState } from "react"
import { ElectronicInvoice } from "@/components/admin/billing/types"
import { BillingHeader } from "@/components/admin/billing/BillingHeader"
import { BillingMetrics } from "@/components/admin/billing/BillingMetrics"
import { BillingTable } from "@/components/admin/billing/BillingTable"
import { toast } from "sonner"
import { BillingChart } from "@/components/admin/billing/BillingChart"
import { FileDown, Printer, ShieldAlert } from "lucide-react"
import { DataFlow, CSVColumn } from "@/lib/data-flow"
import { DataImportWizard } from "@/components/admin/shared/DataImportWizard"
import { DataFlowActions } from "@/components/admin/shared/DataFlowActions"
import { Button } from "@/components/ui/button"

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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

    const handleExport = () => {
        const columns: CSVColumn<ElectronicInvoice>[] = [
            { header: 'ID', key: 'id' },
            { header: 'Orden', key: 'order_id' },
            { header: 'Cliente', key: 'customer_name' },
            { header: 'NIT/ID', key: 'customer_nit' },
            { header: 'Monto', key: 'amount' },
            { header: 'Estado', key: 'status' },
            { header: 'CUFE/UUID', key: 'cufe_uuid' }
        ];
        DataFlow.exportToCSV(invoices, columns, 'facturas-electronicas-jamaliso');
        toast.info("Descargando historial de facturación fiscal...");
    }

    const handleImport = async (data: any[]) => {
        // En una app real, esto validaría el XML o integraría con la DIAN
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Procesando registros fiscales externos...',
                success: () => {
                    const newInvoices = data.map(row => ({
                        id: `EXT-${Math.random().toString(36).substring(7)}`,
                        order_id: row.order_id || 'N/A',
                        customer_name: row.customer_name,
                        customer_nit: row.customer_nit,
                        amount: parseFloat(row.amount) || 0,
                        status: row.status || 'emitida',
                        cufe_uuid: row.cufe_uuid || 'N/A',
                        created_at: new Date().toISOString(),
                        provider: 'IMPORTADO'
                    }));
                    setInvoices(prev => [...prev, ...newInvoices as ElectronicInvoice[]]);
                    return 'Registros importados exitosamente al historial.';
                },
                error: 'Error en la estructura del archivo fiscal.'
            }
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground p-6 md:p-12 font-sans overflow-hidden">
            {/* AMBIANCE */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-primary/[0.01] to-transparent pointer-events-none z-0" />

            <div className="max-w-[1600px] mx-auto space-y-12 relative z-10 animate-in fade-in duration-700">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-border/50 pb-10">
                    <BillingHeader
                        onSync={handleSync}
                        isSyncing={isSyncing}
                        onConfig={() => toast.success("Abriendo Configuración de Proveedor Tecnológico...")}
                    />
                    <div className="shrink-0">
                        <DataFlowActions
                            onExport={handleExport}
                            onImport={() => setIsImportModalOpen(true)}
                            importLabel="Importar Facturas"
                            exportLabel="Descargar Reporte Fiscal"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    <div className="xl:col-span-1 space-y-12">
                        <BillingMetrics invoices={invoices} />
                        <div className="p-8 bg-amber-500/5 rounded-3xl border border-amber-500/10 space-y-4">
                            <div className="flex items-center gap-3 text-amber-500">
                                <ShieldAlert className="w-5 h-5" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest italic">Protocolo de Emergencia DIAN</h4>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tighter">
                                Si el servicio central del proveedor falla, habilite el modo de "Contingencia Fiscal" para guardar XMLs locales y re-transmitir en 24h.
                            </p>
                            <Button variant="outline" className="w-full h-12 border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest italic hover:bg-amber-500 hover:text-white transition-all">
                                Activar Contingencia
                            </Button>
                        </div>
                    </div>
                    <div className="xl:col-span-2">
                        <BillingChart />
                    </div>
                </div>

                <div className="flex items-center justify-between border-y border-border/50 py-8">
                    <div className="flex items-center gap-8">
                        <Button
                            onClick={() => toast.success("GENERANDO LIBRO AUXILIAR MENSUAL (PDF)")}
                            variant="ghost"
                            className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase italic text-[10px] tracking-[0.3em] flex items-center gap-4 hover:bg-slate-800"
                        >
                            <FileDown className="w-5 h-5 text-orange-500" /> Libro Auxiliar (PDF)
                        </Button>
                        <Button variant="ghost" className="h-14 px-8 rounded-2xl border border-slate-200 text-slate-400 font-black uppercase italic text-[10px] tracking-[0.3em] flex items-center gap-4 hover:bg-slate-100">
                            <Printer className="w-5 h-5" /> Imprimir Último Cierre
                        </Button>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Total Fiscal Periodo: <span className="text-foreground text-sm">$45.8M COP</span></p>
                    </div>
                </div>

                <div className="animate-in slide-in-from-bottom-12 duration-1000">
                    <BillingTable invoices={invoices} onEmit={handleEmitSingle} />
                </div>

                <DataImportWizard
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onConfirm={handleImport}
                    moduleName="Historial Fiscal de Facturación"
                    requiredFields={[
                        { key: 'customer_name', label: 'Nombre Cliente' },
                        { key: 'customer_nit', label: 'NIT/ID' },
                        { key: 'amount', label: 'Monto' }
                    ]}
                />
            </div>
        </div>
    )
}
