"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Search,
    ArrowLeft,
    ChefHat,
    Loader2,
    DollarSign,
    TrendingUp,
    ChevronRight,
    SearchIcon,
    Flame,
    UtensilsCrossed,
    PieChart,
    Clock,
    CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { getRecipes, getIngredients, saveRecipe } from "./actions"
import { toast } from "sonner"
import { DataFlow, CSVColumn } from "@/lib/data-flow"
import { DataImportWizard } from "@/components/admin/shared/DataImportWizard"
import { DataFlowActions } from "@/components/admin/shared/DataFlowActions"

type Recipe = {
    id: string
    name: string
    total_cost: number
    margin: number
    components_count: number
    main_ingredients: string[]
    status: 'optimal' | 'low_margin' | 'high_cost'
}

export default function RecipesPage() {
    const { restaurant } = useRestaurant()
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)

    useEffect(() => {
        if (restaurant?.id) {
            loadData()
        }
    }, [restaurant?.id])

    const loadData = async () => {
        if (!restaurant?.id) return
        setLoading(true)
        try {
            const res = await getRecipes(restaurant.id)
            if (res.success && res.data) {
                // Mapear datos reales al formato de la UI
                const mapped: Recipe[] = res.data.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    total_cost: r.total_cost,
                    margin: 70, // TODO: Calcular margen real vs precio de venta
                    components_count: r.components_count,
                    main_ingredients: [], // Opcional: cargar ingredientes principales
                    status: 'optimal'
                }))
                setRecipes(mapped)
            }
        } catch (err) {
            toast.error("Error al cargar recetas")
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        const columns: CSVColumn<Recipe>[] = [
            { header: 'ID', key: 'id' },
            { header: 'Nombre', key: 'name' },
            { header: 'Costo Total', key: 'total_cost' },
            { header: 'Margen (%)', key: 'margin' },
            { header: 'Componentes', key: 'components_count' }
        ];
        DataFlow.exportToCSV(recipes, columns, 'recetario-jamaliso');
        toast.info("Exportando el Kernel de Recetas...");
    }

    const handleImport = async (data: any[]) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Procesando Fichas Técnicas...',
                success: () => {
                    const newRecipes = data.map(row => ({
                        id: Math.random().toString(36).substring(7),
                        name: row.name,
                        total_cost: parseFloat(row.total_cost) || 0,
                        margin: parseFloat(row.margin) || 0,
                        components_count: parseInt(row.components_count) || 1,
                        main_ingredients: row.ingredients?.split(',') || [],
                        status: 'optimal' as const
                    }));
                    setRecipes(prev => [...prev, ...newRecipes]);
                    return 'Recetario actualizado masivamente.';
                },
                error: 'Error en la estructura del archivo de recetas.'
            }
        );
    }

    const filtered = recipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden">

            {/* 🖼️ FONDO AMBIENTE PRO */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-110 pointer-events-none" />
            <div className="fixed inset-0 backdrop-blur-[60px] bg-transparent/90 pointer-events-none" />

            <div className="relative z-10 p-10 space-y-10 max-w-[1600px] mx-auto h-screen flex flex-col">

                {/* HEADER (Estilo Mockup) */}
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/inventory">
                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-800/40 border border-slate-200">
                                <ArrowLeft className="w-6 h-6 text-slate-400" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-tight">KERNEL DE <span className="text-slate-400">RECETAS</span></h1>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Ingeniería de Menú & Costos</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative w-80">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                placeholder="Buscar Receta..."
                                className="w-full bg-slate-800/40 border border-slate-200 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <DataFlowActions
                            onExport={handleExport}
                            onImport={() => setIsImportModalOpen(true)}
                            importLabel="Importar Recetario"
                            exportLabel="Respaldar Recetas"
                        />
                        <Button className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-black font-black uppercase text-xs italic tracking-widest rounded-full shadow-2xl shadow-orange-600/30">
                            CREAR FICHA TÉCNICA
                        </Button>
                    </div>
                </div>

                {/* GRID DE RECETAS (Estilo Mockup) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((recipe) => (
                            <div key={recipe.id} className="bg-slate-800/40 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-8 space-y-6 relative group overflow-hidden transition-all hover:border-orange-500/30">
                                {/* Status Dot */}
                                <div className={cn(
                                    "absolute top-8 right-8 w-4 h-4 rounded-full shadow-lg",
                                    recipe.status === 'optimal' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-red-500 shadow-red-500/20"
                                )} />

                                {/* Card Header */}
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black italic text-slate-900 leading-none tracking-tight group-hover:text-orange-400 transition-colors uppercase">
                                        {recipe.name}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{recipe.components_count} Componentes</p>
                                </div>

                                {/* Metrics Row */}
                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Costo Total:</p>
                                        <p className="text-2xl font-black text-slate-900 italic">${recipe.total_cost.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Margen:</p>
                                        <p className={cn("text-2xl font-black italic", recipe.margin > 60 ? "text-emerald-400" : "text-orange-500")}>
                                            {recipe.margin}%
                                        </p>
                                    </div>
                                </div>

                                {/* Ingredients List */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                                        {recipe.main_ingredients.join(', ')}...
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex gap-3">
                                    <button className="flex-1 h-12 bg-white border border-slate-200 shadow-sm hover:bg-white/10 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-200 transition-all">
                                        EDITAR FICHA
                                    </button>
                                    <button className="w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                                        <PieChart className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in duration-1000">
                            <div className="w-32 h-32 rounded-full bg-white border border-slate-200 shadow-sm border border-slate-200 flex items-center justify-center mb-10 group hover:border-orange-500/30 transition-all">
                                <ChefHat className="w-16 h-16 text-slate-700 group-hover:text-orange-500 transition-all" />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4">Librería de Recetas Vacía</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mb-12">Empiece cargando sus fichas técnicas de escándalo</p>
                            <div className="flex gap-6">
                                <Button className="h-14 px-10 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest italic hover:scale-105 transition-all">
                                    Configurar Primera Receta
                                </Button>
                                <Button
                                    onClick={() => setIsImportModalOpen(true)}
                                    variant="outline"
                                    className="h-14 px-10 rounded-full border-slate-200 text-slate-900 font-black uppercase text-[10px] tracking-widest italic hover:bg-white border border-slate-200 shadow-sm transition-all"
                                >
                                    Importar desde Excel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DataImportWizard
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onConfirm={handleImport}
                    moduleName="Kernel de Recetas"
                    requiredFields={[
                        { key: 'name', label: 'Nombre Receta' },
                        { key: 'total_cost', label: 'Costo Estimado' }
                    ]}
                />

                {/* Footer KPIs Rápidos */}
                <div className="flex gap-10 border-t border-slate-200 pt-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black italic text-slate-900">85%</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-[9px]">Salud de Menu</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-xs font-black italic text-slate-900">62%</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-[9px]">Margen Promedio</p>
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
        </div >
    )
}
