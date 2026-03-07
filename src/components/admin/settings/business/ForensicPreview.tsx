"use client"

import { ReceiptText, ChevronRight } from "lucide-react"

interface ForensicPreviewProps {
    businessName: string
}

export function ForensicPreview({ businessName }: ForensicPreviewProps) {
    return (
        <div className="bg-foreground text-background rounded-[4.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group/pre group hover:scale-[1.02] transition-all duration-700 animate-pulse-slow font-sans">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover/pre:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-32 -mt-32 group-hover/pre:scale-125 transition-transform duration-1000" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="w-28 h-28 rounded-[2.5rem] bg-background border border-white/10 flex items-center justify-center shrink-0 shadow-3xl group-hover/pre:rotate-12 transition-transform duration-500">
                    <ReceiptText className="w-14 h-14 text-primary drop-shadow-[0_0_20px_rgba(255,77,0,0.6)] animate-bounce-slow" />
                </div>
                <div className="space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter text-primary group-hover/pre:text-white transition-colors">Forensics Preview</h4>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-[12px] text-background/40 font-black uppercase tracking-[0.3em] leading-relaxed italic max-w-lg">
                        LA CONFIGURACIÓN ACTUAL SERÁ INYECTADA EN EL KERNEL DE IMPRESIÓN Y FACTURACIÓN ELECTRÓNICA PARA <span className="text-primary border-b border-primary/20">{businessName || "JAMALI OS MASTER HUB"}</span>. VERIFIQUE LOS RANGOS ANTES DE SINCRONIZAR.
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-6 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Status: Sync Ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Node: Secure</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex justify-end items-center">
                    <button className="h-16 w-16 rounded-full bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
            </div>
        </div>
    )
}
