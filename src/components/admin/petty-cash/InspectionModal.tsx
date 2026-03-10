"use client"

import { X, ShieldCheck, FileText, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PettyCashVoucher } from "@/app/admin/petty-cash/types"

interface InspectionModalProps {
    isOpen: boolean
    onClose: () => void
    voucher: PettyCashVoucher | null
    onPrint: (v: PettyCashVoucher) => void
}

export function InspectionModal({ isOpen, onClose, voucher, onPrint }: InspectionModalProps) {
    if (!isOpen || !voucher) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-white/20 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-3xl w-full max-w-2xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-2 border-slate-100 overflow-hidden flex flex-col max-h-[95vh] outline-none">
                <div className="p-10 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-6 h-6 text-orange-600" />
                        <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Auditoría <span className="text-orange-600">Visual</span></h2>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 text-slate-300 hover:bg-slate-900 hover:text-white transition-all border-2 border-slate-50" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-white/20">
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-slate-50 relative text-slate-900 font-mono">
                        <div className="text-center border-b-2 border-slate-100 pb-8 mb-8">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">JAMALI OS INTELLIGENCE</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Financial Controller v3.0</p>
                        </div>

                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300">PROTOCOLO DE EGRESO</p>
                                <p className="text-2xl font-black italic"># P-{String(voucher.voucher_number).padStart(5, '0')}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-slate-300">CRONOLOGÍA</p>
                                <p className="text-lg font-black">{voucher.date}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300">PAGADO A:</p>
                                    <p className="text-lg font-black uppercase italic leading-tight">{voucher.beneficiary_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300">ROL/CARGO:</p>
                                    <p className="text-lg font-black uppercase italic">{voucher.cargo || 'EXTERNO'}</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t-2 border-slate-50 space-y-1">
                                <p className="text-[10px] font-black text-slate-300">VALOR NETO:</p>
                                <p className="text-4xl font-black italic text-orange-600">${voucher.amount.toLocaleString('es-CO')}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300">VALOR EN LETRAS:</p>
                                <p className="text-[11px] font-black uppercase leading-relaxed text-slate-400">{voucher.amount_in_words}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300">NATURALEZA DEL GASTO:</p>
                                <p className="text-[11px] font-black uppercase leading-relaxed text-slate-400">"{voucher.concept}"</p>
                            </div>
                        </div>

                        <div className="mt-16 pt-8 border-t-2 border-dashed border-slate-100 flex flex-col items-center">
                            {voucher.signature_data ? (
                                <img src={voucher.signature_data} alt="Firma" className="h-24 w-auto mb-4 mix-blend-multiply opacity-80" />
                            ) : (
                                <div className="h-24 w-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50 mb-4">
                                    <p className="text-[10px] font-black text-slate-200 italic">SIN FIRMA_REGISTRO</p>
                                </div>
                            )}
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Identificación de Conformidad</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 h-18 bg-white border-2 border-slate-100 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 transition-all">
                            <Download className="w-5 h-5" /> EXPORTAR PDF
                        </Button>
                        <Button onClick={() => onPrint(voucher)} className="flex-1 h-18 bg-slate-900 text-white hover:bg-orange-600 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 transition-all border-none shadow-2xl">
                            <Printer className="w-5 h-5" /> IMPRIMIR TICKET
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
