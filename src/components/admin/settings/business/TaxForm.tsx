"use client"

import { ReceiptText, Layers, CheckCircle2, ShieldAlert, Percent, Terminal } from "lucide-react"
import { TaxSettings } from "@/app/admin/settings/business/types"
import { cn } from "@/lib/utils"

interface TaxFormProps {
    taxSettings: TaxSettings
    onChange: (settings: TaxSettings) => void
}

export function TaxForm({ taxSettings, onChange }: TaxFormProps) {
    return (
        <div className="bg-card border border-border rounded-[4.5rem] p-12 md:p-16 shadow-3xl relative overflow-hidden group/card transition-all hover:border-primary/20 font-sans">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/card:scale-110 transition-all duration-1000 -rotate-12">
                <ReceiptText className="w-[500px] h-[500px]" />
            </div>

            <div className="flex items-center gap-6 mb-16 border-l-8 border-primary px-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xl">
                    <Layers className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Matriz Tributaria</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">FISCAL CORE AUTO-PILOT</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="col-span-1 md:col-span-2">
                    <button
                        onClick={() => onChange({ ...taxSettings, include_tax_in_price: !taxSettings.include_tax_in_price })}
                        className={cn(
                            "w-full h-24 rounded-[3rem] border-4 flex items-center justify-between px-10 transition-all group/switch shadow-3xl relative overflow-hidden",
                            taxSettings.include_tax_in_price
                                ? "bg-primary/5 border-primary text-primary"
                                : "bg-muted/40 border-border/50 text-muted-foreground/30"
                        )}
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/switch:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl group-hover/switch:scale-110",
                                taxSettings.include_tax_in_price ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                            )}>
                                {taxSettings.include_tax_in_price ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                            </div>
                            <div className="text-left">
                                <span className="text-lg font-black uppercase tracking-tighter italic block leading-none mb-1 transition-colors group-hover/switch:text-foreground">Impuesto Integrado</span>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">CALCULAR IVA EN EL PRECIO DE VENTA</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-16 h-8 rounded-full relative transition-all border-2 border-transparent",
                            taxSettings.include_tax_in_price ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted-foreground/10"
                        )}>
                            <div className={cn(
                                "w-6 h-6 rounded-full bg-white absolute top-0.5 shadow-xl transition-all duration-500",
                                taxSettings.include_tax_in_price ? "translate-x-9" : "translate-x-1"
                            )} />
                        </div>
                    </button>
                </div>

                <div className="space-y-4 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                        <Percent className="w-4 h-4 text-emerald-500" /> IVA / TASA BASE
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            className="w-full h-20 bg-muted/30 border border-border rounded-[2.5rem] px-10 outline-none focus:border-primary transition-all font-black text-4xl italic text-emerald-500 text-center shadow-inner placeholder:text-emerald-500/10"
                            value={taxSettings.tax_percentage}
                            onChange={e => onChange({ ...taxSettings, tax_percentage: parseFloat(e.target.value) || 0 })}
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500/20">%</span>
                    </div>
                </div>

                <div className="space-y-4 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                        <Percent className="w-4 h-4 text-primary" /> IMP. CONSUMO
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            className="w-full h-20 bg-muted/30 border border-border rounded-[2.5rem] px-10 outline-none focus:border-primary transition-all font-black text-4xl italic text-primary text-center shadow-inner placeholder:text-primary/10"
                            value={taxSettings.consumption_tax}
                            onChange={e => onChange({ ...taxSettings, consumption_tax: parseFloat(e.target.value) || 0 })}
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-primary/20">%</span>
                    </div>
                </div>

                <div className="space-y-4 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3 leading-none">
                        <Terminal className="w-4 h-4" /> PREFIJO DE FACTURACIÓN
                    </label>
                    <input
                        className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-2xl italic text-foreground uppercase text-center shadow-inner tracking-widest"
                        value={taxSettings.invoice_prefix}
                        placeholder="EJ: PRE-"
                        onChange={e => onChange({ ...taxSettings, invoice_prefix: e.target.value.toUpperCase() })}
                    />
                </div>

                <div className="space-y-4 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic leading-none">PUNTO DE PARTIDA</label>
                    <input
                        type="number"
                        className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-2xl italic text-foreground text-center shadow-inner"
                        value={taxSettings.invoice_start_number}
                        onChange={e => onChange({ ...taxSettings, invoice_start_number: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <div className="space-y-4 col-span-1 md:col-span-2 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                        <ReceiptText className="w-4 h-4 text-primary" /> CLÁUSULA LEGAL / PIE DE PÁGINA
                    </label>
                    <textarea
                        className="w-full h-36 bg-muted/30 border border-border rounded-[3rem] p-10 outline-none focus:border-primary transition-all font-black text-[11px] uppercase tracking-tighter resize-none text-muted-foreground italic shadow-inner leading-relaxed placeholder:text-muted-foreground/10"
                        value={taxSettings.legal_text}
                        onChange={e => onChange({ ...taxSettings, legal_text: e.target.value.toUpperCase() })}
                        placeholder="INTRODUCE EL TEXTO LEGAL PARA TUS TICKETS DE VENTA..."
                    />
                </div>
            </div>
        </div>
    )
}
