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
        <div className={cn("flex-1 flex-col min-w-0 bg-[#F8FAFC]/50 backdrop-blur-md font-sans text-slate-900", showCartMobile ? "hidden md:flex" : "flex")}>
            {/* Search Bar */}
            <div className="p-4 md:p-6 shrink-0">
                <div className="relative group max-w-xl">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="search"
                        autoComplete="new-password"
                        placeholder="Escanear o Buscar productos..."
                        className="w-full bg-white border-2 border-slate-200 rounded-[1.5rem] py-3 md:py-4 pl-12 pr-4 text-xs md:text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all focus:ring-4 focus:ring-orange-500/10 text-slate-900 placeholder:text-slate-400 italic shadow-sm"
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
                            className="group relative bg-white border-2 border-slate-200 rounded-[2rem] p-4 md:p-6 cursor-pointer transition-all hover:scale-[1.02] hover:border-orange-500/40 hover:bg-orange-50/30 active:scale-95 flex flex-col h-36 md:h-48 justify-between overflow-hidden shadow-sm hover:shadow-xl"
                        >
                            {/* Icon Backdrop Decorativo */}
                            <div className="absolute -top-4 -right-4 p-4 md:p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12">
                                <Utensils className="w-24 h-24 md:w-32 md:h-32 text-slate-900" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-orange-500/5 flex items-center justify-center border-2 border-orange-500/10 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all shadow-sm">
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] md:text-xs font-black italic tracking-tighter uppercase group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight md:leading-normal text-slate-500">
                                        {prod.name}
                                    </h3>
                                    <p className="text-base md:text-xl font-black text-slate-900 mt-0.5 md:mt-1 font-mono tracking-tighter">
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
