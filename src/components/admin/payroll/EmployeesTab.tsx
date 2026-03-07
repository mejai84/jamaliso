"use client"

import { Search } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { Employee } from "@/app/admin/payroll/types"

interface EmployeesTabProps {
    employees: Employee[]
}

export function EmployeesTab({ employees }: EmployeesTabProps) {
    return (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden flex flex-col font-sans">
            <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[2rem] p-6 h-full flex flex-col shadow-sm">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h2 className="text-lg font-black italic uppercase tracking-tighter">SUELDOS & <span className="text-orange-500">CONTRATOS</span></h2>
                    <div className="flex gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="BUSCAR COLABORADOR..."
                                className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-[9px] font-black uppercase italic outline-none focus:border-orange-500/50 transition-all w-48 text-slate-900"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] italic">
                                <th className="px-4 py-3">COLABORADOR</th>
                                <th className="px-4 py-3 hidden md:table-cell">CONTRATO</th>
                                <th className="px-4 py-3">SUELDO BASE</th>
                                <th className="px-4 py-3 hidden md:table-cell">COMISIÓN %</th>
                                <th className="px-4 py-3">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <tr key={i} className="bg-white hover:bg-slate-50 shadow-sm border border-slate-100 transition-colors rounded-xl group">
                                    <td className="px-4 py-3 first:rounded-l-xl border-y border-l border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center font-black italic text-orange-500 border border-orange-100">
                                                {emp.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black italic uppercase tracking-tight text-slate-900">{emp.full_name}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 border-y border-slate-100 hidden md:table-cell">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase italic rounded-md border border-blue-100">
                                            {emp.contract_type || 'INDEFINIDO'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 border-y border-slate-100">
                                        <p className="text-xs font-black italic text-slate-900">{formatPrice(emp.base_salary || 0)}</p>
                                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest italic">VALOR MENSUAL</p>
                                    </td>
                                    <td className="px-4 py-3 border-y border-slate-100 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-8 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-500" style={{ width: `${emp.commission_percentage || 0}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black italic text-orange-600">{emp.commission_percentage || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 border-y border-r border-slate-100 last:rounded-r-xl">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.3)]" />
                                            <span className="text-[8px] font-black text-slate-500 uppercase italic">ACTIVO</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
