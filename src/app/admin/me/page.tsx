"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

// Types
import { UserProfile, Stats, TipOrder } from "./types"

// Components
import { IdentityCard } from "@/components/admin/me/IdentityCard"
import { PerformanceMatrix } from "@/components/admin/me/PerformanceMatrix"
import { SecurityNode } from "@/components/admin/me/SecurityNode"
import { InspectionModal } from "@/components/admin/me/InspectionModal"

export default function MyProfilePage() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<UserProfile | null>(null)
    const [stats, setStats] = useState<Stats>({
        shiftsThisMonth: 0,
        hoursWorked: 0,
        tipsEstimated: 0,
        rank: 'Novato'
    })
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [recentTips, setRecentTips] = useState<TipOrder[]>([])
    const [newPin, setNewPin] = useState("")
    const [updatingPin, setUpdatingPin] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()

            const { data: ordersWithTips } = await supabase
                .from('orders')
                .select('id, total, tip_amount, created_at')
                .eq('waiter_id', authUser.id)
                .gt('tip_amount', 0)
                .order('created_at', { ascending: false })
                .limit(10)

            const totalTips = ordersWithTips?.reduce((sum, o) => sum + (Number(o.tip_amount) || 0), 0) || 0
            setRecentTips(ordersWithTips as TipOrder[] || [])

            setUser({ ...authUser, profile } as UserProfile)
            setStats({
                shiftsThisMonth: 12,
                hoursWorked: 94.5,
                tipsEstimated: totalTips,
                rank: profile?.role === 'admin' ? 'Master' : 'Experto'
            })
            setLoading(false)
        }
        loadProfile()
    }, [])

    async function handleUpdatePin() {
        if (!newPin || newPin.length !== 4) return alert("El PIN debe ser de 4 dígitos")
        setUpdatingPin(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ waiter_pin: newPin })
                .eq('id', user?.id)

            if (error) throw error
            alert("PIN actualizado correctamente")
            if (user) {
                setUser({ ...user, profile: { ...user.profile, waiter_pin: newPin } })
            }
            setNewPin("")
        } catch (e: any) {
            alert("Error: " + e.message)
        } finally {
            setUpdatingPin(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = "/login"
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-black italic">
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                        <Loader2 className="w-16 h-16 animate-spin text-primary relative z-10" />
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="uppercase tracking-[0.4em] text-[10px] font-black italic opacity-50">Sincronizando Identidad Digital</p>
                        <p className="uppercase tracking-[0.1em] text-[11px] font-bold text-primary animate-pulse">Kernel v5.0 Access</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8 font-sans selection:bg-primary selection:text-primary-foreground relative pb-20">
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-1000">

                <IdentityCard
                    fullName={user?.profile?.full_name}
                    role={user?.profile?.role}
                    id={user?.id}
                />

                <PerformanceMatrix
                    stats={stats}
                    onOpenDetails={() => setIsDetailsOpen(true)}
                />

                <SecurityNode
                    newPin={newPin}
                    setNewPin={setNewPin}
                    updatingPin={updatingPin}
                    hasPin={!!user?.profile?.waiter_pin}
                    onUpdatePin={handleUpdatePin}
                    onSignOut={handleSignOut}
                />

                {isDetailsOpen && (
                    <InspectionModal
                        recentTips={recentTips}
                        totalTips={stats.tipsEstimated}
                        onClose={() => setIsDetailsOpen(false)}
                    />
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,77,0,0.2); }
            `}</style>
        </div>
    )
}
