"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { getPosStatus, PosStatus } from "@/actions/pos"
import { Loader2, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Movement } from "./types"

// Components
import { CashierHeader } from "@/components/admin/cashier/CashierHeader"
import { BalanceSummary } from "@/components/admin/cashier/BalanceSummary"
import { QuickCommands } from "@/components/admin/cashier/QuickCommands"
import { MovementLog } from "@/components/admin/cashier/MovementLog"
import { MovementModal } from "@/components/admin/cashier/MovementModal"
import { CalculatorModal } from "@/components/admin/cashier/CalculatorModal"
import { ZReportModal } from "@/components/admin/cashier/ZReportModal"

const CASH_LIMIT = 1000000

export default function CashierPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [status, setStatus] = useState<PosStatus | null>(null)

    const [movements, setMovements] = useState<Movement[]>([])
    const [balance, setBalance] = useState({ total: 0, sales: 0, expenses: 0, incomes: 0 })

    const [modalOpen, setModalOpen] = useState<'income' | 'expense' | 'audit' | 'close' | 'z-report' | 'petty-cash-transfer' | null>(null)
    const [submittingModal, setSubmittingModal] = useState(false)
    const [zReportData, setZReportData] = useState<any>(null)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push("/login")

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setCurrentUser(profile)

            try {
                const posStatus = await getPosStatus(user.id)
                setStatus(posStatus)

                if (!posStatus.hasActiveShift) return router.push("/admin/cashier/start-shift")
                if (!posStatus.hasOpenCashbox) return router.push("/admin/cashier/open-box")

                if (posStatus.activeCashboxSession?.id) {
                    await fetchDashboardData(posStatus.activeCashboxSession.id)
                } else {
                    router.push("/admin/cashier/open-box")
                }
            } catch (error) {
                console.error("Error validating POS status:", error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [router])

    const fetchDashboardData = async (sessionId: string) => {
        setRefreshing(true)
        if (!sessionId) return

        const { data: movements, error: movementsError } = await supabase
            .from('cash_movements')
            .select('*')
            .eq('cashbox_session_id', sessionId)
            .order('created_at', { ascending: false })

        if (movementsError) return console.error("Error fetching movements:", movementsError)
        setMovements(movements || [])

        const sales = (movements || []).filter(m => m.movement_type === 'SALE').reduce((acc, m) => acc + Number(m.amount), 0)
        const expenses = (movements || []).filter(m => m.movement_type === 'WITHDRAWAL').reduce((acc, m) => acc + Number(m.amount), 0)
        const partials = (movements || []).filter(m => m.movement_type === 'DEPOSIT').reduce((acc, m) => acc + Number(m.amount), 0)

        const { data: session } = await supabase.from('cashbox_sessions').select('opening_amount').eq('id', sessionId).maybeSingle()
        const opening = Number(session?.opening_amount || 0)

        setBalance({ total: opening + sales + partials - expenses, sales, expenses, incomes: partials })
        setRefreshing(false)
    }

    const handleMovementSubmit = async (amount: number, reason: string) => {
        if (!status?.activeCashboxSession || amount <= 0) return
        setSubmittingModal(true)
        try {
            const { transferToPettyCash } = await import("@/actions/pos")
            if (modalOpen === 'petty-cash-transfer') {
                await transferToPettyCash(status.activeCashboxSession.id, currentUser.id, amount, reason)
                toast.success("Transferencia a Caja Menor exitosa")
            } else {
                const type = modalOpen === 'income' ? 'DEPOSIT' : 'WITHDRAWAL'
                const { error } = await supabase.from('cash_movements').insert({
                    cashbox_session_id: status.activeCashboxSession.id,
                    user_id: currentUser.id,
                    movement_type: type,
                    amount,
                    description: reason
                })
                if (error) throw error
                toast.success("Movimiento registrado con éxito")
            }
            setModalOpen(null)
            fetchDashboardData(status.activeCashboxSession.id)
        } catch (error: any) {
            toast.error("Error: " + error.message)
        } finally {
            setSubmittingModal(false)
        }
    }

    const handleCalculatorSubmit = async (amount: number, reason: string) => {
        if (!status?.activeCashboxSession) return
        setSubmittingModal(true)
        try {
            const { closeCashbox, performPartialAudit } = await import("@/actions/pos")
            if (modalOpen === 'audit') {
                const res = await performPartialAudit(status.activeCashboxSession.id, currentUser.id, amount, reason)
                toast.success(`Arqueo registrado. DIFERENCIA: $${res.difference.toLocaleString()}`)
                setModalOpen(null)
            } else {
                const result = await closeCashbox(status.activeCashboxSession.id, currentUser.id, amount, reason)
                setZReportData({ systemAmount: result.systemAmount, countedAmount: amount, difference: result.difference, sales: balance.sales, expenses: balance.expenses })
                setModalOpen('z-report')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSubmittingModal(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000">
                <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic animate-pulse">Sincronizando Terminal de Caja...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-transparent text-foreground p-4 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent pointer-events-none z-0" />
            <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in duration-1000 relative z-10">

                <CashierHeader currentUser={currentUser} refreshing={refreshing} onRefresh={() => fetchDashboardData(status?.activeCashboxSession?.id!)} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 space-y-12 animate-in slide-in-from-left-12 duration-1000">
                        <BalanceSummary balance={balance} cashLimit={CASH_LIMIT} />
                        <QuickCommands
                            onIncome={() => setModalOpen('income')}
                            onExpense={() => setModalOpen('expense')}
                            onPettyCash={() => setModalOpen('petty-cash-transfer')}
                            onAudit={() => setModalOpen('audit')}
                        />
                    </div>

                    <div className="lg:col-span-8 animate-in slide-in-from-right-12 duration-1000">
                        <MovementLog movements={movements} refreshing={refreshing} />
                    </div>
                </div>

                <div className="p-10 bg-foreground rounded-[4rem] text-background flex flex-col md:flex-row items-center justify-between shadow-3xl group/metric relative overflow-hidden">
                    <div className="flex items-center gap-10 relative z-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-background/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl group-hover/metric:rotate-12 transition-transform duration-500">
                            <Activity className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,77,0,0.6)]" />
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Master POS Ledger</h4>
                            <p className="text-[10px] text-background/40 font-black uppercase tracking-[0.4em] italic leading-none">SYSTEM v8.42 • KERNEL OPTIMIZED FOR CORE FINANCIAL OPERATIONS</p>
                        </div>
                    </div>
                </div>
            </div>

            <MovementModal
                isOpen={modalOpen === 'income' || modalOpen === 'expense' || modalOpen === 'petty-cash-transfer'}
                type={modalOpen as any}
                onSubmit={handleMovementSubmit}
                onClose={() => setModalOpen(null)}
                submitting={submittingModal}
            />

            <CalculatorModal
                isOpen={modalOpen === 'close' || modalOpen === 'audit'}
                mode={modalOpen === 'close' ? 'close' : 'audit'}
                onSubmit={handleCalculatorSubmit}
                onClose={() => setModalOpen(null)}
                submitting={submittingModal}
            />

            <ZReportModal
                isOpen={modalOpen === 'z-report'}
                data={zReportData}
                onPrint={() => window.print()}
                onExit={() => router.push('/admin')}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,77,0,0.1); border-radius: 20px; }
            `}</style>
        </div>
    )
}
