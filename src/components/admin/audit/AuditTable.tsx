"use client"

import { User, Clock, Eye, Database } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AuditLog } from "@/app/admin/audit/types"

interface AuditTableProps {
    logs: AuditLog[]
    loading: boolean
    onSelectLog: (log: AuditLog) => void
}

export function AuditTable({ logs, loading, onSelectLog }: AuditTableProps) {
    const getActionBadge = (action: string) => {
        switch (action.toUpperCase()) {
            case 'INSERT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            case 'UPDATE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm animate-in slide-in-from-bottom-6 duration-1000 relative font-sans">
            <div className="px-10 py-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500">
                <div className="flex items-center gap-6">
                    <span>Mostrando: {logs.length} eventos</span>
                    <div className="w-[1px] h-4 bg-border" />
                    <span className="text-emerald-500">Live Feedback Active</span>
                </div>
                <div className="flex items-center gap-2">
                    Limit: 200 Entries
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                            <th className="px-10 py-6 bg-white border-b border-slate-200">Identidad del Sujeto</th>
                            <th className="px-10 py-6 bg-white border-b border-slate-200">Vector</th>
                            <th className="px-10 py-6 bg-white border-b border-slate-200">Entidad</th>
                            <th className="px-10 py-6 bg-white border-b border-slate-200 text-center">Cronología</th>
                            <th className="px-10 py-6 bg-white border-b border-slate-200 text-right">Análisis</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-10 py-10">
                                        <div className="h-6 bg-slate-100 rounded-full w-2/3" />
                                    </td>
                                </tr>
                            ))
                        ) : logs.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-all duration-300 group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 italic text-sm group-hover:bg-orange-50 group-hover:text-orange-500 group-hover:rotate-6 transition-all duration-500">
                                                {log.profiles?.full_name?.charAt(0) || <User className="w-5 h-5 text-slate-400" />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-black italic text-slate-900 uppercase tracking-tight truncate group-hover:text-orange-500 transition-colors">
                                                    {log.profiles?.full_name || "KERNEL SYSTEM"}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                    {log.profiles?.email || "INTERNAL_SERVICE"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border italic shadow-sm bg-white",
                                            getActionBadge(log.action)
                                        )}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-200 group-hover:border-orange-200 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] font-mono italic">
                                                {log.entity_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-center italic">
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">
                                                {format(new Date(log.created_at), "dd MMM yyyy", { locale: es })}
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                    {format(new Date(log.created_at), "HH:mm:ss")}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => onSelectLog(log)}
                                            className="rounded-[1.25rem] h-14 w-14 bg-slate-50 border border-slate-200 hover:border-orange-200 hover:bg-white hover:text-orange-500 shadow-sm active:scale-95 transition-all group/btn text-slate-500"
                                        >
                                            <Eye className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-10 py-32 text-center text-slate-400 italic">
                                    <div className="flex flex-col items-center justify-center gap-6">
                                        <Database className="w-24 h-24 text-slate-200" />
                                        <div className="space-y-2">
                                            <p className="text-base font-black uppercase italic tracking-[0.5em] leading-none text-slate-500">Sin Coincidencias</p>
                                            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-400">No se han detectado eventos con los filtros actuales</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
