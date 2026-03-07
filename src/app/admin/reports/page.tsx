"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { formatPrice } from "@/lib/utils"
import { getBusinessIntelligenceData } from "./actions"

// Types
import { KPI, DailySales, TopProduct, WasteData } from "./types"

// Components
import { ReportsHeader } from "@/components/admin/reports/ReportsHeader"
import { KPIsGrid } from "@/components/admin/reports/KPIsGrid"
import { RevenueAnalytics } from "@/components/admin/reports/RevenueAnalytics"
import { WasteWidget } from "@/components/admin/reports/WasteWidget"
import { ContributionMargin } from "@/components/admin/reports/ContributionMargin"
import { SmartInsight } from "@/components/admin/reports/SmartInsight"
import { AdditionalIntelligence } from "@/components/admin/reports/AdditionalIntelligence"

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

    const exportPDF = () => {
        setExporting(true)
        try {
            const doc = new jsPDF()
            const restaurantName = restaurant?.name || 'JAMALI SO'
            const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

            doc.setFillColor(234, 88, 12)
            doc.rect(0, 0, 210, 40, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont('helvetica', 'bold')
            doc.text('BUSINESS INTELLIGENCE', 14, 20)
            doc.setFontSize(11)
            doc.setFont('helvetica', 'normal')
            doc.text(`${restaurantName} | Reporte generado: ${fecha}`, 14, 32)

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
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col bg-[#F8FAFC]">
            {/* 🖼️ FONDO PREMIUM */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bbbda5366991?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-50" />
            <div className="absolute inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col min-h-full">
                <ReportsHeader
                    currentTime={currentTime}
                    onExportCSV={exportCSV}
                    onExportPDF={exportPDF}
                    exporting={exporting}
                />

                <KPIsGrid kpis={kpis} />

                <div className="grid grid-cols-12 gap-8 flex-1 p-8 md:px-12">
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                        <RevenueAnalytics dailySales={dailySales} />
                        <WasteWidget weeklyWaste={weeklyWaste} />
                    </div>

                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                        <ContributionMargin topProducts={topProducts} />
                        <SmartInsight />
                    </div>
                </div>

                <AdditionalIntelligence kpis={kpis} loading={loading} />
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
