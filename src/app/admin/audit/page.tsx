"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRestaurant } from "@/providers/RestaurantProvider"
import {
    ShieldAlert,
    History,
    User,
    Clock,
    Database,
    Search,
    ArrowRight,
    Eye,
    Info,
    X,
    Lock,
    Activity,
    ArrowLeft,
    Download
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AuditLog {
    id: string
    user_id: string
    action: string
    entity_type: string
    entity_id: string
    old_values: any
    new_values: any
    created_at: string
    profiles: {
        full_name: string
        email: string
    }
}

export default function AuditPage() {
    const { restaurant } = useRestaurant()
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

    // Filtros
    const [filterAction, setFilterAction] = useState<string>("ALL")
    const [filterStaff, setFilterStaff] = useState<string>("ALL")
    const [filterEntity, setFilterEntity] = useState<string>("ALL")

    useEffect(() => {
        if (!restaurant) return

        const fetchInitialData = async () => {
            try {
                setLoading(true)

                // 1. Fetch Staff for Filter
                const { data: staffData } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .eq('restaurant_id', restaurant.id)
                setStaff(staffData || [])

                // 2. Fetch Logs
                const { data, error } = await supabase
                    .from('audit_logs')
                    .select(`
                        *,
                        profiles:user_id (full_name, email)
                    `)
                    .eq('restaurant_id', restaurant.id)
                    .order('created_at', { ascending: false })
                    .limit(200)

                if (error) throw error
                setLogs(data || [])
            } catch (error) {
                console.error("Error fetching audit data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()

        // 3. Realtime Subscription
        const channel = supabase
            .channel('audit_changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'audit_logs',
                filter: `restaurant_id=eq.${restaurant.id}`
            }, async (payload) => {
                // Fetch the full record including profile info
                const { data: newLog } = await supabase
                    .from('audit_logs')
                    .select('*, profiles:user_id(full_name, email)')
                    .eq('id', payload.new.id)
                    .single()

                if (newLog) {
                    setLogs(prev => [newLog as AuditLog, ...prev].slice(0, 200))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [restaurant])

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesAction = filterAction === "ALL" || log.action === filterAction
        const matchesStaff = filterStaff === "ALL" || log.user_id === filterStaff
        const matchesEntity = filterEntity === "ALL" || log.entity_type === filterEntity

        return matchesSearch && matchesAction && matchesStaff && matchesEntity
    })

    const entityTypes = Array.from(new Set(logs.map(l => l.entity_type)))

    const getActionBadge = (action: string) => {
        switch (action.toUpperCase()) {
            case 'INSERT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            case 'UPDATE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    const exportToCSV = () => {
        const headers = ["ID", "Fecha", "Usuario", "Acción", "Entidad", "Entidad ID"]
        const rows = filteredLogs.map(log => [
            log.id,
            log.created_at,
            log.profiles?.full_name || "KERNEL",
            log.action,
            log.entity_type,
            log.entity_id
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `audit_log_${new Date().toISOString()}.csv`)
        document.body.appendChild(link)
        link.click()
    }

    // Helper to identify changed fields in an update
    const getChangedFields = (oldVals: any, newVals: any) => {
        if (!oldVals || !newVals) return []
        return Object.keys(newVals).filter(key => {
            const oldVal = oldVals[key]
            const newVal = newVals[key]
            return JSON.stringify(oldVal) !== JSON.stringify(newVal)
        })
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-12 font-sans selection:bg-orange-500 selection:text-white relative">
            <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000">

                {/* 🔝 STRATEGIC HEADER */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 border-b border-slate-200 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Lock className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">Audit Protocol v5.0 • Live</span>
                        </div>
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Caja <span className="text-orange-500 italic">Negra</span></h1>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest italic flex items-center gap-3">
                            Monitor de integridad y trazabilidad operativa
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto">
                        {/* Search */}
                        <div className="relative group/search sm:col-span-2 lg:col-span-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR EVENTO..."
                                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase placeholder:text-slate-300 shadow-sm text-slate-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter Action */}
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="h-14 bg-white border border-slate-200 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase appearance-none cursor-pointer hover:bg-slate-50 text-slate-900 shadow-sm"
                        >
                            <option value="ALL">TODAS LAS ACCIONES</option>
                            <option value="INSERT">INSERCIONES (+)</option>
                            <option value="UPDATE">MODIFICACIONES (Δ)</option>
                            <option value="DELETE">ELIMINACIONES (-)</option>
                        </select>

                        {/* Filter Staff */}
                        <select
                            value={filterStaff}
                            onChange={(e) => setFilterStaff(e.target.value)}
                            className="h-14 bg-white border border-slate-200 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase appearance-none cursor-pointer hover:bg-slate-50 text-slate-900 shadow-sm truncate max-w-[200px]"
                        >
                            <option value="ALL">TODOS LOS SUJETOS</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.full_name}</option>
                            ))}
                        </select>

                        {/* Filter Entity */}
                        <select
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            className="h-14 bg-white border border-slate-200 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase appearance-none cursor-pointer hover:bg-slate-50 text-slate-900 shadow-sm"
                        >
                            <option value="ALL">TODAS LAS ENTIDADES</option>
                            {entityTypes.map(type => (
                                <option key={type} value={type}>{type.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 🛡️ AUDIT REGISTRY */}
                <div className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm animate-in slide-in-from-bottom-6 duration-1000 relative">
                    {/* Header Table Info */}
                    <div className="px-10 py-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500">
                        <div className="flex items-center gap-6">
                            <span>Mostrando: {filteredLogs.length} eventos</span>
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
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
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
                                                    onClick={() => setSelectedLog(log)}
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

                {/* 📊 ANALYTIC MINI HUB */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-900 border-none p-10 rounded-[3.5rem] text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-orange-500/40 transition-all" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-4 text-left">
                                <p className="text-[11px] font-black italic text-orange-500 uppercase tracking-[0.4em]">Eventos en Registro</p>
                                <p className="text-6xl font-black italic tracking-tighter uppercase leading-none">{logs.length}<span className="text-xl ml-3 opacity-30 text-white">UNIT</span></p>
                            </div>
                            <Activity className="w-20 h-20 text-orange-500 opacity-20 group-hover:rotate-[30deg] transition-transform duration-1000" />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-10 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all duration-500">
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-4 text-left">
                                <p className="text-[11px] font-black italic text-slate-500 uppercase tracking-[0.4em]">Eliminaciones (Crítico)</p>
                                <p className="text-6xl font-black italic tracking-tighter uppercase text-rose-500 leading-none">
                                    {logs.filter(l => l.action === 'DELETE').length}
                                    <span className="text-xl ml-3 text-slate-300">FAIL</span>
                                </p>
                            </div>
                            <ShieldAlert className="w-20 h-20 text-rose-500 opacity-10 group-hover:scale-110 transition-all duration-700" />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all duration-500 group flex items-center justify-center p-12">
                        <Button
                            variant="ghost"
                            onClick={exportToCSV}
                            className="w-full h-full text-[12px] font-black uppercase italic tracking-[0.3em] gap-5 text-slate-500 hover:text-slate-900 transition-all flex flex-col items-center justify-center group-hover:bg-slate-50 rounded-[2.5rem]"
                        >
                            <Download className="w-10 h-10 text-orange-500/40 group-hover:text-orange-500 transition-all mb-2 animate-bounce" />
                            DESCARGAR DATA FORENSE (.CSV)
                        </Button>
                    </div>
                </div>
            </div>

            {/* 👓 LOG INSPECTOR MODAL */}
            {selectedLog && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="relative bg-white rounded-[4rem] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 selection:bg-orange-100 selection:text-orange-900">

                        <div className="px-12 py-12 border-b border-slate-100 bg-slate-50 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-orange-50 rounded-3xl shadow-sm border border-orange-100">
                                    <ShieldAlert className="w-10 h-10 text-orange-500 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Reporte <span className="text-orange-500 italic">Atómico</span></h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] italic">HSA: {selectedLog.id.split('-')[0].toUpperCase()} • {format(new Date(selectedLog.created_at), "PPP", { locale: es })}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-2xl h-16 w-16 hover:bg-slate-100 active:scale-95 transition-all text-slate-400 hover:text-slate-600"
                                onClick={() => setSelectedLog(null)}
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
                                        getActionBadge(selectedLog.action)
                                    )}>
                                        {selectedLog.action}
                                    </span>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic">Entidad</p>
                                    <div className="flex items-center gap-4">
                                        <Database className="w-6 h-6 text-slate-300" />
                                        <p className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{selectedLog.entity_type}</p>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic">Responsable</p>
                                    <div className="flex items-center gap-4">
                                        <User className="w-6 h-6 text-slate-300" />
                                        <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter leading-none truncate">{selectedLog.profiles?.full_name || "KERNEL SYSTEM"}</p>
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
                                            {selectedLog.old_values ? (
                                                <pre className="text-xs text-rose-300 font-mono leading-relaxed selection:bg-rose-500/30 w-full overflow-y-auto custom-scrollbar">
                                                    {JSON.stringify(selectedLog.old_values, null, 4)}
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
                                            {selectedLog.new_values ? (
                                                <div className="w-full h-full relative">
                                                    <pre className="text-xs text-emerald-400 font-mono leading-relaxed selection:bg-orange-500/20 w-full overflow-y-auto custom-scrollbar">
                                                        {JSON.stringify(selectedLog.new_values, null, 4)}
                                                    </pre>

                                                    {/* Highlight changed fields if it's an update */}
                                                    {selectedLog.action === 'UPDATE' && (
                                                        <div className="mt-8 pt-8 border-t border-slate-700">
                                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 italic">Campos Modificados:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {getChangedFields(selectedLog.old_values, selectedLog.new_values).map(field => (
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
                                <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-500">ID DE SEGUIMIENTO: {selectedLog.id}</span>
                            </div>
                            <Button
                                onClick={() => setSelectedLog(null)}
                                className="h-16 px-16 bg-slate-900 text-white hover:bg-orange-600 hover:text-white font-black rounded-[2rem] gap-4 uppercase text-[12px] tracking-[0.3em] italic shadow-lg transition-all border-none scale-100 hover:scale-105 active:scale-95 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> CANCELAR INSPECCIÓN
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,100,0,0.1); border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,100,0,0.3); }
                select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ff4d00' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.5rem center;
                    background-size: 1.25rem;
                }
            `}</style>
        </div>
    )
}
