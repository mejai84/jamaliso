"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Image from "next/image"

interface MobileHeaderProps {
    restaurant: any
    onMenuOpen: () => void
}

export function MobileHeader({ restaurant, onMenuOpen }: MobileHeaderProps) {
    return (
        <header className="h-16 border-b-2 border-slate-100 flex items-center px-6 lg:hidden justify-between bg-white sticky top-0 z-50 font-sans shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-100 flex items-center justify-center relative overflow-hidden transition-all shadow-sm">
                    {restaurant?.logo_url ? (
                        <img src={restaurant.logo_url} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                        <div className="relative w-full h-full p-1.5">
                            <Image src="/images/jamali-os-logo.png" alt="JAMALI OS" fill className="object-contain" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col -gap-1">
                    <span className="font-black italic text-xs tracking-tighter uppercase text-slate-900 leading-none">
                        JAMALI <span className="text-orange-600">OS</span>
                    </span>
                    <span className="text-[6px] font-black text-slate-400 tracking-widest uppercase opacity-60">SMART SYSTEM</span>
                </div>
            </div>
            <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-xl border-2 border-slate-100 bg-slate-50 active:scale-95 transition-all text-slate-900"
                onClick={onMenuOpen}
            >
                <Menu className="w-5 h-5" />
            </Button>
        </header>
    )
}
