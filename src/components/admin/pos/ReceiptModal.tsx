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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
            <div className="bg-white text-slate-900 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl no-print">
                <div className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">¡VENTA EXITOSA!</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 leading-none">ORDEN #{receipt.orderId.slice(0, 8)}</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-left space-y-3">
                        {receipt.items.map((item: any) => (
                            <div key={item.product.id} className="flex justify-between text-xs font-bold uppercase">
                                <span>{item.qty}x {item.product.name}</span>
                                <span>{formatPrice(item.product.price * item.qty)}</span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-lg">
                            <span>TOTAL</span>
                            <span>{formatPrice(receipt.total)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => window.print()}
                            className="h-14 bg-slate-900 hover:bg-slate-800 text-white font-black italic rounded-xl gap-3"
                        >
                            <Receipt className="w-5 h-5" /> IMPRIMIR RECIBO
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="h-14 font-black italic rounded-xl text-slate-400 hover:text-slate-900"
                        >
                            NUEVA VENTA
                        </Button>
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
