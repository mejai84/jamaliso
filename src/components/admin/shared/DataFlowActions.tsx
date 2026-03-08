"use client"

import { Button } from "@/components/ui/button"
import { Download, Upload, LucideIcon } from "lucide-react"

interface DataFlowActionsProps {
    onImport: () => void;
    onExport: () => void;
    importLabel?: string;
    exportLabel?: string;
    isImporting?: boolean;
}

export function DataFlowActions({
    onImport,
    onExport,
    importLabel = "Importar",
    exportLabel = "Exportar",
    isImporting = false
}: DataFlowActionsProps) {
    return (
        <div className="flex items-center gap-4 font-sans">
            <Button
                variant="ghost"
                onClick={onImport}
                disabled={isImporting}
                className="h-16 px-8 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black uppercase italic text-[10px] tracking-[0.3em] transition-all hover:bg-slate-900 hover:text-white shadow-sm flex items-center gap-4 active:scale-95 disabled:opacity-50"
            >
                {isImporting ? (
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent animate-spin rounded-full" />
                ) : (
                    <Upload className="w-5 h-5 text-orange-500" />
                )}
                {importLabel}
            </Button>

            <Button
                variant="ghost"
                onClick={onExport}
                className="h-16 px-8 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black uppercase italic text-[10px] tracking-[0.3em] transition-all hover:bg-orange-600 hover:text-white shadow-sm flex items-center gap-4 active:scale-95 group"
            >
                <Download className="w-5 h-5 text-orange-500 group-hover:translate-y-1 transition-transform" />
                {exportLabel}
            </Button>
        </div>
    )
}
