"use client"

import { DollarSign, ShieldCheck, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeliverySettings } from "@/app/admin/delivery-config/types"

interface FinancialMatrixProps {
    settings: DeliverySettings
    onUpdate: (key: keyof DeliverySettings, value: any) => void
}

export function FinancialMatrix({ settings, onUpdate }: FinancialMatrixProps) {
    return (
        <div className="bg-card border border-border rounded-[4.5rem] p-12 md:p-16 shadow-3xl relative overflow-hidden group/fin transition-all hover:border-primary/20 font-sans">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/fin:scale-110 transition-all duration-1000 rotate-45">
                <DollarSign className="w-[500px] h-[500px]" />
            </div>

            <div className="flex items-center gap-6 mb-16 border-l-8 border-primary px-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xl">
                    <DollarSign className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Matriz de Tarifas</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">REVENUE & LOGISTICS LEDGER</p>
                </div>
            </div>

            <div className="space-y-12 relative z-10">
                <button
                    onClick={() => onUpdate('delivery_fee_enabled', !settings.delivery_fee_enabled)}
                    className={cn(
                        "w-full h-24 rounded-[3rem] border-4 flex items-center justify-between px-10 transition-all group/toggle shadow-xl",
                        settings.delivery_fee_enabled
                            ? "bg-amber-500/5 border-amber-500 text-amber-500"
                            : "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-emerald-500/10"
                    )}
                >
                    <div className="flex items-center gap-8">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl",
                            settings.delivery_fee_enabled ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                        )}>
                            {settings.delivery_fee_enabled ? <DollarSign className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                        </div>
                        <div className="text-left">
                            <span className="text-lg font-black uppercase tracking-tighter italic block leading-none mb-1 group-hover/toggle:text-foreground transition-colors">
                                {settings.delivery_fee_enabled ? "Cobro de Envío Activo" : "Estrategia: Envío Gratuito"}
                            </span>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">DEFINIR SI EL CLIENTE ASUME COSTO DE ENTREGAS</p>
                        </div>
                    </div>
                    <Activity className={cn("w-6 h-6 animate-pulse", settings.delivery_fee_enabled ? "text-amber-500" : "text-emerald-500")} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3 leading-none">
                            <DollarSign className="w-4 h-4 text-primary" /> TARIFA BASE (COP)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.delivery_fee}
                                onChange={(e) => onUpdate('delivery_fee', parseFloat(e.target.value) || 0)}
                                disabled={!settings.delivery_fee_enabled}
                                className={cn(
                                    "w-full h-20 px-10 rounded-[2.5rem] border-4 font-black text-4xl italic transition-all outline-none text-center shadow-inner",
                                    settings.delivery_fee_enabled
                                        ? "bg-muted/30 border-primary/20 text-foreground focus:border-primary"
                                        : "bg-muted/10 border-border/20 text-muted-foreground/20 cursor-not-allowed"
                                )}
                            />
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black opacity-10">$</span>
                        </div>
                    </div>

                    <div className="space-y-4 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3 leading-none">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> UMBRAL ENVÍO GRATIS
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.free_delivery_threshold || ''}
                                onChange={(e) => onUpdate('free_delivery_threshold', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-full h-20 bg-muted/30 border-4 border-emerald-500/10 rounded-[2.5rem] px-10 outline-none focus:border-emerald-500 transition-all font-black text-3xl italic text-foreground text-center shadow-inner placeholder:text-muted-foreground/5 leading-none"
                                placeholder="0.00"
                            />
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-xl font-black text-emerald-500/20">$</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
