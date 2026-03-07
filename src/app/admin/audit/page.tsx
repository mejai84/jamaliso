"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { AuditLog, StaffMember } from "./types"

// Components
import { AuditHeader } from "@/components/admin/audit/AuditHeader"
import { AuditTable } from "@/components/admin/audit/AuditTable"
import { AuditStats } from "@/components/admin/audit/AuditStats"
import { LogInspectorModal } from "@/components/admin/audit/LogInspectorModal"

export default function AuditPage() {
    const { restaurant } = useRestaurant()
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [staff, setStaff] = useState<StaffMember[]>([])
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
                setStaff((staffData as StaffMember[]) || [])

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
                setLogs((data as unknown as AuditLog[]) || [])
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
                const { data: newLog } = await supabase
                    .from('audit_logs')
                    .select('*, profiles:user_id(full_name, email)')
                    .eq('id', payload.new.id)
                    .single()

                if (newLog) {
                    setLogs(prev => [newLog as unknown as AuditLog, ...prev].slice(0, 200))
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

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-12 font-sans selection:bg-orange-500 selection:text-white relative flex flex-col">
            <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000 w-full flex-1">
                <AuditHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterAction={filterAction}
                    setFilterAction={setFilterAction}
                    filterStaff={filterStaff}
                    setFilterStaff={setFilterStaff}
                    filterEntity={filterEntity}
                    setFilterEntity={setFilterEntity}
                    staff={staff}
                    entityTypes={entityTypes}
                />

                <AuditTable
                    logs={filteredLogs}
                    loading={loading}
                    onSelectLog={setSelectedLog}
                />

                <AuditStats
                    logs={logs}
                    onExport={exportToCSV}
                />
            </div>

            <LogInspectorModal
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,100,0,0.1); border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,100,0,0.3); }
            `}</style>
        </div>
    )
}
