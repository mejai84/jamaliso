"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Zap } from "lucide-react"
import { useRestaurant } from "@/providers/RestaurantProvider"

// Types
import { Ingredient } from "./types"

// Components
import { InventoryHeader } from "@/components/admin/inventory/InventoryHeader"
import { AccessGrid } from "@/components/admin/inventory/AccessGrid"
import { InventoryKPIs } from "@/components/admin/inventory/InventoryKPIs"
import { InventoryTable } from "@/components/admin/inventory/InventoryTable"
import { DataFlow, CSVColumn } from "@/lib/data-flow"
import { DataImportWizard } from "@/components/admin/shared/DataImportWizard"
import { toast } from "sonner"

export default function InventoryPage() {
    const { restaurant } = useRestaurant()
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)

    useEffect(() => {
        if (restaurant) loadIngredients()
    }, [restaurant])

    const loadIngredients = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .eq('restaurant_id', restaurant?.id)
            .eq('active', true)
            .order('name', { ascending: true })

        if (!error) setIngredients(data as Ingredient[] || [])
        setLoading(false)
    }

    const handleExport = () => {
        const columns: CSVColumn<Ingredient>[] = [
            { header: 'ID', key: 'id' },
            { header: 'Nombre', key: 'name' },
            { header: 'Categoría', key: 'category' },
            { header: 'Unidad', key: 'unit' },
            { header: 'Stock_Actual', key: 'current_stock' },
            { header: 'Stock_Mínimo', key: 'min_stock' },
            { header: 'Costo_Unitario', key: 'cost_per_unit' }
        ];
        DataFlow.exportToCSV(ingredients, columns, 'inventario-jamaliso');
        toast.info("Descargando respaldo de Kernel de Inventario...");
    }

    const handleImport = async (data: any[]) => {
        if (!restaurant) return;

        // Transformar data del CSV al formato de DB
        const toInsert = data.map(row => ({
            restaurant_id: restaurant.id,
            name: row.name,
            category: row.category,
            unit: row.unit,
            current_stock: parseFloat(row.current_stock) || 0,
            min_stock: parseFloat(row.min_stock) || 0,
            cost_per_unit: parseFloat(row.cost_per_unit) || 0,
            active: true
        }));

        const { error } = await supabase.from('ingredients').insert(toInsert);
        if (error) throw error;

        loadIngredients();
    }

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-6 font-sans">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Zap className="w-16 h-16 text-primary animate-pulse relative z-10" />
            </div>
            <p className="font-black italic uppercase text-[10px] tracking-[0.4em] text-primary animate-pulse">Iniciando Kernel de Suministros...</p>
        </div>
    )

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen">
            {/* 🖼️ FONDO PREMIUM PIXORA (Standardized Across Modules) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-[0.15]" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-30 p-10 md:p-12 space-y-12 max-w-[1800px] mx-auto flex-1 h-full flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <InventoryHeader
                    onExport={handleExport}
                    onImport={() => setIsImportModalOpen(true)}
                />
                <AccessGrid />
                <InventoryKPIs ingredients={ingredients} />
                <InventoryTable
                    ingredients={ingredients}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>

            <DataImportWizard
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onConfirm={handleImport}
                moduleName="Inventario de Insumos"
                requiredFields={[
                    { key: 'name', label: 'Nombre' },
                    { key: 'category', label: 'Categoría' },
                    { key: 'unit', label: 'Unidad' },
                    { key: 'current_stock', label: 'Stock_Actual' },
                    { key: 'min_stock', label: 'Stock_Mínimo' },
                    { key: 'cost_per_unit', label: 'Costo_Unitario' }
                ]}
            />
        </div>
    )
}
