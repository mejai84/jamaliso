"use client"

import { ChefHat, Truck, Activity, Warehouse, ChevronRight } from "lucide-react"
import Link from "next/link"

export function AccessGrid() {
    const list = [
        { label: 'LIBRO DE RECETAS', icon: ChefHat, href: '/admin/inventory/recipes', sub: 'Recipe_Engine' },
        { label: 'PROVEEDORES', icon: Truck, href: '/admin/inventory/suppliers', sub: 'Vendor_Matrix' },
        { label: 'HISTORIAL MOVIMIENTOS', icon: Activity, href: '/admin/inventory/movements', sub: 'Loss_Analysis' },
        { label: 'PEDIDOS Y COMPRAS', icon: Warehouse, href: '/admin/inventory/purchases', sub: 'Supply_Chain' }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-sans">
            {list.map((btn, i) => (
                <Link key={i} href={btn.href} className="block w-full">
                    <div className="w-full h-24 flex items-center justify-between p-8 bg-white/60 backdrop-blur-3xl rounded-[2rem] border border-slate-200 hover:border-orange-500/30 hover:bg-orange-50 hover:shadow-xl group transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                            <btn.icon className="w-16 h-16 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-6 relative z-10 transition-all group-hover:translate-x-1">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-white transition-colors">
                                <btn.icon className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="space-y-1 text-left">
                                <p className="text-[11px] font-black tracking-[0.2em] uppercase italic text-slate-900 group-hover:text-orange-600 leading-none">{btn.label}</p>
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-600 leading-none">{btn.sub}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
