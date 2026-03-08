"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, X, Printer, User, PenTool } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface VoucherModalProps {
    data: {
        id: string
        type: 'DEPOSIT' | 'WITHDRAWAL' | 'PETTY_CASH'
        amount: number
        description: string
        date: Date
        user: string
    } | null
    onClose: () => void
    restaurant: any
}

export function VoucherModal({ data, onClose, restaurant }: VoucherModalProps) {
    if (!data) return null

    const isExpense = data.type === 'WITHDRAWAL' || data.type === 'PETTY_CASH'
    const title = data.type === 'PETTY_CASH' ? 'TRASLADO CAJA MENOR' : (isExpense ? 'COMPROBANTE DE EGRESO' : 'COMPROBANTE DE INGRESO')
    const colorClass = isExpense ? 'text-rose-500' : 'text-emerald-500'
    const bgClass = isExpense ? 'bg-rose-500' : 'bg-emerald-500'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500 font-sans">
            <div className="bg-white text-slate-900 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] no-print border-4 border-white relative">
                <div className={`absolute top-0 left-0 w-full h-3 ${bgClass}`} />

                <div className="p-10 md:p-14 text-center space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="text-left space-y-1">
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-950">
                                {data.type === 'PETTY_CASH' ? 'CAJA' : (isExpense ? 'EGRESO' : 'INGRESO')} <span className={colorClass}>EXITOSO</span>
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">JAMALI OS FINANCIAL KERNEL</p>
                        </div>
                        <div className={`w-16 h-16 rounded-2xl ${bgClass} text-white flex items-center justify-center shadow-2xl`}>
                            <FileText className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 text-left space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                            <FileText className="w-24 h-24" />
                        </div>

                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Número de Folio</p>
                                <p className="text-xl font-black italic text-slate-950">#{data.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</p>
                                <p className="text-[11px] font-black italic text-slate-600 uppercase">{data.date.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-2 relative z-10 pt-4 border-t border-slate-200 border-dashed">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Concepto / Justificación</p>
                            <p className="text-lg font-black italic text-slate-900 uppercase leading-snug tracking-tight">
                                {data.description || 'SIN DESCRIPCIÓN PROTOCALARIA'}
                            </p>
                        </div>

                        <div className="pt-6 border-t-2 border-slate-200 border-dashed flex justify-between items-end relative z-10">
                            <div className="flex flex-col">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Valor {isExpense ? 'Retirado' : 'Ingresado'}</p>
                                <p className={`text-4xl font-black italic tracking-tighter ${isExpense ? 'text-rose-600' : 'text-emerald-600'} leading-none`}>
                                    {isExpense ? '-' : '+'}{formatPrice(data.amount)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Autorizado por</p>
                                <p className="text-[10px] font-black text-slate-950 uppercase tracking-tight flex items-center gap-2 justify-end">
                                    <User className="w-3 h-3 text-orange-500" /> {data.user}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={() => window.print()}
                            className="h-16 bg-slate-950 hover:bg-slate-900 text-white font-black italic rounded-2xl gap-3 shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                        >
                            <Printer className="w-5 h-5 text-orange-500" /> IMPRIMIR COMPROBANTE
                        </Button>
                        <button
                            onClick={onClose}
                            className="h-12 font-black italic rounded-xl text-slate-400 hover:text-slate-950 transition-colors uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" /> Finalizar y Continuar
                        </button>
                    </div>
                </div>
            </div>

            {/* PRINT TEMPLATE (Professional Voucher) */}
            <div className="voucher-print opacity-0 pointer-events-none absolute left-0 top-0 text-black bg-white p-8 font-serif w-[210mm] min-h-[148mm] border-2 border-black">
                <div className="flex justify-between items-start border-b-2 border-black pb-4">
                    <div className="flex gap-6 items-start">
                        {restaurant?.logo_url && (
                            <img src={restaurant.logo_url} alt="Logo" className="h-16 w-auto object-contain grayscale" />
                        )}
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold uppercase">{restaurant?.name}</h1>
                            <p className="text-[9px] uppercase font-bold tracking-widest">{restaurant?.address_text}</p>
                            <p className="text-[9px] uppercase font-bold tracking-widest">NIT/ID: {restaurant?.landing_page_config?.tax_id || '900.XXX.XXX-X'}</p>
                            <p className="text-sm font-bold italic text-slate-700 mt-2">{title}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="border border-black p-2 mb-2">
                            <p className="text-[10px] font-bold uppercase">NÚMERO DE COMPROBANTE</p>
                            <p className="text-xl font-bold">#{data.id.slice(0, 10).toUpperCase()}</p>
                        </div>
                        <p className="text-[10px]">{data.date.toLocaleString()}</p>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6">
                    <div className="flex border-b border-dotted border-black pb-2">
                        <span className="text-xs font-bold uppercase w-48">Entregado a / Recibido de:</span>
                        <span className="text-sm border-b border-black flex-1 italic">{data.type === 'PETTY_CASH' ? 'FONDO DE CAJA MENOR' : '__________________________________________________'}</span>
                    </div>
                    <div className="flex border-b border-dotted border-black pb-2">
                        <span className="text-xs font-bold uppercase w-48">La Suma de:</span>
                        <span className="text-lg font-bold flex-1">{formatPrice(data.amount)}</span>
                    </div>
                    <div className="flex border-b border-dotted border-black pb-2">
                        <span className="text-xs font-bold uppercase w-48">Por concepto de:</span>
                        <span className="text-sm italic flex-1 uppercase">{data.description || 'MOVIMIENTO DE CAJA'}</span>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-2 gap-20">
                    <div className="space-y-4">
                        <div className="border-t border-black pt-2 text-center">
                            <p className="text-[10px] font-bold uppercase">ENTREGUÉ CONFORME</p>
                            <p className="text-[8px] italic mt-4">{data.user}</p>
                            <p className="text-[8px] uppercase tracking-widest mt-1 opacity-50">RESPONSABLE DE CAJA</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="border-t border-black pt-2 text-center">
                            <p className="text-[10px] font-bold uppercase">RECIBÍ CONFORME</p>
                            <div className="h-10 mt-2 flex items-center justify-center">
                                <PenTool className="w-6 h-6 opacity-10" />
                            </div>
                            <p className="text-[8px] uppercase tracking-widest mt-1 opacity-50 font-bold italic">FIRMA Y CÉDULA / NIT</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-4 border-t border-black flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[8px] font-bold uppercase">JAMALI OS FINANCIAL KERNEL v2.0</p>
                        <p className="text-[8px] italic">Este documento es un soporte interno de contabilidad.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold">Powered by JAMALI OS</p>
                        <p className="text-[8px] italic">www.jamali-os.com</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    @page { margin: 10mm; size: half-letter; }
                    body * { visibility: hidden; }
                    .no-print { display: none !important; }
                    .voucher-print, .voucher-print * {
                        visibility: visible !important;
                    }
                    .voucher-print { 
                        opacity: 1 !important;
                        position: fixed !important; 
                        left: 0 !important; 
                        top: 0 !important;
                        width: 210mm !important;
                        background: white !important;
                        z-index: 9999;
                    }
                }
            `}</style>
        </div>
    )
}
