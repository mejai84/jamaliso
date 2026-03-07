"use client"

import { Button } from "@/components/ui/button"
import { Tag, X, Percent, DollarSign, User, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SEASONAL_OPTIONS, Profile } from "@/app/admin/coupons/types"

interface CouponModalProps {
    isOpen: boolean
    onClose: () => void
    formData: any
    setFormData: (data: any) => void
    submitting: boolean
    onSubmit: (e: React.FormEvent) => void
    profiles: Profile[]
}

export function CouponModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    submitting,
    onSubmit,
    profiles
}: CouponModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500 font-sans">
            <div className="bg-[#0f172a] w-full max-w-4xl rounded-[4rem] border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500 max-h-[95vh] outline-none">

                <div className="px-12 py-10 border-b border-white/10 flex justify-between items-center bg-white/5 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-orange-500/10 rounded-2xl shadow-inner border border-orange-500/20">
                            <Tag className="w-8 h-8 text-orange-500 shadow-orange-500/20 shadow-lg" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                                {formData.id ? 'Optimizar' : 'Inyectar'} <span className="text-orange-500">Cupón</span>
                            </h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] italic opacity-60">CAMPAIGN ENGINE v5.1</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl h-14 w-14 hover:bg-white/5 active:scale-90 transition-all border border-transparent hover:border-white/10 text-white">
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <form onSubmit={onSubmit} className="px-12 py-10 space-y-12 overflow-y-auto custom-scrollbar relative z-10 selection:bg-orange-500 selection:text-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* IDENTIFICACION */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 px-4 border-l-4 border-orange-500/40">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Arquitectura Nominal</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Identificador (CÓDIGO)</label>
                                    <input
                                        required
                                        placeholder="EJ: VIP-ACCESS-2025"
                                        className="w-full h-18 bg-white/5 border border-white/5 rounded-[2.5rem] px-8 py-5 outline-none focus:border-orange-500 transition-all font-black uppercase text-2xl tracking-tighter italic placeholder:text-white/5 text-orange-500 shadow-inner"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Narrativa Promocional</label>
                                    <textarea
                                        placeholder="OBJETIVO DE LA CAMPAÑA..."
                                        className="w-full h-40 bg-white/5 border border-white/5 rounded-[2.5rem] p-8 outline-none focus:border-orange-500 transition-all font-black italic uppercase tracking-tight text-xs resize-none placeholder:text-white/5 shadow-inner text-white"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* LOGICA DE VALOR */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 px-4 border-l-4 border-orange-500/40">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Métrica de Impacto</h2>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'percentage' as const, label: 'RADIAL (%)', icon: Percent },
                                        { id: 'fixed' as const, label: 'NOMINAL ($)', icon: DollarSign },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, discount_type: type.id })}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-4 transition-all gap-3 shadow-sm",
                                                formData.discount_type === type.id
                                                    ? "bg-orange-500/10 border-orange-500 text-orange-500 shadow-orange-500/20"
                                                    : "bg-white/5 border-transparent hover:bg-white/10 text-slate-500"
                                            )}
                                        >
                                            <type.icon className="w-6 h-6" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/60 ml-6 italic">Cuantía</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full h-20 bg-[#0f172a] border-4 border-orange-500/10 rounded-[2rem] px-8 outline-none focus:border-orange-500 transition-all font-black text-3xl italic text-orange-500 text-center shadow-2xl"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Mínimo Gastado</label>
                                        <input
                                            type="number"
                                            className="w-full h-20 bg-white/5 border border-white/5 rounded-[2rem] px-8 outline-none focus:border-orange-500 transition-all font-black text-3xl italic text-white text-center shadow-inner"
                                            value={formData.min_purchase}
                                            onChange={(e) => setFormData({ ...formData, min_purchase: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Capacidad de Suministro (LIMIT)</label>
                                    <input
                                        type="number"
                                        placeholder="∞ (ACCESO ILIMITADO)"
                                        className="w-full h-18 bg-white/5 border border-white/5 rounded-[2rem] px-8 outline-none focus:border-orange-500 transition-all font-black italic text-center text-sm shadow-inner placeholder:text-white/5 text-white"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CRONOGRAMA & CRM */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-white/10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Despliegue</label>
                            <input
                                type="date"
                                required
                                className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all font-black italic text-xs shadow-inner cursor-pointer text-white"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Finalización</label>
                            <input
                                type="date"
                                className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all font-black italic text-xs shadow-inner cursor-pointer text-white"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Tag Estacional</label>
                            <select
                                className="w-full h-16 bg-white/5 border border-white/5 rounded-2xl px-8 outline-none focus:border-orange-500 transition-all font-black italic text-xs shadow-inner cursor-pointer appearance-none text-white"
                                value={formData.seasonal_tag}
                                onChange={(e) => setFormData({ ...formData, seasonal_tag: e.target.value })}
                            >
                                {SEASONAL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-slate-900">
                                        {opt.label.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 pt-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/60 ml-6 italic flex items-center gap-2">
                            <User className="w-4 h-4" /> CRM TARGETING (SOLO PARA TITULAR ESPECÍFICO)
                        </label>
                        <select
                            className="w-full h-18 bg-white/5 border border-white/5 rounded-[2.5rem] px-8 outline-none focus:border-orange-500 transition-all font-black italic text-sm shadow-inner cursor-pointer appearance-none text-white"
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        >
                            <option value="" className="bg-slate-900">OPEN SOURCE (PÚBLICO GENERAL)</option>
                            {profiles.map(profile => (
                                <option key={profile.id} value={profile.id} className="bg-slate-900">
                                    {profile.full_name?.toUpperCase() || 'USUARIO ANÓNIMO'} — [{profile.email.toUpperCase()}]
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 pt-10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="w-full md:w-1/3 h-20 text-xs font-black uppercase tracking-[0.4em] border-2 border-white/5 rounded-[2rem] text-slate-500 hover:text-white hover:border-white transition-all italic bg-transparent active:scale-95 shadow-lg"
                        >
                            ABORTAR
                        </Button>
                        <Button
                            disabled={submitting}
                            type="submit"
                            className="flex-1 h-20 text-xl font-black uppercase tracking-[0.2em] transition-all rounded-[2rem] shadow-3xl italic border-none bg-orange-600 text-black hover:bg-orange-500 hover:scale-[1.02] active:scale-95 group"
                        >
                            {submitting ? (
                                <div className="flex items-center gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    INDEXANDO...
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    {formData.id ? 'AUTORIZAR CAMBIOS' : 'LIBERAR CAMPAÑA'}
                                    <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
