"use client"

import { ArrowRight, Table as TableIcon } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { Table } from "@/app/admin/waiter/types"

interface TransferItemModalProps {
    isOpen: boolean
    onClose: () => void
    table: Table | null
    allTables: Table[]
    itemToTransfer: any
    setItemToTransfer: (item: any) => void
    onTransfer: (targetTableId: string) => void
}

export function TransferItemModal({
    isOpen,
    onClose,
    table,
    allTables,
    itemToTransfer,
    setItemToTransfer,
    onTransfer
}: TransferItemModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                <div className="p-8 bg-indigo-600 text-white">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase">{itemToTransfer ? 'PASO 2: MESA DESTINO' : 'PASO 1: SELECCIONA ITEM'}</h3>
                    <p className="text-[10px] font-bold text-indigo-200 uppercase mt-1">
                        {itemToTransfer ? `¿A dónde enviamos ${itemToTransfer.products?.name}?` : '¿Qué producto quieres mover de mesa?'}
                    </p>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {!itemToTransfer ? (
                        <div className="space-y-3">
                            {(table as any)?.items?.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => setItemToTransfer(item)}
                                    className="w-full p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-black italic text-[10px]">{item.quantity}x</div>
                                        <div>
                                            <p className="font-black italic text-slate-900 uppercase text-xs">{item.products?.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400">{formatPrice(item.unit_price)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {allTables.filter(t => t.id !== table?.id).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onTransfer(t.id)}
                                    className={cn(
                                        "p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 active:scale-95",
                                        t.status === 'occupied' ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white border-slate-100 text-slate-400"
                                    )}
                                >
                                    <TableIcon className="w-6 h-6" />
                                    <span className="font-black italic uppercase text-xs">{t.table_name}</span>
                                    <span className="text-[8px] font-bold opacity-60 uppercase">{t.status === 'occupied' ? 'OCUPADA' : 'LIBRE'}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-between items-center">
                    {itemToTransfer && (
                        <button onClick={() => setItemToTransfer(null)} className="text-xs font-black uppercase text-indigo-600">VOLVER</button>
                    )}
                    <button onClick={onClose} className="text-xs font-black uppercase text-slate-400 ml-auto">CANCELAR</button>
                </div>
            </div>
        </div>
    )
}
