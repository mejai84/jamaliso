"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import Link from "next/link"
import {
    ArrowLeft, Save, Loader2, CreditCard, Banknote,
    Smartphone, Globe, Shield, CheckCircle2,
    AlertTriangle, Eye, EyeOff, Zap, Lock, RefreshCw,
    ExternalLink, Info, Plug, PlugZap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface GatewayConfig {
    enabled: boolean
    mode: 'sandbox' | 'production'
    api_key?: string
    api_secret?: string
    public_key?: string
    webhook_secret?: string
    account_id?: string   // Para Nequi / MercadoPago
    phone_number?: string // Para Nequi
    extra?: Record<string, string>
}

interface PaymentSettings {
    mercadopago: GatewayConfig
    nequi: GatewayConfig
    stripe: GatewayConfig
    wompi: GatewayConfig
    card_terminal: GatewayConfig
    bank_transfer: GatewayConfig
}

const DEFAULT_SETTINGS: PaymentSettings = {
    mercadopago: { enabled: false, mode: 'sandbox', api_key: '', api_secret: '', public_key: '' },
    nequi: { enabled: false, mode: 'production', phone_number: '', api_key: '' },
    stripe: { enabled: false, mode: 'sandbox', api_key: '', public_key: '', webhook_secret: '' },
    wompi: { enabled: false, mode: 'sandbox', api_key: '', public_key: '' },
    card_terminal: { enabled: true, mode: 'production' },
    bank_transfer: { enabled: true, mode: 'production', account_id: '', extra: { bank: '', account_type: '', routing: '' } },
}

// ─── Gateway Definitions ──────────────────────────────────────────────────────

const GATEWAYS = [
    {
        id: 'mercadopago' as const,
        name: 'Mercado Pago',
        tagline: 'LATAM · Argentina, México, Colombia, Chile...',
        icon: '🟦',
        color: 'from-blue-500 to-cyan-500',
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50',
        activeText: 'text-blue-700',
        countries: ['CO', 'MX', 'AR', 'CL', 'PE', 'UY'],
        docsUrl: 'https://www.mercadopago.com.co/developers',
        fields: [
            { key: 'public_key', label: 'Public Key', placeholder: 'APP_USR-xxxxxxxx...', type: 'text', hint: 'Clave pública para el frontend (SDK)' },
            { key: 'api_secret', label: 'Access Token', placeholder: 'APP_USR-xxxx-xxx-xxx...', type: 'password', hint: 'Token privado de acceso a la API' },
        ]
    },
    {
        id: 'nequi' as const,
        name: 'Nequi',
        tagline: 'Colombia · Pagos móviles instantáneos',
        icon: '🟣',
        color: 'from-violet-500 to-purple-600',
        borderColor: 'border-violet-200',
        bgColor: 'bg-violet-50',
        activeText: 'text-violet-700',
        countries: ['CO'],
        docsUrl: 'https://developer.nequi.com.co',
        fields: [
            { key: 'api_key', label: 'Client ID', placeholder: 'xxxxxxxx-xxxx-xxxx...', type: 'text', hint: 'Client ID del Portal de Desarrolladores Nequi' },
            { key: 'api_secret', label: 'Client Secret', placeholder: 'xxxxxxxx...', type: 'password', hint: 'Client Secret de la aplicación Nequi' },
            { key: 'phone_number', label: 'Número Nequi', placeholder: '+57 300 0000000', type: 'text', hint: 'Número de celular asociado a la cuenta Nequi del negocio (para QR)' },
        ]
    },
    {
        id: 'stripe' as const,
        name: 'Stripe',
        tagline: 'Global · Europa, USA y más de 135 países',
        icon: '🔵',
        color: 'from-indigo-500 to-blue-600',
        borderColor: 'border-indigo-200',
        bgColor: 'bg-indigo-50',
        activeText: 'text-indigo-700',
        countries: ['ES', 'US', 'EU'],
        docsUrl: 'https://dashboard.stripe.com/apikeys',
        fields: [
            { key: 'public_key', label: 'Publishable Key', placeholder: 'pk_live_xxxxxxxx...', type: 'text', hint: 'Clave pública del dashboard de Stripe' },
            { key: 'api_secret', label: 'Secret Key', placeholder: 'sk_live_xxxxxxxx...', type: 'password', hint: 'Clave secreta — ¡nunca la compartas!' },
            { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_xxxxxxxx...', type: 'password', hint: 'Secreto para verificar eventos de Webhook' },
        ]
    },
    {
        id: 'wompi' as const,
        name: 'Wompi',
        tagline: 'Colombia · Bancolombia. PSE, tarjetas, Nequi',
        icon: '🟢',
        color: 'from-emerald-500 to-teal-500',
        borderColor: 'border-emerald-200',
        bgColor: 'bg-emerald-50',
        activeText: 'text-emerald-700',
        countries: ['CO'],
        docsUrl: 'https://docs.wompi.co',
        fields: [
            { key: 'public_key', label: 'Llave Pública', placeholder: 'pub_stagtest_xxxxxxxx...', type: 'text', hint: 'Llave pública del panel Wompi' },
            { key: 'api_secret', label: 'Llave Privada', placeholder: 'prv_stagtest_xxxxxxxx...', type: 'password', hint: 'Llave privada del panel Wompi — mantener oculta' },
        ]
    },
    {
        id: 'card_terminal' as const,
        name: 'Tarjeta (Datáfono/Terminal)',
        tagline: 'Local · Visa, Mastercard, débito. Sin integración API',
        icon: '💳',
        color: 'from-slate-500 to-slate-700',
        borderColor: 'border-slate-200',
        bgColor: 'bg-slate-50',
        activeText: 'text-slate-700',
        countries: ['ALL'],
        docsUrl: '',
        fields: []  // No requiere configuración — solo habilitar/deshabilitar
    },
    {
        id: 'bank_transfer' as const,
        name: 'Transferencia Bancaria',
        tagline: 'Universal · Datos bancarios manuales',
        icon: '🏦',
        color: 'from-amber-400 to-orange-500',
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50',
        activeText: 'text-amber-700',
        countries: ['ALL'],
        docsUrl: '',
        fields: [
            { key: 'account_id', label: 'Número de Cuenta', placeholder: '000-000000-00', type: 'text', hint: 'Número de cuenta bancaria de destino' },
            { key: 'extra.bank', label: 'Entidad Bancaria', placeholder: 'Bancolombia / Banco Santander...', type: 'text', hint: 'Nombre del banco' },
            { key: 'extra.account_type', label: 'Tipo de Cuenta', placeholder: 'Ahorros / Corriente', type: 'text', hint: 'Tipo de cuenta bancaria' },
        ]
    },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PaymentGatewaysPage() {
    const { restaurant } = useRestaurant()
    const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeGateway, setActiveGateway] = useState<string | null>(null)
    const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (restaurant?.id) loadSettings()
    }, [restaurant?.id])

    const loadSettings = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('restaurant_id', restaurant!.id)
            .eq('key', 'payment_gateways')
            .maybeSingle()

        if (data?.value) {
            setSettings({ ...DEFAULT_SETTINGS, ...data.value })
        }
        setLoading(false)
    }

    const handleToggle = (gatewayId: keyof PaymentSettings) => {
        setSettings(prev => ({
            ...prev,
            [gatewayId]: { ...prev[gatewayId], enabled: !prev[gatewayId].enabled }
        }))
    }

    const handleFieldChange = (gatewayId: keyof PaymentSettings, fieldKey: string, value: string) => {
        setSettings(prev => {
            const gw = { ...prev[gatewayId] }
            if (fieldKey.startsWith('extra.')) {
                const subKey = fieldKey.replace('extra.', '')
                gw.extra = { ...(gw.extra || {}), [subKey]: value }
            } else {
                (gw as any)[fieldKey] = value
            }
            return { ...prev, [gatewayId]: gw }
        })
    }

    const handleModeChange = (gatewayId: keyof PaymentSettings, mode: 'sandbox' | 'production') => {
        setSettings(prev => ({ ...prev, [gatewayId]: { ...prev[gatewayId], mode } }))
    }

    const toggleFieldVisibility = (key: string) => {
        setVisibleFields(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

    const handleSave = async () => {
        if (!restaurant?.id) return
        setSaving(true)
        try {
            const { error } = await supabase.from('settings').upsert({
                restaurant_id: restaurant.id,
                key: 'payment_gateways',
                value: settings
            }, { onConflict: 'restaurant_id, key' })

            if (error) throw error
            toast.success("💳 Pasarelas de pago actualizadas correctamente")
        } catch (e: any) {
            toast.error("Error al guardar: " + (e.message || "desconocido"))
        } finally {
            setSaving(false)
        }
    }

    const getFieldValue = (gatewayId: keyof PaymentSettings, fieldKey: string): string => {
        const gw = settings[gatewayId] as any
        if (fieldKey.startsWith('extra.')) {
            return gw.extra?.[fieldKey.replace('extra.', '')] || ''
        }
        return gw[fieldKey] || ''
    }

    const enabledCount = Object.values(settings).filter(g => g.enabled).length

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Cargando configuración...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* ── BANNER BACKGROUND ── */}
            <div className="absolute top-0 inset-x-0 h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-10">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute rounded-full border border-white/30"
                            style={{ width: `${(i + 1) * 80}px`, height: `${(i + 1) * 80}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                    ))}
                </div>
            </div>

            <div className="relative z-10">
                {/* ── HEADER ── */}
                <div className="px-8 md:px-16 pt-12 pb-36 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/settings">
                            <button className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all group">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <CreditCard className="w-5 h-5 text-orange-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Payment Engine</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                                PASARELAS <span className="text-orange-500">DE PAGO</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Métodos activos</p>
                            <p className="text-4xl font-black text-white italic tracking-tighter leading-none">
                                {enabledCount} <span className="text-orange-500 text-2xl">/ {GATEWAYS.length}</span>
                            </p>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="h-14 px-8 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[10px] italic tracking-widest rounded-2xl shadow-2xl shadow-orange-600/30 transition-all active:scale-95"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> GUARDAR</>}
                        </Button>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="relative -mt-24 px-6 md:px-16 pb-20">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* ── LEFT: Gateway List ── */}
                        <div className="xl:col-span-1 space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic pl-2">Métodos de pago disponibles</p>
                            {GATEWAYS.map(gw => {
                                const cfg = settings[gw.id as keyof PaymentSettings]
                                const isActive = !!cfg?.enabled
                                const isSelected = activeGateway === gw.id

                                return (
                                    <div
                                        key={gw.id}
                                        onClick={() => setActiveGateway(gw.id === activeGateway ? null : gw.id)}
                                        className={cn(
                                            "bg-white rounded-[2rem] p-6 flex items-center justify-between cursor-pointer transition-all group border-2 shadow-sm hover:shadow-lg",
                                            isSelected ? "border-orange-500 shadow-orange-100" : "border-transparent hover:border-slate-200",
                                            isActive && !isSelected ? "border-l-4 border-l-emerald-500 border-transparent" : ""
                                        )}
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Icon */}
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm",
                                                isActive ? `bg-gradient-to-br ${gw.color} shadow-lg` : "bg-slate-100"
                                            )}>
                                                {gw.icon}
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "font-black italic uppercase tracking-tight leading-none",
                                                    isActive ? "text-slate-900" : "text-slate-400"
                                                )}>{gw.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{gw.tagline}</p>
                                                {isActive && (
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic">
                                                            {cfg.mode === 'production' ? 'PRODUCCIÓN' : 'SANDBOX'} · ACTIVO
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Toggle */}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); handleToggle(gw.id as keyof PaymentSettings) }}
                                            className={cn(
                                                "w-14 h-7 rounded-full transition-all flex items-center px-1 cursor-pointer shadow-inner flex-shrink-0",
                                                isActive ? "bg-emerald-500 shadow-sm" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full bg-white shadow-xl transition-all",
                                                isActive ? "translate-x-7" : "translate-x-0"
                                            )} />
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Info Card */}
                            <div className="bg-slate-900 rounded-[2rem] p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 italic">Seguridad PCI-DSS</span>
                                </div>
                                <p className="text-[10px] font-bold text-white/50 leading-relaxed">
                                    Las credenciales se almacenan encriptadas en tu base de datos privada.
                                    <strong className="text-white/80"> Nunca se envían al cliente</strong> y solo se usan en el servidor.
                                </p>
                                <div className="flex items-center gap-2 pt-2">
                                    <Lock className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest italic">AES-256 Encrypted Storage</span>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Config Panel ── */}
                        <div className="xl:col-span-2">
                            {activeGateway ? (
                                (() => {
                                    const gw = GATEWAYS.find(g => g.id === activeGateway)!
                                    const cfg = settings[activeGateway as keyof PaymentSettings]

                                    return (
                                        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
                                            {/* Gateway Header */}
                                            <div className={`bg-gradient-to-r ${gw.color} p-8 relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 p-8 opacity-20 text-7xl select-none">{gw.icon}</div>
                                                <div className="relative z-10 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] italic">Payment Gateway</p>
                                                        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none mt-1">{gw.name}</h2>
                                                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-2">{gw.tagline}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div
                                                            onClick={() => handleToggle(activeGateway as keyof PaymentSettings)}
                                                            className={cn(
                                                                "w-16 h-8 rounded-full transition-all flex items-center px-1 cursor-pointer shadow-inner",
                                                                cfg?.enabled ? "bg-white/30" : "bg-black/20"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full bg-white shadow-xl transition-all",
                                                                cfg?.enabled ? "translate-x-8" : "translate-x-0"
                                                            )} />
                                                        </div>
                                                        <span className="text-[8px] font-black text-white/80 uppercase tracking-widest italic">
                                                            {cfg?.enabled ? 'ACTIVO' : 'INACTIVO'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 space-y-8">
                                                {/* Mode Selector */}
                                                {gw.fields.length > 0 && (
                                                    <div className="space-y-3">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic flex items-center gap-2">
                                                            <Zap className="w-3 h-3 text-orange-500" /> ENTORNO DE EJECUCIÓN
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { value: 'sandbox', label: 'SANDBOX', desc: 'Pruebas y desarrollo', icon: '🧪' },
                                                                { value: 'production', label: 'PRODUCCIÓN', desc: 'Real · Dinero real', icon: '🚀' },
                                                            ].map(mode => (
                                                                <button
                                                                    key={mode.value}
                                                                    onClick={() => handleModeChange(activeGateway as keyof PaymentSettings, mode.value as any)}
                                                                    className={cn(
                                                                        "p-5 rounded-2xl border-2 text-left transition-all",
                                                                        cfg?.mode === mode.value
                                                                            ? mode.value === 'production'
                                                                                ? "border-orange-500 bg-orange-50"
                                                                                : "border-blue-400 bg-blue-50"
                                                                            : "border-slate-200 hover:border-slate-300 bg-slate-50"
                                                                    )}
                                                                >
                                                                    <div className="text-xl mb-2">{mode.icon}</div>
                                                                    <p className={cn(
                                                                        "text-[10px] font-black uppercase tracking-widest italic",
                                                                        cfg?.mode === mode.value
                                                                            ? mode.value === 'production' ? "text-orange-700" : "text-blue-700"
                                                                            : "text-slate-400"
                                                                    )}>{mode.label}</p>
                                                                    <p className="text-[8px] text-slate-400 uppercase tracking-wider mt-0.5 font-bold">{mode.desc}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {cfg?.mode === 'production' && (
                                                            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                                                                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                                                <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest leading-relaxed italic">
                                                                    MODO PRODUCCIÓN ACTIVO · Los cobros son reales y afectan dinero real.
                                                                    Verifica las credenciales antes de activar.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Fields */}
                                                {gw.fields.length > 0 ? (
                                                    <div className="space-y-5">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic flex items-center gap-2">
                                                            <Key className="w-3 h-3 text-orange-500" /> CREDENCIALES DE ACCESO
                                                        </label>
                                                        {gw.fields.map(field => {
                                                            const visKey = `${gw.id}__${field.key}`
                                                            const isPassword = field.type === 'password'
                                                            const isVisible = visibleFields.has(visKey)
                                                            const val = getFieldValue(activeGateway as keyof PaymentSettings, field.key)

                                                            return (
                                                                <div key={field.key} className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{field.label}</label>
                                                                        {isPassword && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toggleFieldVisibility(visKey)}
                                                                                className="text-[8px] font-black text-slate-400 hover:text-orange-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                                            >
                                                                                {isVisible ? <><EyeOff className="w-3 h-3" /> OCULTAR</> : <><Eye className="w-3 h-3" /> MOSTRAR</>}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="relative">
                                                                        <input
                                                                            type={isPassword && !isVisible ? 'password' : 'text'}
                                                                            value={val}
                                                                            onChange={e => handleFieldChange(activeGateway as keyof PaymentSettings, field.key, e.target.value)}
                                                                            placeholder={field.placeholder}
                                                                            className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-mono font-bold focus:outline-none focus:border-orange-400 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300 placeholder:font-sans pr-12"
                                                                        />
                                                                        {val && (
                                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {field.hint && (
                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                            <Info className="w-3 h-3" /> {field.hint}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}

                                                        {gw.docsUrl && (
                                                            <a
                                                                href={gw.docsUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors group/link pt-2"
                                                            >
                                                                <ExternalLink className="w-3 h-3 group-hover/link:rotate-12 transition-transform" />
                                                                Obtener credenciales en {gw.name} Developers →
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3">
                                                        <PlugZap className="w-10 h-10 text-slate-300 mx-auto" />
                                                        <p className="text-sm font-black italic uppercase text-slate-900 tracking-tighter">Sin configuración requerida</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                                            Este método de pago funciona de forma local.<br />
                                                            Solo activa o desactiva el toggle para habilitarlo en el POS.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Test Connection Button */}
                                                {gw.fields.length > 0 && cfg?.enabled && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => toast.info(`🔍 Test de conexión con ${gw.name} en construcción`)}
                                                        className="w-full h-12 rounded-2xl border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest italic text-slate-600 hover:border-orange-400 hover:text-orange-600 transition-all group/test"
                                                    >
                                                        <RefreshCw className="w-4 h-4 mr-2 group-hover/test:rotate-180 transition-transform duration-500" />
                                                        VERIFICAR CONEXIÓN CON {gw.name.toUpperCase()}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })()
                            ) : (
                                /* Placeholder when nothing selected */
                                <div className="h-full min-h-[500px] bg-white rounded-[2.5rem] flex flex-col items-center justify-center text-center p-16 shadow-sm border-2 border-dashed border-slate-200 space-y-6">
                                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                                        <Plug className="w-12 h-12 text-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Selecciona un método</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Haz clic en cualquier pasarela de la lista para ver y editar su configuración
                                        </p>
                                    </div>
                                    <div className="pt-4 flex flex-wrap gap-2 justify-center">
                                        {GATEWAYS.map(g => (
                                            <div key={g.id} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
                                                {g.icon} {g.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Enabled Summary ── */}
                            <div className="mt-6 bg-slate-900 rounded-[2rem] p-6 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-black italic text-orange-500 tracking-tighter">{enabledCount}</p>
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">Métodos Activos</p>
                                </div>
                                <div className="text-center border-x border-white/10">
                                    <p className="text-3xl font-black italic text-emerald-400 tracking-tighter">
                                        {Object.values(settings).filter(g => g.enabled && g.mode === 'production').length}
                                    </p>
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">En Producción</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black italic text-blue-400 tracking-tighter">
                                        {Object.values(settings).filter(g => g.enabled && g.mode === 'sandbox').length}
                                    </p>
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest italic">En Sandbox</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
