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
                            <div key={i} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex items-start gap-6 group hover:border-slate-900 hover:shadow-2xl transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 transition-all pointer-events-none">
                                    <Users className="w-24 h-24 text-slate-900" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all shadow-sm">
                                        <Users className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-5 relative z-10">
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-orange-600 transition-colors leading-none">{shift.profiles?.full_name || 'Empleado'}</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 italic opacity-60">CLOCK_IN: {new Date(shift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <Button
                                        onClick={() => onFinalizeShift(shift.id, shift.profiles?.full_name || 'Empleado')}
                                        className="w-full h-12 bg-orange-600 text-white hover:bg-orange-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg shadow-orange-600/20"
                                    >
                                        FINALIZAR JORNADA
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
