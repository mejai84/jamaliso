"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Signal, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function InventoryHeader() {
    return (
        <div className="flex items-center justify-between font-sans">
            <div className="flex items-center gap-8">
                <Link href="/admin/hub">
                    <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.5rem] bg-white border border-slate-200 hover:bg-orange-600 hover:text-white transition-all group shadow-sm">
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Signal className="w-4 h-4 text-orange-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">Core Supply Intelligence</span>
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Kernel <span className="text-orange-500">Inventory</span></h1>
                </div>
            </div>
            <Button
                onClick={() => toast.success("ABRIENDO EDITOR DE NUEVO INSUMO")}
                className="h-16 px-12 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-lg shadow-orange-600/20 transition-all active:scale-95 gap-4"
            >
                <Plus className="w-6 h-6" /> ADQUIRIR PROTOCOLO
            </Button>
        </div>
    )
}
