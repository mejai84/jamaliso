"use client"

import { Button } from "@/components/ui/button"
import { Eye, Printer, ShieldCheck } from "lucide-react"
import { PettyCashVoucher } from "@/app/admin/petty-cash/types"

interface VoucherTableProps {
    vouchers: PettyCashVoucher[]
    onPreview: (v: PettyCashVoucher) => void
    onPrint: (v: PettyCashVoucher) => void
}

export function VoucherTable({ vouchers, onPreview, onPrint }: VoucherTableProps) {
    return (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic border-b-2 border-slate-50">
                        <th className="px-10 py-6 bg-slate-50/50">Protocolo ID</th>
                        <th className="px-10 py-6 bg-slate-50/50">Cronología</th>
                        <th className="px-10 py-6 bg-slate-50/50">Entidad Receptora</th>
                        <th className="px-10 py-6 bg-slate-50/50">Naturaleza Operativa</th>
                        <th className="px-10 py-6 bg-slate-50/50 text-right">Impacto Neto</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                    {vouchers.map((voucher) => (
                        <tr key={voucher.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                            <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500/20 group-hover:bg-orange-600 transition-colors" />
                                    <span className="font-mono text-orange-600 font-black italic text-sm tracking-tighter">
                                        P-{String(voucher.voucher_number).padStart(5, '0')}
                                    </span>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest leading-none">
                                    {voucher.date}
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="space-y-1">
                                    <div className="font-black text-slate-900 uppercase italic text-base tracking-tighter group-hover:text-orange-600 transition-colors leading-none">{voucher.beneficiary_name}</div>
                                    <div className="text-[9px] text-slate-400 font-black tracking-[0.3em] uppercase italic">{voucher.cargo || 'EXTERNO'}</div>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="space-y-3">
                                    <div className="max-w-[300px] truncate text-[11px] font-black text-slate-500 italic uppercase tracking-tight">"{voucher.concept}"</div>
                                    <span className="inline-flex items-center px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-[8px] font-black text-slate-600 italic uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                                        {voucher.category || 'VARIOS'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                                <div className="flex justify-end gap-6 items-center">
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl shadow-sm border border-slate-100"
                                            onClick={() => onPreview(voucher)}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-orange-600 hover:bg-orange-600 hover:text-white rounded-xl shadow-sm border border-slate-100"
                                            onClick={() => onPrint(voucher)}
                                        >
                                            <Printer className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <div className="py-4 px-8 bg-white text-rose-600 rounded-[2rem] font-black border-2 border-slate-100 italic text-2xl tracking-tighter shadow-sm group-hover:border-rose-100 transition-all min-w-[180px] text-center">
                                        -${voucher.amount.toLocaleString('es-CO')}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {vouchers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-10 py-48 text-center bg-slate-50/20">
                                <div className="flex flex-col items-center justify-center gap-6 opacity-40">
                                    <ShieldCheck className="w-24 h-24 text-slate-200" />
                                    <p className="italic text-xs uppercase font-black tracking-[0.5em] text-slate-400">Integridad de Bóveda: Sin movimientos</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
