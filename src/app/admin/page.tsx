"use client"

import { Button } from "@/components/ui/button"
import {
    DollarSign,
    ShoppingBag,
    Users,
    TrendingUp,
    Clock,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Activity,
    Flame,
    Package,
    Utensils,
    Wallet,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Sparkles,
    BarChart3,
    ChevronRight,
    Star,
    Target,
    Bell,
    Settings,
    LayoutDashboard
} from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        todayRevenue: 2450000,
        activeOrders: 18,
        criticalStock: 3,
        occupiedTables: 12,
        totalTables: 20,
        newCustomers: 8,
        rating: 4.8
    })
    const [currentTime, setCurrentTime] = useState(new Date())
    const { restaurant } = useRestaurant()
    const router = useRouter()

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        setLoading(false)
        return () => clearInterval(timer)
    }, [])

    const navItems = [
        { label: 'POS VENTA', icon: ShoppingBag, href: '/admin/pos', desc: 'Terminal Punto de Venta' },
        { label: 'KDS COCINA', icon: Flame, href: '/admin/kitchen', desc: 'Central de Producción' },
        { label: 'CAJA', icon: Wallet, href: '/admin/cashier', desc: 'Control de Flujo de Efectivo' },
        { label: 'INVENTARIO', icon: Package, href: '/admin/inventory', desc: 'Control de Suministros' },
        { label: 'NÓMINA', icon: Users, href: '/admin/payroll', desc: 'Gestión de Personal' },
        { label: 'PRODUCTOS', icon: Utensils, href: '/admin/products', desc: 'Ingeniería de Menú' },
        { label: 'REPORTES', icon: BarChart3, href: '/admin/reports', desc: 'Business Intelligence' },
    ]

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden">

            {/* 🖼️ FONDO PREMIM: Restaurante de Lujo con Blur */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none" />

            {/* 🌫️ CAPA DE CRISTAL CLARO PIXORA */}
            <div className="absolute inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto flex flex-col min-h-full">

                {/* HEADER EJECUTIVO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shrink-0">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight md:leading-none">DASHBOARD <span className="text-orange-500">ADMINISTRATIVO</span></h1>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.5em] italic flex items-center gap-2 md:gap-4">
                            CENTRAL COMMAND HUB
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                            {restaurant?.name || 'JAMALI SO'} OS v2.0
                        </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-5 w-full md:w-auto">
                        <div className="text-left md:text-right">
                            <p className="text-lg md:text-2xl font-black italic tracking-tighter font-mono">
                                {currentTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                            <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest">TIEMPO REAL DE SISTEMA</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => toast.info("CENTRO DE NOTIFICACIONES: Sin mensajes nuevos")}
                                variant="ghost" size="icon" className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-800/40 border border-white/5"
                            >
                                <Bell className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                            </Button>
                            <Link href="/admin/settings">
                                <Button variant="ghost" size="icon" className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-800/40 border border-white/5">
                                    <Settings className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* KPI CARDS (Pixora Light Style) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-8 shrink-0">
                    {[
                        { label: 'VENTAS HOY', val: formatPrice(stats.todayRevenue), icon: DollarSign, color: 'text-orange-600', trend: '+12%' },
                        { label: 'ÓRDENES ACTIVAS', val: stats.activeOrders, icon: Flame, color: 'text-orange-600', trend: 'Live' },
                        { label: 'MESAS OCUPADAS', val: `${stats.occupiedTables}/${stats.totalTables}`, icon: LayoutDashboard, color: 'text-slate-900', trend: '60%' },
                        { label: 'STOCKS CRÍTICO', val: stats.criticalStock, icon: AlertCircle, color: 'text-rose-600', trend: '3 items' },
                        { label: 'CLIENTES NUEVOS', val: `+${stats.newCustomers}`, icon: Users, color: 'text-slate-900' },
                        { label: 'VALORACIÓN', val: stats.rating, icon: Star, color: 'text-amber-500', trend: '4.8/5' },
                    ].map((card, i) => (
                        <div key={i} className="group bg-white border-2 border-slate-100 rounded-[2rem] p-6 transition-all hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                                    <card.icon className="w-5 h-5" />
                                </div>
                                {card.trend && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{card.trend}</span>}
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none italic">{card.label}</p>
                            <p className={cn("text-2xl font-black italic tracking-tighter", card.color)}>{card.val}</p>
                        </div>
                    ))}
                </div>

                {/* MAIN GRID */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 flex-1 min-h-0">

                    {/* MODULOS DE CONTROL */}
                    <div className="lg:col-span-8 flex flex-col space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-1 w-12 bg-orange-600 rounded-full" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 italic">Módulos de Control Operativo</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 flex-1 lg:overflow-y-auto lg:pr-4 custom-scrollbar">
                            {navItems.map((item, i) => (
                                <Link key={i} href={item.href}>
                                    <div className="group bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 h-full transition-all hover:border-slate-900 hover:shadow-2xl cursor-pointer overflow-hidden relative active:scale-95">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all">
                                            <item.icon className="w-24 h-24 text-slate-900" />
                                        </div>
                                        <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase group-hover:text-orange-600 transition-colors leading-none">{item.label}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 italic opacity-60">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* REAL-TIME TRENDS (Estilo Pixora Light) */}
                    <div className="lg:col-span-4 bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl flex flex-col overflow-hidden mb-20 lg:mb-0">
                        <div className="flex items-center justify-between mb-8 md:mb-10">
                            <h2 className="text-base md:text-lg font-black italic uppercase tracking-tight">Real-time <span className="text-orange-600">Sales</span></h2>
                            <div className="px-2 md:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] md:text-[9px] font-bold text-emerald-600 uppercase">Live Metrics</div>
                        </div>

                        {/* Simulación Gráfico Trend */}
                        <div className="h-40 md:h-auto md:flex-1 relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent rounded-3xl border border-slate-100 flex items-end p-4 md:p-6 gap-1 md:gap-2">
                                {[30, 45, 60, 40, 75, 90, 85, 95, 100].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-orange-300 rounded-md md:rounded-lg hover:brightness-110 transition-all opacity-80" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            <div className="p-4 md:p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-orange-500/30 transition-all cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/10 flex items-center justify-center">
                                            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm font-black italic uppercase">Mesa 5</p>
                                            <p className="text-[8px] md:text-[10px] font-medium text-slate-400 leading-none">Hace 2m</p>
                                        </div>
                                    </div>
                                    <p className="text-base md:text-lg font-black italic tracking-tighter text-slate-900">$145.000</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    toast.loading("Generando reporte de cierre parcial...", { id: 'cierre-x' });
                                    setTimeout(() => {
                                        toast.success("Redirigiendo a Tesorería...", { id: 'cierre-x' });
                                        router.push('/admin/cashier');
                                    }, 1000);
                                }}
                                className="w-full h-14 md:h-16 bg-slate-900 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl hover:bg-slate-800 shadow-xl transition-all active:scale-95"
                            >
                                EJECUTAR CIERRE X
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255, 255, 255, 0.05); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
