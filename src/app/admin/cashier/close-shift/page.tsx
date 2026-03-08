"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { DENOMINATIONS } from "@/components/admin/cashier/close-shift/types"
import { CloseShiftSuccess } from "@/components/admin/cashier/close-shift/CloseShiftSuccess"
import { CloseShiftHeader } from "@/components/admin/cashier/close-shift/CloseShiftHeader"
import { CloseShiftCalculator } from "@/components/admin/cashier/close-shift/CloseShiftCalculator"
import { CloseShiftSummary } from "@/components/admin/cashier/close-shift/CloseShiftSummary"

export default function CloseShiftPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState(1) // 1: Arqueo, 2: Resumen, 3: Éxito
    const [counts, setCounts] = useState<Record<number, number>>({})
    const [systemTotal, setSystemTotal] = useState(0) // Lo que el sistema espera
    const [baseAmount, setBaseAmount] = useState(0)
    const [cashSales, setCashSales] = useState(0)
    const [cardSales, setCardSales] = useState(0)
    const [transferSales, setTransferSales] = useState(0)
    const [creditSales, setCreditSales] = useState(0)
    const [expenses, setExpenses] = useState(0)

    // Datos de Sesión
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [shiftId, setShiftId] = useState<string | null>(null)

    useEffect(() => {
        loadSessionData()
    }, [])

    const loadSessionData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Buscar Perfil y Turno Activo
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, restaurant_id')
                .eq('id', user.id)
                .single()

            const { data: shift } = await supabase
                .from('shifts')
                .select('id')
                .eq('user_id', user.id)
                .is('ended_at', null)
                .single()

            if (!shift) {
                toast.error("No tienes un turno activo para cerrar")
                router.push('/admin/cashier/start-shift') // Redirigir a inicio
                return
            }
            setShiftId(shift.id)

            // 2. Buscar Sesión de Caja Activa
            const { data: session } = await supabase
                .from('cashbox_sessions')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'OPEN')
                .maybeSingle()

            if (session) {
                setSessionId(session.id)
                setBaseAmount(session.opening_amount || 0)

                // 3. Calcular Ventas por Método de ESTA sesión
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total, payment_method')
                    .gte('created_at', session.opened_at)
                    .in('status', ['delivered', 'paid', 'payment_requested'])
                    .eq('payment_status', 'paid')

                const salesByMethod = (orders || []).reduce((acc: any, order) => {
                    const method = order.payment_method || 'cash'
                    acc[method] = (acc[method] || 0) + (order.total || 0)
                    return acc
                }, {})

                setCashSales(salesByMethod.cash || 0)
                setCardSales(salesByMethod.card || 0)
                setTransferSales(salesByMethod.transfer || 0)
                setCreditSales(salesByMethod.credit || 0)

                // 4. Calcular Egresos de Caja Menor de ESTA sesión
                const { data: vouchers } = await supabase
                    .from('petty_cash_vouchers')
                    .select('amount')
                    .gte('created_at', session.opened_at)
                    .eq('restaurant_id', profile?.restaurant_id)

                const calculatedExpenses = vouchers?.reduce((sum, v) => sum + (v.amount || 0), 0) || 0
                setExpenses(calculatedExpenses)

                // TOTAL ESPERADO EN CAJA (EL EFECTIVO)
                setSystemTotal((session.opening_amount || 0) + (salesByMethod.cash || 0) - calculatedExpenses)
                setLoading(false)
            } else {
                setSystemTotal(0)
                setLoading(false)
            }

        } catch (error) {
            console.error("Error loading shift", error)
            setLoading(false)
        }
    }

    const handleCountChange = (denom: number, qty: string) => {
        const val = parseInt(qty) || 0
        setCounts(prev => ({ ...prev, [denom]: val }))
    }

    const calculatedTotal = DENOMINATIONS.reduce((sum, d) => sum + (d.value * (counts[d.value] || 0)), 0)
    const difference = calculatedTotal - systemTotal

    const handleCloseShift = async () => {
        if (!shiftId) return

        setLoading(true)
        try {
            const now = new Date().toISOString()
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Cerrar Sesión de Caja (si existe)
            if (sessionId) {
                const { error: sessionError } = await supabase.from('cashbox_sessions').update({
                    status: 'CLOSED',
                    closing_time: now,
                    closing_amount: calculatedTotal,
                    system_amount: systemTotal,
                    closing_notes: "Cierre asistido por Smart Z-Report"
                }).eq('id', sessionId)

                if (sessionError) throw sessionError
            }

            // 2. Cerrar Turno
            const { error: shiftError } = await supabase.from('shifts').update({
                ended_at: now,
                status: 'CLOSED'
            }).eq('id', shiftId)

            if (shiftError) throw shiftError

            setStep(3) // Éxito
            toast.success("Turno y caja cerrados correctamente")
        } catch (error: any) {
            console.error("Error closing", error)
            toast.error("Error al cerrar el turno: " + (error.message || "Error desconocido"))
        } finally {
            setLoading(false)
        }
    }

    if (loading && step !== 3) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    }

    if (step === 3) {
        return (
            <CloseShiftSuccess
                cashSales={cashSales}
                cardSales={cardSales}
                transferSales={transferSales}
                creditSales={creditSales}
                difference={difference}
            />
        )
    }

    return (
        <div className="min-h-screen bg-muted pb-20 font-sans">
            <CloseShiftHeader systemTotal={systemTotal} />
            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-6">
                <CloseShiftCalculator
                    counts={counts}
                    handleCountChange={handleCountChange}
                    calculatedTotal={calculatedTotal}
                />
                <CloseShiftSummary
                    systemTotal={systemTotal}
                    difference={difference}
                    calculatedTotal={calculatedTotal}
                    handleCloseShift={handleCloseShift}
                />
            </div>
        </div>
    )
}
