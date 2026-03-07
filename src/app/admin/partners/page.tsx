"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Loader2, Save, Palette,
    Building2, Globe, Layout,
    Zap, ShieldCheck, Users,
    TrendingUp, Plus, Briefcase,
    ExternalLink, MoreHorizontal,
    Search, Filter, CheckCircle2,
    Store, CreditCard, PieChart
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

type Tenant = {
    id: string
    name: string
    subdomain: string
    primary_color: string
    logo_url: string
    plan: string
    created_at: string
}

export default function PartnerMasterPanel() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchTenants()
    }, [])

    const fetchTenants: any = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTenants(data || [])
        } catch (error: any) {
            toast.error("Error al cargar socios B2B")
        } finally {
            setLoading(false)
        }
    }

    const stats = [
        { label: "SOCIO REVENDEDORES", value: tenants.length.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "RESTAURANTES TOTALES", value: "124", icon: Store, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "MRR PROYECTADO", value: "$12.400", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col">

            {/* PIXORA PARTNER HEADER */}
            <header className="bg-white border-b border-slate-200 px-8 h-20 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900">Partner <span className="text-slate-400 font-medium">Master Hub</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestión de Distribuidores Marca Blanca</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6 rounded-xl shadow-lg transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 mr-2" /> RECLUTAR SOCIO
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={stat.label}
                                className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex items-center gap-6 group hover:border-primary/30 transition-all"
                            >
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* PARTNER LIST SECTION */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por Nombre o Subdominio..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-11 pl-11 pr-4 text-sm font-bold focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 text-slate-500">
                                    <Filter className="w-4 h-4 mr-2" /> Filtros
                                </Button>
                                <Button variant="outline" className="h-11 rounded-xl font-bold border-slate-200 text-slate-500">
                                    Descargar Reporte
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Socio Distribuido</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subdominio Core</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Elite</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identidad</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/30" />
                                            </tr>
                                        ))
                                    ) : (
                                        tenants.map((tenant) => (
                                            <tr key={tenant.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-white p-1">
                                                            {tenant.logo_url ? (
                                                                <img src={tenant.logo_url} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                                                                    {tenant.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 text-sm tracking-tight">{tenant.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Socio Activo</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-3.5 h-3.5 text-slate-300" />
                                                        <span className="text-sm font-mono font-bold text-slate-600 tracking-tight">{tenant.subdomain}.jamalios.com</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                                                        Partner {tenant.plan || 'PRO'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-slate-200"
                                                            style={{ backgroundColor: tenant.primary_color }}
                                                        />
                                                        <span className="text-[10px] font-bold text-slate-500 font-mono tracking-tight uppercase">{tenant.primary_color}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
            `}</style>
        </div>
    )
}
