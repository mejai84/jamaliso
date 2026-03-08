"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Receipt, X } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface ReceiptModalProps {
    receipt: any
    onClose: () => void
    restaurant: any
}

export function ReceiptModal({ receipt, onClose, restaurant }: ReceiptModalProps) {
    if (!receipt) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-500 font-sans">
            <div className="bg-white text-slate-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] no-print border-4 border-white relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600" />

                <div className="p-8 md:p-10 text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                        <div className="relative w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900">VENTA <span className="text-orange-500">EXITOSA</span></h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 leading-none">JAMALI OS SMART TERMINAL</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 text-left space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                            <Receipt className="w-16 h-16" />
                        </div>

                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detalle de Productos</p>
                            {receipt.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-[11px] font-black uppercase tracking-tight text-slate-600">
                                    <span className="truncate mr-4">{item.qty}x {item.product.name}</span>
                                    <span className="shrink-0">{formatPrice(item.product.price * item.qty)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t-2 border-slate-200 border-dashed space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                <span>Subtotal</span>
                                <span>{formatPrice(receipt.subtotal || receipt.total)}</span>
                            </div>

                            {receipt.taxDetails?.map((tax: any, i: number) => (
                                <div key={i} className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                    <span>{tax.name} ({tax.percentage}%)</span>
                                    <span>{formatPrice(tax.amount)}</span>
                                </div>
                            ))}

                            <div className="flex justify-between items-end pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Facturado</span>
                                    <span className="text-3xl font-black italic tracking-tighter text-slate-950 leading-none">{formatPrice(receipt.total)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic bg-slate-200 px-2 py-1 rounded-md mb-1">{receipt.method}</p>
                                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">#{receipt.orderId.slice(0, 8)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => window.print()}
                            className="h-16 bg-slate-950 hover:bg-slate-900 text-white font-black italic rounded-2xl gap-3 shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                        >
                            <Receipt className="w-5 h-5 text-orange-500" /> IMPRIMIR FACTURA
                        </Button>
                        <button
                            onClick={onClose}
                            className="h-12 font-black italic rounded-xl text-slate-400 hover:text-slate-950 transition-colors uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" /> Nueva Venta
                        </button>
                    </div>
                </div>
            </div>

            {/* STRUCTURE FOR THERMAL PRINTER (80mm) */}
            <div className="ticket-thermal opacity-0 pointer-events-none absolute left-0 top-0 text-black bg-white p-4 font-mono w-[80mm] leading-tight">
                <div className="text-center space-y-1 mb-4">
                    {restaurant?.logo_url && (
                        <div className="flex justify-center mb-2">
                            <img src={restaurant.logo_url} alt="Logo" className="h-12 w-auto object-contain" />
                        </div>
                    )}
                    <h2 className="text-xl font-bold uppercase">{restaurant?.name}</h2>
                    <p className="text-[9px] font-bold uppercase">{restaurant?.address_text}</p>
                    <p className="text-[9px] font-bold">NIT/ID: {restaurant?.landing_page_config?.tax_id || '900.XXX.XXX-X'}</p>
                    <p className="text-[8px] uppercase">Régimen Común - Responsable de IVA</p>
                    <div className="border-y border-dashed border-black py-1 my-2">
                        <p className="text-[9px]">SISTEMA: JAMALI OS v2.0</p>
                        <p className="text-[9px]">FECHA: {receipt.date.toLocaleString()}</p>
                        <p className="text-[9px]">ID: {receipt.orderId}</p>
                    </div>
                </div>

                <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[10px] font-bold border-b border-black pb-1 mb-1">
                        <span>CANT / DESCRIPCIÓN</span>
                        <span>SUBTOTAL</span>
                    </div>
                    {receipt.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-[10px]">
                            <span className="italic">{item.qty}x {item.product.name.slice(0, 20)}</span>
                            <span>{formatPrice(item.product.price * item.qty)}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t border-dashed border-black pt-2 space-y-1 mb-4">
                    <div className="flex justify-between text-[10px]">
                        <span>SUBTOTAL NETO</span>
                        <span>{formatPrice(receipt.subtotal || receipt.total)}</span>
                    </div>
                    {receipt.taxDetails?.map((tax: any, i: number) => (
                        <div key={i} className="flex justify-between text-[10px]">
                            <span>{tax.name} ({tax.percentage}%)</span>
                            <span>{formatPrice(tax.amount)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-black">
                        <span>TOTAL A PAGAR</span>
                        <span>{formatPrice(receipt.total)}</span>
                    </div>
                </div>

                <div className="text-[9px] text-center space-y-1 pt-4 border-t border-dashed border-black italic">
                    <p>MÉTODO DE PAGO: {receipt.method.toUpperCase()}</p>
                    <p className="font-bold">¡GRACIAS POR PREFERIRNOS!</p>
                    <div className="pt-2">
                        <p>Desarrollado por Jaime Jaramillo</p>
                        <p>Propiedad Intelectual JAMALI OS © 2026</p>
                        <p>www.jamali-os.com</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    @page { margin: 0; }
                    body * { visibility: hidden; }
                    .no-print { display: none !important; }
                    .ticket-thermal, .ticket-thermal * {
                        visibility: visible !important;
                    }
                    .ticket-thermal { 
                        opacity: 1 !important;
                        position: fixed !important; 
                        left: 0 !important; 
                        top: 0 !important;
                        width: 80mm !important;
                        background: white !important;
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}
