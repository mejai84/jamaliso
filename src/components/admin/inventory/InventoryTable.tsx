"use client"

import { Search, Filter, Edit, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Ingredient } from "@/app/admin/inventory/types"
import { adminTranslations } from "@/lib/i18n/admin"

interface InventoryTableProps {
    ingredients: Ingredient[]
    searchTerm: string
    onSearchChange: (val: string) => void
    lang?: 'en' | 'es'
}

export function InventoryTable({ ingredients, searchTerm, onSearchChange, lang = 'es' }: InventoryTableProps) {
    const x = adminTranslations[lang].inventory
    const getStatusInfo = (current: number, min: number) => {
        if (current <= 0) return { label: x.table.states.out_of_stock, color: 'bg-red-500', text: 'text-red-400' }
        if (current <= min) return { label: x.table.states.critical, color: 'bg-red-500', text: 'text-red-400' }
        if (current <= min * 1.5) return { label: x.table.states.low, color: 'bg-yellow-500', text: 'text-yellow-400' }
        return { label: x.table.states.optimal, color: 'bg-emerald-500', text: 'text-emerald-400' }
    }

    const filtered = ingredients.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="bg-white/60 backdrop-blur-3xl border border-slate-200 rounded-[4rem] overflow-hidden flex-1 flex flex-col shadow-sm font-sans">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="relative w-[500px] group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-all font-black" />
                    <input
                        type="search"
                        placeholder={x.table.search_placeholder}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-5 pl-16 pr-8 text-xs font-black uppercase tracking-[0.2em] italic focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-slate-400 text-slate-900 shadow-sm"
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => toast.info(x.table.advanced_filters)}
                    variant="ghost" className="h-16 px-10 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black uppercase italic text-[10px] tracking-[0.3em] transition-all hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                >
                    <Filter className="w-5 h-5 mr-4" /> {x.table.filter}
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic border-b border-slate-100">{x.table.cols.reference}</th>
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic border-b border-slate-100">{x.table.cols.category}</th>
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic border-b border-slate-100">{x.table.cols.availability}</th>
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic text-center border-b border-slate-100">{x.table.cols.status}</th>
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic text-right border-b border-slate-100">{x.table.cols.command}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((item) => {
                            const status = getStatusInfo(item.current_stock, item.min_stock)
                            return (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-900">{item.name}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.category}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-900">{item.current_stock} {item.unit}</span>
                                            <span className={cn("text-[10px] font-black uppercase tracking-tighter opacity-70", status.text.replace('text-red-400', 'text-red-600').replace('text-yellow-400', 'text-yellow-600').replace('text-emerald-400', 'text-emerald-600'))}>({status.label})</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center">
                                            <div className={cn("w-3 h-3 rounded-full shadow-sm", status.color, "animate-pulse")} />
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => toast.success(`${x.notifications.editing}${item.name}`)}
                                                className="p-2 rounded-lg bg-white text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toast.info(`${x.notifications.more_options}${item.name}`)}
                                                className="p-2 rounded-lg bg-white text-slate-400 hover:text-orange-500 border border-slate-200 shadow-sm"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
