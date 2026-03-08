"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRestaurant } from "@/providers/RestaurantProvider"
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
    Cell,
    AreaChart,
    Area
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
    Clock,
    UtensilsCrossed,
    Trophy,
    Target,
    Flame,
    Star,
    ChefHat,
    ArrowUpRight,
    ArrowDownRight,
    Zap
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function AnalyticsDashboard() {
    const { restaurant } = useRestaurant()
    const [loading, setLoading] = useState(true)
    const [kpis, setKpis] = useState<any>(null)
    const [dailySales, setDailySales] = useState([])
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [categorySales, setCategorySales] = useState([])
    const [hourlyData, setHourlyData] = useState<any[]>([])
    const [ticketComparison, setTicketComparison] = useState<any>(null)
    const [productRankings, setProductRankings] = useState<any[]>([])

    useEffect(() => {
        if (restaurant) fetchData()
    }, [restaurant])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Original analytics queries
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

            // New analytics: Hourly Sales, Ticket Comparison, Product Rankings
            try {
                const [hourlyRes, ticketRes, rankingRes] = await Promise.all([
                    supabase.rpc('get_sales_by_hour', { p_restaurant_id: restaurant?.id, p_days: 30 }),
                    supabase.rpc('get_ticket_comparison', { p_restaurant_id: restaurant?.id }),
                    supabase.rpc('get_product_rankings', { p_restaurant_id: restaurant?.id, p_days: 30 })
                ])

                if (hourlyRes.data) {
                    // Fill missing hours with 0
                    const fullHours = Array.from({ length: 24 }, (_, i) => {
                        const found = hourlyRes.data.find((h: any) => h.hour_of_day === i)
                        return {
                            hour: i,
                            label: `${i.toString().padStart(2, '0')}:00`,
                            orders: found?.total_orders || 0,
                            revenue: found?.total_revenue || 0,
                            avg_ticket: found?.avg_ticket || 0
                        }
                    })
                    setHourlyData(fullHours)
                }

                if (ticketRes.data && ticketRes.data[0]) {
                    setTicketComparison(ticketRes.data[0])
                }

                if (rankingRes.data) {
                    setProductRankings(rankingRes.data.slice(0, 10))
                }
            } catch (e) {
                console.log("New analytics functions not yet deployed:", e)
                // Fallback: generate hourly data from orders directly
                const { data: orders } = await supabase
                    .from('orders')
                    .select('created_at, total')
                    .eq('restaurant_id', restaurant?.id)
                    .neq('status', 'cancelled')
                    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

                if (orders) {
                    const hourMap: Record<number, { orders: number; revenue: number }> = {}
                    orders.forEach((o: any) => {
                        const hour = new Date(o.created_at).getHours()
                        if (!hourMap[hour]) hourMap[hour] = { orders: 0, revenue: 0 }
                        hourMap[hour].orders++
                        hourMap[hour].revenue += o.total || 0
                    })

                    const fullHours = Array.from({ length: 24 }, (_, i) => ({
                        hour: i,
                        label: `${i.toString().padStart(2, '0')}:00`,
                        orders: hourMap[i]?.orders || 0,
                        revenue: hourMap[i]?.revenue || 0,
                        avg_ticket: hourMap[i] ? hourMap[i].revenue / hourMap[i].orders : 0
                    }))
                    setHourlyData(fullHours)

                    // Fallback ticket comparison
                    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
                    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
                    const currentWeek = orders.filter((o: any) => new Date(o.created_at).getTime() > weekAgo)
                    const prevWeek = orders.filter((o: any) => {
                        const t = new Date(o.created_at).getTime()
                        return t > twoWeeksAgo && t <= weekAgo
                    })
                    const currentAvg = currentWeek.length > 0 ? currentWeek.reduce((s: number, o: any) => s + (o.total || 0), 0) / currentWeek.length : 0
                    const prevAvg = prevWeek.length > 0 ? prevWeek.reduce((s: number, o: any) => s + (o.total || 0), 0) / prevWeek.length : 0
                    setTicketComparison({
                        current_avg_ticket: Math.round(currentAvg),
                        previous_avg_ticket: Math.round(prevAvg),
                        change_pct: prevAvg > 0 ? Math.round(((currentAvg - prevAvg) / prevAvg) * 100 * 10) / 10 : 0,
                        current_total_orders: currentWeek.length,
                        previous_total_orders: prevWeek.length,
                        current_total_revenue: currentWeek.reduce((s: number, o: any) => s + (o.total || 0), 0),
                        previous_total_revenue: prevWeek.reduce((s: number, o: any) => s + (o.total || 0), 0)
                    })
                }
            }

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

    // Find peak hour
    const peakHour = hourlyData.reduce((best, h) => h.orders > best.orders ? h : best, hourlyData[0] || { label: '--', orders: 0 })
    // Product estrella
    const starProduct = productRankings.length > 0 ? productRankings[0] : (topProducts.length > 0 ? topProducts[0] : null)

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-8 selection:bg-orange-500 selection:text-white relative overflow-hidden font-sans">
            {/* Mesh Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto space-y-5 relative z-10">
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
                        <Link href="/admin/reports/food-cost">
                            <Button className="rounded-2xl h-14 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-500">
                                <DollarSign className="w-4 h-4" /> FOOD COST
                            </Button>
                        </Link>
                        <Button
                            onClick={fetchData}
                            className="bg-orange-600 text-white h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest italic hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20"
                        >
                            ACTUALIZAR
                        </Button>
                    </div>
                </div>

                {/* KPI Cards — Enhanced Row */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <KPICard
                        title="Ventas del Mes"
                        value={formatPrice(kpis?.total_revenue_month || 0)}
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
                    <KPICardComparison
                        title="Ticket Promedio"
                        currentValue={ticketComparison?.current_avg_ticket || kpis?.avg_ticket || 0}
                        previousValue={ticketComparison?.previous_avg_ticket || 0}
                        changePct={ticketComparison?.change_pct || 0}
                    />
                    <KPICard
                        title="Hora Pico"
                        value={peakHour?.label || '--'}
                        icon={<Clock className="w-6 h-6" />}
                        trend={`${peakHour?.orders || 0} pedidos`}
                        color="text-amber-600"
                        bg="bg-amber-50"
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

                {/* 🔥 Product Star — Featured Card */}
                {starProduct && (
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-[2.5rem] shadow-xl shadow-orange-500/20 text-white flex items-center gap-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-x-10 -translate-y-10" />
                        <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-6" />
                        <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm">
                            <Star className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">⭐ Producto Estrella del Mes</p>
                            <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter mt-1">
                                {starProduct.product_name}
                            </h3>
                            <div className="flex items-center gap-6 mt-3 text-sm font-bold text-white/80">
                                <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {starProduct.total_quantity} vendidos</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {formatPrice(starProduct.total_revenue)} facturado</span>
                                <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {starProduct.order_count || starProduct.total_quantity} pedidos</span>
                            </div>
                        </div>
                        <div className="text-right relative z-10">
                            <p className="text-6xl font-black italic tracking-tighter">#1</p>
                        </div>
                    </div>
                )}

                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Sales History */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-500" /> Histórico de Ventas (30d)
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailySales}>
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={10}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '15px' }} />
                                    <Area type="monotone" dataKey="total_sales" stroke="#f97316" strokeWidth={3} fill="url(#salesGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sales by Category */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 self-start flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-orange-500" /> Por Categoría
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categorySales} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="total_sales" nameKey="category">
                                        {categorySales.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-2 w-full">
                            {categorySales.slice(0, 4).map((cat: any, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{cat.category}</span>
                                    </div>
                                    <span className="text-xs font-bold font-mono text-slate-900">{formatPrice(cat.total_sales)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🕐 Ventas por Hora — NEW */}
                <div className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                                <Clock className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase italic tracking-tighter">Ventas por <span className="text-amber-500">Hora</span></h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Últimos 30 días · Identifica tus horas pico</p>
                            </div>
                        </div>
                        {peakHour && (
                            <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl text-right">
                                <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">HORA PICO</p>
                                <p className="text-xl font-black italic text-amber-700">{peakHour.label}</p>
                            </div>
                        )}
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData.filter(h => h.hour >= 6 && h.hour <= 23)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '15px' }}
                                    formatter={(value: any, name: any) => [
                                        name === 'orders' ? `${value} pedidos` : formatPrice(value),
                                        name === 'orders' ? 'Pedidos' : 'Ingresos'
                                    ]}
                                />
                                <Bar dataKey="orders" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Product Rankings + Ticket Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Top Products Enhanced */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded-xl border border-yellow-100">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase italic tracking-tighter">Top <span className="text-yellow-500">Productos</span></h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ranking por unidades vendidas · 30 días</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(productRankings.length > 0 ? productRankings : topProducts).slice(0, 8).map((p: any, i) => {
                                const maxQty = (productRankings.length > 0 ? productRankings : topProducts)[0]?.total_quantity || 1
                                const pct = ((p.total_quantity || 0) / maxQty) * 100
                                return (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group relative overflow-hidden">
                                        {/* Progress bar background */}
                                        <div className="absolute inset-0 bg-orange-500/[0.03] rounded-2xl" style={{ width: `${pct}%` }} />

                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm italic relative z-10 shrink-0",
                                            i === 0 ? "bg-yellow-100 text-yellow-600 border border-yellow-200" :
                                                i === 1 ? "bg-slate-200 text-slate-600" :
                                                    i === 2 ? "bg-amber-100 text-amber-700" :
                                                        "bg-white border border-slate-200 text-slate-400"
                                        )}>
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <h4 className="font-bold text-sm uppercase group-hover:text-orange-600 transition-colors truncate">{p.product_name}</h4>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.category_name || ''} · {p.total_quantity} unidades</p>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <span className="text-sm font-black italic font-mono text-emerald-600">{formatPrice(p.total_revenue)}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Ticket Comparison Card — NEW */}
                    <div className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                                <Target className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase italic tracking-tighter">Ticket <span className="text-blue-500">Promedio</span></h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Esta semana vs anterior</p>
                            </div>
                        </div>

                        {ticketComparison && (
                            <div className="space-y-6">
                                {/* Current */}
                                <div className="text-center py-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Esta Semana</p>
                                    <p className="text-5xl font-black italic tracking-tighter text-slate-900">
                                        {formatPrice(ticketComparison.current_avg_ticket)}
                                    </p>
                                    <p className="text-xs text-slate-400 font-bold mt-2">{ticketComparison.current_total_orders} pedidos</p>
                                </div>

                                {/* Change */}
                                <div className={cn(
                                    "flex items-center justify-center gap-2 p-3 rounded-2xl",
                                    ticketComparison.change_pct >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                )}>
                                    {ticketComparison.change_pct >= 0
                                        ? <ArrowUpRight className="w-5 h-5" />
                                        : <ArrowDownRight className="w-5 h-5" />
                                    }
                                    <span className="font-black text-lg">{ticketComparison.change_pct >= 0 ? '+' : ''}{ticketComparison.change_pct}%</span>
                                    <span className="text-xs font-bold">vs semana anterior</span>
                                </div>

                                {/* Previous */}
                                <div className="text-center py-4 rounded-2xl">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 mb-1">Semana Anterior</p>
                                    <p className="text-2xl font-black italic tracking-tighter text-slate-400">
                                        {formatPrice(ticketComparison.previous_avg_ticket)}
                                    </p>
                                    <p className="text-[10px] text-slate-300 font-bold mt-1">{ticketComparison.previous_total_orders} pedidos</p>
                                </div>

                                {/* Revenue comparison */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Ingresos Esta Sem.</p>
                                        <p className="text-lg font-black italic text-slate-900 mt-1">{formatPrice(ticketComparison.current_total_revenue)}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Ingresos Sem. Ant.</p>
                                        <p className="text-lg font-black italic text-slate-400 mt-1">{formatPrice(ticketComparison.previous_total_revenue)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!ticketComparison && (
                            <div className="text-center py-12 text-slate-300">
                                <Target className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-xs font-bold">Sin datos comparativos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function KPICard({ title, value, icon, trend, color, bg }: any) {
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-3 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-500">
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-700 ${color}`}>
                {icon}
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{title}</p>
            <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter italic text-slate-900">{value}</span>
                <span className={`text-[9px] font-bold mt-1.5 px-3 py-1 rounded-full w-fit ${bg} ${color}`}>
                    {trend}
                </span>
            </div>
        </div>
    )
}

function KPICardComparison({ title, currentValue, previousValue, changePct }: any) {
    const isUp = changePct >= 0
    return (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-3 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-500">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-700 text-orange-600">
                <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{title}</p>
            <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter italic text-slate-900">{formatPrice(currentValue)}</span>
                <span className={cn(
                    "text-[9px] font-bold mt-1.5 px-3 py-1 rounded-full w-fit flex items-center gap-1",
                    isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isUp ? '+' : ''}{changePct}% vs. sem. anterior
                </span>
            </div>
        </div>
    )
}
