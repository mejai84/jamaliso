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

export default function InventoryPage() {
    const { restaurant } = useRestaurant()
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

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
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500 overflow-hidden flex flex-col h-screen relative">
            {/* 🌌 FONDO ESTRUCTURAL JAMALI */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full opacity-50" />
            </div>

            <div className="relative z-30 p-10 md:p-12 space-y-12 max-w-[1800px] mx-auto flex-1 min-h-full flex flex-col">
                <InventoryHeader />
                <AccessGrid />
                <InventoryKPIs ingredients={ingredients} />
                <InventoryTable
                    ingredients={ingredients}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>
        </div>
    )
}
