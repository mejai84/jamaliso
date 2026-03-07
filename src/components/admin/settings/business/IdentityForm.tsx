"use client"

import { Building2, Fingerprint, Hash, ShieldCheck, Phone, Mail, MapPin, Globe, ArrowRight } from "lucide-react"
import { BusinessInfo } from "@/app/admin/settings/business/types"

interface IdentityFormProps {
    businessInfo: BusinessInfo
    onChange: (info: BusinessInfo) => void
}

export function IdentityForm({ businessInfo, onChange }: IdentityFormProps) {
    return (
        <div className="bg-card border border-border rounded-[4.5rem] p-12 md:p-16 shadow-3xl relative overflow-hidden group/card animate-in slide-in-from-left-12 duration-1000 font-sans">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/card:scale-110 transition-all duration-1000 rotate-12">
                <Building2 className="w-[500px] h-[500px]" />
            </div>

            <div className="flex items-center gap-6 mb-16 border-l-8 border-primary px-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl">
                    <Fingerprint className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Credenciales Jurídicas</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">GLOBAL IDENTITY PARAMETERS</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-4 col-span-1 md:col-span-2 group/input">
                    <label className="text-[11px] font-black text-primary/60 uppercase tracking-[0.5em] ml-10 italic group-focus-within/input:text-primary transition-colors flex items-center gap-3 leading-none">
                        <Hash className="w-4 h-4" /> NOMBRE O RAZÓN SOCIAL DEL TITULAR
                    </label>
                    <input
                        className="w-full h-20 bg-muted/30 border border-border rounded-[2.5rem] px-10 outline-none focus:border-primary transition-all font-black text-3xl italic text-foreground tracking-tighter shadow-inner placeholder:text-muted-foreground/10 leading-none"
                        value={businessInfo.business_name}
                        placeholder="JAMALI OS CORE ENTITY..."
                        onChange={e => onChange({ ...businessInfo, business_name: e.target.value.toUpperCase() })}
                    />
                </div>

                <div className="space-y-4 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic leading-none flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4" /> TAX ID / NIT / RUT
                    </label>
                    <input
                        className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-xl italic text-foreground tracking-tighter shadow-inner leading-none"
                        value={businessInfo.identification_number}
                        onChange={e => onChange({ ...businessInfo, identification_number: e.target.value })}
                    />
                </div>

                <div className="space-y-4 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic leading-none flex items-center gap-3">
                        <Phone className="w-4 h-4" /> LÍNEA DE ENLACE CORE
                    </label>
                    <input
                        className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-xl italic text-foreground tracking-tighter shadow-inner leading-none"
                        value={businessInfo.phone}
                        onChange={e => onChange({ ...businessInfo, phone: e.target.value })}
                    />
                </div>

                <div className="space-y-4 col-span-1 md:col-span-2 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic leading-none flex items-center gap-3">
                        <Mail className="w-4 h-4" /> CANAL DE NOTIFICACIÓN DIGITAL
                    </label>
                    <input
                        className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-xl text-foreground tracking-tighter shadow-inner leading-none italic"
                        value={businessInfo.email}
                        onChange={e => onChange({ ...businessInfo, email: e.target.value })}
                        placeholder="enterprise@jamalios.com"
                    />
                </div>

                <div className="space-y-4 col-span-1 md:col-span-2 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic leading-none flex items-center gap-3">
                        <MapPin className="w-4 h-4" /> HUB DE OPERACIÓN FÍSICA
                    </label>
                    <input
                        className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-bold text-foreground tracking-tighter shadow-inner leading-none h-20 text-lg uppercase italic"
                        value={businessInfo.address}
                        onChange={e => onChange({ ...businessInfo, address: e.target.value })}
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic leading-none flex items-center gap-3">
                        <Globe className="w-4 h-4" /> DIVISA DE INTERCAMBIO
                    </label>
                    <div className="relative group/sel">
                        <select
                            className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-foreground uppercase italic cursor-pointer shadow-inner appearance-none relative z-10"
                            value={businessInfo.currency}
                            onChange={e => onChange({ ...businessInfo, currency: e.target.value })}
                        >
                            <option value="COP">PESO COLOMBIANO (COP)</option>
                            <option value="USD">DÓLAR AMERICANO (USD)</option>
                            <option value="EUR">EURO ZONE (EUR)</option>
                            <option value="MXN">PESO MEXICANO (MXN)</option>
                        </select>
                        <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 rotate-90" />
                    </div>
                </div>

                <div className="space-y-4 text-center">
                    <label className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">SÍMBOLO CORE</label>
                    <input
                        className="w-full h-18 bg-card border-4 border-primary/20 rounded-[2rem] px-6 outline-none focus:border-primary transition-all font-black text-5xl text-primary text-center shadow-3xl shadow-primary/10 relative overflow-hidden"
                        value={businessInfo.currency_symbol}
                        onChange={e => onChange({ ...businessInfo, currency_symbol: e.target.value })}
                    />
                </div>
            </div>
        </div>
    )
}
