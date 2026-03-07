"use client"

import { Button } from "@/components/ui/button"
import { ShieldAlert, X, User, Database, ArrowRight, Info, Activity, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { AuditLog } from "@/app/admin/audit/types"

interface LogInspectorModalProps {
    log: AuditLog | null
    onClose: () => void
}

export function LogInspectorModal({ log, onClose }: LogInspectorModalProps) {
    if (!log) return null

    const getActionBadge = (action: string) => {
        switch (action.toUpperCase()) {
            case 'INSERT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            case 'UPDATE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    const getChangedFields = (oldVals: any, newVals: any) => {
        if (!oldVals || !newVals) return []
        return Object.keys(newVals).filter(key => {
            const oldVal = oldVals[key]
            const newVal = newVals[key]
            return JSON.stringify(oldVal) !== JSON.stringify(newVal)
        })
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500 font-sans">
            <div className="relative bg-white rounded-[4rem] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 selection:bg-orange-100 selection:text-orange-900">

                <div className="px-12 py-12 border-b border-slate-100 bg-slate-50 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-orange-50 rounded-3xl shadow-sm border border-orange-100">
                            <ShieldAlert className="w-10 h-10 text-orange-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Reporte <span className="text-orange-500 italic">Atómico</span></h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] italic">HSA: {log.id.split('-')[0].toUpperCase()} • {format(new Date(log.created_at), "PPP", { locale: es })}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-2xl h-16 w-16 hover:bg-slate-100 active:scale-95 transition-all text-slate-400 hover:text-slate-600"
                        onClick={onClose}
                    >
                        <X className="w-10 h-10" />
                    </Button>
                </div>

                <div className="px-12 py-10 overflow-y-auto custom-scrollbar space-y-12 relative z-10 flex-1">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm group/card hover:border-orange-200 transition-all">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 italic">Vector</p>
                            <span className={cn(
                                "px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border italic inline-block shadow-sm bg-white",
                                getActionBadge(log.action)
                            )}>
                                {log.action}
                            </span>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic">Entidad</p>
                            <div className="flex items-center gap-4">
                                <Database className="w-6 h-6 text-slate-300" />
                                <p className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{log.entity_type}</p>
                            </div>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic">Responsable</p>
                            <div className="flex items-center gap-4">
                                <User className="w-6 h-6 text-slate-300" />
                                <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none truncate">{log.profiles?.full_name || "KERNEL SYSTEM"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12 pb-12">
                        {/* Compare View */}
                        <div className="grid lg:grid-cols-2 gap-12 relative">
                            {/* Arrow connection */}
                            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm text-orange-500 animate-pulse">
                                <ArrowRight className="w-8 h-8" />
                            </div>

                            {/* STATE A */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-8">
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4 italic opacity-70">
                                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                                        E. Inicial
                                    </p>
                                </div>
                                <div className="p-8 bg-slate-900 rounded-[3rem] overflow-x-auto shadow-sm border border-slate-200 relative min-h-[300px] flex">
                                    {log.old_values ? (
                                        <pre className="text-xs text-rose-300 font-mono leading-relaxed selection:bg-rose-500/30 w-full overflow-y-auto custom-scrollbar">
                                            {JSON.stringify(log.old_values, null, 4)}
                                        </pre>
                                    ) : (
                                        <div className="m-auto flex flex-col items-center gap-4 text-slate-600">
                                            <Info className="w-12 h-12 text-slate-500" />
                                            <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">N/A (Cero Estado)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* STATE B */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-8">
                                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em] flex items-center gap-4 italic">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                                        E. Final
                                    </p>
                                </div>
                                <div className="p-8 bg-slate-900 rounded-[3rem] overflow-x-auto shadow-sm border border-slate-200 relative min-h-[300px] flex">
                                    {log.new_values ? (
                                        <div className="w-full h-full relative">
                                            <pre className="text-xs text-emerald-400 font-mono leading-relaxed selection:bg-orange-500/20 w-full overflow-y-auto custom-scrollbar">
                                                {JSON.stringify(log.new_values, null, 4)}
                                            </pre>

                                            {/* Highlight changed fields if it's an update */}
                                            {log.action === 'UPDATE' && (
                                                <div className="mt-8 pt-8 border-t border-slate-700">
                                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 italic">Campos Modificados:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getChangedFields(log.old_values, log.new_values).map(field => (
                                                            <span key={field} className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-[10px] font-black mono italic uppercase">
                                                                {field}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="m-auto flex flex-col items-center gap-4 text-slate-600">
                                            <Database className="w-12 h-12 text-slate-500" />
                                            <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">Estado Nulo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-12 py-10 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">ID DE SEGUIMIENTO: {log.id}</span>
                    </div>
                    <Button
                        onClick={onClose}
                        className="h-16 px-16 bg-slate-900 text-white hover:bg-orange-600 hover:text-white font-black rounded-[2rem] gap-4 uppercase text-[12px] tracking-[0.3em] italic shadow-lg transition-all border-none scale-100 hover:scale-105 active:scale-95 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> CANCELAR INSPECCIÓN
                    </Button>
                </div>
            </div>
        </div>
    )
}
