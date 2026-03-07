"use client"

import { useState } from "react"
import { X, Plus, Minus, HandCoins, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MovementModalProps {
    isOpen: boolean
    type: 'income' | 'expense' | 'petty-cash-transfer' | null
    onSubmit: (amount: number, reason: string) => Promise<void>
    onClose: () => void
    submitting: boolean
}

export function MovementModal({ isOpen, type, onSubmit, onClose, submitting }: MovementModalProps) {
    const [amount, setAmount] = useState<number>(0)
    const [reason, setReason] = useState("")

    if (!isOpen || !type) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(amount, reason)
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card border-4 border-primary/20 rounded-[4.5rem] w-full max-w-2xl p-16 shadow-[0_0_100px_rgba(255,77,0,0.1)] relative overflow-hidden group/modal animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/modal:scale-110 transition-transform duration-1000 rotate-12">
                    {type === 'income' ? <Plus className="w-[400px] h-[400px]" /> : type === 'expense' ? <Minus className="w-[400px] h-[400px]" /> : <HandCoins className="w-[400px] h-[400px]" />}
                </div>

                <div className="flex justify-between items-start mb-16 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-5">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-3xl",
                                type === 'income' ? "bg-emerald-500 text-white" : type === 'expense' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                            )}>
                                {type === 'income' ? <Plus className="w-8 h-8" /> : type === 'expense' ? <Minus className="w-8 h-8" /> : <HandCoins className="w-8 h-8" />}
                            </div>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                {type === 'petty-cash-transfer' ? 'TRANSFERIR A' : 'REPORTE DE'} <span className={cn("italic", type === 'income' ? "text-emerald-500" : type === 'expense' ? "text-rose-500" : "text-amber-500")}> {type === 'income' ? 'INGRESO' : type === 'expense' ? 'EGRESO' : 'CAJA MENOR'}</span>
                            </h2>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic pl-20 italic">
                            {type === 'petty-cash-transfer' ? 'MOVIMIENTO INTERNO DE CAJA PRINCIPAL A MENOR' : 'REGISTRO DE FLUJO MANUAL EN KERNEL POS'}
                        </p>
                    </div>
                    <Button variant="ghost" className="h-16 w-16 rounded-[1.5rem] bg-muted/40 hover:bg-primary hover:text-white transition-all active:scale-90" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
                    <div className="space-y-6 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic">TOTAL DEL MOVIMIENTO (COP)</label>
                        <div className="relative">
                            <input
                                autoFocus
                                type="number"
                                className="w-full h-32 bg-muted/30 border-4 border-border rounded-[3.5rem] px-12 outline-none focus:border-primary transition-all font-black text-7xl italic text-foreground tracking-tighter shadow-inner text-center"
                                placeholder="0"
                                value={amount || ''}
                                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                            />
                            <span className="absolute left-12 top-1/2 -translate-y-1/2 text-4xl font-black opacity-10 italic">$</span>
                        </div>
                    </div>
                    <div className="space-y-6 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic">PROTOCOLO DE JUSTIFICACIÓN</label>
                        <textarea
                            className="w-full h-40 bg-muted/30 border-4 border-border rounded-[3.5rem] p-10 font-black text-lg italic text-foreground placeholder:text-muted-foreground/10 outline-none resize-none transition-all shadow-inner uppercase tracking-tight"
                            placeholder={type === 'petty-cash-transfer' ? 'JUSTIFICA EL REABASTECIMIENTO DE CAJA MENOR...' : "DEFINE EL ORIGEN O DESTINO DE LOS RECURSOS..."}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-8">
                        <Button type="button" variant="ghost" className="flex-1 h-24 rounded-[2.5rem] font-black uppercase tracking-[0.5em] italic text-muted-foreground/40 hover:bg-muted/10" onClick={onClose}>ABORTAR</Button>
                        <Button type="submit" disabled={submitting || amount <= 0} className="flex-[2] h-24 rounded-[2.5rem] bg-foreground text-background font-black uppercase tracking-[0.5em] italic hover:bg-primary hover:text-white transition-all shadow-3xl text-xl border-none">
                            {submitting ? <Loader2 className="w-10 h-10 animate-spin" /> : 'AUTORIZAR REGISTRO'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
