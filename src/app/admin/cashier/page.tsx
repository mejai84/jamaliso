"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { getPosStatus, PosStatus, processOrderPayment } from "@/actions/pos"
import { Loader2, Activity, ArrowRight, Wallet, CreditCard, Banknote, X, MessageSquare } from "lucide-react"
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
    const [pendingOrders, setPendingOrders] = useState<any[]>([])

    const [modalOpen, setModalOpen] = useState<'income' | 'expense' | 'audit' | 'close' | 'z-report' | 'petty-cash-transfer' | null>(null)
    const [submittingModal, setSubmittingModal] = useState(false)
    const [zReportData, setZReportData] = useState<any>(null)
    const [activeVoucher, setActiveVoucher] = useState<any>(null)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push("/login")

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setCurrentUser(profile)

            try {
                if (!restaurant?.id) return
                const posStatus = await getPosStatus(undefined, restaurant.id)
                setStatus(posStatus)

                if (!posStatus.hasActiveShift) {
                    router.push("/admin/cashier/start-shift")
                    return
                }
                if (!posStatus.hasOpenCashbox) {
                    router.push("/admin/cashier/open-box")
                    return
                }

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

        if (restaurant?.id) {
            init()
        }
    }, [restaurant?.id, router])

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

        // Fetch mesas con pedidos pendientes de cobro
        const { data: occupiedTables } = await supabase
            .from('tables')
            .select('id, table_name, table_number, status')
            .eq('restaurant_id', restaurant?.id)
            .eq('status', 'occupied')

        const tableIds = (occupiedTables || []).map(t => t.id)
        let filteredPending: any[] = []
        if (tableIds.length > 0) {
            const { data: activeOrders } = await supabase
                .from('orders')
                .select('id, table_id, total, status, created_at')
                .in('table_id', tableIds)
                .in('status', ['payment_requested', 'delivered', 'ready'])
                .order('created_at', { ascending: false })

            filteredPending = (occupiedTables || [])
                .map(t => {
                    const order = (activeOrders || []).find(o => o.table_id === t.id)
                    return order ? { ...t, active_order: order } : null
                })
                .filter(Boolean)
        }
        setPendingOrders(filteredPending)
        setRefreshing(false)
    }

    const handleMovementSubmit = async (amount: number, reason: string) => {
        if (!status?.activeCashboxSession || amount <= 0) return
        setSubmittingModal(true)
        const currentModal = modalOpen
        try {
            const { transferToPettyCash } = await import("@/actions/pos")
            let voucherType: 'DEPOSIT' | 'WITHDRAWAL' | 'PETTY_CASH' = 'DEPOSIT'

            if (currentModal === 'petty-cash-transfer') {
                await transferToPettyCash(status.activeCashboxSession.id, amount, reason)
                toast.success("Transferencia a Caja Menor exitosa")
                voucherType = 'PETTY_CASH'
            } else {
                const type = currentModal === 'income' ? 'DEPOSIT' : 'WITHDRAWAL'
                voucherType = type
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

            setActiveVoucher({
                id: (Math.random() * 1000000).toString(),
                type: voucherType,
                amount,
                description: reason,
                date: new Date(),
                user: currentUser?.full_name || 'ADMINISTRADOR'
            })

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
                if (res.isBlind) {
                    toast.success("ARQUEO CIEGO REGISTRADO", {
                        description: "Informe de arqueo guardado. La conciliación final será realizada por un supervisor.",
                        icon: "🔒"
                    })
                } else {
                    toast.success(`Arqueo registrado. DIFERENCIA: $${res.difference?.toLocaleString()}`)
                }
                setModalOpen(null)
            } else {
                const result = await closeCashbox(status.activeCashboxSession.id, amount, reason)
                if (result.isBlind) {
                    toast.success("CIERRE DE CAJA REGISTRADO", {
                        description: "Turno finalizado exitosamente. Sesión blindada.",
                        icon: "🔒"
                    })
                    router.push('/admin')
                } else {
                    setZReportData({
                        systemAmount: result.systemAmount,
                        countedAmount: amount,
                        difference: result.difference,
                        sales: balance.sales,
                        expenses: balance.expenses
                    })
                    setModalOpen('z-report')
                }
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSubmittingModal(false)
        }
    }

    const handlePaymentConfirm = async (method: 'cash' | 'card' | 'transfer') => {
        if (!selectedOrder) return
        setIsProcessingPayment(true)
        try {
            const res = await processOrderPayment(
                selectedOrder.active_order.id,
                method as any,
                selectedOrder.active_order.total,
                0 // Propina opcional
            )

            if (res.success) {
                toast.success("ORDEN PAGADA", { description: "La cuenta ha sido cerrada correctamente." })
                setSelectedOrder(null)
                fetchDashboardData(status?.activeCashboxSession?.id!)
            } else {
                toast.error(res.error)
            }
        } catch (e: any) {
            toast.error("Error: " + e.message)
        } finally {
            setIsProcessingPayment(false)
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
            {/* 🖼️ FONDO PREMIUM PIXORA */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-4 md:p-10 flex-1 flex flex-col overflow-hidden max-w-[1700px] mx-auto w-full">
                <CashierHeader currentUser={currentUser} refreshing={refreshing} onRefresh={() => fetchDashboardData(status?.activeCashboxSession?.id!)} />

                <div className="mt-4 md:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden no-scrollbar">
                    {/* LEFT PANEL: Summary & Orders */}
                    <div className="lg:col-span-4 space-y-6 md:space-y-8 flex flex-col lg:overflow-y-auto lg:pr-2 custom-scrollbar shrink-0">
                        <BalanceSummary balance={balance} cashLimit={CASH_LIMIT} />

                        <QuickCommands
                            onIncome={() => setModalOpen('income')}
                            onExpense={() => setModalOpen('expense')}
                            onPettyCash={() => setModalOpen('petty-cash-transfer')}
                            onAudit={() => setModalOpen('audit')}
                        />

                        {/* 📋 WIDGET DE MESAS POR COBRAR */}
                        <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                                <Activity className="w-24 h-24 text-white" />
                            </div>
                            <div className="flex items-center justify-between relative z-10">
                                <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white">Mesas por <span className="text-orange-500">Cobrar</span></h3>
                                <span className="bg-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-bounce">
                                    {pendingOrders.length} PENDIENTES
                                </span>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {pendingOrders.length > 0 ? pendingOrders.map((table) => (
                                    <div
                                        key={table.id}
                                        className={cn(
                                            "bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group/item",
                                            table.active_order?.status === 'payment_requested' && "border-orange-500/50 bg-orange-500/10 ring-2 ring-orange-500/20"
                                        )}
                                        onClick={() => setSelectedOrder(table)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-white transition-all",
                                                table.active_order?.status === 'payment_requested' ? "bg-orange-600 scale-110 shadow-lg shadow-orange-600/20" : "bg-slate-800"
                                            )}>
                                                {table.table_name.replace(/\D/g, '') || table.table_number}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic leading-none">
                                                        {table.active_order?.status === 'payment_requested' ? "CUENTA SOLICITADA" : "ORDEN EN CURSO"}
                                                    </p>
                                                    {table.active_order?.status === 'payment_requested' && (
                                                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                                                    )}
                                                </div>
                                                <p className="text-white font-black italic uppercase tracking-tighter leading-none mt-1">{table.table_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div className="hidden group-hover/item:flex items-center gap-1 bg-orange-600 text-white text-[8px] font-black px-2 py-1 rounded-lg animate-in fade-in slide-in-from-right-1">
                                                CERRAR <ArrowRight className="w-2 h-2" />
                                            </div>
                                            <p className="text-orange-500 font-black italic text-lg tracking-tighter">${(table.active_order as any)?.total?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">No hay cuentas pendientes</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: History Log */}
                    <div className="lg:col-span-8 flex flex-col min-h-[400px] lg:min-h-0 bg-white border-2 border-slate-100 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-900/5">
                        <MovementLog movements={movements} refreshing={refreshing} />
                    </div>
                </div>

                {/* Status Footer */}
                <div className="mt-4 md:mt-8 p-6 bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Activity className="w-24 h-24 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                            <Activity className="w-6 h-6 md:w-7 md:h-7 text-orange-500 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tighter"><span className="text-orange-500">Master</span> POS Ledger</h4>
                            <p className="text-[7px] md:text-[8px] text-white/40 font-black uppercase tracking-[0.4em] italic leading-none">CORE FINANCIAL OPERATIONS ACTIVE • SYNC v8.42</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">SISTEMA SINCRONIZADO ✅</span>
                    </div>
                </div>
            </div>

            {/* MODALS */}
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
                restaurant={restaurant}
            />

            <VoucherModal
                data={activeVoucher}
                onClose={() => setActiveVoucher(null)}
                restaurant={restaurant}
            />

            {/* 💳 MODAL DE COBRO DIRECTO */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-orange-600/20">
                                    {selectedOrder.table_name.replace(/\D/g, '')}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Cerrar <span className="text-orange-600">Cuenta</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic">{selectedOrder.table_name} • MESA OCUPADA</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-900 rounded-[2rem] p-8 text-center space-y-2 border-4 border-slate-800 shadow-2xl">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">Total Neto Recaudado</p>
                                <p className="text-5xl md:text-6xl font-black italic tracking-tighter text-orange-500">${selectedOrder.active_order.total.toLocaleString()}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    disabled={isProcessingPayment}
                                    onClick={() => handlePaymentConfirm('cash')}
                                    className="h-24 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-3xl flex flex-col items-center justify-center gap-1 hover:bg-emerald-600 hover:text-white transition-all group disabled:opacity-50"
                                >
                                    <Banknote className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">EFECTIVO</span>
                                </button>
                                <button
                                    disabled={isProcessingPayment}
                                    onClick={() => handlePaymentConfirm('card')}
                                    className="h-24 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-3xl flex flex-col items-center justify-center gap-1 hover:bg-blue-600 hover:text-white transition-all group disabled:opacity-50"
                                >
                                    <CreditCard className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">TARJETA</span>
                                </button>
                                <button
                                    disabled={isProcessingPayment}
                                    onClick={() => handlePaymentConfirm('transfer')}
                                    className="md:col-span-2 h-16 bg-slate-50 text-slate-600 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all group disabled:opacity-50"
                                >
                                    <Wallet className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">TRANSFERENCIA BANCARIA</span>
                                </button>
                            </div>

                            <Button
                                onClick={() => router.push(`/admin/orders?table=${selectedOrder.id}`)}
                                variant="ghost"
                                className="w-full text-slate-400 text-[9px] font-black uppercase tracking-widest italic hover:text-orange-600"
                            >
                                <MessageSquare className="w-4 h-4 mr-2" /> VER DETALLE DE COMANDA COMPLETA
                            </Button>
                        </div>
                        {isProcessingPayment && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
                                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-orange-600 animate-pulse">PROCESANDO TRANSACCIÓN...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,77,0,0.1); border-radius: 20px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
