"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { sidebarSections } from "@/app/admin/navigation"
import { BusinessSelector } from "@/components/admin/business-selector"
import { QuickBusinessSwitch } from "@/components/admin/quick-business-switch"

interface SidebarProps {
    restaurant: any
    userRole: string
    userName: string
}

export function Sidebar({ restaurant, userRole, userName }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = (typeof window !== 'undefined') ? ["", () => { }] : ["", () => { }] // Simplified for now
    // Actually I need states in the component or passed down. I'll use local state for search here.
    const [localSearch, setLocalSearch] = (typeof window !== 'undefined') ? (() => {
        const [s, setS] = require('react').useState("");
        return [s, setS];
    })() : ["", () => { }];

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <aside className="w-72 border-r border-slate-200 bg-white/80 backdrop-blur-[40px] hidden lg:flex flex-col sticky top-0 h-screen z-50 relative overflow-hidden font-sans">
            {/* Background Decorative Glows */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-40 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px] pointer-events-none" />

            {/* Brand Header */}
            <div className="p-10 pb-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/10 blur-md rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center relative z-10 transition-colors group-hover:bg-white overflow-hidden">
                            {restaurant?.logo_url ? (
                                <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Image src="/images/jamali-os-logo.png" alt="JAMALI OS" fill className="object-contain p-2" />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                            {restaurant?.name?.split(' ')[0] || "JAMALI"}<span className="text-primary italic">{restaurant?.name?.split(' ').slice(1).join(' ') || "OS"}</span>
                        </span>
                        <span className="text-[8px] font-black text-slate-400 tracking-[0.4em] uppercase mt-1">Smart Framework</span>
                    </div>
                </div>
            </div>

            {/* Business Selector at Top */}
            <div className="px-8 mb-4 relative z-10">
                <BusinessSelector />
            </div>

            {/* Navigation Search */}
            <div className="px-8 mb-8 relative z-10">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="search"
                        placeholder="Buscar módulos..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-primary/30 text-[10px] font-bold uppercase tracking-[0.1em] placeholder:text-slate-400 transition-all font-sans text-slate-900"
                    />
                </div>
            </div>

            <QuickBusinessSwitch />

            <div className="flex-1 overflow-y-auto px-6 custom-scrollbar space-y-12 pb-10 relative z-10">
                {sidebarSections.map((section, idx) => {
                    const filteredItems = section.items.filter(item => {
                        const hasRole = userRole === 'admin' || item.roles.includes(userRole)
                        const matchesSearch = item.label.toLowerCase().includes(localSearch.toLowerCase())
                        return hasRole && matchesSearch
                    })

                    if (filteredItems.length === 0) return null

                    return (
                        <div key={idx} className="space-y-4 font-sans">
                            <h4 className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{section.title}</h4>
                            <div className="space-y-1">
                                {filteredItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href

                                    return (
                                        <Link key={item.href} href={item.href} className="block group relative">
                                            {isActive && (
                                                <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[4px_0_15px_rgba(255,107,107,0.3)] animate-in slide-in-from-left-2 duration-300" />
                                            )}

                                            <div className={cn(
                                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group/item",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-slate-500 hover:bg-slate-50"
                                            )}>
                                                <div className="relative">
                                                    {isActive && (
                                                        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full scale-150" />
                                                    )}
                                                    <Icon className={cn(
                                                        "w-5 h-5 transition-all relative z-10",
                                                        isActive ? "text-primary scale-110" : "group-hover:text-primary/70"
                                                    )} />
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-bold tracking-wide transition-all",
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

            {/* Footer / Profile Section */}
            <div className="p-8 pb-10 border-t border-slate-100 bg-slate-50/50 relative z-10 space-y-8">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden relative z-10 flex items-center justify-center bg-white shadow-sm group-hover:border-primary/50 transition-all duration-500">
                            <span className="text-slate-900 font-black italic text-lg">{userName.charAt(0)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-black text-slate-900 tracking-wide uppercase italic">{userName}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{userRole}</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 h-12 text-[9px] font-black uppercase italic tracking-[0.3em] text-rose-500/70 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-rose-100 group mb-6"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    CERRAR SESIÓN
                </Button>

                <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-100 opacity-20 hover:opacity-50 transition-opacity">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Powered by</span>
                    <div className="relative w-16 h-4 grayscale transition-all hover:grayscale-0">
                        <Image src="/images/jamali-os-logo.png" alt="JAMALI OS" fill className="object-contain" />
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(0, 0, 0, 0.1); 
                    border-radius: 10px; 
                }
            `}</style>
        </aside>
    )
}
