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
        <header className="h-16 border-b border-slate-200 flex items-center px-6 lg:hidden justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 font-sans">
            <div className="flex items-center gap-3">
                {restaurant?.logo_url ? (
                    <img src={restaurant.logo_url} className="w-6 h-6 object-contain" alt="Logo" />
                ) : (
                    <div className="relative w-6 h-6">
                        <Image src="/images/jamali-os-logo.png" alt="JAMALI OS" fill className="object-contain" />
                    </div>
                )}
                <span className="font-black italic text-sm tracking-tighter uppercase text-slate-900">
                    {restaurant?.name || "JAMALI OS"} <span className="text-primary italic">JAMALI OS</span>
                </span>
            </div>
            <Button
                size="icon"
                variant="ghost"
                className="rounded-xl border border-slate-200 active:scale-90 transition-transform"
                onClick={onMenuOpen}
            >
                <Menu className="w-5 h-5" />
            </Button>
        </header>
    )
}
