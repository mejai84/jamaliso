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
    ChefHat,
    ArrowRight,
    Star,
    Target,
    Bell,
    Settings,
    LayoutDashboard,
    Globe
} from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { adminTranslations } from "@/lib/i18n/admin"

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        todayRevenue: 0,
        activeOrders: 0,
        criticalStock: 0,
        occupiedTables: 0,
        totalTables: 0,
        newCustomers: 0,
        rating: 4.8
    })
    const [currentTime, setCurrentTime] = useState(new Date())
    const { restaurant, lang, setLanguage } = useRestaurant()
    const router = useRouter()
    const t = adminTranslations[lang]
    const [isDemo, setIsDemo] = useState(false)

    useEffect(() => {
        setIsDemo(new URL(window.location.href).searchParams.get('demo') === 'true')
        // Al montar o cambiar de sede, reseteamos estadísticas para evitar ver datos anteriores
        setStats({
            todayRevenue: 0,
            activeOrders: 0,
            criticalStock: 0,
            occupiedTables: 0,
            totalTables: 0,
            newCustomers: 0,
            rating: 4.8
        })
    }, [restaurant?.id])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (restaurant?.id) {
            fetchDashboardStats(restaurant.id)
        }
    }, [restaurant?.id])

    const fetchDashboardStats = async (resId: string) => {
        setLoading(true)
        try {
            const isDemo = new URL(window.location.href).searchParams.get('demo') === 'true'
            if (isDemo || resId === '00000000-0000-0000-0000-000000000000') {
                setStats({
                    todayRevenue: 1250000,
                    activeOrders: 8,
                    criticalStock: 3,
                    occupiedTables: 12,
                    totalTables: 24,
                    newCustomers: 15,
                    rating: 4.9
                })
                setLoading(false)
                return
            }

            // 1. Ventas de Hoy
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const { data: salesData } = await supabase
                .from('orders')
                .select('total')
                .eq('restaurant_id', resId)
                .neq('status', 'cancelled')
                .gte('created_at', today.toISOString())

            const totalRevenue = salesData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

            // 2. Órdenes Activas
            const { count: activeCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('restaurant_id', resId)
                .in('status', ['pending', 'confirmed', 'cooking', 'ready'])

            // 3. Mesas
            const { data: tablesData } = await supabase
                .from('tables')
                .select('status')
                .eq('restaurant_id', resId)

            const totalTables = tablesData?.length || 0
            const occupiedTables = tablesData?.filter(t => t.status === 'occupied').length || 0

            // 4. Inventario Crítico
            const { data: invData } = await supabase
                .from('ingredients')
                .select('stock, min_stock')
                .eq('restaurant_id', resId)

            const criticalStock = invData?.filter(i => (i.stock || 0) <= (i.min_stock || 0)).length || 0

            setStats({
                todayRevenue: totalRevenue,
                activeOrders: activeCount || 0,
                criticalStock: criticalStock,
                occupiedTables: occupiedTables,
                totalTables: totalTables,
                newCustomers: 8, // Placeholder o consulta opcional
                rating: 4.8
            })
        } catch (error) {
            console.error("Error loading dashboard stats:", error)
            toast.error(lang === 'es' ? "No se pudieron sincronizar las métricas reales" : "Could not synchronize real metrics")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center gap-12 z-[100] relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 pointer-events-none" />
            <div className="relative">
                <div className="w-24 h-24 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <LayoutDashboard className="w-10 h-10 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-3">
                <p className="text-2xl font-black italic uppercase italic tracking-tighter">{t.dashboard.synchronizing} <span className="text-orange-500">{t.dashboard.real_metrics}</span> {t.dashboard.real_metrics_suffix}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] animate-pulse">
                    {restaurant?.name || 'JAMALI OS'} COMMAND CENTER
                </p>
            </div>
        </div>
    )
    const navItems = [
        { label: t.nav.pos_operations, icon: ShoppingBag, href: '/admin/pos', desc: lang === 'es' ? 'Terminal Punto de Venta' : 'Point of Sale Terminal' },
        { label: t.nav.kitchen_kds, icon: Flame, href: '/admin/kitchen', desc: lang === 'es' ? 'Central de Producción' : 'Production Central' },
        { label: t.nav.cash_control, icon: Wallet, href: '/admin/cashier', desc: lang === 'es' ? 'Control de Flujo de Efectivo' : 'Cash Flow Control' },
        { label: t.nav.inventory, icon: Package, href: '/admin/inventory', desc: lang === 'es' ? 'Control de Suministros' : 'Supply Control' },
        { label: t.nav.payroll, icon: Users, href: '/admin/payroll', desc: lang === 'es' ? 'Gestión de Personal' : 'Staff Management' },
        { label: t.nav.menu_products, icon: Utensils, href: '/admin/products', desc: lang === 'es' ? 'Ingeniería de Menú' : 'Menu Engineering' },
        { label: t.nav.reports, icon: BarChart3, href: '/admin/reports', desc: 'Business Intelligence' },
    ]

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden">

            {/* 🖼️ FONDO PREMIM: Restaurante de Lujo con Blur */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none" />

            {/* 🌫️ CAPA DE CRISTAL CLARO PIXORA */}
            <div className="absolute inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto flex flex-col min-h-full">

                {/* HEADER EJECUTIVO */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <LayoutDashboard className="w-5 h-5 text-orange-600" />
                            </div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                {t.dashboard.title} <span className="text-orange-600 underline decoration-4 underline-offset-8">{t.dashboard.admin_suffix}</span>
                            </h1>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            {t.dashboard.command_hub} • {t.dashboard.real_time}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border-2 border-slate-100">
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(lang === 'es' ? 'en' : 'es')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-orange-600 transition-colors"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            {lang === 'es' ? 'English' : 'Español'}
                        </button>

                        <div className="h-10 w-[1px] bg-slate-100" />

                        <div className="text-right px-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                {currentTime.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'long' })}
                            </p>
                            <p className="text-2xl font-black italic text-slate-900 tracking-tighter tabular-nums leading-none">
                                {currentTime.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', { hour12: false })}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Hub Alerts (ex-Demo Banner) removed from here */}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Ventas Hoy */}
                    <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-50 shadow-sm relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl">
                                <Wallet className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="flex items-center text-xs font-black text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-lg">
                                +12.5% <ArrowUpRight className="ml-1 w-3 h-3" />
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t.dashboard.kpis.today_sales}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 tabular-nums">
                                {formatPrice(stats.todayRevenue)}
                            </h3>
                        </div>
                    </div>

                    {/* Órdenes Activas */}
                    <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-50 shadow-sm relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-orange-500/10 rounded-2xl">
                                <ShoppingBag className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 rounded-full">
                                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-ping" />
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{t.dashboard.kpis.live}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t.dashboard.kpis.active_orders}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 tabular-nums">
                                {stats.activeOrders} <span className="text-xs uppercase font-bold italic text-slate-300">tickets</span>
                            </h3>
                        </div>
                    </div>

                    {/* Mesas Ocupadas */}
                    <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-50 shadow-sm relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-blue-500/10 rounded-2xl">
                                <Utensils className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-xs font-black text-blue-600">
                                {Math.round((stats.occupiedTables / stats.totalTables) * 100)}% cap.
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t.dashboard.kpis.occupied_tables}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 tabular-nums">
                                {stats.occupiedTables} / {stats.totalTables}
                            </h3>
                        </div>
                    </div>

                    {/* Stock Crítico */}
                    <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-50 shadow-sm relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-rose-500/10 rounded-2xl">
                                <Package className="w-6 h-6 text-rose-600" />
                            </div>
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t.dashboard.kpis.critical_stock}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 tabular-nums">
                                {stats.criticalStock} <span className="text-xs uppercase font-bold italic text-slate-300">{t.dashboard.kpis.items}</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Secondary Metrics / Activity Center */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-white rounded-[2.5rem] p-10 border-2 border-slate-50 shadow-sm space-y-8">
                            <div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic mb-6">
                                    {t.dashboard.notifications}
                                </h4>
                                <div className="p-10 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                                    <Bell className="w-10 h-10 text-slate-200" />
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.dashboard.no_notifications}</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t-2 border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.kpis.new_customers}</p>
                                        <p className="text-xl font-black italic text-slate-900 tracking-tighter">+{stats.newCustomers}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                                        <Star className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.dashboard.kpis.rating}</p>
                                        <p className="text-xl font-black italic text-slate-900 tracking-tighter">{stats.rating}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic mb-4">{t.dashboard.synchronizing}</h4>
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
                                {t.dashboard.real_metrics} <br />
                                <span className="text-orange-500">{t.dashboard.real_metrics_suffix}</span>
                            </h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                {lang === 'es' ? `Sistema optimizado. ${restaurant?.name || '---'} opera al 100%.` : `System optimized. ${restaurant?.name || '---'} is 100% operational.`}
                            </p>
                            <Button className="w-full bg-white text-slate-900 hover:bg-orange-500 hover:text-white h-16 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all border-none">
                                {lang === 'es' ? 'Ver Reportes' : 'View Reports'} <ArrowUpRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Operations Control Center */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-white rounded-[2.5rem] p-10 border-2 border-slate-50 shadow-sm h-full">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">
                                        {t.dashboard.control_modules}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {lang === 'es' ? 'Accesos directos de alta prioridad' : 'High priority direct access'}
                                    </p>
                                </div>
                                <BarChart3 className="w-6 h-6 text-slate-300" />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {[
                                    { icon: ShoppingBag, label: t.nav.order_list.toUpperCase(), color: "orange", href: "/admin/orders" },
                                    { icon: Utensils, label: t.nav.waiter_portal.toUpperCase(), color: "blue", href: "/admin/waiter" },
                                    { icon: ChefHat, label: lang === 'es' ? 'COCINA' : 'KITCHEN', color: "rose", href: "/admin/kitchen" },
                                    { icon: Users, label: t.nav.staff_management.toUpperCase(), color: "emerald", href: "/admin/employees" },
                                    { icon: Package, label: t.nav.inventory.toUpperCase(), color: "amber", href: "/admin/inventory" },
                                    { icon: Settings, label: t.nav.settings.toUpperCase(), color: "slate", href: "/admin/settings" }
                                ].map((module, i) => (
                                    <Link
                                        key={i}
                                        href={module.href}
                                        className="group p-8 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col items-center gap-4 text-center active:scale-95"
                                    >
                                        <div className={`p-5 rounded-2xl bg-${module.color}-500/10 group-hover:bg-${module.color}-500 transition-colors`}>
                                            <module.icon className={`w-6 h-6 text-${module.color}-600 group-hover:text-white transition-colors`} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">
                                            {module.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
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
