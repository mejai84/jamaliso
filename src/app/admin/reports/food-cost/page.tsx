"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRestaurant } from "@/providers/RestaurantProvider"
import {
    ArrowLeft,
    Loader2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    ChefHat,
    Flame,
    Target,
    Trophy,
    ArrowUpRight,
    ArrowDownRight,
    Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface FoodCostItem {
    product_id: string
    product_name: string
    sale_price: number
    category_name: string | null
    ingredient_cost: number
    margin_pct: number
    margin_abs: number
    margin_status: string
    ingredient_count: number
}

export default function FoodCostPage() {
    const { restaurant } = useRestaurant()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<FoodCostItem[]>([])
    const [filter, setFilter] = useState<'all' | 'low' | 'no_recipe'>('all')
    const [sortBy, setSortBy] = useState<'margin_asc' | 'margin_desc' | 'price_desc'>('margin_asc')

    useEffect(() => {
        if (restaurant) fetchData()
    }, [restaurant])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: costData, error } = await supabase
                .from('vw_food_cost_analysis')
                .select('*')
                .eq('restaurant_id', restaurant?.id)

            if (error) {
                console.error("Food Cost Error:", error)
                // Fallback: manual calculation if view doesn't exist yet
                const { data: products } = await supabase
                    .from('products')
                    .select('id, name, price, category_id, categories(name)')
                    .eq('restaurant_id', restaurant?.id)
                    .eq('is_available', true)
                    .is('deleted_at', null)

                if (products) {
                    const fallbackData: FoodCostItem[] = products.map((p: any) => ({
                        product_id: p.id,
                        product_name: p.name,
                        sale_price: p.price,
                        category_name: p.categories?.name || null,
                        ingredient_cost: 0,
                        margin_pct: 100,
                        margin_abs: p.price,
                        margin_status: 'SIN RECETA',
                        ingredient_count: 0
                    }))
                    setData(fallbackData)
                }
            } else {
                setData(costData || [])
            }
        } catch (e) {
            console.error("Error:", e)
        } finally {
            setLoading(false)
        }
    }

    // Filtered & Sorted data
    const processedData = data
        .filter(item => {
            if (filter === 'low') return item.margin_status === 'MARGEN BAJO'
            if (filter === 'no_recipe') return item.margin_status === 'SIN RECETA'
            return true
        })
        .sort((a, b) => {
            if (sortBy === 'margin_asc') return a.margin_pct - b.margin_pct
            if (sortBy === 'margin_desc') return b.margin_pct - a.margin_pct
            return b.sale_price - a.sale_price
        })

    // Aggregated KPIs
    const withRecipe = data.filter(d => d.margin_status !== 'SIN RECETA')
    const avgMargin = withRecipe.length > 0
        ? withRecipe.reduce((sum, d) => sum + d.margin_pct, 0) / withRecipe.length
        : 0
    const lowMarginCount = data.filter(d => d.margin_status === 'MARGEN BAJO').length
    const noRecipeCount = data.filter(d => d.margin_status === 'SIN RECETA').length
    const bestProduct = withRecipe.length > 0
        ? withRecipe.reduce((best, d) => d.margin_pct > best.margin_pct ? d : best, withRecipe[0])
        : null
    const worstProduct = withRecipe.length > 0
        ? withRecipe.reduce((worst, d) => d.margin_pct < worst.margin_pct ? d : worst, withRecipe[0])
        : null

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-8 relative overflow-hidden font-sans">
            {/* Mesh Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <DollarSign className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
                                    Food <span className="text-emerald-500">Cost</span>
                                </h1>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                    Análisis de Rentabilidad por Plato
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/reports">
                            <Button variant="ghost" className="rounded-2xl h-12 bg-white border border-slate-200 font-black uppercase text-xs tracking-widest gap-2 shadow-sm">
                                <ArrowLeft className="w-4 h-4" /> VOLVER
                            </Button>
                        </Link>
                        <Button
                            onClick={fetchData}
                            className="bg-emerald-600 text-white h-12 px-6 rounded-2xl font-black uppercase text-xs tracking-widest italic hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
                        >
                            ACTUALIZAR
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Margen Promedio</p>
                        <p className={cn("text-3xl font-black italic tracking-tighter", avgMargin >= 50 ? "text-emerald-600" : avgMargin >= 30 ? "text-orange-600" : "text-red-600")}>
                            {avgMargin.toFixed(1)}%
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold">{withRecipe.length} platos con receta</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Alertas Margen Bajo</p>
                        <p className={cn("text-3xl font-black italic tracking-tighter", lowMarginCount > 0 ? "text-red-600" : "text-emerald-600")}>
                            {lowMarginCount}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold">Productos {'<'}30% margen</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Sin Receta</p>
                        <p className={cn("text-3xl font-black italic tracking-tighter", noRecipeCount > 0 ? "text-amber-600" : "text-emerald-600")}>
                            {noRecipeCount}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold">Sin costeo asignado</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Más Rentable</p>
                        <p className="text-lg font-black italic tracking-tighter text-emerald-600 truncate">
                            {bestProduct?.product_name || '—'}
                        </p>
                        <p className="text-[9px] text-emerald-500 font-bold">{bestProduct ? `${bestProduct.margin_pct}% margen` : 'Sin datos'}</p>
                    </div>
                </div>

                {/* Best & Worst Comparison */}
                {bestProduct && worstProduct && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-2xl">
                                <Trophy className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Campeón de Rentabilidad</p>
                                <p className="text-xl font-black italic tracking-tighter text-emerald-700 truncate">{bestProduct.product_name}</p>
                                <p className="text-xs text-emerald-600 font-bold mt-1">
                                    Venta: {formatPrice(bestProduct.sale_price)} · Costo: {formatPrice(bestProduct.ingredient_cost)} · <span className="font-black">Margen: {bestProduct.margin_pct}%</span>
                                </p>
                            </div>
                            <ArrowUpRight className="w-10 h-10 text-emerald-300" />
                        </div>

                        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-2xl">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Menor Rentabilidad</p>
                                <p className="text-xl font-black italic tracking-tighter text-red-700 truncate">{worstProduct.product_name}</p>
                                <p className="text-xs text-red-600 font-bold mt-1">
                                    Venta: {formatPrice(worstProduct.sale_price)} · Costo: {formatPrice(worstProduct.ingredient_cost)} · <span className="font-black">Margen: {worstProduct.margin_pct}%</span>
                                </p>
                            </div>
                            <ArrowDownRight className="w-10 h-10 text-red-300" />
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'Todos', count: data.length },
                        { key: 'low', label: 'Margen Bajo', count: lowMarginCount },
                        { key: 'no_recipe', label: 'Sin Receta', count: noRecipeCount },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={cn(
                                "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                filter === f.key
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}

                    <div className="ml-auto flex gap-2">
                        {[
                            { key: 'margin_asc', label: '↑ Menor Margen' },
                            { key: 'margin_desc', label: '↓ Mayor Margen' },
                            { key: 'price_desc', label: '💰 Precio' },
                        ].map(s => (
                            <button
                                key={s.key}
                                onClick={() => setSortBy(s.key as any)}
                                className={cn(
                                    "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all",
                                    sortBy === s.key
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-white text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Table */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 border-b border-slate-100">
                        <div className="col-span-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Producto</div>
                        <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Precio Venta</div>
                        <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Costo</div>
                        <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Margen $</div>
                        <div className="col-span-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Margen %</div>
                    </div>

                    {/* Rows */}
                    {processedData.map((item, idx) => (
                        <div
                            key={item.product_id}
                            className={cn(
                                "grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 px-6 md:px-8 py-4 md:py-5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors items-center",
                                item.margin_status === 'MARGEN BAJO' && "bg-red-50/30",
                                item.margin_status === 'SIN RECETA' && "bg-amber-50/30"
                            )}
                        >
                            {/* Product Name */}
                            <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-black",
                                    item.margin_status === 'MARGEN ALTO' && "bg-emerald-100 text-emerald-600",
                                    item.margin_status === 'MARGEN MEDIO' && "bg-orange-100 text-orange-600",
                                    item.margin_status === 'MARGEN BAJO' && "bg-red-100 text-red-600",
                                    item.margin_status === 'SIN RECETA' && "bg-slate-100 text-slate-400"
                                )}>
                                    {item.margin_status === 'SIN RECETA' ? <Package className="w-4 h-4" /> : `${Math.round(item.margin_pct)}%`}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-sm uppercase tracking-tight truncate">{item.product_name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                        {item.category_name || 'Sin categoría'} · {item.ingredient_count} ingredientes
                                    </p>
                                </div>
                            </div>

                            {/* Sale Price */}
                            <div className="md:col-span-2 text-right">
                                <p className="text-sm font-black font-mono text-slate-700">{formatPrice(item.sale_price)}</p>
                                <p className="text-[8px] text-slate-300 font-bold uppercase md:hidden">VENTA</p>
                            </div>

                            {/* Cost */}
                            <div className="md:col-span-2 text-right">
                                <p className={cn("text-sm font-black font-mono", item.ingredient_cost > 0 ? "text-slate-700" : "text-slate-300")}>
                                    {item.ingredient_cost > 0 ? formatPrice(item.ingredient_cost) : '—'}
                                </p>
                                <p className="text-[8px] text-slate-300 font-bold uppercase md:hidden">COSTO</p>
                            </div>

                            {/* Margin $ */}
                            <div className="md:col-span-2 text-right">
                                <p className={cn(
                                    "text-sm font-black font-mono",
                                    item.margin_abs > 0 ? "text-emerald-600" : "text-red-600"
                                )}>
                                    {item.ingredient_cost > 0 ? formatPrice(item.margin_abs) : '—'}
                                </p>
                            </div>

                            {/* Margin % */}
                            <div className="md:col-span-2 text-right">
                                <span className={cn(
                                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black",
                                    item.margin_status === 'MARGEN ALTO' && "bg-emerald-100 text-emerald-700",
                                    item.margin_status === 'MARGEN MEDIO' && "bg-orange-100 text-orange-700",
                                    item.margin_status === 'MARGEN BAJO' && "bg-red-100 text-red-700",
                                    item.margin_status === 'SIN RECETA' && "bg-slate-100 text-slate-400"
                                )}>
                                    {item.margin_status === 'SIN RECETA' ? 'Sin receta' : `${item.margin_pct}%`}
                                    {item.margin_status === 'MARGEN ALTO' && <TrendingUp className="w-3 h-3" />}
                                    {item.margin_status === 'MARGEN BAJO' && <TrendingDown className="w-3 h-3" />}
                                </span>
                            </div>
                        </div>
                    ))}

                    {processedData.length === 0 && (
                        <div className="p-16 text-center text-slate-400">
                            <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="font-black uppercase tracking-widest text-xs">Sin datos de food cost</p>
                            <p className="text-[10px] mt-1">Crea recetas para ver el análisis de costos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
