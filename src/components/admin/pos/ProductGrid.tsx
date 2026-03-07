"use client"

import { SearchIcon, Plus, Utensils } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { Product } from "@/app/admin/pos/types"

interface ProductGridProps {
    products: Product[]
    searchTerm: string
    setSearchTerm: (val: string) => void
    onAdd: (product: Product) => void
    showCartMobile: boolean
}

export function ProductGrid({
    products,
    searchTerm,
    setSearchTerm,
    onAdd,
    showCartMobile
}: ProductGridProps) {
    return (
        <div className={cn("flex-1 flex-col min-w-0 bg-slate-950/20 backdrop-blur-sm font-sans text-white", showCartMobile ? "hidden md:flex" : "flex")}>
            {/* Search Bar */}
            <div className="p-4 md:p-6 shrink-0">
                <div className="relative group max-w-xl">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="search"
                        autoComplete="new-password"
                        placeholder="Escanear o Buscar..."
                        className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-3 md:py-4 pl-12 pr-4 text-xs md:text-sm font-medium focus:outline-none focus:border-orange-500/50 transition-all focus:ring-1 focus:ring-orange-500/20 text-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 custom-scrollbar">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                    {products.map(prod => (
                        <div
                            key={prod.id}
                            onClick={() => onAdd(prod)}
                            className="group relative bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl md:rounded-[2rem] p-4 md:p-5 cursor-pointer transition-all hover:scale-[1.02] hover:border-orange-500/40 hover:bg-slate-700/50 active:scale-95 flex flex-col h-36 md:h-44 justify-between overflow-hidden"
                        >
                            {/* Icon Backdrop */}
                            <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:opacity-10 transition-all">
                                <Utensils className="w-16 h-16 md:w-20 md:h-20" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-black transition-all">
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] md:text-sm font-black italic tracking-tighter uppercase group-hover:text-orange-400 transition-colors line-clamp-2 leading-tight md:leading-normal">
                                        {prod.name}
                                    </h3>
                                    <p className="text-sm md:text-lg font-black text-white mt-0.5 md:mt-1 font-mono tracking-tighter">
                                        {formatPrice(prod.price)}
                                    </p>
                                </div>
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
