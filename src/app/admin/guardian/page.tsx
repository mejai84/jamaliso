"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
    ShieldAlert,
    Zap,
    Activity,
    LockIcon,
    TerminalSquare,
    Package,
    XCircle,
    CheckCircle2,
    BarChart,
    Settings,
    AlertTriangle,
    Brain,
    Building2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
    authorizeEvent,
    getGuardianKPIs,
    getEmployeeRiskView,
    getGuardianRestaurants
} from "@/actions/guardian"
import { formatPrice } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { adminTranslations } from "@/lib/i18n/admin"

export default function JamaliGuardianPage() {
    const { lang } = useRestaurant()
    const t = adminTranslations[lang].guardian
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [userRole, setUserRole] = useState("")
    const [alerts, setAlerts] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<'security' | 'inventory' | 'risk' | 'stats'>('security')
    const [riskData, setRiskData] = useState<any[]>([])

    // Multi-Sede State
    const [restaurants, setRestaurants] = useState<any[]>([])
    const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string, name: string } | null>(null)
    const [isChangingSede, setIsChangingSede] = useState(false)

    const [kpis, setKpis] = useState({
        revenue: 0,
        bruttoMargin: 0,
        realizationMargin: 0,
        laborCost: 0,
        totalWaste: 0,
        ordersCount: 0
    })

    useEffect(() => {
        const checkStrictAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push("/login")
                    return
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, restaurant_id')
                    .eq('id', session.user.id)
                    .single()

                const allowed = ['owner', 'developer', 'admin']
                if (!profile || !allowed.includes(profile.role)) {
                    toast.error(lang === 'es' ? "ACCESO DENEGADO" : "ACCESS DENIED")
                    router.push("/admin/hub")
                    return
                }

                setUserRole(profile.role)
                setIsAuthorized(true)

                const res = await getGuardianRestaurants()
                if (res.success && res.restaurants) {
                    setRestaurants(res.restaurants)
                    const current = res.restaurants.find(r => r.id === profile.restaurant_id) || res.restaurants[0]
                    setSelectedRestaurant(current)
                }

            } catch (err) {
                router.push("/admin/hub")
            } finally {
                setLoading(false)
            }
        }
        checkStrictAuth()

        const channel = supabase.channel('guardian-alerts')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'security_audit'
            }, payload => {
                if (payload.eventType === 'INSERT') {
                    setAlerts(prev => [payload.new, ...prev])
                    toast.error(`¡GUARDIAN!: ${payload.new.description}`, {
                        icon: <ShieldAlert className="text-red-500" />,
                        duration: 8000
                    })
                } else if (payload.eventType === 'UPDATE') {
                    setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [router])

    useEffect(() => {
        if (selectedRestaurant) {
            loadData(selectedRestaurant.id)
        }
    }, [selectedRestaurant])

    const loadData = async (rid: string) => {
        setIsChangingSede(true)
        try {
            await Promise.all([
                loadAlerts(rid),
                loadKPIs(rid)
            ])
        } finally {
            setIsChangingSede(false)
        }
    }

    const loadAlerts = async (rid: string) => {
        const { data } = await supabase
            .from('security_audit')
            .select('*')
            .eq('restaurant_id', rid)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) setAlerts(data)
    }

    const loadKPIs = async (rid: string) => {
        const res = await getGuardianKPIs(rid)
        if (res.success && res.kpis) {
            setKpis(res.kpis)
        }

        const riskRes = await getEmployeeRiskView(rid)
        if (riskRes.success && riskRes.riskData) {
            setRiskData(riskRes.riskData)
        }
    }

    const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
        const promise = authorizeEvent(id, action);
        toast.promise(promise, {
            loading: t.actions.transmitting,
            success: (res) => {
                if (res.success) return action === 'APPROVED' ? t.actions.success_auth : t.actions.success_rej
                throw new Error(res.error)
            },
            error: (err) => err.message
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-8 gap-6 font-sans">
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150"
                    />
                    <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse relative z-10" />
                </div>
                <p className="font-black italic uppercase text-[10px] tracking-[0.4em] text-red-500 animate-pulse">{t.starting}</p>
            </div>
        )
    }

    if (!isAuthorized) return null

    const securityAlerts = alerts.filter(a => a.event_type !== 'LOW_STOCK_ALERT')
    const inventoryAlerts = alerts.filter(a => a.event_type === 'LOW_STOCK_ALERT')

    return (
        <div className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-red-500 overflow-x-hidden relative">
            <AnimatePresence>
                {/* 🛡️ BACKGROUND GUARDIAN AESTHETIC */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

                {/* HEADER */}
                <header className="relative z-20 p-8 flex items-center justify-between border-b border-red-500/10 backdrop-blur-md bg-transparent/40">
                    <div className="flex items-center gap-6">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0] }}
                            className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center cursor-help"
                        >
                            <LockIcon className="w-7 h-7 text-red-500" />
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">JAMALI <span className="text-red-500">GUARDIAN</span></h1>
                                <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest leading-none">V.1.0-ELITE</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 p-8 max-w-lg mx-auto space-y-12 pb-44">

                    {/* 🏢 RESTAURANT SELECTOR */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic flex items-center gap-3">
                            <Building2 className="w-3 h-3" /> {t.unit_selector}
                        </p>
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {restaurants.map((res) => (
                                <button
                                    key={res.id}
                                    onClick={() => setSelectedRestaurant(res)}
                                    className={cn(
                                        "px-6 py-4 rounded-2xl border text-xs font-black uppercase italic tracking-widest whitespace-nowrap transition-all",
                                        selectedRestaurant?.id === res.id
                                            ? "bg-red-500 border-red-500 text-black shadow-xl shadow-red-500/20"
                                            : "bg-white shadow-sm border border-slate-200 border-slate-200 text-slate-500 hover:border-red-500/20"
                                    )}
                                >
                                    {res.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isChangingSede ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-40 flex items-center justify-center"
                            >
                                <Zap className="w-8 h-8 text-red-500 animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                {/* 1. PULSE DASHBOARD */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: t.kpis.revenue, val: formatPrice(kpis.revenue), icon: Zap, color: 'text-orange-500' },
                                        { label: t.kpis.margin, val: `${kpis.realizationMargin.toFixed(1)}%`, icon: Activity, color: 'text-emerald-500' },
                                        { label: t.kpis.labor, val: formatPrice(kpis.laborCost), icon: TerminalSquare, color: 'text-blue-500' },
                                        { label: t.kpis.waste, val: formatPrice(kpis.totalWaste), icon: AlertTriangle, color: 'text-red-500' },
                                    ].map((kpi, i) => (
                                        <div
                                            key={i}
                                            className="bg-white shadow-md backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 group"
                                        >
                                            <div className={cn("p-3 rounded-xl bg-white border border-slate-200 shadow-sm w-fit mb-4", kpi.color)}>
                                                <kpi.icon className="w-4 h-4" />
                                            </div>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-1">{kpi.label}</p>
                                            <p className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-red-500 transition-colors">{kpi.val}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* 2. SECURITY FEED */}
                                <div className="space-y-6">
                                    <div className="flex bg-white shadow-sm border border-slate-200 p-1.5 rounded-2xl border border-slate-200 gap-1 shadow-inner relative z-30">
                                        {[
                                            { id: 'security', label: t.tabs.audit, icon: ShieldAlert },
                                            { id: 'risk', label: t.tabs.intel, icon: Brain },
                                            { id: 'inventory', label: t.tabs.warehouse, icon: Package },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={cn(
                                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest italic transition-all relative z-10",
                                                    activeTab === tab.id ? "bg-red-500 text-black shadow-lg" : "text-slate-500 hover:text-slate-900"
                                                )}
                                            >
                                                <tab.icon className="w-4 h-4" /> {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="min-h-[400px]">
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'security' && (
                                                <motion.div
                                                    key="security"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="space-y-4"
                                                >
                                                    {securityAlerts.length === 0 ? (
                                                        <EmptyState icon={ShieldAlert} text={t.empty.clean} />
                                                    ) : (
                                                        securityAlerts.map(alert => (
                                                            <SecurityCard
                                                                key={alert.id}
                                                                alert={alert}
                                                                t={t}
                                                                onApprove={() => handleAction(alert.id, 'APPROVED')}
                                                                onReject={() => handleAction(alert.id, 'REJECTED')}
                                                            />
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}

                                            {activeTab === 'risk' && (
                                                <motion.div
                                                    key="risk"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] mb-4">
                                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                            <Brain className="w-4 h-4" /> {t.ai.title}
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-400 leading-tight">
                                                            {t.ai.desc}
                                                        </p>
                                                    </div>

                                                    {riskData.length === 0 ? (
                                                        <EmptyState icon={Brain} text={t.empty.insufficient} />
                                                    ) : (
                                                        riskData.map((item, idx) => (
                                                            <div key={idx} className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem] group hover:bg-white shadow-sm border border-slate-200 transition-all overflow-hidden relative">
                                                                <div className={cn(
                                                                    "absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-20 pointer-events-none",
                                                                    item.aggregate_risk_score > 70 ? "bg-red-500" :
                                                                        item.aggregate_risk_score > 40 ? "bg-orange-500" : "bg-emerald-500"
                                                                )} />

                                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                                    <div>
                                                                        <p className="text-xl font-black italic uppercase tracking-tighter leading-none mb-2">{item.employee_name}</p>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={cn(
                                                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider",
                                                                                item.risk_level === 'CRITICAL' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                                                    item.risk_level === 'MEDIUM' ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                                                                                        "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                                            )}>
                                                                                {item.risk_level === 'CRITICAL' ? t.risk.red_alert : item.risk_level}
                                                                            </span>
                                                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">{item.total_orders} {t.risk.orders}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{t.risk.suspicion}</p>
                                                                        <p className={cn(
                                                                            "text-3xl font-black italic tracking-tighter leading-none",
                                                                            item.aggregate_risk_score > 70 ? "text-red-500" : "text-slate-900"
                                                                        )}>
                                                                            {Math.round(item.aggregate_risk_score)}%
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-6 relative z-10">
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {[
                                                                            { l: t.risk.void, v: item.cancel_score, max: 50 },
                                                                            { l: t.risk.discounts, v: item.discount_score, max: 30 },
                                                                            { l: t.risk.history, v: item.history_score, max: 20 },
                                                                        ].map((sub, sidx) => (
                                                                            <div key={sidx} className="bg-white border border-slate-200 shadow-sm p-3 rounded-xl border border-slate-200">
                                                                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{sub.l}</p>
                                                                                <div className="flex items-baseline gap-1">
                                                                                    <span className="text-xs font-black italic">{Math.round(sub.v)}</span>
                                                                                    <span className="text-[8px] font-bold text-slate-600">/{sub.max}</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div>
                                                                        <div className="h-2 w-full bg-white border border-slate-200 shadow-sm rounded-full overflow-hidden">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${item.aggregate_risk_score}%` }}
                                                                                className={cn(
                                                                                    "h-full rounded-full transition-all duration-1000",
                                                                                    item.aggregate_risk_score > 70 ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" :
                                                                                        item.aggregate_risk_score > 40 ? "bg-orange-500" : "bg-emerald-500"
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}

                                            {activeTab === 'inventory' && (
                                                <motion.div
                                                    key="inventory"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="space-y-4"
                                                >
                                                    {inventoryAlerts.length === 0 ? (
                                                        <EmptyState icon={Package} text={t.empty.healthy} />
                                                    ) : (
                                                        inventoryAlerts.map(alert => (
                                                            <div key={alert.id} className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between group">
                                                                <div className="flex items-center gap-5">
                                                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-xl shadow-orange-500/10">
                                                                        <Package className="w-4 h-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black uppercase tracking-tighter leading-none mb-2">{alert.metadata.ingredient_name}</p>
                                                                        <p className="text-[9px] font-bold text-orange-500/60 uppercase tracking-widest italic leading-none">
                                                                            {t.inventory.critical}: {alert.metadata.current_stock} {alert.metadata.unit}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => router.push('/admin/inventory')}
                                                                    title="Ver Inventario"
                                                                    className="h-10 w-10 rounded-xl bg-orange-500 border border-orange-500/20 flex items-center justify-center text-black hover:bg-orange-400 transition-all active:scale-95">
                                                                    <Activity className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[340px] h-20 bg-slate-900/60 backdrop-blur-3xl border border-slate-200 rounded-full flex items-center justify-around px-8 shadow-2xl z-50">
                    {([
                        { icon: ShieldAlert, tab: 'security' },
                        { icon: Activity, tab: 'risk' },
                        { icon: TerminalSquare, tab: 'inventory' },
                        { icon: Settings, tab: null }, // Futuro: settings
                    ] as const).map(({ icon: Icon, tab }, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => tab && setActiveTab(tab as any)}
                            className={cn(
                                "p-4 transition-all rounded-full",
                                tab && activeTab === tab
                                    ? "text-red-500 bg-red-500/10"
                                    : tab
                                        ? "text-slate-500 hover:text-slate-200"
                                        : "text-slate-700 cursor-not-allowed opacity-40"
                            )}
                        >
                            <Icon className="w-6 h-6" />
                        </motion.button>
                    ))}
                </nav>
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255, 255, 255, 0.05); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}

function EmptyState({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-[3rem] p-12 bg-slate-50/50">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-slate-700" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic text-center leading-relaxed">
                {text}
            </p>
        </div>
    )
}

function SecurityCard({ alert, t, onApprove, onReject }: { alert: any, t: any, onApprove: () => void, onReject: () => void }) {
    const isPending = alert.status === 'PENDING'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "p-8 rounded-[2.5rem] border backdrop-blur-md transition-all",
                isPending ? "bg-white shadow-sm border border-slate-200 border-red-500/20 shadow-2xl shadow-red-500/5" : "bg-white shadow-sm border-slate-200 opacity-60"
            )}
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                        alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                    )}>
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <p className={cn(
                            "text-[10px] font-black uppercase tracking-[0.4em] mb-1 italic",
                            alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? "text-red-500" : "text-orange-500"
                        )}>
                            {alert.severity} PRIORITY
                        </p>
                        <p className="text-xs font-black uppercase tracking-tighter text-slate-400">
                            {new Date(alert.created_at).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                {alert.status !== 'PENDING' && (
                    <div className={cn(
                        "px-4 py-2 rounded-full border text-[8px] font-black uppercase italic tracking-widest leading-none",
                        alert.status === 'APPROVED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                    )}>
                        {alert.status === 'APPROVED' ? t.actions.approved : alert.status === 'REJECTED' ? t.actions.denied : alert.status}
                    </div>
                )}
            </div>

            <p className="text-xl font-black italic tracking-tighter uppercase leading-tight mb-8">
                {alert.description}
            </p>

            {isPending && (
                <div className="grid grid-cols-2 gap-4">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onReject}
                        className="h-14 bg-white border border-slate-200 shadow-sm hover:bg-red-500/10 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 transition-all"
                    >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">{t.actions.reject}</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onApprove}
                        className="h-14 bg-red-600 hover:bg-red-500 text-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-500/20"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">{t.actions.authorize}</span>
                    </motion.button>
                </div>
            )}
        </motion.div>
    )
}
