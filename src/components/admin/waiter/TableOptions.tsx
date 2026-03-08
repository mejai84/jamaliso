"use client"

import { Plus, Receipt, Link2, ArrowLeftRight, Signal, CheckCircle2, X, Table as TableIcon, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table as TableType } from "@/app/admin/waiter/types"

interface TableOptionsProps {
    table: TableType
    onAddItems: () => void
    onBillPreview: () => void
    onMergeTables: () => void
    onSplitCheck: () => void
    onTransferItems: () => void
    onPay: () => void
    onDeliver: () => void
    onRelease: () => void
    onVoidOrder: () => void
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
    submitting
}: TableOptionsProps) {
    return (
        <div className="min-h-full flex flex-col p-4 md:p-12 items-center justify-start py-12 md:py-24 space-y-8 md:space-y-12 max-w-4xl mx-auto w-full animate-in zoom-in duration-500">
            <div className="text-center space-y-6 relative">
                {/* Decorative Elements */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/20 blur-[80px] rounded-full -z-10" />

                <div className="w-24 h-24 md:w-36 md:h-36 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] md:rounded-[4rem] flex items-center justify-center border-4 border-white shadow-2xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <TableIcon className="w-10 h-10 md:w-16 md:h-16 text-orange-500" />
                </div>
                <div>
                    <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{table.table_name}</h2>
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <span className="px-4 py-1.5 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                            Mesa Ocupada
                        </span>
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                            Consumo: ${table.active_order?.total?.toLocaleString() || '0'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
                {/* ACCIONES PRINCIPALES */}
                <Button onClick={onAddItems} className="h-44 md:h-56 bg-slate-900 text-white rounded-[3rem] flex flex-col hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-500/20 transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-xl col-span-2 md:col-span-1">
                    <Plus className="w-10 h-10 mb-4 group-hover:rotate-90 transition-transform" />
                    <span>Adicionar</span>
                    <span className="text-[10px] opacity-50 mt-1">Nuevos Pedidos</span>
                </Button>

                <Button onClick={onBillPreview} className="h-44 md:h-56 bg-white border-2 border-slate-100 text-slate-900 rounded-[3rem] flex flex-col hover:border-slate-900 hover:shadow-2xl transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-sm">
                    <Receipt className="w-10 h-10 mb-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    <span>Ver Pre-Cuenta</span>
                    <span className="text-[10px] text-slate-400 mt-1">Ticket Borrador</span>
                </Button>

                <Button onClick={onPay} className="h-44 md:h-56 bg-emerald-500 text-white rounded-[3rem] flex flex-col hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-xl">
                    <Signal className="w-10 h-10 mb-4 animate-bounce" />
                    <span className="text-center">Notificar Cobro</span>
                    <span className="text-[9px] opacity-70 mt-1">Enviar a Caja</span>
                </Button>

                {/* ACCIONES DE GESTIÓN */}
                <Button onClick={onSplitCheck} className="h-32 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-all font-black uppercase text-[10px] italic group active:scale-95">
                    <ArrowLeftRight className="w-6 h-6 mb-2 text-amber-500" />
                    <span>Dividir Cuenta</span>
                </Button>

                <Button onClick={onMergeTables} className="h-32 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-all font-black uppercase text-[10px] italic group active:scale-95">
                    <Link2 className="w-6 h-6 mb-2 text-indigo-500" />
                    <span>Unir Mesas</span>
                </Button>

                <Button onClick={onTransferItems} className="h-32 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] flex flex-col items-center justify-center hover:border-sky-500 hover:bg-sky-50 transition-all font-black uppercase text-[10px] italic group active:scale-95">
                    <ArrowLeftRight className="w-6 h-6 mb-2 text-sky-500" />
                    <span>Transferir</span>
                </Button>

                {table.active_order?.status === 'ready' && (
                    <Button
                        onClick={onDeliver}
                        disabled={submitting}
                        className="h-24 bg-orange-600 text-white rounded-[2rem] flex items-center justify-center gap-4 hover:bg-orange-700 transition-all font-black uppercase text-xs italic col-span-3 shadow-xl animate-pulse"
                    >
                        <CheckCircle2 className="w-8 h-8" />
                        ENTREGAR PEDIDO LISTO
                    </Button>
                )}

                <div className="col-span-3 grid grid-cols-2 gap-4 mt-6">
                    <Button onClick={onVoidOrder} variant="ghost" className="h-16 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center gap-4 hover:bg-rose-600 hover:text-white transition-all font-black uppercase text-[10px] italic shadow-sm group">
                        <ShieldAlert className="w-4 h-4" />
                        ANULAR ORDEN COMPLETA
                    </Button>

                    <Button onClick={onRelease} variant="ghost" className="h-16 bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-600 hover:text-white transition-all font-black uppercase text-[10px] italic shadow-sm group">
                        <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        FORZAR LIBERACIÓN (SUPERVISOR)
                    </Button>
                </div>
            </div>
        </div>
    )
}
