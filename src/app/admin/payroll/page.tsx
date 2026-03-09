"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Users, Zap, Wallet, Activity, Briefcase, ShieldCheck, BadgeDollarSign, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { useRestaurant } from "@/providers/RestaurantProvider"
import {
    calculatePayrollForPeriod,
    emitPayrollDocument,
    getBankDispersionData,
    getParafiscalReport,
    getAccountingExport,
    sendPayrollNotificationsBatch
} from "@/actions/payroll-engine"

// Types
import { Employee, Shift, Concept } from "./types"

// Components
import { PayrollHeader } from "@/components/admin/payroll/PayrollHeader"
import { DashboardTab } from "@/components/admin/payroll/DashboardTab"
import { EmployeesTab } from "@/components/admin/payroll/EmployeesTab"
import { ConceptsTab } from "@/components/admin/payroll/ConceptsTab"
import { RunsTab } from "@/components/admin/payroll/RunsTab"
import { AbsencesTab } from "@/components/admin/payroll/AbsencesTab"

export default function PayrollPage() {
    const { restaurant } = useRestaurant()
    const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'concepts' | 'runs' | 'absences'>('dashboard')
    const [employees, setEmployees] = useState<Employee[]>([])
    const [activeShifts, setActiveShifts] = useState<Shift[]>([])
    const [concepts, setConcepts] = useState<Concept[]>([])
    const [absences, setAbsences] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCalculating, setIsCalculating] = useState(false)
    const [isEmitting, setIsEmitting] = useState(false)
    const [recentRuns, setRecentRuns] = useState<any[]>([])

    useEffect(() => {
        if (restaurant) loadData()
    }, [restaurant])

    const loadData = async () => {
        setLoading(true)
        try {
            const [profilesRes, shiftsRes, conceptsRes, runsRes, absencesRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('restaurant_id', restaurant?.id).order('full_name', { ascending: true }),
                supabase.from('shifts').select('*, profiles(full_name)').eq('restaurant_id', restaurant?.id).eq('status', 'OPEN'),
                supabase.from('payroll_concepts').select('*').eq('restaurant_id', restaurant?.id).is('deleted_at', null),
                supabase.from('payroll_runs').select('*, payroll_periods(name)').eq('restaurant_id', restaurant?.id).order('created_at', { ascending: false }).limit(10),
                supabase.from('payroll_absences').select('*, profiles(full_name)').eq('restaurant_id', restaurant?.id).order('start_date', { ascending: false })
            ])

            if (profilesRes.data) setEmployees(profilesRes.data as Employee[])
            if (shiftsRes.data) setActiveShifts(shiftsRes.data as Shift[])
            if (conceptsRes.data) setConcepts(conceptsRes.data as Concept[])
            if (runsRes.data) setRecentRuns(runsRes.data)
            if (absencesRes.data) setAbsences(absencesRes.data)
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
                loadData()
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

    const handleEmitDIAN = async (runId: string) => {
        if (!restaurant) return;
        setIsEmitting(true);
        try {
            toast.loading("Transmitiendo nómina electrónica a la DIAN...", { id: 'dian_emit' })
            const result = await emitPayrollDocument(runId, restaurant.id)
            if (result.success) {
                toast.success(result.message, { id: 'dian_emit' })
                loadData()
            } else {
                toast.error(result.message, { id: 'dian_emit' })
            }
        } catch (error: any) {
            toast.error("Error en conexión DIAN", { id: 'dian_emit' })
        } finally {
            setIsEmitting(false)
        }
    }

    const handleDownloadBank = async (runId: string) => {
        if (!restaurant) return;
        try {
            toast.loading("Generando archivo de dispersión...", { id: 'bank_gen' })
            const result = await getBankDispersionData(runId, restaurant.id)
            if (result.success && result.data) {
                const headers = "Nombre,Documento,Tipo_Id,Banco,Tipo_Cuenta,Numero_Cuenta,Valor_Pagado\n"
                const rows = result.data.map((r: any) =>
                    `${r.full_name},${r.document_id},${r.identification_type},${r.bank_name},${r.account_type},${r.account_number},${r.total_to_pay}`
                ).join("\n")

                const blob = new Blob([headers + rows], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `DISPERSION_BANCARIA_${runId.substring(0, 8)}.csv`
                a.click()
                toast.success("Archivo de dispersión generado", { id: 'bank_gen' })
            }
        } catch (error) {
            toast.error("Error al generar archivo bancario", { id: 'bank_gen' })
        }
    }

    const handleExportAccounting = async (runId: string, format: 'SIIGO' | 'HELISA') => {
        try {
            toast.loading(`Exportando para ${format}...`, { id: 'acc_gen' })
            const res = await getAccountingExport(runId, format)
            if (res.success && res.data) {
                const blob = new Blob([res.data], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = res.filename || `export_${format}.csv`
                a.click()
                toast.success(`Archivo para ${format} generado`, { id: 'acc_gen' })
            }
        } catch (e) {
            toast.error("Error en exportación contable", { id: 'acc_gen' })
        }
    }

    const handleEmitReceipts = async (runId: string) => {
        if (!restaurant) return
        try {
            toast.loading("Enviando notificaciones a empleados...", { id: 'not_batch' })
            const res = await sendPayrollNotificationsBatch(runId, restaurant.id)
            if (res.success) {
                toast.success(res.message, { id: 'not_batch' })
            } else {
                toast.error(res.error, { id: 'not_batch' })
            }
        } catch (err) {
            toast.error("Error al emitir recibos", { id: 'not_batch' })
        }
    }

    const stats = [
        { label: 'TURNOS ACTIVOS', val: activeShifts.length.toString(), icon: Zap, color: 'text-orange-500' },
        { label: 'COSTO TOTAL EMPRESA', val: recentRuns[0] ? `$${recentRuns[0].net_total.toLocaleString()}` : '$0', icon: Wallet, color: 'text-emerald-500' },
        { label: 'CARGA PRESTACIONAL', val: '21.8%', icon: ShieldCheck, color: 'text-blue-400' }
    ]

    const menuTabs = [
        { id: 'dashboard', label: 'Dashboard Live', icon: Activity },
        { id: 'employees', label: 'Sueldos & Contratos', icon: Briefcase },
        { id: 'absences', label: 'Novedades', icon: CalendarDays },
        { id: 'concepts', label: 'Conceptos Legales', icon: ShieldCheck },
        { id: 'runs', label: 'Ejecutar Nómina', icon: BadgeDollarSign },
    ]

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen">
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-30 p-10 md:p-12 space-y-12 max-w-[1800px] mx-auto flex-1 h-full flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <PayrollHeader stats={stats} menuTabs={menuTabs} activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                    {activeTab === 'dashboard' && <DashboardTab activeShifts={activeShifts} employees={employees} onFinalizeShift={handleFinalizeShift} />}
                    {activeTab === 'employees' && <EmployeesTab employees={employees} onRefresh={loadData} />}
                    {activeTab === 'absences' && <AbsencesTab absences={absences} employees={employees} restaurantId={restaurant?.id!} onRefresh={loadData} />}
                    {activeTab === 'concepts' && <ConceptsTab concepts={concepts} />}
                    {activeTab === 'runs' && (
                        <RunsTab
                            employees={employees}
                            isCalculating={isCalculating}
                            onCalculatePayroll={handleCalculatePayroll}
                            recentRuns={recentRuns}
                            onEmitDIAN={handleEmitDIAN}
                            onDownloadBank={handleDownloadBank}
                            onDownloadParafiscal={loadData}
                            onExportAccounting={handleExportAccounting}
                            onEmitReceipts={handleEmitReceipts}
                            isEmitting={isEmitting}
                        />
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15, 23, 42, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
