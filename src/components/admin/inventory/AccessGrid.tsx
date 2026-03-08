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
                    <div className="w-full h-32 flex items-center justify-between p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-slate-900 hover:shadow-2xl hover:-translate-y-1 group transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 transition-all pointer-events-none">
                            <btn.icon className="w-24 h-24 text-slate-900" />
                        </div>
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                                <btn.icon className="w-7 h-7" />
                            </div>
                            <div className="space-y-1 text-left">
                                <p className="text-xl font-black tracking-tighter uppercase italic text-slate-900 group-hover:text-orange-600 leading-none transition-colors">{btn.label}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-slate-600 leading-none transition-colors italic opacity-60">{btn.sub}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
