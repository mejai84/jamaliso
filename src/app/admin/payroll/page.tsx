"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Users, Zap, Wallet, Activity, Briefcase, ShieldCheck, BadgeDollarSign } from "lucide-react"
import { toast } from "sonner"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { calculatePayrollForPeriod } from "@/actions/payroll-engine"

// Types
import { Employee, Shift, Concept } from "./types"

// Components
import { PayrollHeader } from "@/components/admin/payroll/PayrollHeader"
import { DashboardTab } from "@/components/admin/payroll/DashboardTab"
import { EmployeesTab } from "@/components/admin/payroll/EmployeesTab"
import { ConceptsTab } from "@/components/admin/payroll/ConceptsTab"
import { RunsTab } from "@/components/admin/payroll/RunsTab"

export default function PayrollPage() {
    const { restaurant } = useRestaurant()
    const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'concepts' | 'runs'>('dashboard')
    const [employees, setEmployees] = useState<Employee[]>([])
    const [activeShifts, setActiveShifts] = useState<Shift[]>([])
    const [concepts, setConcepts] = useState<Concept[]>([])
    const [loading, setLoading] = useState(true)
    const [isCalculating, setIsCalculating] = useState(false)

    useEffect(() => {
        if (restaurant) loadData()
    }, [restaurant])

    const loadData = async () => {
        setLoading(true)
        try {
            const [profilesRes, shiftsRes, conceptsRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('restaurant_id', restaurant?.id).order('full_name', { ascending: true }),
                supabase.from('shifts').select('*, profiles(full_name)').eq('restaurant_id', restaurant?.id).eq('status', 'OPEN'),
                supabase.from('payroll_concepts').select('*').eq('restaurant_id', restaurant?.id).is('deleted_at', null)
            ])

            if (profilesRes.data) setEmployees(profilesRes.data as Employee[])
            if (shiftsRes.data) setActiveShifts(shiftsRes.data as Shift[])
            if (conceptsRes.data) setConcepts(conceptsRes.data as Concept[])
        } catch (error) {
            console.error("Error loading payroll data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleFinalizeShift = async (shiftId: string, empName: string) => {
        if (!confirm(`¿Deseas finalizar forzosamente el turno de ${empName}?`)) return
        const { error } = await supabase.from('shifts').update({ status: 'CLOSED', ended_at: new Date().toISOString() }).eq('id', shiftId)
        if (!error) { toast.success(`TURNO DE ${empName} FINALIZADO`); loadData(); }
        else { toast.error("Error: " + error.message) }
    }

    const handleCalculatePayroll = async () => {
        if (!restaurant) return;
        setIsCalculating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("No session found")

            // 1. Get or create an open period for this month
            let { data: period } = await supabase
                .from('payroll_periods')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .eq('status', 'OPEN')
                .maybeSingle()

            if (!period) {
                const start = new Date()
                start.setDate(1)
                const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)

                const { data: newPeriod, error: pErr } = await supabase
                    .from('payroll_periods')
                    .insert({
                        restaurant_id: restaurant.id,
                        name: `Periodo ${start.toLocaleString('es', { month: 'long' }).toUpperCase()}`,
                        start_date: start.toISOString().split('T')[0],
                        end_date: end.toISOString().split('T')[0],
                        status: 'OPEN'
                    })
                    .select()
                    .single()

                if (pErr) throw pErr
                period = newPeriod
            }

            toast.loading("Calculando nómina, horas extra y comisiones...", { id: 'payroll_calc' })

            const result = await calculatePayrollForPeriod(restaurant.id, period.id, session.user.id)

            if (result.success) {
                toast.success(result.message, { id: 'payroll_calc' })
            } else {
                toast.error(result.message || "Error al calcular nómina", { id: 'payroll_calc' })
            }
        } catch (error: any) {
            console.error("Payroll Error:", error)
            toast.error(error.message || "Error inesperado", { id: 'payroll_calc' })
        } finally {
            setIsCalculating(false)
        }
    }

    const stats = [
        { label: 'TURNOS ACTIVOS', val: activeShifts.length.toString(), icon: Zap, color: 'text-orange-500' },
        { label: 'NÓMINA PENDIENTE', val: '$450.000', icon: Wallet, color: 'text-emerald-500' },
        { label: 'COLABORADORES', val: employees.length.toString(), icon: Users, color: 'text-blue-400' }
    ]

    const menuTabs = [
        { id: 'dashboard', label: 'Dashboard Live', icon: Activity },
        { id: 'employees', label: 'Sueldos & Contratos', icon: Briefcase },
        { id: 'concepts', label: 'Conceptos Legales', icon: ShieldCheck },
        { id: 'runs', label: 'Ejecutar Nómina', icon: BadgeDollarSign },
    ]

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen">
            {/* 🖼️ FONDO PREMIUM PIXORA (Standardized Across Modules) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-30 p-10 md:p-12 space-y-12 max-w-[1800px] mx-auto flex-1 h-full flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-1000">

                <PayrollHeader
                    stats={stats}
                    menuTabs={menuTabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                    {activeTab === 'dashboard' && (
                        <DashboardTab
                            activeShifts={activeShifts}
                            employees={employees}
                            onFinalizeShift={handleFinalizeShift}
                        />
                    )}

                    {activeTab === 'employees' && (
                        <EmployeesTab employees={employees} />
                    )}

                    {activeTab === 'concepts' && (
                        <ConceptsTab concepts={concepts} />
                    )}

                    {activeTab === 'runs' && (
                        <RunsTab
                            employees={employees}
                            isCalculating={isCalculating}
                            onCalculatePayroll={handleCalculatePayroll}
                        />
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255, 255, 255, 0.05); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    );
}
