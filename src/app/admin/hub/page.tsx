"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Zap } from "lucide-react"
import { formatPrice } from "@/lib/utils"

// Types
import { HubStats, PeakHour, RecentSale } from "./types"

// Components
import { HubHeader } from "@/components/admin/hub/HubHeader"
import { RevenueCore } from "@/components/admin/hub/RevenueCore"
import { PeakRadar } from "@/components/admin/hub/PeakRadar"
import { RapidAnalytics } from "@/components/admin/hub/RapidAnalytics"
import { TransactionalStream } from "@/components/admin/hub/TransactionalStream"
import { QuickOpsHub } from "@/components/admin/hub/QuickOpsHub"
import { GlobalCommandBar } from "@/components/admin/hub/GlobalCommandBar"

export default function JamaliHubPage() {
    const [stats, setStats] = useState<HubStats>({
        revenue: 0,
        orders: 0,
        activeTables: 0,
        avgTicket: 0,
        cashboxStatus: 'CLOSED'
    })
    const [recentSales, setRecentSales] = useState<RecentSale[]>([])
    const [peakHours, setPeakHours] = useState<PeakHour[]>([])
    const [businessInfo, setBusinessInfo] = useState({ name: "JAMALI HUB", logo: null })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadHubData()

        const channel = supabase.channel('hub-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadHubData(true))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => loadHubData(true))
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const loadHubData = async (isQuiet = false) => {
        if (!isQuiet) setLoading(true)
        else setRefreshing(true)

        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { data: orders } = await supabase
                .from('orders')
                .select('total, created_at, status')
                .gte('created_at', today.toISOString())

            const totalRev = orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0
            const totalOrders = orders?.length || 0
            const avg = totalOrders > 0 ? totalRev / totalOrders : 0

            const { count: activeCount } = await supabase
                .from('tables')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'occupied')

            const { data: recent } = await supabase
                .from('orders')
                .select('id, total, created_at, guest_info')
                .order('created_at', { ascending: false })
                .limit(5)

            const { data: cashbox } = await supabase
                .from('cashboxes')
                .select('status')
                .eq('name', 'Caja Principal')
                .single()

            setStats({
                revenue: totalRev,
                orders: totalOrders,
                activeTables: activeCount || 0,
                avgTicket: avg,
                cashboxStatus: cashbox?.status || 'UNKNOWN'
            })
            setRecentSales(recent as RecentSale[] || [])

            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            const { data: peakData } = await supabase
                .from('orders')
                .select('created_at')
                .gte('created_at', thirtyDaysAgo.toISOString())

            const hourCounts: Record<number, number> = {}
            peakData?.forEach(o => {
                const hour = new Date(o.created_at).getHours()
                hourCounts[hour] = (hourCounts[hour] || 0) + 1
            })

            const maxCount = Math.max(...Object.values(hourCounts), 1)
            const peakArray = Object.entries(hourCounts).map(([hour, count]) => ({
                hour: parseInt(hour),
                count,
                intensity: (count / maxCount) * 100
            })).sort((a, b) => a.hour - b.hour)

            setPeakHours(peakArray)

            const { data: brand } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'business_info')
                .single()

            if (brand?.value) {
                setBusinessInfo({
                    name: brand.value.business_name || "JAMALI HUB",
                    logo: brand.value.logo_url || null
                })
            }

        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-6 font-sans">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Zap className="w-16 h-16 text-primary animate-pulse relative z-10" />
            </div>
            <p className="font-black italic uppercase text-[10px] tracking-[0.4em] text-primary animate-pulse">Sincronizando Live Node...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500 pb-28 overflow-x-hidden relative">
            {/* 🌌 ATMOSPHERIC AMBIANCE */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-orange-500/10 via-orange-500/[0.02] to-transparent pointer-events-none z-0" />
            <div className="fixed -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none opacity-50 z-0 animate-pulse" />
            <div className="fixed -bottom-40 -left-40 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none opacity-30 z-0" />

            <HubHeader
                businessInfo={businessInfo}
                refreshing={refreshing}
                onReload={() => loadHubData(true)}
            />

            <main className="relative z-10 px-6 pt-10 space-y-12 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <RevenueCore stats={stats} />
                <PeakRadar peakHours={peakHours} />
                <RapidAnalytics stats={stats} />
                <TransactionalStream recentSales={recentSales} />
                <QuickOpsHub />
            </main>

            <GlobalCommandBar />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(0,0,0,0.1); 
                    border-radius: 20px; 
                }
            `}</style>
        </div>
    )
}
