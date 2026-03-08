import { Button } from "@/components/ui/button"
import { ArrowLeft, Signal, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { DataFlowActions } from "@/components/admin/shared/DataFlowActions"

interface InventoryHeaderProps {
    onImport: () => void;
    onExport: () => void;
}

export function InventoryHeader({ onImport, onExport }: InventoryHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row items-center justify-between font-sans gap-8">
            <div className="flex items-center gap-8 w-full xl:w-auto">
                <Link href="/admin/hub">
                    <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2rem] bg-white border border-slate-200 hover:bg-slate-900 hover:text-white transition-all group shadow-sm flex items-center justify-center">
                        <ArrowLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Signal className="w-5 h-5 text-orange-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-orange-500 italic">Core Supply Intelligence Engine</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Kernel <span className="text-orange-500">Inventory</span></h1>
                </div>
            </div>

            <div className="flex items-center gap-6 w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 justify-end custom-scrollbar">
                <DataFlowActions
                    onImport={onImport}
                    onExport={onExport}
                    importLabel="Protocolo Masivo (CSV)"
                    exportLabel="Respaldo (CSV)"
                />

                <Button
                    onClick={() => toast.success("ABRIENDO EDITOR DE NUEVO INSUMO")}
                    className="h-20 px-12 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs italic tracking-widest rounded-[2rem] shadow-xl shadow-orange-600/20 transition-all active:scale-95 gap-5 group"
                >
                    <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" /> ADQUIRIR PROTOCOLO
                </Button>
            </div>
        </div>
    )
}
