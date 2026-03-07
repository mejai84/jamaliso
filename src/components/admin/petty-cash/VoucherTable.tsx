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
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic border-b border-white/5">
                        <th className="px-10 py-6 bg-white/[0.02]">Protocolo ID</th>
                        <th className="px-10 py-6 bg-white/[0.02]">Cronología</th>
                        <th className="px-10 py-6 bg-white/[0.02]">Entidad Receptora</th>
                        <th className="px-10 py-6 bg-white/[0.02]">Naturaleza Operativa</th>
                        <th className="px-10 py-6 bg-white/[0.02] text-right">Impacto Neto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {vouchers.map((voucher) => (
                        <tr key={voucher.id} className="hover:bg-white/[0.03] transition-all duration-300 group border-b border-white/5">
                            <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500/40 group-hover:bg-orange-500 transition-colors animate-pulse" />
                                    <span className="font-mono text-orange-500 font-black italic text-sm tracking-tighter">
                                        P-{String(voucher.voucher_number).padStart(5, '0')}
                                    </span>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="text-xs font-black text-muted-foreground italic uppercase tracking-tighter opacity-70">
                                    {voucher.date}
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="space-y-1">
                                    <div className="font-black text-white uppercase italic text-base tracking-tighter group-hover:text-orange-500 transition-colors">{voucher.beneficiary_name}</div>
                                    <div className="text-[9px] text-slate-500 font-black tracking-[0.3em] uppercase italic">{voucher.cargo || 'EXTERNO'}</div>
                                </div>
                            </td>
                            <td className="px-10 py-8">
                                <div className="space-y-2">
                                    <div className="max-w-[300px] truncate text-xs font-bold text-slate-400 italic uppercase tracking-tighter">"{voucher.concept}"</div>
                                    <span className="inline-flex items-center px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-black text-orange-500 italic uppercase tracking-widest">
                                        {voucher.category || 'VARIOS'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                                <div className="flex justify-end gap-3 items-center">
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl"
                                            onClick={() => onPreview(voucher)}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 text-primary hover:bg-primary hover:text-background rounded-xl"
                                            onClick={() => onPrint(voucher)}
                                        >
                                            <Printer className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <div className="py-3 px-6 bg-rose-500/5 text-rose-500 rounded-[1.5rem] font-black border border-rose-500/10 italic text-xl tracking-tighter shadow-inner min-w-[150px] text-center">
                                        -${voucher.amount.toLocaleString('es-CO')}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {vouchers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-10 py-32 text-center">
                                <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                                    <ShieldCheck className="w-20 h-20 text-muted-foreground" />
                                    <p className="italic text-base uppercase font-black tracking-[0.4em]">Integridad de Bóveda: Sin movimientos</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
