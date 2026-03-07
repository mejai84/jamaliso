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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-slate-950/40 w-full max-w-2xl rounded-[4rem] shadow-3xl border border-white/5 overflow-hidden flex flex-col max-h-[95vh] outline-none">
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Auditoría <span className="text-orange-500">Visual</span></h2>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 text-slate-500 hover:bg-white/5 hover:text-white" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-white/[0.01]">
                    <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl relative text-black font-mono">
                        <div className="text-center border-b-2 border-black/10 pb-8 mb-8">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">JAMALI OS INTELLIGENCE</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Financial Controller v3.0</p>
                        </div>

                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black opacity-30">PROTOCOLO DE EGRESO</p>
                                <p className="text-2xl font-black italic"># P-{String(voucher.voucher_number).padStart(5, '0')}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black opacity-30">CRONOLOGÍA</p>
                                <p className="text-lg font-black">{voucher.date}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black opacity-30">PAGADO A:</p>
                                    <p className="text-lg font-black uppercase italic leading-tight">{voucher.beneficiary_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black opacity-30">ROL/CARGO:</p>
                                    <p className="text-lg font-black uppercase italic">{voucher.cargo || 'EXTERNO'}</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-black/5 space-y-1">
                                <p className="text-[10px] font-black opacity-30">VALOR NETO:</p>
                                <p className="text-4xl font-black italic text-orange-600">${voucher.amount.toLocaleString('es-CO')}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black opacity-30">VALOR EN LETRAS:</p>
                                <p className="text-[11px] font-black uppercase leading-relaxed">{voucher.amount_in_words}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black opacity-30">NATURALEZA DEL GASTO:</p>
                                <p className="text-[11px] font-black uppercase leading-relaxed">"{voucher.concept}"</p>
                            </div>
                        </div>

                        <div className="mt-16 pt-8 border-t-2 border-dashed border-black/10 flex flex-col items-center">
                            {voucher.signature_data ? (
                                <img src={voucher.signature_data} alt="Firma" className="h-24 w-auto mb-4 mix-blend-multiply opacity-80" />
                            ) : (
                                <div className="h-24 w-full flex items-center justify-center border border-black/5 rounded-xl bg-black/[0.02] mb-4">
                                    <p className="text-[10px] font-black opacity-20 italic">SIN FIRMA_REGISTRO</p>
                                </div>
                            )}
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Identificación de Conformidad</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button className="flex-1 h-18 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 transition-all border border-white/5">
                            <Download className="w-5 h-5" /> EXPORTAR PDF
                        </Button>
                        <Button onClick={() => onPrint(voucher)} className="flex-1 h-18 bg-orange-600 text-black hover:bg-orange-500 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-3 transition-all border-none shadow-xl shadow-orange-500/10">
                            <Printer className="w-5 h-5" /> IMPRIMIR TICKET
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
