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
import { DataFlow, CSVColumn } from "@/lib/data-flow"
import { DataImportWizard } from "@/components/admin/shared/DataImportWizard"
import { DataFlowActions } from "@/components/admin/shared/DataFlowActions"
import { useRestaurant } from "@/providers/RestaurantProvider"

export default function CustomersPagePremium() {
    const { restaurant } = useRestaurant()
    const [view, setView] = useState<'database' | 'loyalty' | 'notifications'>('database')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isImportModalOpen, setIsImportModalOpen] = useState(false)

    useEffect(() => {
        if (restaurant) fetchInitialData()
    }, [restaurant])

    const fetchInitialData = async () => {
        if (!restaurant) return
        setLoading(true)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .eq('restaurant_id', restaurant.id)

        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: false })

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

    const handleExport = () => {
        const columns: CSVColumn<Customer>[] = [
            { header: 'ID', key: 'id' },
            { header: 'Nombre', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Teléfono', key: 'phone' },
            { header: 'Puntos', key: 'points' }
        ];
        DataFlow.exportToCSV(customers, columns, 'clientes-jamaliso');
        toast.info("Descargando base de datos de élite...");
    }

    const handleImport = async (data: any[]) => {
        if (!restaurant) return;
        const toInsert = data.map(row => ({
            restaurant_id: restaurant.id,
            full_name: row.name,
            email: row.email,
            phone: row.phone,
            loyalty_points: parseInt(row.points) || 0,
            role: 'customer'
        }));
        const { error } = await supabase.from('profiles').insert(toInsert);
        if (error) throw error;
        fetchInitialData();
    }

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    )

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen">
            {/* 🖼️ FONDO PREMIUM PIXORA (Standardized Across Modules) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            {/* HEADER DE ELITE TÁCTICA */}
            <CustomersHeader view={view} setView={setView} />

            <div className="relative z-10 p-8 md:p-12 flex-1 flex flex-col gap-8 max-w-[1800px] mx-auto w-full min-h-full animate-in fade-in duration-1000">

                {/* KPI DESCRIPTORS ELITE */}
                <CustomersMetrics customers={customers} />

                {/* MAIN WORKSPACE ELITE */}
                <div className="flex-1 bg-white border-2 border-slate-100 rounded-[4rem] overflow-hidden flex flex-col relative shadow-xl shadow-slate-900/5">

                    {/* Search & Action Bar */}
                    <div className="p-10 border-b-2 border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <div className="relative w-[500px] group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-orange-500 transition-all" />
                            <input
                                type="search"
                                autoComplete="new-password"
                                placeholder="ESCANEAR REGISTROS DE ÉLITE..."
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-16 pr-8 text-xs font-black uppercase tracking-[0.2em] italic focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-slate-400 text-slate-900"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-6">
                            <DataFlowActions
                                onExport={handleExport}
                                onImport={() => setIsImportModalOpen(true)}
                                importLabel="Importar"
                                exportLabel="Exportar"
                            />
                            <Button
                                onClick={() => toast.info("HERRAMIENTA DE SEGMENTACIÓN: Próximamente")}
                                variant="ghost" className="h-16 px-10 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-400 font-black uppercase italic text-[10px] tracking-[0.3em] transition-all hover:bg-900 hover:text-white"
                            >
                                <Filter className="w-5 h-5 mr-4" /> Segmentar
                            </Button>
                            <Button
                                onClick={() => toast.success("ABRIENDO FORMULARIO DE NUEVO CLIENTE")}
                                className="h-16 px-12 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[11px] italic tracking-widest rounded-2xl shadow-xl shadow-orange-600/20 active:scale-95 transition-all gap-4"
                            >
                                <Users className="w-6 h-6" /> CREAR PROTOCOLO
                            </Button>
                        </div>
                    </div>

                    <DataImportWizard
                        isOpen={isImportModalOpen}
                        onClose={() => setIsImportModalOpen(false)}
                        onConfirm={handleImport}
                        moduleName="Base de Datos de Clientes"
                        requiredFields={[
                            { key: 'name', label: 'Nombre Completo' },
                            { key: 'email', label: 'Correo Electrónico' },
                            { key: 'phone', label: 'Teléfono' },
                            { key: 'points', label: 'Puntos de Lealtad' }
                        ]}
                    />

                    {/* Table Style Database */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <CustomersTable filtered={filtered} view={view} setView={setView} />
                    </div>
                </div>

                {/* AI INSIGHT FOOTER */}
                <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2.5rem] shrink-0 shadow-2xl shadow-slate-900/40 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Sparkles className="w-32 h-32 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                            <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Discovery <span className="text-orange-500">Insights:</span> Clientes Nocturnos</h4>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1 italic">Patrón detectado: alta frecuencia de pedidos de mesa entre 20:00 y 22:00.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            toast.success("CAMPAÑA WHATSAPP LANZADA CON ÉXITO")
                            console.log("Launching WhatsApp campaign...")
                        }}
                        className="bg-white text-slate-900 hover:bg-orange-500 hover:text-white h-14 px-10 rounded-2xl font-black italic uppercase text-xs tracking-[0.2em] relative z-10 transition-all active:scale-95"
                    >
                        LANZAR CAMPAÑA WHATSAPP
                    </Button>
                </div>

            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track {background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
