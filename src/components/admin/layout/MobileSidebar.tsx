"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { sidebarSections } from "@/app/admin/navigation"

interface MobileSidebarProps {
    isOpen: boolean
    onClose: () => void
    userRole: string
}

export function MobileSidebar({ isOpen, onClose, userRole }: MobileSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    if (!isOpen) return null

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <div className="fixed inset-0 z-[100] lg:hidden font-sans">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
                onClick={onClose}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-[300px] bg-white border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-500 shadow-2xl overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-[80px] pointer-events-none" />

                <div className="p-8 border-b border-slate-100 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center relative overflow-hidden">
                            <Image src="/images/jamali-os-logo.png" alt="JAMALI OS" fill className="object-contain p-1.5" />
                        </div>
                        <span className="font-black italic text-base tracking-tighter uppercase text-slate-900">JAMALI <span className="text-primary">OS</span></span>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-xl hover:bg-slate-50" onClick={onClose}>
                        <X className="w-5 h-5 text-slate-400" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar relative z-10">
                    {sidebarSections.map((section, idx) => {
                        const filteredItems = section.items.filter(item => userRole === 'admin' || item.roles.includes(userRole))
                        if (filteredItems.length === 0) return null

                        return (
                            <div key={idx} className="space-y-4">
                                <h4 className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] font-sans">{section.title}</h4>
                                <div className="space-y-1">
                                    {filteredItems.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={onClose}
                                                className="block group relative"
                                            >
                                                <div className={cn(
                                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative",
                                                    isActive
                                                        ? "bg-primary/10 text-primary border border-primary/5 shadow-sm"
                                                        : "text-slate-500 hover:bg-slate-50"
                                                )}>
                                                    <Icon className={cn(
                                                        "w-5 h-5 transition-all",
                                                        isActive ? "text-primary scale-110" : "group-hover:text-primary/70"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase italic tracking-widest transition-all",
                                                        isActive ? "text-slate-900" : "group-hover:translate-x-1"
                                                    )}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="p-8 border-t border-slate-100 bg-slate-50 relative z-10">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-4 h-14 text-[10px] font-black uppercase italic tracking-[0.3em] text-rose-500/70 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-rose-100 group mb-6"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        CERRAR SESIÓN
                    </Button>

                    <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-100 opacity-20 transition-opacity">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Powered by</span>
                        <div className="relative w-16 h-4 grayscale">
                            <Image src="/images/jamali-os-logo.png" alt="JAMALI OS" fill className="object-contain" />
                        </div>
                    </div>
                </div>
            </aside>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(0, 0, 0, 0.1); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
