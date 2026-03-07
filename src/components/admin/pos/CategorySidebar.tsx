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
        <div className="w-full md:w-32 bg-slate-950/60 backdrop-blur-3xl border-b md:border-b-0 md:border-r border-white/5 flex flex-row md:flex-col py-2 md:py-6 shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar font-sans text-white">
            <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                    "flex flex-col items-center gap-1 md:gap-2 px-6 md:px-4 py-4 transition-all border-b-4 md:border-b-0 md:border-l-4 shrink-0",
                    activeCategory === 'all'
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                )}
            >
                <LayoutGrid className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider italic text-center">TODO</span>
            </button>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                        "flex flex-col items-center gap-1 md:gap-2 px-6 md:px-4 py-4 md:p-6 transition-all border-b-4 md:border-b-0 md:border-l-4 shrink-0",
                        activeCategory === cat.id
                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                            : "border-transparent text-slate-500 hover:text-slate-300"
                    )}
                >
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic text-center leading-relaxed whitespace-nowrap">
                        {cat.name}
                    </span>
                </button>
            ))}
        </div>
    )
}
