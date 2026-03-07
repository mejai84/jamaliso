"use client"

import { X, CheckCircle2, ArrowLeftRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, cn } from "@/lib/utils"
import { Table } from "@/app/admin/waiter/types"

interface SplitCheckModalProps {
    isOpen: boolean
    onClose: () => void
    table: Table | null
    selectedItems: { itemId: string, quantity: number }[]
    onToggleItem: (itemId: string, maxQty: number) => void
    onSplit: () => void
    submitting: boolean
}

export function SplitCheckModal({
    isOpen,
    onClose,
    table,
    selectedItems,
    onToggleItem,
    onSplit,
    submitting
}: SplitCheckModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl pointer-events-auto" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">DIVIDIR <span className="text-orange-600">CUENTA</span></h2>
                        <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1">Selecciona productos para mover</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[50vh]">
                    {(table as any)?.items?.map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => onToggleItem(item.id, item.quantity)}
                            className={cn(
                                "w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                selectedItems.some(s => s.itemId === item.id)
                                    ? "bg-orange-50 border-orange-500 shadow-md translate-x-1"
                                    : "bg-white border-slate-100 hover:border-slate-300"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm transition-all",
                                    selectedItems.some(s => s.itemId === item.id) ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    {item.quantity}x
                                </div>
                                <div className="text-left">
                                    <p className="font-black italic text-slate-900 uppercase text-xs truncate max-w-[200px]">{item.products?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{formatPrice(item.unit_price)}</p>
                                </div>
                            </div>
                            {selectedItems.some(s => s.itemId === item.id) && <CheckCircle2 className="w-6 h-6 text-orange-500" strokeWidth={3} />}
                        </button>
                    ))}
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                    <Button
                        onClick={onSplit}
                        disabled={submitting || selectedItems.length === 0}
                        className="w-full h-16 bg-slate-900 text-white font-black italic uppercase rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <ArrowLeftRight className="w-5 h-5 text-orange-500" />
                                MOVER A NUEVA CUENTA
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
