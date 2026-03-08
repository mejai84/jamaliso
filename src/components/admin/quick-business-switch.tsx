"use client"

import { useRestaurant } from "@/providers/RestaurantProvider"
import { cn } from "@/lib/utils"
import { Building2 } from "lucide-react"

export function QuickBusinessSwitch() {
    const { restaurant, accessibleRestaurants } = useRestaurant()

    if (accessibleRestaurants.length <= 1) return null

    const handleSwitch = (slugOrSub: string) => {
        const hostname = window.location.hostname
        const pathname = window.location.pathname

        const isPathBased = hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('.vercel.app')

        if (isPathBased) {
            const segments = pathname.split('/').filter(Boolean)
            if (segments.length > 0) {
                segments[0] = slugOrSub
                window.location.href = `/${segments.join('/')}`
            } else {
                window.location.href = `/${slugOrSub}/admin`
            }
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
        <div className="px-4 mb-6">
            <p className="px-4 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] font-mono mb-3">Cambio Rápido</p>
            <div className="flex flex-wrap gap-3 px-2">
                {accessibleRestaurants.map((res) => (
                    <button
                        key={res.id}
                        onClick={() => handleSwitch(res.slug || res.subdomain)}
                        title={res.name}
                        className={cn(
                            "w-10 h-10 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden hover:scale-110 active:scale-90 shadow-sm",
                            restaurant?.id === res.id
                                ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                                : "border-slate-100 bg-white opacity-60 hover:opacity-100 hover:border-slate-300"
                        )}
                    >
                        {res.logo_url ? (
                            <img src={res.logo_url} className="w-full h-full object-contain p-1" alt={res.name} />
                        ) : (
                            <Building2 className="w-4 h-4 text-slate-400" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
