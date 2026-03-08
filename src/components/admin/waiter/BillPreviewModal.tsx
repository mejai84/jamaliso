"use client"

import { Receipt, X, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { Table } from "@/app/admin/waiter/types"
import { generatePreBillPDF } from "@/lib/pdf-generator"

interface BillPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    table: Table | null
    restaurant: any
}

export function BillPreviewModal({
    isOpen,
    onClose,
    table,
    restaurant
}: BillPreviewModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-10 border-b border-slate-100 text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">{restaurant?.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Pre-Cuenta / Borrador</p>
                </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-6 font-mono text-xs text-slate-600">
                    <div className="border-b border-dashed border-slate-200 pb-4 space-y-2">
                        <p className="flex justify-between uppercase"><span>Mesa</span> <span>{table?.table_name}</span></p>
                        <p className="flex justify-between uppercase"><span>Fecha</span> <span>{new Date().toLocaleDateString()}</span></p>
                    </div>
                    <div className="space-y-4">
                        {(table as any)?.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between gap-4">
                                <span className="shrink-0">{item.quantity}x</span>
                                <span className="flex-1 uppercase">{item.products?.name}</span>
                                <span className="shrink-0">{formatPrice(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-4 space-y-2 text-sm font-black">
                        <p className="flex justify-between"><span>SUBTOTAL</span> <span>{formatPrice(table?.active_order?.total || 0)}</span></p>
                        <p className="text-[9px] text-slate-400 italic font-normal text-center mt-6 uppercase">Este documento no es una factura válida.</p>
                    </div>
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <Button onClick={onClose} className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl">CERRAR</Button>
                    <button
                        onClick={() => generatePreBillPDF(restaurant, table)}
                        className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-colors shadow-lg"
                        title="Descargar PDF"
                    >
                        <FileDown className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
