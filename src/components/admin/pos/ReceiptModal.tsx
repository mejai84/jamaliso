"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Receipt, X } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface ReceiptModalProps {
    receipt: any
    onClose: () => void
    restaurantName: string | undefined
}

export function ReceiptModal({ receipt, onClose, restaurantName }: ReceiptModalProps) {
    if (!receipt) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500 font-sans">
            <div className="bg-white text-slate-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] no-print border-4 border-white">
                <div className="p-8 md:p-10 text-center space-y-8">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                        <div className="relative w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900">¡VENTA <span className="text-emerald-600">EXITOSA</span>!</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 leading-none">TRANSACCIÓN PROCESADA CORRECTAMENTE</p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 text-left space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                            <Receipt className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resumen de Cuenta</p>
                            {receipt.items.map((item: any) => (
                                <div key={item.product.id} className="flex justify-between text-[11px] font-black uppercase tracking-tight text-slate-600">
                                    <span className="truncate mr-4">{item.qty}x {item.product.name}</span>
                                    <span className="shrink-0">{formatPrice(item.product.price * item.qty)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t-2 border-slate-200 border-dashed flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Recaudado</span>
                                <span className="text-2xl font-black italic tracking-tighter text-slate-900">{formatPrice(receipt.total)}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Orden #{receipt.orderId.slice(0, 8)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={() => window.print()}
                            className="h-16 bg-slate-950 hover:bg-slate-900 text-white font-black italic rounded-2xl gap-3 shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                        >
                            <Receipt className="w-5 h-5 text-orange-500" /> IMPRIMIR TICKET
                        </Button>
                        <button
                            onClick={onClose}
                            className="h-14 font-black italic rounded-xl text-slate-400 hover:text-slate-900 transition-colors uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" /> Finalizar y Nueva Venta
                        </button>
                    </div>
                </div>
            </div>

            {/* STRUCTURE FOR THERMAL PRINTER (Hidden on screen via CSS) */}
            <div className="ticket-thermal opacity-0 pointer-events-none absolute left-0 top-0">
                <div className="ticket-header text-center space-y-2">
                    <h2 className="text-xl font-bold">{restaurantName}</h2>
                    <p className="text-xs">JAMALI OS SMART TERMINAL</p>
                    <p className="text-xs">{receipt.date.toLocaleString()}</p>
                    <p className="text-xs">Orden: #{receipt.orderId.slice(0, 12)}</p>
                </div>

                <div className="ticket-body my-4 space-y-1">
                    {receipt.items.map((item: any) => (
                        <div key={item.product.id} className="ticket-item flex justify-between text-xs">
                            <span>{item.qty}x {item.product.name}</span>
                            <span>{formatPrice(item.product.price * item.qty)}</span>
                        </div>
                    ))}
                </div>

                <div className="ticket-total border-t border-black pt-2 flex justify-between font-bold">
                    <span>TOTAL</span>
                    <span>{formatPrice(receipt.total)}</span>
                </div>

                <div className="ticket-footer mt-4 text-center text-xs space-y-1">
                    <p>¡GRACIAS POR SU COMPRA!</p>
                    <p>Powered by JAMALI OS</p>
                    <p>www.jamalios.com</p>
                </div>
            </div>
            <style jsx>{`
                @media print {
                    .no-print { display: none; }
                    .ticket-thermal { 
                        opacity: 1; 
                        position: static;
                        width: 80mm;
                        padding: 10px;
                    }
                }
            `}</style>
        </div>
    )
}
