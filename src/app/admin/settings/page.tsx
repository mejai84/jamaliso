"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Loader2, Save, MapPin, Phone, Mail, Instagram, Facebook,
    Youtube, Video, Twitter, Link2, Palette, ShieldCheck,
    Zap, Globe, Receipt, Coins, MessageSquare, Clock, Layout,
    Award, ChefHat, Heart, Star, Sparkles, Image as ImageIcon,
    Building2, Smartphone, ShieldAlert, CheckCircle2, QrCode,
    Camera, Upload, ArrowRight, Settings, Grid, Monitor,
    Smartphone as Mobile, Keyboard, MousePointer2, Layers,
    HardDrive, Cpu, Wifi, Activity, Database, ArrowLeft,
    Power, RefreshCw, Key
} from "lucide-react"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import Link from "next/link"

import { updateRestaurantBranding } from "./actions"

export default function SettingsPremiumPage() {
    const { restaurant, refreshRestaurant } = useRestaurant()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'general' | 'infrastructure' | 'branding' | 'regional'>('general')
    const [currentTime, setCurrentTime] = useState(new Date())

    // Regional states
    const [country, setCountry] = useState("Colombia")
    const [currency, setCurrency] = useState("COP")
    const [locale, setLocale] = useState("es-CO")

    // Branding states
    const [name, setName] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [primaryColor, setPrimaryColor] = useState("")

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        if (restaurant) {
            setName(restaurant.name || "")
            setLogoUrl(restaurant.logo_url || "")
            setPrimaryColor(restaurant.primary_color || "#FF6B6B")
        }
        // Load regional settings from settings table if needed, for now defaults
        return () => clearInterval(timer)
    }, [restaurant])

    const handleSave = async () => {
        if (!restaurant?.id) return
        setLoading(true)
        try {
            // Branding update
            await updateRestaurantBranding(restaurant.id, {
                name,
                logo_url: logoUrl,
                primary_color: primaryColor
            })

            // Regional update (Upsert in settings table)
            await supabase.from('settings').upsert({
                restaurant_id: restaurant.id,
                key: 'regional_config',
                value: { country, currency_code: currency, locale, currency_symbol: '$', decimal_digits: 0 }
            }, { onConflict: 'restaurant_id, key' })

            toast.success("CONFIGURACIÓN MAESTRA ACTUALIZADA ✨")
            refreshRestaurant?.()
        } catch (err) {
            toast.error("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'general', label: 'PARÁMETROS GENERALES', icon: Building2 },
        { id: 'regional', label: 'CONFIGURACIÓN REGIONAL', icon: Globe },
        { id: 'branding', label: 'IDENTIDAD VISUAL', icon: Palette },
        { id: 'infrastructure', label: 'INFRAESTRUCTURA CORE', icon: Cpu },
    ]

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col bg-[#F8FAFC]">

            {/* 🖼️ FONDO PREMIUM: Oficina Tech / Minimalismo Industrial con Blur */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-50" />
            <div className="absolute inset-0 backdrop-blur-[120px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col min-h-full">
                {/* HEADER SISTEMA */}
                <div className="relative z-20 p-8 md:p-12 flex items-center justify-between border-b border-slate-200 bg-white/60 backdrop-blur-xl shrink-0 shadow-sm">
                    <div className="flex items-center gap-6">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm">
                                <ArrowLeft className="w-6 h-6 text-slate-500" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-slate-900">SYSTEM <span className="text-orange-500">INFRA</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-2 italic flex items-center gap-3">
                                CORE ENGINE CONFIGURATION
                                <Database className="w-3 h-3 text-orange-500" />
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-3xl font-black italic tracking-tighter font-mono text-slate-900">
                                {currentTime.toLocaleTimeString('es-CO')}
                            </p>
                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest text-right">SYSTEM UPTIME: 99.9%</p>
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="h-14 px-10 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[10px] italic tracking-widest rounded-2xl shadow-lg shadow-orange-600/20"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> GUARDAR CAMBIOS</>}
                        </Button>
                    </div>
                </div>

                <div className="relative z-10 flex-1 overflow-hidden flex">

                    {/* SIDEBAR TABS */}
                    <div className="w-80 bg-white/60 border-r border-slate-200 p-8 flex flex-col gap-3 shrink-0 shadow-sm">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-2xl transition-all border shrink-0 text-left",
                                    activeTab === tab.id
                                        ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm"
                                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                                )}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">{tab.label}</span>
                            </button>
                        ))}

                        <div className="mt-auto space-y-6">
                            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Storage Status</p>
                                    <HardDrive className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[45%]" />
                                </div>
                                <p className="text-[8px] font-medium text-slate-500 uppercase">1.2 GB / 5 GB Utilizados</p>
                            </div>
                            <Button
                                onClick={() => toast.error("REBOOT REQUERIDO: Contacte con Soporte Técnico")}
                                variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 h-14 rounded-2xl font-black italic uppercase text-[10px] tracking-widest border border-red-100 shadow-sm bg-white"
                            >
                                <Power className="w-4 h-4 mr-3" /> REBOOT CORE
                            </Button>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-12">
                        <div className="max-w-4xl mx-auto space-y-12 pb-20">

                            {/* Section Header */}
                            <div className="flex items-center gap-6 pb-8 border-b border-slate-200">
                                <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                                    {tabs.find(t => t.id === activeTab)?.icon && <Settings className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 italic shadow-sm">
                                        Ajustes maestros del nodo de inteligencia
                                    </p>
                                </div>
                            </div>

                            {activeTab === 'branding' && (
                                <div className="grid grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">NOMBRE DEL NEGOCIO</label>
                                            <input
                                                className="w-full bg-white border border-slate-200 rounded-xl h-14 px-6 text-sm font-medium focus:outline-none focus:border-orange-500/50 text-slate-900 shadow-sm"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">COLOR PRIMARIO (HEX)</label>
                                            <div className="flex gap-4">
                                                <input
                                                    className="flex-1 bg-white border border-slate-200 rounded-xl h-14 px-6 text-sm font-medium focus:outline-none focus:border-orange-500/50 text-slate-900 shadow-sm"
                                                    value={primaryColor}
                                                    onChange={e => setPrimaryColor(e.target.value)}
                                                />
                                                <div
                                                    className="w-14 h-14 rounded-xl border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: primaryColor }}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">URL DEL LOGO (PNG/SVG)</label>
                                            <input
                                                className="w-full bg-white border border-slate-200 rounded-xl h-14 px-6 text-sm font-medium focus:outline-none focus:border-orange-500/50 text-slate-900 shadow-sm"
                                                value={logoUrl}
                                                onChange={e => setLogoUrl(e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center gap-6 shadow-sm">
                                        <div className="w-32 h-32 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                                            {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-4" alt="Preview" /> : <ImageIcon className="w-12 h-12 text-slate-400" />}
                                        </div>
                                        <div>
                                            <p className="text-xl font-black italic uppercase text-slate-900 tracking-tighter">{name || "TU MARCA"}</p>
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Pixel Perfect Branding</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'regional' && (
                                <div className="grid grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                                                <Globe className="w-3 h-3 text-orange-500" /> PAÍS DE OPERACIÓN
                                            </label>
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-xl h-14 px-6 text-sm font-medium focus:outline-none focus:border-orange-500/50 appearance-none text-slate-900 italic shadow-sm"
                                                value={country}
                                                onChange={e => setCountry(e.target.value)}
                                            >
                                                <option value="Colombia" className="bg-white text-slate-900">COLOMBIA (Default)</option>
                                                <option value="Mexico" className="bg-white text-slate-900">MÉXICO</option>
                                                <option value="España" className="bg-white text-slate-900">ESPAÑA</option>
                                                <option value="USA" className="bg-white text-slate-900">ESTADOS UNIDOS</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                                                <Coins className="w-3 h-3 text-orange-500" /> MONEDA PRINCIPAL
                                            </label>
                                            <select
                                                className="w-full bg-white border border-slate-200 rounded-xl h-14 px-6 text-sm font-medium focus:outline-none focus:border-orange-500/50 appearance-none text-slate-900 italic shadow-sm"
                                                value={currency}
                                                onChange={e => setCurrency(e.target.value)}
                                            >
                                                <option value="COP" className="bg-white text-slate-900">COP - PESO COLOMBIANO</option>
                                                <option value="MXN" className="bg-white text-slate-900">MXN - PESO MEXICANO</option>
                                                <option value="EUR" className="bg-white text-slate-900">EUR - EURO</option>
                                                <option value="USD" className="bg-white text-slate-900">USD - DÓLAR ESTADOUNIDENSE</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 border border-orange-200 rounded-[2.5rem] p-10 space-y-4 shadow-sm">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">LOCALIZACIÓN SMART</h3>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                                            JAMALI OS ajustará automáticamente los formatos de moneda, cálculos de impuestos y reglas legales de nómina según el país seleccionado.
                                        </p>
                                        <div className="pt-4 flex items-center gap-2 text-[9px] font-black text-orange-600 uppercase tracking-widest">
                                            <CheckCircle2 className="w-4 h-4" /> LOCALIZACIÓN ACTIVA
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">NIT / IDENTIFICACIÓN</label>
                                        <input
                                            className="w-full bg-white border border-slate-200 rounded-xl h-14 px-6 text-sm font-medium focus:outline-none focus:border-orange-500/50 text-slate-900 shadow-sm"
                                            defaultValue="900.123.456-7"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">TELÉFONO DE CONTACTO</label>
                                        <input
                                            className="w-full bg-white border border-slate-200 rounded-xl h-14 px-6 text-sm font-medium focus:outline-none focus:border-orange-500/50 text-slate-900 shadow-sm"
                                            defaultValue={restaurant?.whatsapp_number || "+57 300 000 0000"}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Feature Toggles */}
                            <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-10 space-y-8 shadow-sm">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 italic">Core Feature Flags</h3>

                                {[
                                    { label: 'Motor de Cocina KDS', desc: 'Activa la central de producción industrial', active: true },
                                    { label: 'Inteligencia de Meseros', desc: 'Habilita la sincronización móvil de comandas', active: true },
                                    { label: 'Check-in de Reservas', desc: 'Inicia el servicio de concierge digital', active: false },
                                    { label: 'Módulo de Fidelización', desc: 'Gestiona la base de datos de élite', active: true }
                                ].map((flag, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-sm font-black italic uppercase tracking-tight text-slate-900">{flag.label}</p>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{flag.desc}</p>
                                        </div>
                                        <div
                                            onClick={() => toast.info(`CONTROL DE ACCESO: ${flag.label} ${flag.active ? "DESACTIVADO" : "ACTIVADO"}`)}
                                            className={cn(
                                                "w-14 h-7 rounded-full transition-all flex items-center px-1 shadow-inner cursor-pointer",
                                                flag.active ? "bg-orange-600 shadow-sm" : "bg-slate-200 border border-slate-300"
                                            )}
                                        >
                                            <div className={cn("w-5 h-5 rounded-full bg-white shadow-xl transition-all", flag.active ? "translate-x-7" : "translate-x-0")} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </main>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(0, 0, 0, 0.1); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
