"use client"

import { Button } from "@/components/ui/button"
import { X, User, Phone, Shield, Calendar, Utensils, Receipt, Mail, ShieldCheck, EyeOff, Eye, ChefHat, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmployeeModalProps {
    isOpen: boolean
    isEdit: boolean
    onClose: () => void
    formData: any
    setFormData: (data: any) => void
    submitting: boolean
    showPassword: boolean
    setShowPassword: (show: boolean) => void
    onSubmit: (e: React.FormEvent) => void
}

export function EmployeeModal({
    isOpen,
    isEdit,
    onClose,
    formData,
    setFormData,
    submitting,
    showPassword,
    setShowPassword,
    onSubmit
}: EmployeeModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto font-sans">
            <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 relative my-auto">
                <div className="absolute top-0 left-0 w-full h-32 md:h-64 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
                <div className="p-6 md:p-10 pb-4 md:pb-6 flex justify-between items-center border-b border-slate-100 relative z-10 bg-white/50">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase italic text-slate-900 leading-none">
                        {!isEdit ? 'Nuevo Colaborador' : 'Editar Expediente'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 md:w-6 md:h-6 text-slate-500" />
                    </Button>
                </div>

                <form onSubmit={onSubmit} className="p-10 pt-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="EJ: JUAN PÉREZ"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Teléfono Móvil</label>
                                <div className="relative">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="+57 300..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Documento de Identidad</label>
                                <div className="relative">
                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="C.C. / C.E."
                                        value={formData.document_id}
                                        onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Fecha de Vinculación</label>
                                <div className="relative">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 shadow-sm cursor-pointer"
                                        value={formData.hire_date}
                                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">% Descuento Staff</label>
                                <div className="relative">
                                    <Utensils className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 shadow-sm"
                                        value={formData.food_discount_pct}
                                        onChange={(e) => setFormData({ ...formData, food_discount_pct: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Límite de Consumo Cr.</label>
                                <div className="relative">
                                    <Receipt className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 shadow-sm"
                                        value={formData.max_credit}
                                        onChange={(e) => setFormData({ ...formData, max_credit: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-orange-50 p-6 rounded-[2rem] border border-orange-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-600 ml-4 italic">Sueldo Base Mensual</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-600 font-bold">$</span>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-10 pr-4 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 shadow-sm"
                                        value={formData.base_salary}
                                        onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-600 ml-4 italic">% Comisión Venta</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 shadow-sm"
                                    value={formData.commission_percentage}
                                    onChange={(e) => setFormData({ ...formData, commission_percentage: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-orange-600 ml-4 italic">Tipo Contrato</label>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 appearance-none italic shadow-sm"
                                    value={formData.contract_type}
                                    onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                                >
                                    <option value="indefinido">INDEFINIDO</option>
                                    <option value="termino_fijo">TÉRMINO FIJO</option>
                                    <option value="prestacion">PRESTACIÓN</option>
                                    <option value="aprendizaje">APRENDIZAJE</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Correo Corporativo</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        disabled={isEdit}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 disabled:opacity-50 shadow-sm disabled:bg-slate-50"
                                        placeholder="email@jamali-os.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">PIN de Seguridad (4 dígitos)</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required={formData.role === 'waiter'}
                                        maxLength={4}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="EJ: 1234"
                                        value={formData.waiter_pin}
                                        onChange={(e) => setFormData({ ...formData, waiter_pin: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                            </div>
                        </div>

                        {!isEdit && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Contraseña Inicial</label>
                                <div className="relative">
                                    <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-14 outline-none focus:border-orange-500/40 transition-all font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="Min. 8 caracteres"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Designación de Rango / Sistema</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {[
                                    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'hover:border-orange-500 active:bg-orange-50' },
                                    { id: 'cashier', label: 'Cajero', icon: Shield, color: 'hover:border-emerald-500 active:bg-emerald-50' },
                                    { id: 'waiter', label: 'Mesero', icon: Utensils, color: 'hover:border-blue-500 active:bg-blue-50' },
                                    { id: 'cook', label: 'Cocina', icon: ChefHat, color: 'hover:border-rose-500 active:bg-rose-50' },
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: role.id })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 transition-all gap-2 shadow-sm",
                                            formData.role === role.id
                                                ? "bg-orange-50 border-orange-500 text-orange-600"
                                                : "bg-white border-slate-200 text-slate-500",
                                            role.color
                                        )}
                                    >
                                        <role.icon className="w-7 h-7" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 relative z-10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 border border-slate-200 bg-white"
                        >
                            CANCELAR
                        </Button>
                        <Button
                            disabled={submitting}
                            type="submit"
                            className="flex-[2] h-16 rounded-2xl bg-orange-600 text-black font-black uppercase tracking-widest italic hover:bg-orange-500 transition-all border-none text-lg shadow-2xl shadow-orange-500/20 active:scale-95"
                        >
                            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : !isEdit ? 'OPERATIVIZAR PERFIL' : 'ACTUALIZAR DATOS'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
