"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Plus, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { registerAbsence } from "@/actions/payroll-engine"

interface AbsencesTabProps {
    absences: any[]
    employees: any[]
    restaurantId: string
    onRefresh: () => void
}

export function AbsencesTab({ absences, employees, restaurantId, onRefresh }: AbsencesTabProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const totalAbsenceDays = absences.reduce((acc, curr) => acc + (curr.days || 0), 0)

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'INCAPACITY': return 'bg-rose-500'
            case 'VACATION': return 'bg-emerald-500'
            case 'PERMIT_PAID': return 'bg-blue-500'
            default: return 'bg-slate-400'
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            restaurant_id: restaurantId,
            employee_id: formData.get('employee_id') as string,
            type: formData.get('type') as any,
            start_date: formData.get('start_date') as string,
            end_date: formData.get('end_date') as string,
            description: formData.get('description') as string
        }

        try {
            const res = await registerAbsence(data)
            if (res.success) {
                toast.success("Novedad registrada")
                setIsAdding(false)
                onRefresh()
            } else {
                toast.error(res.error)
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Gestión de <span className="text-orange-500">Novedades</span></h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] italic mt-2">CALENDARIO DE AUSENTISMOS Y PERMISOS</p>
                </div>
                <Button
                    onClick={() => setIsAdding(true)}
                    className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase italic tracking-widest text-[11px] hover:bg-slate-800 shadow-xl shadow-slate-900/20"
                >
                    <Plus className="w-4 h-4 mr-2 text-orange-500" /> Registrar Novedad
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
                {/* LISTADO DE NOVEDADES */}
                <div className="lg:col-span-8 bg-white/40 border-2 border-slate-100 rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar shadow-sm">
                    {absences.length > 0 ? (
                        <div className="space-y-4">
                            {absences.map((abs, i) => (
                                <div key={i} className="bg-white border-2 border-slate-50 rounded-3xl p-6 flex items-center justify-between group hover:border-orange-500/20 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${getStatusColor(abs.type)}`}>
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black italic uppercase text-slate-900">{abs.profiles?.full_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{abs.type}</span>
                                                <span className="text-[10px] font-bold text-slate-500 italic">Del {new Date(abs.start_date).toLocaleDateString()} al {new Date(abs.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black italic uppercase text-slate-900">{abs.days} DÍAS</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{abs.is_processed ? 'PROCESADO' : 'PENDIENTE LIQUIDACIÓN'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                            <CalendarIcon className="w-20 h-20 mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest italic">No hay novedades registradas en este periodo</p>
                        </div>
                    )}
                </div>

                {/* RESUMEN DE IMPACTO */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Clock className="w-24 h-24 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter relative z-10">Impacto en <span className="text-orange-500">Costo</span></h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center py-3 border-b border-white/10 text-white/60">
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Días no laborados</span>
                                <span className="text-lg font-black italic text-orange-500">{totalAbsenceDays} DÍAS</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/10 text-white/60">
                                <span className="text-[10px] font-black uppercase tracking-widest italic">Ahorro en Aux. Transporte</span>
                                <span className="text-lg font-black italic">$0</span>
                            </div>
                            <div className="pt-4">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic">Sincronización Automática</p>
                                <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase italic">Las novedades afectan proporcionalmente el cálculo del Salario Básico y Auxilios legales en la próxima liquidación.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Guía Rápida</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                                <p className="text-[10px] text-slate-600 font-bold uppercase italic">Incapacidades: Se liquidan al 66.67% (Ley 100).</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />
                                <p className="text-[10px] text-slate-600 font-bold uppercase italic">Vacaciones: Provisiones automáticas IFRS.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL PARA AGREGAR NOVEDAD */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Nueva <span className="text-orange-600">Novedad</span></h3>
                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic">Registro de ausentismo legal</p>
                                </div>
                                <button type="button" onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors text-xl">✕</button>
                            </div>

                            <div className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Colaborador</label>
                                    <select name="employee_id" required className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-orange-500 outline-none appearance-none">
                                        <option value="">Seleccionar empleado...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Tipo de Novedad</label>
                                        <select name="type" required className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-orange-500 outline-none">
                                            <option value="INCAPACITY">Incapacidad</option>
                                            <option value="PERMIT_PAID">Permiso Remunerado</option>
                                            <option value="PERMIT_UNPAID">Permiso No Remun.</option>
                                            <option value="VACATION">Vacaciones</option>
                                            <option value="SUSPENSION">Suspensión</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Fecha Inicio</label>
                                        <input name="start_date" type="date" required className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-orange-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Fecha Fin</label>
                                        <input name="end_date" type="date" required className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:border-orange-500 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Justificación / Descripción</label>
                                    <textarea name="description" rows={3} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 font-bold text-slate-900 focus:border-orange-500 outline-none resize-none" placeholder="Escriba motivo detallado..."></textarea>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black italic uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20"
                                >
                                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "REGISTRAR EN HISTORIAL"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function Loader2({ className }: { className?: string }) {
    return <Clock className={`animate-spin ${className}`} />
}
