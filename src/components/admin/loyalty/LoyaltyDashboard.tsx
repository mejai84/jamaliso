"use client"

import { useState, useEffect } from "react"
import {
    Gift,
    TrendingUp,
    Users,
    DollarSign,
    Settings,
    Star,
    Award,
    Sparkles,
    Medal,
    ArrowUpRight,
    Search,
    RefreshCcw,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

export function LoyaltyDashboard() {
    const { restaurant, refreshRestaurant } = useRestaurant()
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        totalClients: 0,
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        redemptionRate: 0
    })

    useEffect(() => {
        if (restaurant) {
            loadSettings()
            loadStats()
        }
    }, [restaurant])

    const loadSettings = async () => {
        if (!restaurant?.id) return
        try {
            const { data, error } = await supabase
                .from('loyalty_settings')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .single()

            if (data) {
                setSettings(data)
            } else {
                // Si no existe, preconfiguramos el estado local para luego crearlo
                setSettings({
                    is_active: false,
                    points_per_currency: 1.00,
                    currency_per_point: 10.00,
                    min_points_to_redeem: 100,
                    expiration_days: 365
                })
            }
        } catch (e: any) {
            console.error("No loyalty settings found yet", e)
        }
    }

    const loadStats = async () => {
        // Mock data fetching, ready for real queries
        // const { count } = await supabase.from('customer_loyalty').select('*', { count: 'exact', head: true }).eq('restaurant_id', restaurant?.id)
        setStats({
            totalClients: 1245,
            totalPointsIssued: 45800,
            totalPointsRedeemed: 12400,
            redemptionRate: 27
        })
    }

    const updateSettings = async (updates: Partial<any>) => {
        if (!restaurant?.id) return
        setLoading(true)
        try {
            // Upsert mechanism
            const { error } = await supabase
                .from('loyalty_settings')
                .upsert({
                    restaurant_id: restaurant.id,
                    ...settings,
                    ...updates,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'restaurant_id' })

            if (error) throw error

            setSettings((prev: any) => ({ ...prev, ...updates }))
            toast.success("REGLAS DE LEALTAD ACTUALIZADAS")
        } catch (e: any) {
            toast.error(`Error: ${e.message || "No se pudieron guardar los cambios"}`)
            console.error("Supabase Error:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleLoyalty = (checked: boolean) => {
        updateSettings({ is_active: checked })
    }

    if (!settings) return <div className="p-8 text-center text-slate-500 animate-pulse">Cargando motor de lealtad...</div>

    return (
        <div className="bg-transparent text-slate-900 font-sans relative overflow-hidden flex flex-col min-h-screen -m-4 md:-m-8 p-4 md:p-8">
            {/* 🖼️ FONDO PREMIUM EXCLUSIVO */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-10" />
            <div className="absolute inset-0 backdrop-blur-[100px] bg-gradient-to-br from-indigo-50/90 via-white/80 to-purple-50/90 pointer-events-none" />

            <div className="relative z-10 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-700">

                {/* 🛰️ HEADER DEL MÓDULO */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-slate-100 shadow-xl">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 rotate-[-3deg]">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Motor de Retención</h2>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                            Programa de <span className="text-indigo-600">Lealtad</span>
                        </h1>
                        <p className="text-sm font-bold text-slate-500 italic max-w-xl leading-relaxed">Convierte clientes ocasionales en promotores de marca. Otorga puntos por compra y define reglas de redención que aumenten la recurrencia real.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/60 p-5 rounded-[2rem] border-2 border-indigo-50 shadow-inner">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status del Programa</p>
                            <p className={cn("text-xs font-black italic uppercase transition-colors", settings.is_active ? "text-indigo-600" : "text-rose-600")}>
                                {settings.is_active ? "● Acumulando Puntos" : "○ Programa Pausado"}
                            </p>
                        </div>
                        <Switch
                            checked={settings.is_active}
                            onCheckedChange={handleToggleLoyalty}
                            className="scale-125 data-[state=checked]:bg-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border-2 border-slate-100 shadow-sm hover:border-indigo-200 transition-colors group">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Socios Activos</p>
                        <p className="text-3xl font-black italic tracking-tighter">{stats.totalClients.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border-2 border-slate-100 shadow-sm hover:border-emerald-200 transition-colors group">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Puntos Emitidos</p>
                        <p className="text-3xl font-black italic tracking-tighter">{stats.totalPointsIssued.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border-2 border-slate-100 shadow-sm hover:border-orange-200 transition-colors group">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                            <Gift className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Puntos Redimidos</p>
                        <p className="text-3xl font-black italic tracking-tighter">{stats.totalPointsRedeemed.toLocaleString()}</p>
                    </div>

                    <div className="bg-indigo-600 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform">
                            <Zap className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Tasa de Redención</p>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black italic tracking-tighter">{stats.redemptionRate}%</p>
                            <span className="text-xs font-bold text-indigo-300 mb-1">+5% vs. Anterior</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* MATRIZ DE REGLAS (COL-7) */}
                    <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-sm space-y-10 group hover:border-indigo-100 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Reglas de Fricción</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CÓMO ACUMULAN Y REDIMEN TUS CLIENTES</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* ACUMULACIÓN */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black italic uppercase text-indigo-900 border-b-2 border-indigo-50 pb-2 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-emerald-500" /> Acumulación</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Por cada compra de ($)</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-slate-400">$</span>
                                            <input
                                                type="number"
                                                defaultValue={settings.points_per_currency}
                                                onBlur={(e) => updateSettings({ points_per_currency: parseFloat(e.target.value) })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black focus:border-indigo-500 outline-none text-indigo-900"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black italic">OTORGAMOS</div>
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 transition-colors">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Cantidad de Puntos</label>
                                        <div className="flex items-center gap-3">
                                            <Star className="w-5 h-5 text-amber-400" />
                                            <input
                                                type="number"
                                                disabled
                                                value="1"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-500 text-center opacity-70"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* REDENCIÓN */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black italic uppercase text-purple-900 border-b-2 border-purple-50 pb-2 flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-purple-500" /> Redención</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-300 transition-colors">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Por cada Punto</label>
                                        <div className="flex items-center gap-3">
                                            <Star className="w-5 h-5 text-amber-400" />
                                            <input
                                                type="number"
                                                disabled
                                                value="1"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-500 text-center opacity-70"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-xs font-black italic">DESCONTAMOS</div>
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-300 transition-colors">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Dólares/Pesos ($)</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-slate-400">$</span>
                                            <input
                                                type="number"
                                                defaultValue={settings.currency_per_point}
                                                onBlur={(e) => updateSettings({ currency_per_point: parseFloat(e.target.value) })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black focus:border-purple-500 outline-none text-purple-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                            <div className="bg-white border-2 border-slate-50 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Puntos mínimos para canje</p>
                                    <input
                                        type="number"
                                        defaultValue={settings.min_points_to_redeem}
                                        onBlur={(e) => updateSettings({ min_points_to_redeem: parseInt(e.target.value) })}
                                        className="text-lg font-black italic text-slate-900 outline-none w-20"
                                    />
                                </div>
                                <Medal className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="bg-white border-2 border-slate-50 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expiración (Días)</p>
                                    <input
                                        type="number"
                                        defaultValue={settings.expiration_days}
                                        onBlur={(e) => updateSettings({ expiration_days: parseInt(e.target.value) })}
                                        className="text-lg font-black italic text-slate-900 outline-none w-20"
                                    />
                                </div>
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                    </div>

                    {/* LÍDER BOARD VIP (COL-5) */}
                    <div className="lg:col-span-5 bg-white/40 backdrop-blur-md border-2 border-slate-100 rounded-[3rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Award className="w-48 h-48" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-1">Top Clientes VIP</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LOS MÁS FIELES ESTE MES</p>
                            </div>

                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full h-12 bg-white rounded-xl border border-slate-100 pl-12 pr-4 text-xs font-bold shadow-sm outline-none focus:border-indigo-400"
                                    placeholder="Buscar por nombre o teléfono..."
                                />
                            </div>

                            <div className="space-y-3">
                                {[
                                    { name: "Sebastián M.", points: 3450, color: "text-amber-500", bg: "bg-amber-100", rank: 1 },
                                    { name: "Carolina A.", points: 2100, color: "text-slate-400", bg: "bg-slate-100", rank: 2 },
                                    { name: "Diego F.", points: 1890, color: "text-orange-400", bg: "bg-orange-100", rank: 3 },
                                    { name: "María G.", points: 800, color: "text-indigo-400", bg: "bg-indigo-50", rank: 4 }
                                ].map((vip, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 hover:border-indigo-100 transition-colors shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black italic", vip.bg, vip.color)}>
                                                #{vip.rank}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{vip.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registrado hace 5m</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="flex items-center gap-1 text-sm font-black italic text-emerald-600">
                                                {vip.points.toLocaleString()} <Star className="w-3 h-3" />
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
