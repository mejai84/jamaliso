"use client"

import { Button } from "@/components/ui/button"
import { ShieldCheck, Utensils, ChefHat, Shield, Users, Edit, Trash2, Mail, Phone } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { Employee } from "@/app/admin/employees/types"
import { checkPermission, UserPermissions } from "@/lib/permissions"

interface EmployeeCardProps {
    employee: Employee
    currentUserPerms: UserPermissions | null
    onEdit: (emp: Employee) => void
    onDelete: (id: string) => void
}

export const getRoleBadge = (role: string) => {
    switch (role) {
        case 'admin': return { label: 'ADMIN', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: ShieldCheck };
        case 'waiter': return { label: 'MESERO', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Utensils };
        case 'cook': return { label: 'COCINA', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: ChefHat };
        case 'cashier': return { label: 'CAJERO', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Shield };
        default: return { label: 'STAFF', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: Users };
    }
}

export function EmployeeCard({ employee, currentUserPerms, onEdit, onDelete }: EmployeeCardProps) {
    const badge = getRoleBadge(employee.role);
    const Icon = badge.icon;

    return (
        <div className="group/card bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-10 transition-all duration-500 hover:border-orange-500/20 shadow-sm flex flex-col justify-between relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/[0.05] rounded-full -mr-20 -mt-20 group-hover/card:bg-orange-500/10 group-hover/card:scale-110 transition-all duration-1000" />
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex gap-6 min-w-0">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-orange-50 flex items-center justify-center font-black text-3xl text-orange-500 border border-orange-100 shrink-0 shadow-sm italic">
                        {employee.full_name?.charAt(0) || employee.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-2">
                        <h3 className="font-black text-2xl italic tracking-tighter uppercase group-hover/card:text-orange-500 transition-colors text-slate-900 truncate leading-none">
                            {employee.full_name || 'Anonymous_User'}
                        </h3>
                        <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.2em] border italic leading-none shadow-sm",
                            badge.color
                        )}>
                            <Icon className="w-3.5 h-3.5" />
                            {badge.label}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-x-4 group-hover/card:translate-x-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-12 w-12 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
                        onClick={() => onEdit(employee)}
                    >
                        <Edit className="w-5 h-5" />
                    </Button>
                    {currentUserPerms && checkPermission(currentUserPerms, 'manage_employees') && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl h-12 w-12 bg-rose-50 border border-rose-100 text-rose-500 hover:text-white hover:bg-rose-500 shadow-sm"
                            onClick={() => onDelete(employee.id)}
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8 relative z-10">
                <div className="space-y-3 min-w-0">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 truncate italic">
                        <Mail className="w-4 h-4 text-orange-500 opacity-60 shrink-0" />
                        <span className="truncate uppercase">{employee.email}</span>
                    </div>
                    {employee.phone && (
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 truncate italic">
                            <Phone className="w-4 h-4 text-orange-500 opacity-60 shrink-0" />
                            <span className="truncate">{employee.phone}</span>
                        </div>
                    )}
                </div>
                <div className="text-right flex flex-col justify-center gap-2">
                    <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 inline-block self-end">
                        <span className="text-[10px] font-black text-emerald-600 uppercase italic tracking-widest">PRO_DISC {employee.food_discount_pct}%</span>
                    </div>
                    <div className="px-3 py-1.5 bg-orange-50 rounded-xl border border-orange-100 inline-block self-end">
                        <span className="text-[10px] font-black text-orange-600 uppercase italic tracking-widest">LIMIT {formatPrice(employee.max_credit)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
