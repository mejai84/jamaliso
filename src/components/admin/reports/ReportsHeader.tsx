"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import Link from "next/link"

interface ReportsHeaderProps {
    currentTime: Date
    onExportCSV: () => void
    onExportPDF: () => void
    exporting: boolean
}

export function ReportsHeader({ currentTime, onExportCSV, onExportPDF, exporting }: ReportsHeaderProps) {
    return (
        <div className="relative z-20 p-8 flex items-center justify-between border-b border-slate-200 bg-white/60 backdrop-blur-xl shrink-0 shadow-sm font-sans">
            <div className="flex items-center gap-6">
                <Link href="/admin">
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm">
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-slate-900">BUSINESS <span className="text-orange-500">INTELLIGENCE</span></h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-2 italic shadow-sm">Data Center & Intelligence Hub</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-3xl font-black italic tracking-tighter font-mono text-slate-900">
                        {currentTime.toLocaleTimeString('es-CO')}
                    </p>
                    <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest text-right">GLOBAL DATA SYNC</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={onExportCSV}
                        className="h-14 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-sm"
                    >
                        <Download className="w-5 h-5 mr-2" /> CSV
                    </Button>
                    <Button
                        onClick={onExportPDF}
                        disabled={exporting}
                        className="h-14 px-8 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-lg shadow-orange-600/20"
                    >
                        {exporting ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Download className="w-5 h-5 mr-3" />}
                        EXPORT PDF
                    </Button>
                </div>
            </div>
        </div>
    )
}
