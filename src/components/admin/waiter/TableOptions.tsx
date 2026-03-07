"use client"

import { Plus, Receipt, Link2, ArrowLeftRight, Signal, CheckCircle2, X, Table as TableIcon } from "lucide-react"
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
    submitting
}: TableOptionsProps) {
    return (
        <div className="h-full flex flex-col p-4 md:p-12 items-center justify-center space-y-8 md:space-y-12 max-w-2xl mx-auto w-full animate-in zoom-in duration-300">
            <div className="text-center space-y-4">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-orange-500/10 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center border border-orange-500/20 mx-auto mb-6 md:mb-8 shadow-xl shadow-orange-500/5">
                    <TableIcon className="w-10 h-10 md:w-16 md:h-16 text-orange-500" />
                </div>
                <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-slate-900">{table.table_name}</h2>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic">MESA ACTIVA</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full">
                <Button onClick={onAddItems} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-orange-500 hover:text-white transition-all font-black uppercase text-xs italic">
                    <Plus className="w-6 h-6 mb-2 text-orange-500" />
                    ADICIONAR ITEMS
                </Button>
                <Button onClick={onBillPreview} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-slate-900 hover:text-white transition-all font-black uppercase text-xs italic">
                    <Receipt className="w-6 h-6 mb-2 text-blue-500" />
                    VER PRE-CUENTA
                </Button>
                <Button onClick={onMergeTables} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-indigo-500 hover:text-white transition-all font-black uppercase text-xs italic">
                    <Link2 className="w-6 h-6 mb-2 text-indigo-500 group-hover:text-white" />
                    UNIR MESAS
                </Button>
                <Button onClick={onSplitCheck} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-orange-600 hover:text-white transition-all font-black uppercase text-xs italic">
                    <ArrowLeftRight className="w-6 h-6 mb-2 text-orange-500" />
                    DIVIDIR CUENTA
                </Button>
                <Button onClick={onTransferItems} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-indigo-600 hover:text-white transition-all font-black uppercase text-xs italic">
                    <Signal className="w-6 h-6 mb-2 text-indigo-400" />
                    TRANSFERIR ITEMS
                </Button>
                <Button onClick={onPay} className="h-24 md:h-32 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-3xl flex flex-col hover:bg-emerald-500 hover:text-white transition-all font-black uppercase text-xs italic">
                    <Receipt className="w-6 h-6 mb-2" />
                    PAGAR CUENTA
                </Button>
                {table.active_order?.status === 'ready' && (
                    <Button
                        onClick={onDeliver}
                        disabled={submitting}
                        className="h-24 md:h-32 bg-emerald-600 border border-emerald-400 text-white rounded-3xl flex flex-col hover:bg-emerald-700 transition-all font-black uppercase text-xs italic col-span-2 shadow-lg shadow-emerald-500/20 animate-bounce"
                    >
                        <CheckCircle2 className="w-8 h-8 mb-2" />
                        ENTREGAR A CLIENTE (PEDIDO LISTO)
                    </Button>
                )}
                <Button onClick={onRelease} className="h-24 md:h-32 bg-rose-50 border border-rose-100 text-rose-500 rounded-3xl flex flex-col hover:bg-rose-500 hover:text-white transition-all font-black uppercase text-xs italic col-span-2">
                    <X className="w-6 h-6 mb-2" />
                    LIBERAR MESA
                </Button>
            </div>
        </div>
    )
}
