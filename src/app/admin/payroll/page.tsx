"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Users, Clock, DollarSign, Loader2, ArrowLeft, Search, Filter, Activity, Calendar, Wallet, TrendingUp, MoreHorizontal, CheckCircle2, XCircle, UserPlus, Briefcase, Zap, ShieldCheck, BadgeDollarSign } from "lucide-react"
import Link from "next/link"
import { cn, formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { calculatePayrollForPeriod } from "@/actions/payroll-engine"

type Employee = {
    id: string
    full_name: string
    role: string
    is_active: boolean
    last_shift?: string
}

export default function PayrollPage() {
    const { restaurant } = useRestaurant()
    const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'concepts' | 'runs'>('dashboard')
    const [employees, setEmployees] = useState<Employee[]>([])
    const [activeShifts, setActiveShifts] = useState<any[]>([])
    const [concepts, setConcepts] = useState<any[]>([])
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

            if (profilesRes.data) setEmployees(profilesRes.data)
            if (shiftsRes.data) setActiveShifts(shiftsRes.data)
            if (conceptsRes.data) setConcepts(conceptsRes.data)
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
        <div className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-[80px] bg-slate-950/90 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12 space-y-8 max-w-[1800px] mx-auto flex flex-col min-h-screen w-full">

                {/* HEADER */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-800/40 border border-white/5">
                                <ArrowLeft className="w-6 h-6 text-slate-400" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">JAMALI <span className="text-orange-500">PAYROLL</span></h1>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2 italic shadow-sm flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Motor de Liquidación de Élite
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => toast.info("REPORTE CONTABLE: Procesando...")}
                            variant="ghost"
                            className="h-14 px-8 bg-white/5 border border-white/10 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl"
                        >
                            REPORTE CONTABLE
                        </Button>
                        <Button
                            onClick={() => toast.info("MÓDULO DE CONTRATACIÓN: Cargando perfiles...")}
                            className="h-14 px-8 bg-orange-600 text-black font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl shadow-orange-600/20"
                        >
                            <UserPlus className="w-5 h-5 mr-3" /> NUEVO COLABORADOR
                        </Button>
                    </div>
                </div>

                {/* NAVIGATION TABS */}
                <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-3xl border border-white/5 shrink-0">
                    {menuTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all font-black uppercase italic text-[10px] tracking-widest",
                                activeTab === tab.id
                                    ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                                    : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* KPI ROW */}
                <div className="grid grid-cols-3 gap-6 shrink-0">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:bg-slate-700/50 transition-all border-l-4 border-l-orange-500">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className={cn("text-3xl font-black italic", s.color)}>{s.val}</p>
                            </div>
                            <div className="p-4 bg-slate-900/40 rounded-2xl">
                                <s.icon className={cn("w-6 h-6 opacity-40 group-hover:opacity-80 transition-opacity", s.color)} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
                    {activeTab === 'dashboard' && (
                        <div className="flex-1 grid grid-cols-12 gap-10 overflow-hidden">
                            <div className="col-span-8 flex flex-col space-y-6 overflow-hidden">
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3 italic shrink-0">
                                    <Activity className="w-4 h-4 text-orange-500" /> Operación en Tiempo Real (Shifts)
                                </h2>
                                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-6 pb-10">
                                        {activeShifts.length > 0 ? activeShifts.map((shift, i) => (
                                            <div key={i} className="bg-slate-800/30 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 flex items-start gap-6 group hover:border-orange-500/40 transition-all">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-[1.75rem] bg-slate-700 flex items-center justify-center border-2 border-white/5 overflow-hidden">
                                                        <Users className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <h3 className="text-xl font-black italic tracking-tight uppercase group-hover:text-orange-400 transition-colors leading-none">{shift.profiles?.full_name || 'Empleado'}</h3>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">INICIO: {new Date(shift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleFinalizeShift(shift.id, shift.profiles?.full_name)}
                                                        className="w-full h-11 bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all border border-orange-500/20"
                                                    >
                                                        CRUZAR TURNO
                                                    </Button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-2 py-20 text-center bg-slate-950/40 rounded-[2.5rem] border border-dashed border-white/10">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Central de turnos vacía</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4 flex flex-col space-y-6 overflow-hidden">
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 italic shrink-0">Últimas Liquidaciones</h2>
                                <div className="flex-1 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4">
                                        {employees.slice(0, 10).map((emp, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black italic text-orange-500">{emp.full_name[0]}</div>
                                                    <div>
                                                        <p className="text-xs font-black italic uppercase tracking-tight">{emp.full_name}</p>
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">PAGO PROCESADO</p>
                                                    </div>
                                                </div>
                                                <TrendingUp className="w-4 h-4 text-emerald-500/40" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'employees' && (
                        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col">
                            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-8 shrink-0">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">SUELDOS & <span className="text-orange-500">CONTRATOS</span></h2>
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="BUSCAR COLABORADOR..."
                                                className="bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-orange-500/50 transition-all w-64"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    <table className="w-full text-left border-separate border-spacing-y-3">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic">
                                                <th className="px-6 py-4">COLABORADOR</th>
                                                <th className="px-6 py-4">CONTRATO</th>
                                                <th className="px-6 py-4">SUELDO BASE</th>
                                                <th className="px-6 py-4">COMISIÓN %</th>
                                                <th className="px-6 py-4">ESTADO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map((emp: any, i) => (
                                                <tr key={i} className="bg-white/[0.03] hover:bg-white/[0.08] transition-colors rounded-2xl group">
                                                    <td className="px-6 py-5 first:rounded-l-2xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center font-black italic text-orange-500 border border-orange-500/20">
                                                                {emp.full_name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black italic uppercase tracking-tight text-white">{emp.full_name}</p>
                                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{emp.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase italic rounded-lg border border-blue-500/20">
                                                            {emp.contract_type || 'INDEFINIDO'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-black italic text-white">{formatPrice(emp.base_salary || 0)}</p>
                                                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest italic">VALOR MENSUAL</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden">
                                                                <div className="h-full bg-orange-500" style={{ width: `${emp.commission_percentage || 0}%` }} />
                                                            </div>
                                                            <span className="text-xs font-black italic text-orange-500">{emp.commission_percentage || 0}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 last:rounded-r-2xl">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase italic">ACTIVO</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'concepts' && (
                        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-10 shrink-0">
                                    <div>
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">CONFIGURACIÓN LEGAL</h2>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Catálogo de Devengados y Deducciones</p>
                                    </div>
                                    <Button className="bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest h-12 px-6 rounded-xl hover:bg-white/10">
                                        AÑADIR CONCEPTO
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-4">
                                    {concepts.length > 0 ? concepts.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                                                    c.type === 'EARNING' ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                                                )}>
                                                    {c.type === 'EARNING' ? '+' : '-'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black italic uppercase tracking-tight">{c.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black italic">{c.percentage ? `${c.percentage}%` : 'VALOR FIJO'}</p>
                                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{c.is_legal ? 'REGLA DE LEY' : 'BENEFICIO EXTRA'}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                            <ShieldCheck className="w-16 h-16 mb-4" />
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">Cargando configuración legal...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'runs' && (
                        <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
                            <div className="max-w-xl w-full text-center space-y-10 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-600 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <Wallet className="w-32 h-32 text-orange-500 mx-auto relative z-10 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">EJECUTAR <span className="text-orange-500">LIQUIDACIÓN</span></h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em] italic">PROCESO MAESTRO DE NÓMINA - PERIODO ACTUAL</p>
                                </div>
                                <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                                    <div className="flex justify-between text-left">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Empleados a Liquidar</p>
                                            <p className="text-2xl font-black italic uppercase">{employees.length}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Estimada</p>
                                            <p className="text-2xl font-black italic uppercase text-orange-500">$9.240.000</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleCalculatePayroll}
                                        disabled={isCalculating}
                                        className="w-full h-20 bg-orange-600 hover:bg-orange-700 text-black font-black uppercase text-base italic tracking-widest rounded-3xl shadow-2xl shadow-orange-600/20 active:scale-95 transition-all"
                                    >
                                        {isCalculating ? (
                                            <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> PROCESANDO NÓMINA...</>
                                        ) : (
                                            "INICIAR DISPERSIÓN DE PAGOS / EJECUTAR CÁLCULO"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
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
