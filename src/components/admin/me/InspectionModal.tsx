"use client"

import { Wallet, X, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { TipOrder } from "@/app/admin/me/types"

interface InspectionModalProps {
    recentTips: TipOrder[]
    totalTips: number
    onClose: () => void
}

export function InspectionModal({ recentTips, totalTips, onClose }: InspectionModalProps) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-2xl animate-in fade-in duration-500 font-sans">
            <div className="bg-card w-full max-w-xl rounded-[4rem] shadow-[0_0_150px_rgba(0,0,0,0.5)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh] outline-none">
                <div className="px-12 py-10 border-b border-border/50 flex justify-between items-center bg-muted/20 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl shadow-inner border border-emerald-500/20">
                            <Wallet className="w-8 h-8 text-emerald-500 shadow-emerald-500/20 shadow-lg" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black italic uppercase text-foreground leading-none tracking-tighter">Historial de <span className="text-emerald-500">Capital</span></h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.5em] italic opacity-60">Revenue Audit v2.4</p>
                        </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={onClose} className="rounded-2xl h-14 w-14 hover:bg-muted active:scale-90 transition-all border border-transparent hover:border-border">
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <div className="p-12 space-y-6 overflow-y-auto custom-scrollbar relative z-10">
                    {recentTips.length > 0 ? recentTips.map((tip) => (
                        <div key={tip.id} className="flex items-center justify-between p-8 bg-muted/40 rounded-[2.5rem] border border-border/50 group/tip hover:border-emerald-500/30 hover:bg-card transition-all duration-300 shadow-sm relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500/20 group-hover/tip:bg-emerald-500 transition-colors" />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ORDEN #{tip.id.substring(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs font-black text-foreground italic uppercase tracking-widest">{new Date(tip.created_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">ACCESIÓN</p>
                                <p className="text-3xl font-black italic text-emerald-500 tracking-tighter drop-shadow-sm group-hover/tip:scale-110 transition-transform origin-right leading-none">+{formatPrice(tip.tip_amount)}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 opacity-10 space-y-6">
                            <Wallet className="w-32 h-32 mx-auto" />
                            <p className="text-xl font-black uppercase italic tracking-[0.5em]">Lote Transaccional Vacío</p>
                        </div>
                    )}
                </div>

                <div className="p-10 bg-muted/20 border-t border-border mt-auto">
                    <div className="flex justify-between items-center bg-emerald-500/5 p-8 rounded-[3rem] border border-emerald-500/20 relative group/total">
                        <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover/total:opacity-[0.03] transition-opacity" />
                        <div className="space-y-1">
                            <span className="font-black italic uppercase text-[10px] tracking-[0.5em] text-emerald-800 opacity-60">BALANCE ACUMULADO</span>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-11px font-black uppercase text-emerald-800 italic opacity-40">CARTERA OPERATIVA VIGENTE</span>
                            </div>
                        </div>
                        <span className="text-5xl font-black italic text-emerald-500 tracking-tighter leading-none group-hover:scale-110 transition-transform">{formatPrice(totalTips)}</span>
                    </div>
                    <Button onClick={onClose} className="w-full mt-8 h-20 bg-foreground text-background rounded-3xl font-black uppercase italic tracking-[0.3em] text-base shadow-3xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 group">
                        ENTENDIDO / CERRAR AUDITORÍA <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
