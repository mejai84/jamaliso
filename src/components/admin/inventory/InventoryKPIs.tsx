"use client"

import { Package, AlertCircle, DollarSign, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Ingredient } from "@/app/admin/inventory/types"

interface InventoryKPIsProps {
    ingredients: Ingredient[]
}

export function InventoryKPIs({ ingredients }: InventoryKPIsProps) {
    const totalCost = ingredients.reduce((acc, curr) => acc + (curr.current_stock * curr.cost_per_unit), 0)
    const criticalCount = ingredients.filter(i => i.current_stock <= i.min_stock).length

    const cards = [
        { label: 'REFERENCIAS', val: ingredients.length, icon: Package, color: 'text-slate-900', sub: 'Active_Nodes' },
        {
            label: 'STOCK CRÍTICO',
            val: criticalCount,
            icon: AlertCircle,
            color: 'text-rose-500',
            sub: 'At_Risk',
            action: criticalCount > 0 ? (
                <Link href="/admin/inventory/purchases">
                    <Button variant="ghost" className="h-8 mt-2 px-2 text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white rounded-lg transition-all animate-pulse">
                        AUTOMATIZAR COMPRA
                    </Button>
                </Link>
            ) : null
        },
        { label: 'VALORACIÓN', val: `$${(totalCost / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-orange-500', sub: 'Market_Index' },
        { label: 'CATEGORÍAS', val: new Set(ingredients.map(i => i.category)).size, icon: Layers, color: 'text-blue-500', sub: 'Cluster_Map' }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-sans">
            {cards.map((card, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-8 relative overflow-hidden group shadow-sm transition-all duration-700 hover:border-orange-500/20 hover:shadow-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                        <card.icon className="w-20 h-20 text-slate-500" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", card.color.replace('text', 'bg'))} />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">{card.label}</p>
                        </div>
                        <p className={cn("text-4xl font-black italic tracking-tighter text-slate-900 leading-none")}>{card.val}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic group-hover:text-slate-500 transition-colors">{card.sub}</p>
                        {card.action && <div className="pt-2">{card.action}</div>}
                    </div>
                </div>
            ))}
        </div>
    )
}
