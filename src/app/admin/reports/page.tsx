"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    ArrowUpRight,
    ArrowLeft,
    MinusCircle,
    BadgeDollarSign,
    Clock,
    PieChart,
    Loader2,
    Target,
    Trophy,
    ArrowRight,
    Calendar,
    Filter,
    Download,
    Activity,
    Zap,
    Sparkles,
    Presentation,
    Globe,
    Wallet
} from "lucide-react"
import Link from "next/link"
import { cn, formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { getBusinessIntelligenceData } from "./actions"
import { useRestaurant } from "@/providers/RestaurantProvider"
import jsPDF from "jspdf"

type KPI = {
    total_revenue_month: number
    total_orders_month: number
    avg_ticket: number
    total_customers: number
    current_cash_balance?: number
}

type DailySales = {
    day: string
    total_sales: number
    order_count: number
}

type TopProduct = {
    product_name: string
    total_quantity: number
    total_revenue: number
    contribution_margin?: number
}

type WasteData = {
    day: string
    amount: number
}

export default function ReportsPagePremium() {
    const { restaurant } = useRestaurant()
    const [kpis, setKpis] = useState<KPI | null>(null)
    const [dailySales, setDailySales] = useState<DailySales[]>([])
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [weeklyWaste, setWeeklyWaste] = useState<WasteData[]>([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        if (restaurant?.id) {
            loadData()
        }
        return () => clearInterval(timer)
    }, [restaurant?.id])

    const loadData = async () => {
        if (!restaurant?.id) return
        setLoading(true)
        try {
            const res = await getBusinessIntelligenceData(restaurant.id)
            if (res.success && res.data) {
                setKpis(res.data.kpis)
                setDailySales(res.data.dailySales)
                setTopProducts(res.data.topProducts)
                setWeeklyWaste(res.data.weeklyWaste || [])
            } else {
                toast.error("Error al cargar datos reales: " + res.error)
            }
        } catch (err) {
            console.error(err)
            toast.error("Error de conexión al servidor")
        } finally {
            setLoading(false)
        }
    }

    // 📄 EXPORT PDF REAL
    const exportPDF = () => {
        setExporting(true)
        try {
            const doc = new jsPDF()
            const restaurantName = restaurant?.name || 'JAMALI SO'
            const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

            // Header
            doc.setFillColor(234, 88, 12) // orange-600
            doc.rect(0, 0, 210, 40, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont('helvetica', 'bold')
            doc.text('BUSINESS INTELLIGENCE', 14, 20)
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text(`${restaurantName} | Reporte generado: ${fecha}`, 14, 32)

            // KPIs
            doc.setTextColor(15, 23, 42)
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text('KPIs DEL MES', 14, 56)
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            const kpiData = [
                ['Ingresos del Mes', formatPrice(kpis?.total_revenue_month || 0)],
                ['Total de Órdenes', String(kpis?.total_orders_month || 0)],
                ['Ticket Promedio', formatPrice(kpis?.avg_ticket || 0)],
                ['Clientes Únicos', String(kpis?.total_customers || 0)],
                ['Saldo Caja Actual', formatPrice(kpis?.current_cash_balance || 0)],
            ]
            let y = 64
            kpiData.forEach(([label, val]) => {
                doc.setFont('helvetica', 'bold')
                doc.text(label + ':', 14, y)
                doc.setFont('helvetica', 'normal')
                doc.text(val, 90, y)
                y += 9
            })

            // Top Productos
            y += 6
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.text('TOP PRODUCTOS', 14, y)
            y += 8
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('#', 14, y); doc.text('Producto', 25, y); doc.text('Revenue', 120, y); doc.text('Margen', 165, y)
            doc.setDrawColor(200, 200, 200)
            doc.line(14, y + 2, 196, y + 2)
            y += 8
            doc.setFont('helvetica', 'normal')
            topProducts.forEach((p, i) => {
                doc.text(String(i + 1), 14, y)
                doc.text(p.product_name.substring(0, 40), 25, y)
                doc.text(formatPrice(p.total_revenue), 120, y)
                doc.text(formatPrice(p.contribution_margin || 0), 165, y)
                y += 8
            })

            // Ventas diarias
            if (dailySales.length > 0) {
                y += 6
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(14)
                doc.text('VENTAS ÚLTIMOS 7 DÍAS', 14, y)
                y += 8
                doc.setFontSize(10)
                doc.setFont('helvetica', 'bold')
                doc.text('Día', 14, y); doc.text('Ventas', 60, y); doc.text('Órdenes', 120, y)
                doc.line(14, y + 2, 196, y + 2)
                y += 8
                doc.setFont('helvetica', 'normal')
                dailySales.forEach(s => {
                    doc.text(s.day, 14, y)
                    doc.text(formatPrice(s.total_sales), 60, y)
                    doc.text(String(s.order_count), 120, y)
                    y += 8
                })
            }

            // Footer
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(`Generado por ${restaurantName} OS · Antigravity Platform`, 14, 285)

            doc.save(`reporte-${restaurantName.toLowerCase().replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success('PDF generado y descargado exitosamente')
        } catch (err) {
            console.error(err)
            toast.error('Error generando el PDF')
        } finally {
            setExporting(false)
        }
    }

    // 📊 EXPORT CSV REAL
    const exportCSV = () => {
        try {
            const restaurantName = restaurant?.name || 'JAMALI SO'
            const rows = [
                ['REPORTE DE BUSINESS INTELLIGENCE'],
                [`Restaurante: ${restaurantName}`],
                [`Fecha: ${new Date().toLocaleDateString('es-CO')}`],
                [],
                ['--- KPIs DEL MES ---'],
                ['Métrica', 'Valor'],
                ['Ingresos del Mes', formatPrice(kpis?.total_revenue_month || 0)],
                ['Total Órdenes', String(kpis?.total_orders_month || 0)],
                ['Ticket Promedio', formatPrice(kpis?.avg_ticket || 0)],
                ['Clientes Únicos', String(kpis?.total_customers || 0)],
                ['Saldo Caja', formatPrice(kpis?.current_cash_balance || 0)],
                [],
                ['--- TOP PRODUCTOS ---'],
                ['Producto', 'Revenue Total', 'Margen de Contribución', 'Unidades'],
                ...topProducts.map(p => [
                    p.product_name,
                    formatPrice(p.total_revenue),
                    formatPrice(p.contribution_margin || 0),
                    String(p.total_quantity)
                ]),
                [],
                ['--- VENTAS DIARIAS (7 DÍAS) ---'],
                ['Día', 'Ventas', 'Órdenes'],
                ...dailySales.map(s => [s.day, formatPrice(s.total_sales), String(s.order_count)])
            ]
            const csvContent = rows.map(r => r.join(',')).join('\n')
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `reporte-${restaurantName.toLowerCase().replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
            link.click()
            URL.revokeObjectURL(url)
            toast.success('CSV exportado exitosamente')
        } catch (err) {
            toast.error('Error exportando CSV')
        }
    }

    return (
        <div className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col">

            {/* 🖼️ FONDO PREMIUM: Centro de Negocios / Analytics con Blur */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bbbda5366991?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-[100px] bg-slate-950/90 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col min-h-full">

                {/* HEADER ANALÍTICO */}
                <div className="relative z-20 p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-xl shrink-0">
                    <div className="flex items-center gap-6">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
                                <ArrowLeft className="w-6 h-6 text-slate-400" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">BUSINESS <span className="text-orange-500">INTELLIGENCE</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-2 italic shadow-sm">Data Center & Intelligence Hub</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-3xl font-black italic tracking-tighter font-mono">
                                {currentTime.toLocaleTimeString('es-CO')}
                            </p>
                            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest text-right">GLOBAL DATA SYNC</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={exportCSV}
                                className="h-14 px-6 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-black uppercase text-xs italic tracking-widest rounded-2xl"
                            >
                                <Download className="w-5 h-5 mr-2" /> CSV
                            </Button>
                            <Button
                                onClick={exportPDF}
                                disabled={exporting}
                                className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-black font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl shadow-orange-600/20"
                            >
                                {exporting ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Download className="w-5 h-5 mr-3" />}
                                EXPORT PDF
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1800px] mx-auto w-full">
                    {[
                        { label: 'INGRESOS MES', val: formatPrice(kpis?.total_revenue_month || 0), icon: DollarSign, trend: '+12.5%', color: 'text-orange-500' },
                        { label: 'CONCILIACIÓN CAJA', val: formatPrice(kpis?.current_cash_balance || 0), icon: Wallet, trend: 'Fuerte', color: 'text-emerald-400' },
                        { label: 'TICKET PROMEDIO', val: formatPrice(kpis?.avg_ticket || 0), icon: Target, trend: '-2.1%', color: 'text-emerald-400' },
                        { label: 'CLIENTES ÚNICOS', val: kpis?.total_customers || 0, icon: Users, trend: '+15.4%', color: 'text-blue-400' },
                    ].map((card, i) => (
                        <div key={i} className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <card.icon className={cn("w-5 h-5", card.color)} />
                                </div>
                                <span className={cn("text-[10px] font-black px-2 py-1 rounded-full", card.trend.startsWith('+') || card.trend === 'Fuerte' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                    {card.trend}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className={cn("text-3xl font-black italic tracking-tighter", card.color)}>{card.val}</p>

                            {/* Decorative Graph */}
                            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-10">
                                <Activity className="w-full h-full text-white" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. SALES CHATS / TRENDING (Centro de Atención) */}
                <div className="grid grid-cols-12 gap-8 flex-1 p-8 md:px-12">

                    {/* CHART AREA */}
                    <div className="col-span-8 flex flex-col gap-8">
                        <div className="flex-1 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex flex-col relative overflow-hidden">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">Revenue <span className="text-orange-500">Analytics</span></h2>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Análisis Comparativo de Ventas Semanales</p>
                                </div>
                            </div>

                            {/* Simulación de Gráfico Pro */}
                            <div className="flex-1 flex items-end gap-6 relative">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between opacity-5">
                                    {[1, 2, 3, 4, 5].map(l => <div key={l} className="h-px bg-white w-full" />)}
                                </div>

                                {dailySales.map((s, i) => {
                                    const maxVal = Math.max(...dailySales.map(d => d.total_sales), 1000)
                                    const height = (s.total_sales / maxVal) * 100
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-4 relative z-10 group">
                                            <div className="absolute -top-12 bg-orange-500 text-black px-2 py-1 rounded-lg text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-xl shadow-orange-500/40 -translate-y-2 group-hover:translate-y-0">
                                                {formatPrice(s.total_sales)}
                                            </div>
                                            <div
                                                className="w-full bg-gradient-to-t from-orange-600/80 to-orange-400 rounded-2xl group-hover:brightness-125 transition-all shadow-lg group-hover:shadow-orange-500/20"
                                                style={{ height: `${height}%` }}
                                            />
                                            <span className="text-[11px] font-black uppercase text-slate-500 group-hover:text-white transition-colors italic tracking-widest">{s.day}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* MERMA SEMANAL WIDGET */}
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex flex-col relative overflow-hidden h-64">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 text-red-500">Waste <span className="text-white">Merma Semanal</span></h2>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Pérdida por Ingredientes en Pesos</p>
                                </div>
                            </div>

                            <div className="flex-1 flex items-end gap-10">
                                {weeklyWaste.length > 0 ? weeklyWaste.map((w, i) => {
                                    const maxW = Math.max(...weeklyWaste.map(x => x.amount), 1000)
                                    const h = (w.amount / maxW) * 100
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 relative group">
                                            <div className="absolute -top-8 bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all">
                                                {formatPrice(w.amount)}
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden h-full flex flex-col justify-end">
                                                <div className="bg-red-500/40 group-hover:bg-red-500 transition-all w-full" style={{ height: `${h}%` }} />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase italic">{w.day}</span>
                                        </div>
                                    )
                                }) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-700 font-bold uppercase tracking-widest text-[10px]">Sin reportes de merma esta semana</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RANKING AREA */}
                    <div className="col-span-4 flex flex-col gap-8">
                        <div className="flex-1 bg-slate-800/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex flex-col overflow-hidden relative">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-yellow-500/10 rounded-2xl">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Margen de <span className="text-orange-500">Contribución</span></h2>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Ingreso Real vs Costo Receta</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4">
                                {topProducts.map((p, i) => (
                                    <div key={i} className="group relative flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-orange-500/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-black italic text-slate-700 group-hover:text-orange-500/40 transition-colors">0{i + 1}</span>
                                            <div>
                                                <p className="text-sm font-black italic uppercase tracking-tight text-white">{p.product_name}</p>
                                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Utilidad: {formatPrice(p.contribution_margin || 0)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black italic font-mono text-white">{formatPrice(p.total_revenue)}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase">Rev.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Button
                                    onClick={() => toast.info("CARGANDO REPORTE DETALLADO DE PRODUCTOS")}
                                    className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-black uppercase text-[10px] italic tracking-widest rounded-2xl"
                                >
                                    VER REPORTE COMPLETO
                                </Button>
                            </div>
                        </div>

                        {/* SMART INSIGHT (AI Style) */}
                        <div className="p-8 bg-orange-600 rounded-[2.5rem] shadow-2xl shadow-orange-950/40 relative overflow-hidden group cursor-pointer hover:scale-[1.03] transition-all">
                            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:scale-125 transition-all">
                                <Zap className="w-24 h-24 text-black" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-black" />
                                    <span className="text-[9px] font-black uppercase text-black/60 tracking-widest">AI REVENUE PREDICTION</span>
                                </div>
                                <h3 className="text-3xl font-black italic text-black leading-none uppercase tracking-tighter">Se proyecta un crecimiento del 18% para el fin de semana</h3>
                                <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest leading-relaxed">Basado en el histórico de Jueves de Pargo Rojo.</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 3. ADDITIONAL INTELLIGENCE GRID — DATOS REALES */}
                <div className="grid grid-cols-3 gap-8 shrink-0 pb-10">
                    {[
                        {
                            label: 'SALDO EN CAJA',
                            val: formatPrice(kpis?.current_cash_balance || 0),
                            icon: Wallet,
                            desc: 'Conciliación en tiempo real',
                            color: 'text-emerald-400'
                        },
                        {
                            label: 'TICKET PROMEDIO',
                            val: formatPrice(kpis?.avg_ticket || 0),
                            icon: Target,
                            desc: 'Valor medio por orden del mes',
                            color: 'text-orange-400'
                        },
                        {
                            label: 'ÓRDENES DEL MES',
                            val: String(kpis?.total_orders_month || 0),
                            icon: ShoppingBag,
                            desc: 'Total de pedidos confirmados',
                            color: 'text-blue-400'
                        }
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 flex items-center gap-6 group hover:border-white/20 transition-all">
                            <div className={cn("p-4 bg-white/5 rounded-2xl shadow-inner group-hover:scale-110 transition-all", item.color)}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{item.label}</h4>
                                <p className={cn("text-2xl font-black italic tracking-tighter leading-none", item.color)}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : item.val}
                                </p>
                                <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{item.desc}</p>
                            </div>
                        </div>
                    ))}
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
