"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Users,
    ArrowLeft,
    Loader2,
    Calendar,
    ChevronRight,
    UtensilsCrossed,
    Trophy
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true)
    const [kpis, setKpis] = useState<any>(null)
    const [dailySales, setDailySales] = useState([])
    const [topProducts, setTopProducts] = useState([])
    const [categorySales, setCategorySales] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [kpiRes, dailyRes, topRes, catRes] = await Promise.all([
                supabase.rpc('get_dashboard_kpis'),
                supabase.rpc('get_sales_daily'),
                supabase.rpc('get_top_products'),
                supabase.rpc('get_sales_by_category')
            ])

            if (kpiRes.data) setKpis(kpiRes.data[0])
            if (dailyRes.data) setDailySales(dailyRes.data.reverse())
            if (topRes.data) setTopProducts(topRes.data)
            if (catRes.data) setCategorySales(catRes.data)

        } catch (error) {
            console.error("Error fetching analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
    )

    const COLORS = ['#f97316', '#10b981', '#3b82f6', '#eab308', '#a855f7', '#ec4899']

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-8 selection:bg-orange-500 selection:text-white relative overflow-hidden">
            {/* Mesh Gradients for Premium Feel (Light) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <TrendingUp className="w-8 h-8 text-orange-500" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Estadísticas <span className="text-orange-500">Globales</span></h1>
                        </div>
                        <p className="text-slate-400 font-medium italic pl-14 tracking-widest uppercase text-[10px]">Rendimiento comercial de JAMALI OS Intelligence</p>
                    </div>

                    <div className="flex gap-2">
                        <Link href="/admin">
                            <Button variant="ghost" className="rounded-2xl h-14 bg-white border border-slate-200 font-black uppercase text-xs tracking-widest gap-2 shadow-sm">
                                <ArrowLeft className="w-4 h-4" /> VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={fetchData}
                            className="bg-orange-600 text-white h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest italic hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20"
                        >
                            ACTUALIZAR DATOS
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        title="Ventas del Mes"
                        value={`$${kpis?.total_revenue_month?.toLocaleString() || 0}`}
                        icon={<DollarSign className="w-6 h-6" />}
                        trend="+12% vs mes anterior"
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                    <KPICard
                        title="Pedidos Totales"
                        value={kpis?.total_orders_month || 0}
                        icon={<ShoppingBag className="w-6 h-6" />}
                        trend="En tendencia alcista"
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <KPICard
                        title="Ticket Promedio"
                        value={`$${Math.round(kpis?.avg_ticket || 0).toLocaleString()}`}
                        icon={<TrendingUp className="w-6 h-6" />}
                        trend="Optimizado"
                        color="text-orange-600"
                        bg="bg-orange-50"
                    />
                    <KPICard
                        title="Clientes Leales"
                        value={kpis?.total_customers || 0}
                        icon={<Users className="w-6 h-6" />}
                        trend="Acumulando puntos"
                        color="text-purple-600"
                        bg="bg-purple-50"
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ventas Diarias */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" /> Histórico de Ventas (30d)
                            </h3>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailySales}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '15px', color: '#0f172a' }}
                                        labelStyle={{ color: '#f97316', fontWeight: 'bold' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total_sales"
                                        stroke="#f97316"
                                        strokeWidth={4}
                                        dot={{ fill: '#f97316', strokeWidth: 2 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Ventas por Categoría */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 self-start flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-orange-500" /> Por Categoría
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categorySales}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="total_sales"
                                        nameKey="category"
                                    >
                                        {categorySales.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-2 w-full">
                            {categorySales.slice(0, 4).map((cat: any, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{cat.category}</span>
                                    </div>
                                    <span className="text-xs font-bold font-mono text-slate-900">${cat.total_sales?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Top Products */}
                <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-100">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Top Productos</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Los favoritos de los clientes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topProducts.map((p: any, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-orange-500/20 transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-orange-600 italic shadow-sm">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase group-hover:text-orange-600 transition-colors text-slate-900 leading-tight">{p.product_name}</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.total_quantity} Unidades</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black italic font-mono text-emerald-600">${Math.round(p.total_revenue / 1000)}k</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function KPICard({ title, value, icon, trend, color, bg }: any) {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-8 rounded-[2.5rem] shadow-sm space-y-4 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-500">
            <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-700 ${color}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{title}</p>
            <div className="flex flex-col">
                <span className="text-4xl font-black tracking-tighter italic text-slate-900">{value}</span>
                <span className={`text-[10px] font-bold mt-2 px-3 py-1 rounded-full w-fit ${bg} ${color}`}>
                    {trend}
                </span>
            </div>
        </div>
    )
}
