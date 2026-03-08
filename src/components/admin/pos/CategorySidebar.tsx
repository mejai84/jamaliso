"use client"

import { LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
import { Category } from "@/app/admin/pos/types"

interface CategorySidebarProps {
    categories: Category[]
    activeCategory: string
    setActiveCategory: (id: string) => void
}

export function CategorySidebar({ categories, activeCategory, setActiveCategory }: CategorySidebarProps) {
    return (
        <div className="w-full md:w-40 bg-white/40 backdrop-blur-3xl border-b md:border-b-0 md:border-r-2 border-slate-100 flex flex-row md:flex-col py-2 md:py-6 shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar font-sans text-slate-900 shadow-xl z-20">
            <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                    "flex flex-col items-center gap-1 md:gap-3 px-6 md:px-4 py-4 md:py-6 transition-all border-b-4 md:border-b-0 md:border-r-4 shrink-0 relative group",
                    activeCategory === 'all'
                        ? "border-orange-600 bg-orange-600/5 text-orange-600"
                        : "border-transparent text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
            >
                <LayoutGrid className={cn("w-5 h-5 md:w-7 md:h-7 transition-transform", activeCategory === 'all' && "scale-110")} />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] italic text-center">TODO</span>
            </button>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                        "flex flex-col items-center gap-1 md:gap-3 px-6 md:px-4 py-4 md:py-8 transition-all border-b-4 md:border-b-0 md:border-r-4 shrink-0 relative group",
                        activeCategory === cat.id
                            ? "border-orange-600 bg-orange-600/5 text-orange-600"
                            : "border-transparent text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                    )}
                >
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest italic text-center leading-relaxed whitespace-pre-wrap">
                        {cat.name}
                    </span>
                </button>
            ))}
        </div>
    )
}
