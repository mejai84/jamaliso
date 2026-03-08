"use client"

import { useRestaurant } from "@/providers/RestaurantProvider"
import { Building2, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

export function BusinessSelector() {
    const { restaurant, accessibleRestaurants } = useRestaurant()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (accessibleRestaurants.length <= 1) return null

    const handleSwitch = (slugOrSub: string) => {
        const hostname = window.location.hostname

        const isPathBased = hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('.vercel.app')

        if (isPathBased) {
            // Siempre redirigir al /admin del nuevo restaurante para evitar errores de contexto
            window.location.href = `/${slugOrSub}/admin`
            return
        }

        const domainParts = hostname.split('.')
        if (domainParts.length >= 2) {
            const domain = domainParts.slice(-2).join('.')
            window.location.href = `${window.location.protocol}//${slugOrSub}.${domain}${window.location.port ? ':' + window.location.port : ''}/admin`
        } else {
            window.location.href = `${window.location.protocol}//${slugOrSub}.jamalios.com/admin`
        }
    }

    return (
        <div className="relative mb-6" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between h-14 bg-slate-50 border border-slate-100 hover:border-primary/40 rounded-[1.5rem] px-4 group transition-all shadow-sm",
                    isOpen && "border-primary ring-4 ring-primary/5"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-all">
                        {restaurant?.logo_url ? (
                            <img src={restaurant.logo_url} className="w-full h-full object-contain p-1" alt="" />
                        ) : (
                            <Building2 className="w-4 h-4 text-primary" />
                        )}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-[10px] font-black italic uppercase tracking-tighter truncate w-full group-hover:text-primary transition-colors text-slate-800">
                            {restaurant?.name || "Seleccionar Local"}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 truncate uppercase tracking-[0.2em]">Sede Actual</span>
                    </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 top-[calc(100%+8px)] w-[280px] bg-white border border-slate-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[9999] p-3 animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-black/5"
                    style={{ background: 'white' }}
                >
                    <div className="px-5 py-3 mb-2 border-b border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Central Admin</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                        {accessibleRestaurants.map((res) => (
                            <button
                                key={res.id}
                                onClick={() => handleSwitch(res.slug || res.subdomain)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left group/item",
                                    restaurant?.id === res.id
                                        ? "bg-primary/5 text-primary border border-primary/10"
                                        : "hover:bg-slate-50 text-slate-600 border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                        {res.logo_url ? (
                                            <img src={res.logo_url} className="w-full h-full object-contain p-1" alt="" />
                                        ) : (
                                            <Building2 className="w-4 h-4 opacity-20" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase italic tracking-widest leading-none mb-1">{res.name}</span>
                                        <span className="text-[8px] font-bold text-slate-400 lowercase">{res.subdomain}.jamalios.com</span>
                                    </div>
                                </div>
                                {restaurant?.id === res.id && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
