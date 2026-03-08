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
            <div className="grid grid-cols-2 gap-6 md:gap-8 w-full">
                <Button onClick={onAddItems} className="h-40 md:h-48 bg-white border-2 border-slate-100 text-slate-900 rounded-[3rem] flex flex-col hover:border-slate-900 hover:shadow-2xl transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.08] group-hover:scale-125 transition-all">
                        <Plus className="w-24 h-24" />
                    </div>
                    <div className="w-14 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                        <Plus className="w-7 h-7" />
                    </div>
                    <span className="group-hover:text-orange-600 transition-colors">ADICIONAR ITEMS</span>
                </Button>

                <Button onClick={onBillPreview} className="h-40 md:h-48 bg-white border-2 border-slate-100 text-slate-900 rounded-[3rem] flex flex-col hover:border-slate-900 hover:shadow-2xl transition-all font-black uppercase text-xs italic group relative overflow-hidden active:scale-95 shadow-sm">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.08] group-hover:scale-125 transition-all">
                        <Receipt className="w-24 h-24" />
                    </div>
                    <div className="w-14 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                        <Receipt className="w-7 h-7" />
                    </div>
                    <span className="group-hover:text-orange-600 transition-colors">VER PRE-CUENTA</span>
                </Button>

                <Button onClick={onMergeTables} className="h-32 md:h-40 bg-white border-2 border-slate-100 text-slate-900 rounded-[2.5rem] flex flex-col hover:border-slate-900 hover:shadow-2xl transition-all font-black uppercase text-[10px] md:text-xs italic group active:scale-95 shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                        <Link2 className="w-6 h-6" />
                    </div>
                    <span>UNIR MESAS</span>
                </Button>

                <Button onClick={onSplitCheck} className="h-32 md:h-40 bg-white border-2 border-slate-100 text-slate-900 rounded-[2.5rem] flex flex-col hover:border-slate-900 hover:shadow-2xl transition-all font-black uppercase text-[10px] md:text-xs italic group active:scale-95 shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-400 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all">
                        <ArrowLeftRight className="w-6 h-6" />
                    </div>
                    <span>DIVIDIR CUENTA</span>
                </Button>

                <Button onClick={onTransferItems} className="h-32 md:h-40 bg-white border-2 border-slate-100 text-slate-900 rounded-[2.5rem] flex flex-col hover:border-slate-900 hover:shadow-2xl transition-all font-black uppercase text-[10px] md:text-xs italic group active:scale-95 shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-400 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all">
                        <Signal className="w-6 h-6" />
                    </div>
                    <span>TRANSFERIR ITEMS</span>
                </Button>

                <Button onClick={onPay} className="h-32 md:h-40 bg-white border-2 border-slate-100 text-slate-900 rounded-[2.5rem] flex flex-col hover:border-emerald-600 hover:shadow-emerald-500/10 hover:shadow-2xl transition-all font-black uppercase text-[10px] md:text-xs italic group active:scale-95 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 border-2 border-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <span>IR A PAGAR</span>
                </Button>

                {table.active_order?.status === 'ready' && (
                    <Button
                        onClick={onDeliver}
                        disabled={submitting}
                        className="h-28 md:h-32 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center gap-4 hover:bg-emerald-700 transition-all font-black uppercase text-xs italic col-span-2 shadow-xl shadow-emerald-500/20 active:scale-95 animate-pulse"
                    >
                        <CheckCircle2 className="w-8 h-8" />
                        ENTREGAR PEDIDO LISTO
                    </Button>
                )}

                <Button onClick={onRelease} className="h-16 md:h-20 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center gap-4 hover:bg-rose-600 hover:text-white transition-all font-black uppercase text-[10px] italic col-span-2 shadow-sm group">
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    LIBERAR MESA
                </Button>
            </div>
        </div>
    )
}
