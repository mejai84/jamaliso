"use client"

import {
    Users,
    Search,
    Filter,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Customer } from "@/components/admin/customers/types"
import { CustomersHeader } from "@/components/admin/customers/CustomersHeader"
import { CustomersMetrics } from "@/components/admin/customers/CustomersMetrics"
import { CustomersTable } from "@/components/admin/customers/CustomersTable"

export default function CustomersPagePremium() {
    const [view, setView] = useState<'database' | 'loyalty' | 'notifications'>('database')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setLoading(true)
        const { data: profiles } = await supabase.from('profiles').select('*')
        const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })

        if (orders) {
            const customerMap = new Map<string, Customer>()
            orders.forEach(order => {
                const userId = order.user_id
                const guestName = order.guest_info?.name
                const guestPhone = order.guest_info?.phone
                const key = userId || `${guestName}-${guestPhone}`

                if (!customerMap.has(key)) {
                    const profile = userId ? profiles?.find(p => p.id === userId) : null
                    customerMap.set(key, {
                        id: userId,
                        name: profile?.full_name || guestName || "Desconocido",
                        email: profile?.email || null,
                        phone: profile?.phone || guestPhone || "Sin teléfono",
                        totalOrders: 0,
                        totalSpent: 0,
                        lastOrder: order.created_at,
                        points: profile?.loyalty_points || 0,
                        type: userId ? 'user' : 'guest'
                    })
                }

                const cust = customerMap.get(key)!
                cust.totalOrders += 1
                cust.totalSpent += (order.total || 0)
            })
            setCustomers(Array.from(customerMap.values()))
        }
        setLoading(false)
    }

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    )

    return (
        <div className="min-h-screen bg-[#020406] text-white font-sans selection:bg-orange-500 overflow-hidden flex flex-col h-screen relative">

            {/* 🌌 FONDO ESTRUCTURAL JAMALI */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full opacity-50" />
            </div>

            {/* HEADER DE ELITE TÁCTICA */}
            <CustomersHeader view={view} setView={setView} />

            <div className="relative z-10 p-8 md:p-12 flex-1 flex flex-col gap-8 max-w-[1800px] mx-auto w-full min-h-full">

                {/* KPI DESCRIPTORS ELITE */}
                <CustomersMetrics customers={customers} />

                {/* MAIN WORKSPACE ELITE */}
                <div className="flex-1 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] overflow-hidden flex flex-col relative shadow-3xl">

                    {/* Search & Action Bar */}
                    <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="relative w-[500px] group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700 group-focus-within:text-orange-500 transition-all" />
                            <input
                                type="search"
                                autoComplete="new-password"
                                placeholder="ESCANEAR REGISTROS DE ÉLITE..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-xs font-black uppercase tracking-[0.2em] italic focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-slate-800"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-6">
                            <Button
                                onClick={() => toast.info("HERRAMIENTA DE SEGMENTACIÓN: Próximamente")}
                                variant="ghost" className="h-16 px-10 rounded-2xl bg-white/5 border border-white/5 text-slate-500 font-black uppercase italic text-[10px] tracking-[0.3em] transition-all hover:bg-white/10 hover:text-white"
                            >
                                <Filter className="w-5 h-5 mr-4" /> Segmentar
                            </Button>
                            <Button
                                onClick={() => toast.success("ABRIENDO FORMULARIO DE NUEVO CLIENTE")}
                                className="h-16 px-12 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-[11px] italic tracking-widest rounded-2xl shadow-3xl shadow-orange-600/20 active:scale-95 transition-all gap-4"
                            >
                                <Users className="w-6 h-6" /> CREAR PROTOCOLO
                            </Button>
                        </div>
                    </div>

                    {/* Table Style Database */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <CustomersTable filtered={filtered} view={view} setView={setView} />
                    </div>
                </div>

                {/* AI INSIGHT FOOTER */}
                <div className="flex items-center justify-between p-8 bg-orange-600 rounded-[2.5rem] shrink-0 shadow-2xl shadow-orange-950/20 mb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black italic text-black uppercase tracking-tighter leading-none">Discovery Insights: Clientes Nocturnos</h4>
                            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest mt-1">Se detectó una alta frecuencia de pedidos de mesa entre 20:00 y 22:00.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            toast.success("CAMPAÑA WHATSAPP LANZADA CON ÉXITO")
                            console.log("Launching WhatsApp campaign...")
                        }}
                        className="bg-black text-white hover:bg-slate-900 h-14 px-10 rounded-2xl font-black italic uppercase text-xs tracking-[0.2em]"
                    >
                        LANZAR CAMPAÑA WHATSAPP
                    </Button>
                </div>

            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track {background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
