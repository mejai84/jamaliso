"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { getPosStatus, PosStatus } from "@/actions/pos"
import { Loader2, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRestaurant } from "@/providers/RestaurantProvider"
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
import { VoucherModal } from "@/components/admin/cashier/VoucherModal"

const CASH_LIMIT = 1000000

export default function CashierPage() {
    const { restaurant } = useRestaurant()
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
    const [activeVoucher, setActiveVoucher] = useState<any>(null)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push("/login")

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setCurrentUser(profile)

            try {
                const posStatus = await getPosStatus()
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
        const currentModal = modalOpen
        try {
            const { transferToPettyCash } = await import("@/actions/pos")
            if (currentModal === 'petty-cash-transfer') {
                await transferToPettyCash(status.activeCashboxSession.id, amount, reason)
                toast.success("Transferencia a Caja Menor exitosa")
            } else {
                const type = currentModal === 'income' ? 'DEPOSIT' : 'WITHDRAWAL'
                const { error } = await supabase.from('cash_movements').insert({
                    cashbox_session_id: status.activeCashboxSession.id,
                    user_id: currentUser.id,
                    movement_type: type,
                    amount,
                    description: reason
                })
                if (error) throw error
                toast.success("Movimiento registrado con éxito")

                // Open professional voucher
                setActiveVoucher({
                    id: (Math.random() * 1000000).toString(), // Fallback if no ID available
                    type: currentModal === 'petty-cash-transfer' ? 'PETTY_CASH' : (currentModal === 'income' ? 'DEPOSIT' : 'WITHDRAWAL'),
                    amount,
                    description: reason,
                    date: new Date(),
                    user: currentUser?.full_name || 'ADMINISTRADOR'
                })
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
                const res = await performPartialAudit(status.activeCashboxSession.id, amount, reason)
                toast.success(`Arqueo registrado. DIFERENCIA: $${res.difference.toLocaleString()}`)
                setModalOpen(null)
            } else {
                const result = await closeCashbox(status.activeCashboxSession.id, amount, reason)
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
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen">
            {/* 🖼️ FONDO PREMIUM PIXORA (Standardized Across Modules) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-6 md:p-10 flex-1 flex flex-col overflow-hidden max-w-[1700px] mx-auto w-full">
                <CashierHeader currentUser={currentUser} refreshing={refreshing} onRefresh={() => fetchDashboardData(status?.activeCashboxSession?.id!)} />

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                    <div className="lg:col-span-4 space-y-8 flex flex-col lg:overflow-y-auto pr-2 custom-scrollbar">
                        <BalanceSummary balance={balance} cashLimit={CASH_LIMIT} />
                        <QuickCommands
                            onIncome={() => setModalOpen('income')}
                            onExpense={() => setModalOpen('expense')}
                            onPettyCash={() => setModalOpen('petty-cash-transfer')}
                            onAudit={() => setModalOpen('audit')}
                        />
                    </div>

                    <div className="lg:col-span-8 flex flex-col min-h-0 bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-900/5">
                        <MovementLog movements={movements} refreshing={refreshing} />
                    </div>
                </div>

                {/* Status Footer */}
                <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Activity className="w-24 h-24 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                            <Activity className="w-7 h-7 text-orange-500 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black italic uppercase tracking-tighter"><span className="text-orange-500">Master</span> POS Ledger</h4>
                            <p className="text-[8px] text-white/40 font-black uppercase tracking-[0.4em] italic leading-none">CORE FINANCIAL OPERATIONS ACTIVE • SYNC v8.42</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">SISTEMA BLINDADO ✅</span>
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

            <VoucherModal
                data={activeVoucher}
                onClose={() => setActiveVoucher(null)}
                restaurant={restaurant}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,77,0,0.1); border-radius: 20px; }
            `}</style>
        </div>
    )
}
