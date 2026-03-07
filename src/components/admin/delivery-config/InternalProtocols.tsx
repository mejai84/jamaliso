"use client"

import { FileText } from "lucide-react"
import { DeliverySettings } from "@/app/admin/delivery-config/types"

interface InternalProtocolsProps {
    settings: DeliverySettings
    onUpdate: (key: keyof DeliverySettings, value: any) => void
}

export function InternalProtocols({ settings, onUpdate }: InternalProtocolsProps) {
    return (
        <div className="md:col-span-2 bg-card border border-border rounded-[4.5rem] p-12 md:p-16 shadow-3xl relative overflow-hidden group/note transition-all hover:border-primary/20 font-sans">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/note:scale-110 transition-all duration-1000">
                <FileText className="w-[500px] h-[500px]" />
            </div>

            <div className="flex items-center gap-6 mb-16 border-l-8 border-primary px-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-foreground/10 flex items-center justify-center text-foreground shadow-xl">
                    <FileText className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Protocolos Internos</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">INTERNAL NOTES & OPERATIONAL GUIDES</p>
                </div>
            </div>

            <div className="relative z-10">
                <textarea
                    value={settings.notes || ''}
                    onChange={(e) => onUpdate('notes', e.target.value)}
                    className="w-full h-48 bg-muted/30 border-4 border-border rounded-[4rem] p-12 outline-none focus:border-primary transition-all font-black text-sm italic text-foreground tracking-tight shadow-inner resize-none uppercase tracking-[0.05em] leading-relaxed placeholder:text-muted-foreground/10"
                    placeholder="ASIGNA REGLAS ESPECIALES PARA EL KERNEL DE DESPACHO... EJ: COBRO ADICIONAL FINES DE SEMANA, ZONA NORTE LIMITADA."
                />
            </div>
        </div>
    )
}
