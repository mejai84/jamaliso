"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { SystemHealth } from "@/components/admin/settings/infrastructure/types"
import { InfrastructureHeader } from "@/components/admin/settings/infrastructure/InfrastructureHeader"
import { InfrastructureVitalSigns } from "@/components/admin/settings/infrastructure/InfrastructureVitalSigns"
import { InfrastructureBackupCenter } from "@/components/admin/settings/infrastructure/InfrastructureBackupCenter"
import { InfrastructureTerminal } from "@/components/admin/settings/infrastructure/InfrastructureTerminal"
import { InfrastructureLicensing } from "@/components/admin/settings/infrastructure/InfrastructureLicensing"

export default function InfrastructurePage() {
    const [health, setHealth] = useState<SystemHealth>({
        database: "online",
        latency: 0,
        storage: "12%",
        lastBackup: "Hace 12h",
        version: "Jamali OS v5.2 Enterprise SaaS"
    })
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState<string | null>(null)

    const checkLatency = async () => {
        const start = Date.now()
        await supabase.from('settings').select('key').limit(1)
        setHealth(prev => ({ ...prev, latency: Date.now() - start }))
    }

    useEffect(() => {
        checkLatency()
        const interval = setInterval(checkLatency, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleExport = async (table: string) => {
        setExporting(table)
        try {
            const { data, error } = await supabase.from(table).select('*')
            if (error) throw error

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `jamali_backup_${table}_${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        } catch (e) {
            alert("Error al exportar: " + table)
        } finally {
            setExporting(null)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground p-4 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">

            {/* 🌌 AMBIANCE LAYER */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent pointer-events-none z-0" />
            <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40 z-0 animate-pulse" />
            <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none opacity-20 z-0" />

            <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in duration-1000 relative z-10">

                <InfrastructureHeader />
                <InfrastructureVitalSigns health={health} />

                <div className="grid lg:grid-cols-2 gap-16">
                    <InfrastructureBackupCenter exporting={exporting} handleExport={handleExport} />

                    <div className="space-y-12 animate-in slide-in-from-right-12 duration-1000">
                        <InfrastructureTerminal />
                        <InfrastructureLicensing version={health.version} />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    )
}
