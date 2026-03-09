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
import { useRestaurant } from "@/providers/RestaurantProvider"
import { adminTranslations } from "@/lib/i18n/admin"

import { useState } from "react"

interface SidebarProps {
    restaurant: any
    userRole: string
    userName: string
}

export function Sidebar({ restaurant, userRole, userName }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { lang } = useRestaurant()
    const [localSearch, setLocalSearch] = useState("")

    const t = adminTranslations[lang]

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    // Map navigation keys to translations
    const getNavLabel = (label: string) => {
        const keyMap: Record<string, keyof typeof t.nav> = {
            "Vista General": "overview",
            "Control de Caja": "cash_control",
            "Portal Mesero": "waiter_portal",
            "Cocina (KDS)": "kitchen_kds",
            "Listado Pedidos": "order_list",
            "Facturación DIAN/SAT": "billing",
            "Ventas / Web App": "online_sales",
            "Mesas & QR": "tables_qr",
            "Logística Domicilios": "delivery_logistics",
            "Reservas / Agenda": "reservations",
            "CRM de Clientes": "crm",
            "Repartidores": "drivers",
            "Mi Turno / Entrada": "my_shift",
            "Historial Turnos": "shift_history",
            "Gestión de Personal": "staff_management",
            "Nómina y Pagos": "payroll",
            "Novedades Laborales": "labor_news",
            "Reloj Laboral": "attendance",
            "Stock e Insumos": "inventory",
            "Proveedores": "suppliers",
            "Compras / Ingresos": "purchases",
            "Menú & Productos": "menu_products",
            "Libro de Recetas": "recipes",
            "Promociones / Cupones": "promotions",
            "Reportes Avanzados": "reports",
            "Caja Menor / Gastos": "petty_cash",
            "JAMALI Hub Live": "hub",
            "JAMALI Guardian": "guardian",
            "Auditoría / Roles": "audit_roles",
            "Trazabilidad SaaS": "traceability",
            "Configuración": "settings",
            "Soporte Impresoras": "printers",
            "Infraestructura Core": "core_infra",
            "Mi Perfil": "my_profile",
            "Programa de Lealtad": "loyalty_program",
            "Kiosco Autoservicio": "waiter_portal"
        }
        const key = keyMap[label]
        return key ? t.nav[key] : label
    }

    const getSectionTitle = (title: string) => {
        const keyMap: Record<string, keyof typeof t.nav> = {
            "VENTAS Y OPERACIÓN": "sales_operation",
            "PRODUCCIÓN Y LOGÍSTICA": "production_logistics",
            "GESTIÓN DE TALENTO": "talent_management",
            "ECOSISTEMA DIGITAL": "digital_ecosystem",
            "COMANDO CENTRAL": "central_command",
            "INFRAESTRUCTURA": "infrastructure",
            "MI CUENTA": "my_account"
        }
        const key = keyMap[title]
        return key ? t.nav[key] : title
    }

    return (
        <aside className="w-64 2xl:w-72 border-r-2 border-slate-200 bg-white hidden lg:flex flex-col sticky top-0 h-screen z-50 relative font-sans shadow-xl">
            {/* Brand Header */}
            <div className="p-4 2xl:p-8 2xl:pb-10 flex flex-col items-center justify-center relative z-10 border-b-2 border-slate-50">
                <div className="flex flex-col items-center gap-2 2xl:gap-4">
                    <div className="relative w-12 h-12 2xl:w-20 2xl:h-20 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center relative z-10 overflow-hidden shadow-sm">
                        {restaurant?.logo_url ? (
                            <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Image src="/images/jamali-os-logo.png" alt="JAMALI OS" fill className="object-contain p-2" />
                        )}
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <span className="text-xl 2xl:text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                            JAMALI <span className="text-orange-600">OS</span>
                        </span>
                        <span className="text-[7px] 2xl:text-[7.5px] font-black text-slate-400 tracking-[0.6em] uppercase mt-1 2xl:mt-2 opacity-60">{t.sidebar.smart_pos}</span>
                    </div>
                </div>
            </div>

            {/* Business Selector */}
            <div className="px-4 2xl:px-6 mt-4 mb-4 2xl:mt-8 2xl:mb-6 relative z-50">
                <BusinessSelector />
            </div>

            {/* Navigation Search */}
            <div className="px-4 2xl:px-6 mb-4 2xl:mb-8 relative z-10">
                <div className="relative group">
                    <Search className="absolute left-3 2xl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="search"
                        placeholder={t.sidebar.search_placeholder}
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full h-9 2xl:h-11 pl-9 2xl:pl-12 pr-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-orange-500/30 text-[9px] 2xl:text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-slate-400 transition-all font-sans text-slate-900 shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 2xl:px-4 custom-scrollbar space-y-6 2xl:space-y-12 pb-6 2xl:pb-10 relative z-10">
                {sidebarSections.map((section, idx) => {
                    const filteredItems = section.items.filter(item => {
                        const hasRole = userRole === 'admin' || item.roles.includes(userRole)
                        const matchesSearch = item.label.toLowerCase().includes(localSearch.toLowerCase())
                        return hasRole && matchesSearch
                    })

                    if (filteredItems.length === 0) return null

                    return (
                        <div key={idx} className="space-y-2 2xl:space-y-4 font-sans">
                            <h4 className="px-3 2xl:px-5 text-[8px] 2xl:text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic">
                                {getSectionTitle(section.title)}
                            </h4>
                            <div className="space-y-0.5 2xl:space-y-1">
                                {filteredItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href

                                    return (
                                        <Link key={item.href} href={item.href} className="block group relative px-1 2xl:px-2">
                                            <div className={cn(
                                                "flex items-center gap-3 2xl:gap-4 px-3 2xl:px-4 py-2 2xl:py-3.5 rounded-xl 2xl:rounded-2xl transition-all duration-300 relative group/item border-2",
                                                isActive
                                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1"
                                                    : "text-slate-500 border-transparent hover:bg-slate-50 hover:border-slate-100"
                                            )}>
                                                <Icon className={cn(
                                                    "w-4 h-4 2xl:w-5 2xl:h-5 transition-all relative z-10",
                                                    isActive ? "text-orange-500 scale-110" : "group-hover:text-slate-900"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] 2xl:text-[11px] font-black uppercase italic tracking-wider transition-all",
                                                    isActive ? "text-white" : "group-hover:text-slate-900"
                                                )}>
                                                    {getNavLabel(item.label)}
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
            <div className="p-4 2xl:p-6 2xl:pb-8 border-t-2 border-slate-100 bg-slate-50/50 relative z-10 space-y-4 2xl:space-y-6">
                <div className="flex items-center gap-3 2xl:gap-4 group cursor-default p-2 bg-white rounded-xl 2xl:rounded-2xl border-2 border-slate-100">
                    <div className="relative">
                        <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg 2xl:rounded-xl border-2 border-slate-200 overflow-hidden relative z-10 flex items-center justify-center bg-slate-900 text-white shadow-md">
                            <span className="font-black italic text-sm 2xl:text-base uppercase">{userName.charAt(0)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] 2xl:text-[11px] font-black text-slate-900 tracking-tight uppercase italic truncate max-w-[120px] 2xl:max-w-[140px]">{userName}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[7px] 2xl:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{userRole}</span>
                        </div>
                    </div>
                </div>

                <button
                    className="w-full h-9 2xl:h-12 bg-white border-2 border-rose-100 text-[8px] 2xl:text-[9px] font-black uppercase italic tracking-[0.3em] text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 rounded-lg 2xl:rounded-xl transition-all flex items-center justify-center gap-2 2xl:gap-3 active:scale-95"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    {t.sidebar.logout}
                </button>
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
