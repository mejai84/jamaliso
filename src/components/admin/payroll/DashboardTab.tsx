"use client"

import { Activity, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Shift, Employee } from "@/app/admin/payroll/types"

interface DashboardTabProps {
    activeShifts: Shift[]
    employees: Employee[]
    onFinalizeShift: (shiftId: string, empName: string) => void
}

export function DashboardTab({ activeShifts, employees, onFinalizeShift }: DashboardTabProps) {
    return (
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-8 overflow-hidden font-sans">
            <div className="lg:col-span-8 flex flex-col space-y-4 overflow-hidden">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-2 italic shrink-0">
                    <Activity className="w-4 h-4 text-orange-500" /> Operación en Tiempo Real
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                        {activeShifts.length > 0 ? activeShifts.map((shift, i) => (
                            <div key={i} className="bg-white/60 backdrop-blur-2xl border border-slate-200 rounded-3xl p-6 flex items-start gap-5 group hover:border-orange-500/40 transition-all shadow-sm">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 overflow-hidden">
                                        <Users className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tight uppercase group-hover:text-orange-400 transition-colors leading-none">{shift.profiles?.full_name || 'Empleado'}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">INICIO: {new Date(shift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <Button
                                        onClick={() => onFinalizeShift(shift.id, shift.profiles?.full_name || 'Empleado')}
                                        className="w-full h-11 bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all border border-orange-500/20"
                                    >
                                        CRUZAR TURNO
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-1 md:col-span-2 py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Central de turnos vacía</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-4 flex flex-col space-y-4 overflow-hidden">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic shrink-0">Últimas Liquidaciones</h2>
                <div className="flex-1 bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[2rem] p-6 overflow-y-auto custom-scrollbar shadow-sm">
                    <div className="space-y-3">
                        {employees.slice(0, 10).map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 hover:border-orange-500/30 transition-colors shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center font-black italic text-orange-500">{emp.full_name[0]}</div>
                                    <div>
                                        <p className="text-[11px] font-black italic uppercase tracking-tight">{emp.full_name}</p>
                                        <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">PAGO PROCESADO</p>
                                    </div>
                                </div>
                                <TrendingUp className="w-3 h-3 text-emerald-500/40" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
