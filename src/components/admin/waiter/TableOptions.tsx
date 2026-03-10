import { useState } from "react"
import { Plus, Receipt, Link2, ArrowLeftRight, Signal, CheckCircle2, X, Table as TableIcon, ShieldAlert, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { Table as TableType } from "@/app/admin/waiter/types"

interface TableOptionsProps {
    table: TableType
    onAddItems: (orderId?: string) => void
    onBillPreview: (orderId?: string) => void
    onMergeTables: () => void
    onSplitCheck: (orderId?: string) => void
    onTransferItems: (orderId?: string) => void
    onPay: (orderId?: string) => void
    onDeliver: (orderId?: string) => void
    onRelease: () => void
    onVoidOrder: (orderId?: string) => void
    onManageNotes: (orderId?: string) => void
    submitting: boolean
}

export function TableOptions({
    table,
    onAddItems,
    onBillPreview,
    onMergeTables,
    onSplitCheck,
    onTransferItems,
    onPay,
    onDeliver,
    onRelease,
    onVoidOrder,
    onManageNotes,
    submitting
}: TableOptionsProps) {
    const activeOrders = (table as any).active_orders || (table.active_order ? [table.active_order] : []);
    const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
    const currentOrder = activeOrders[selectedOrderIndex] || table.active_order;

    return (
        <div className="min-h-full flex flex-col p-6 md:p-12 items-center justify-start py-12 md:py-20 space-y-10 md:space-y-16 max-w-5xl mx-auto w-full animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-8 relative w-full">
                {/* Decorative Background Elements */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-100/50 blur-[100px] rounded-full -z-10" />

                <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[3rem] md:rounded-[4rem] flex items-center justify-center border-4 border-slate-50 shadow-2xl mx-auto mb-4 transition-all hover:scale-105">
                    <TableIcon className="w-12 h-12 md:w-16 md:h-16 text-orange-600" />
                </div>

                <div>
                    <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{table.table_name}</h2>

                    {/* Parallel Accounts Selector */}
                    {activeOrders.length > 1 && (
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {activeOrders.map((order: any, idx: number) => (
                                <button
                                    key={order.id}
                                    onClick={() => setSelectedOrderIndex(idx)}
                                    className={cn(
                                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all border-2",
                                        selectedOrderIndex === idx
                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-110"
                                            : "bg-white border-slate-100 text-slate-400 hover:border-orange-500/20"
                                    )}
                                >
                                    Cuenta #{idx + 1}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="flex items-center gap-2 px-6 py-2 bg-orange-50 border-2 border-orange-100 text-orange-600 rounded-2xl shadow-sm">
                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">
                                {activeOrders.length > 1 ? `Gestionando Cuenta #${selectedOrderIndex + 1}` : 'Mesa Activa'}
                            </span>
                        </div>
                        <div className="px-6 py-2 bg-white border-2 border-slate-50 text-slate-900 rounded-2xl shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Total: </span>
                            <span className="text-lg font-black italic ml-1">{formatPrice(currentOrder?.total || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 w-full">
                {/* ACCIONES PRINCIPALES */}
                <Button onClick={() => onAddItems(currentOrder?.id)} className="h-44 md:h-64 bg-slate-900 text-white rounded-[3.5rem] flex flex-col hover:bg-orange-600 hover:shadow-[0_25px_60px_-15px_rgba(234,88,12,0.3)] transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-2xl col-span-2 md:col-span-1 border-none">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform">
                        <Plus className="w-32 h-32" />
                    </div>
                    <Plus className="w-12 h-12 mb-6 group-hover:rotate-90 transition-transform relative z-10" />
                    <span className="relative z-10 text-lg">Adicionar</span>
                    <span className="text-[10px] opacity-40 mt-1 relative z-10 tracking-[0.2em]">Cargar a Pedido</span>
                </Button>

                <Button onClick={() => onBillPreview(currentOrder?.id)} className="h-44 md:h-64 bg-white border-4 border-slate-50 text-slate-900 rounded-[3.5rem] flex flex-col hover:border-slate-900 hover:shadow-2xl transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-xl">
                    <Receipt className="w-12 h-12 mb-6 text-slate-200 group-hover:text-orange-600 transition-colors" />
                    <span className="text-lg">Pre-Cuenta</span>
                    <span className="text-[10px] text-slate-300 mt-1 tracking-[0.2em]">Imprimir Ticket</span>
                </Button>

                <Button onClick={() => onPay(currentOrder?.id)} className="h-44 md:h-64 bg-emerald-50 border-4 border-emerald-100 text-emerald-600 rounded-[3.5rem] flex flex-col hover:bg-emerald-600 hover:text-white hover:shadow-2xl transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-xl">
                    <Signal className="w-12 h-12 mb-6 animate-pulse" />
                    <span className="text-lg">Cobrar</span>
                    <span className="text-[9px] opacity-60 mt-1 tracking-[0.2em]">Solicitar Pago</span>
                </Button>

                <Button onClick={() => onManageNotes(currentOrder?.id)} className="h-44 md:h-64 bg-amber-50 border-4 border-amber-100 text-amber-600 rounded-[3.5rem] flex flex-col hover:bg-amber-600 hover:text-white hover:shadow-2xl transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-xl col-span-2 md:col-span-1">
                    <ClipboardList className="w-12 h-12 mb-6 text-amber-500 group-hover:text-white" />
                    <span className="text-lg">Observaciones</span>
                    <span className="text-[9px] opacity-60 mt-1 tracking-[0.2em]">Gestionar Notas</span>
                </Button>

                {/* ACCIONES DE GESTIÓN */}
                <Button onClick={() => onSplitCheck(currentOrder?.id)} className="h-36 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-white hover:border-amber-400 hover:shadow-xl transition-all font-black uppercase text-[10px] italic group active:scale-95">
                    <ArrowLeftRight className="w-8 h-8 mb-3 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span>Dividir</span>
                </Button>

                <Button onClick={onMergeTables} className="h-36 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-white hover:border-indigo-400 hover:shadow-xl transition-all font-black uppercase text-[10px] italic group active:scale-95">
                    <Link2 className="w-8 h-8 mb-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span>Unir Mesas</span>
                </Button>

                <Button onClick={() => onTransferItems(currentOrder?.id)} className="h-36 bg-slate-50 border-2 border-slate-100 text-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-white hover:border-sky-400 hover:shadow-xl transition-all font-black uppercase text-[10px] italic group active:scale-95">
                    <ArrowLeftRight className="w-8 h-8 mb-3 text-sky-500 group-hover:scale-110 transition-transform" />
                    <span>Transferir</span>
                </Button>

                {currentOrder?.status === 'ready' && (
                    <Button
                        onClick={() => onDeliver(currentOrder?.id)}
                        disabled={submitting}
                        className="h-28 bg-orange-600 text-white rounded-[2.5rem] flex items-center justify-center gap-6 hover:bg-orange-700 transition-all font-black uppercase text-sm italic col-span-3 shadow-2xl animate-pulse"
                    >
                        <CheckCircle2 className="w-10 h-10" />
                        ENTREGAR PEDIDO LISTO
                    </Button>
                )}

                <div className="col-span-3 grid grid-cols-2 gap-6 mt-10">
                    <Button onClick={() => onVoidOrder(currentOrder?.id)} variant="ghost" className="h-20 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center gap-4 hover:bg-rose-600 hover:text-white transition-all font-black uppercase text-[10px] italic shadow-sm group">
                        <ShieldAlert className="w-5 h-5" />
                        ANULAR ORDEN
                    </Button>

                    <Button onClick={onRelease} variant="ghost" className="h-20 bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center gap-4 hover:bg-slate-900 hover:text-white transition-all font-black uppercase text-[10px] italic shadow-sm group">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        FORZAR LIBERACIÓN
                    </Button>
                </div>
            </div>
        </div>
    )
}
