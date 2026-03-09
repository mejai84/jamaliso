"use client"

import { useState, useEffect } from "react"
import {
    Tv,
    Monitor,
    LayoutTemplate,
    Palette,
    Settings,
    Play,
    StopCircle,
    Copy,
    ExternalLink,
    Wand2,
    MonitorSmartphone,
    CreditCard,
    Banknote,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

export function KioskSettings() {
    const { restaurant } = useRestaurant()
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (restaurant) loadSettings()
    }, [restaurant])

    const loadSettings = async () => {
        if (!restaurant?.id) return
        try {
            const { data, error } = await supabase
                .from('kiosk_settings')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .single()

            if (data) {
                setSettings(data)
            } else {
                setSettings({
                    is_active: false,
                    theme_color: '#dc2626',
                    welcome_title: 'Toca para pedir',
                    welcome_subtitle: 'Rápido, fácil y sin filas',
                    require_customer_name: true,
                    allow_cash_payment: false,
                    allow_card_payment: true,
                    idle_timeout_seconds: 60,
                    screensaver_video_url: ''
                })
            }
        } catch (e: any) {
            console.error("No kiosk settings found yet", e)
        }
    }

    const updateSettings = async (updates: Partial<any>) => {
        if (!restaurant?.id) return
        setLoading(true)
        try {
            const { error } = await supabase
                .from('kiosk_settings')
                .upsert({
                    restaurant_id: restaurant.id,
                    ...settings,
                    ...updates,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'restaurant_id' })

            if (error) throw error
            setSettings((prev: any) => ({ ...prev, ...updates }))
            toast.success("AJUSTES DE KIOSCO ACTUALIZADOS")
        } catch (e: any) {
            toast.error(`Error: ${e.message || "No se pudieron guardar los cambios"}`)
            console.error("Supabase Error:", e)
        } finally {
            setLoading(false)
        }
    }

    if (!settings) return <div className="p-8 text-center text-rose-500 animate-pulse font-black italic">Inicializando Sistema Kiosco...</div>

    const kioskUrl = `https://${restaurant?.subdomain || 'restaurante'}.jamaliso.com/kiosk`

    return (
        <div className="bg-transparent text-slate-900 font-sans relative overflow-hidden flex flex-col min-h-screen -m-4 md:-m-8 p-4 md:p-8">
            {/* 🖼️ FONDO PREMIUM KIOSK (Red/Rose tint) */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-10" />
            <div className="absolute inset-0 backdrop-blur-[100px] bg-gradient-to-br from-rose-50/90 via-white/80 to-orange-50/90 pointer-events-none" />

            <div className="relative z-10 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 🛰️ HEADER DEL MÓDULO */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-rose-100 shadow-xl">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20 rotate-3">
                                <MonitorSmartphone className="w-6 h-6" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400 italic">Self-Service Terminal</h2>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                            Módulo de <span className="text-rose-600">Autoservicio</span>
                        </h1>
                        <p className="text-sm font-bold text-slate-500 italic max-w-xl leading-relaxed">Convierte cualquier iPad o Tablet Android en un Kiosco táctil inmersivo donde los clientes ordenan y pagan sin interactuar con cajeros. Aumenta el ticket promedio hasta un 20%.</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-white/60 p-5 rounded-[2rem] border-2 border-rose-50 shadow-inner">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Estado del Tótem</p>
                                <p className={cn("text-xs font-black italic uppercase transition-colors", settings.is_active ? "text-emerald-600" : "text-slate-400")}>
                                    {settings.is_active ? "● Kiosco Online" : "○ Offline"}
                                </p>
                            </div>
                            <Switch
                                checked={settings.is_active}
                                onCheckedChange={(val) => updateSettings({ is_active: val })}
                                className="scale-125 data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                        {settings.is_active && (
                            <Button
                                onClick={() => window.open(window.location.origin + '/kiosk', '_blank')}
                                className="h-12 bg-slate-900 text-white hover:bg-rose-600 rounded-[1.5rem] font-black italic uppercase text-xs tracking-widest gap-2 shadow-xl shrink-0"
                            >
                                <Play className="w-4 h-4 fill-current" /> INICIAR KIOSCO EN ESTE DISPOSITIVO
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* COL-8: PERSONALIZACIÓN VISUAL */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-sm space-y-10 group hover:border-rose-100 transition-colors">
                            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <Wand2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">Look & Feel</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">APARIENCIA DE LA PANTALLA TÁCTIL</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Color Corporativo</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            defaultValue={settings.theme_color}
                                            onBlur={(e) => updateSettings({ theme_color: e.target.value })}
                                            className="w-10 h-10 rounded-xl cursor-pointer"
                                        />
                                        <span className="font-mono text-sm font-bold">{settings.theme_color}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Título de Bienvenida (Greeting)</label>
                                        <input
                                            defaultValue={settings.welcome_title}
                                            onBlur={(e) => updateSettings({ welcome_title: e.target.value })}
                                            className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-xl font-black italic tracking-tighter focus:border-rose-500 outline-none transition-all shadow-inner placeholder:text-slate-300"
                                            placeholder="Toca para ordenar"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Subtítulo de Bienvenida</label>
                                        <input
                                            defaultValue={settings.welcome_subtitle}
                                            onBlur={(e) => updateSettings({ welcome_subtitle: e.target.value })}
                                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-600 focus:border-rose-500 outline-none transition-all shadow-inner placeholder:text-slate-300"
                                            placeholder="Rápido, fácil y sin filas"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Screensaver Interactivo (Video URL)</label>
                                        <input
                                            defaultValue={settings.screensaver_video_url}
                                            onBlur={(e) => updateSettings({ screensaver_video_url: e.target.value })}
                                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-6 text-xs text-rose-600 font-medium focus:border-rose-500 outline-none transition-all shadow-inner placeholder:text-slate-300"
                                            placeholder="https://tu-restaurante.com/kiosk-promo.mp4"
                                        />
                                        <p className="text-[9px] font-bold uppercase italic text-slate-400 pl-2">Se reproducirá cuando el Kiosco esté inactivo.</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-8 border-4 border-slate-800 flex items-center justify-center shrink-0 relative shadow-2xl overflow-hidden group/screen h-[350px]">
                                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black to-transparent z-10" />
                                    {settings.screensaver_video_url ? (
                                        <video src={settings.screensaver_video_url} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-800 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-600 to-slate-900" />
                                    )}

                                    <div className="relative z-20 text-center space-y-4 max-w-[80%] transform scale-90">
                                        <div className="w-20 h-20 bg-white rounded-full mx-auto animate-pulse flex items-center justify-center">
                                            <Tv className="w-8 h-8 text-slate-900" />
                                        </div>
                                        <h3 className="text-3xl text-white font-black italic tracking-tighter uppercase leading-none drop-shadow-md">{settings.welcome_title}</h3>
                                        <p className="text-white/80 font-bold uppercase text-[10px] tracking-widest">{settings.welcome_subtitle}</p>
                                        <Button className="rounded-full h-14 px-8 mt-4 font-black italic uppercase text-xs drop-shadow-xl" style={{ backgroundColor: settings.theme_color }}>
                                            COMENZAR PEDIDO
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COL-4: OPERATIVA FLUJO */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/40 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 shadow-sm space-y-8 group hover:border-rose-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-black uppercase italic tracking-tighter">Reglas de Flujo</h4>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="mr-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Solicitar Nombre</p>
                                        <p className="text-xs font-medium text-slate-500 italic">Identificar pedido en KDS</p>
                                    </div>
                                    <Switch
                                        checked={settings.require_customer_name}
                                        onCheckedChange={(val) => updateSettings({ require_customer_name: val })}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="mr-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500" /> Pago con Tarjeta</p>
                                        <p className="text-[10px] font-medium text-slate-500 italic">Vía Datáfono Integrado</p>
                                    </div>
                                    <Switch
                                        checked={settings.allow_card_payment}
                                        onCheckedChange={(val) => updateSettings({ allow_card_payment: val })}
                                        className="data-[state=checked]:bg-blue-500"
                                    />
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                    <div className="mr-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-500" /> Pago Efectivo</p>
                                        <p className="text-[10px] font-medium text-slate-500 italic">Imprime ticket para caja</p>
                                    </div>
                                    <Switch
                                        checked={settings.allow_cash_payment}
                                        onCheckedChange={(val) => updateSettings({ allow_cash_payment: val })}
                                        className="data-[state=checked]:bg-emerald-500"
                                    />
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 text-rose-500">
                                        <Clock className="w-4 h-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Timeout Inactividad (Seg)</p>
                                    </div>
                                    <input
                                        type="number"
                                        defaultValue={settings.idle_timeout_seconds}
                                        onBlur={(e) => updateSettings({ idle_timeout_seconds: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-center text-lg font-black text-rose-600 focus:outline-none focus:border-rose-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
