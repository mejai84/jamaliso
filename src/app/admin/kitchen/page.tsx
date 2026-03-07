"use client"

import { Button } from "@/components/ui/button"
import {
    Clock,
    Check,
    AlertTriangle,
    ArrowLeft,
    RefreshCw,
    Loader2,
    Flame,
    Bell,
    Timer,
    CheckCircle,
    Play,
    Pause,
    SkipForward,
    Package,
    Volume2,
    VolumeX,
    List,
    Trash2,
    Star,
    Zap,
    Search,
    AlertCircle,
    ShoppingBag
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"

type OrderItem = {
    id: string
    quantity: number
    customizations: any
    notes?: string
    status?: string
    products: {
        id: string
        name: string
        is_available: boolean
        preparation_time?: number
        station_id?: string
    } | null
}

type PrepStation = {
    id: string
    name: string
    description?: string
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

type Order = {
    id: string
    created_at: string
    status: OrderStatus
    order_items: OrderItem[]
    tables?: {
        table_name: string
    }
    notes?: string
}

const STATUS_COLUMNS = [
    { id: 'pending' as const, label: 'PEDIDOS PENDIENTES', color: 'text-slate-200' },
    { id: 'preparing' as const, label: 'ORDENES EN MARCHA', color: 'text-slate-200' },
    { id: 'ready' as const, label: 'LISTO / ENTREGA', color: 'text-slate-200' }
];

export default function KitchenPage() {
    const { restaurant } = useRestaurant()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [stations, setStations] = useState<PrepStation[]>([])
    const [activeStationId, setActiveStationId] = useState<string>("TODAS")
    const [currentTime, setCurrentTime] = useState(new Date())
    const [expandedOrders, setExpandedOrders] = useState<string[]>([])
    const [isSummaryOpen, setIsSummaryOpen] = useState(false)
    const [isStockOpen, setIsStockOpen] = useState(false)
    const [lastOrderCount, setLastOrderCount] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [searchStock, setSearchStock] = useState("")
    const [allProducts, setAllProducts] = useState<any[]>([])

    // 🔊 AUDIO SYSTEM
    const playSound = (type: 'new' | 'alert') => {
        if (isMuted) return
        const sounds = {
            new: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
            alert: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'
        }
        const audio = new Audio(sounds[type])
        audio.volume = type === 'new' ? 0.4 : 0.6
        audio.play().catch(e => console.log("Audio play blocked", e))
    }

    const toggleOrderExpand = (orderId: string) => {
        setExpandedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        )
    }

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)

        if (restaurant) {
            fetchData()
            fetchStations()
        }

        const channel = supabase
            .channel('kitchen-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                fetchData()
                playSound('new')
                toast.info("¡NUEVA COMANDA ENTRANTE!")
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchData())
            .subscribe()

        // 🔊 ALERT SYSTEM: Beep if orders are late (>10 mins)
        const alertInterval = setInterval(() => {
            if (isMuted) return
            const lateOrders = orders.filter(o => {
                const minutes = Math.floor((new Date().getTime() - new Date(o.created_at).getTime()) / 60000)
                return minutes >= 10 && (o.status === 'pending' || o.status === 'preparing')
            })
            if (lateOrders.length > 0) {
                playSound('alert')
                toast.error("HAY COMANDAS EN CRÍTICO (RETRASADAS)", { duration: 5000 })
            }
        }, 30000) // Every 30 seconds check for critical delays

        return () => {
            clearInterval(timer)
            clearInterval(alertInterval)
            supabase.removeChannel(channel)
        }
    }, [restaurant, orders.length, isMuted])

    useEffect(() => {
        if (isStockOpen) fetchAllProducts()
    }, [isStockOpen])

    const fetchAllProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('restaurant_id', restaurant?.id)
            .order('name')
        if (data) setAllProducts(data)
    }

    const toggleProductAvailability = async (productId: string, current: boolean) => {
        const { error } = await supabase.from('products').update({ is_available: !current }).eq('id', productId)
        if (!error) {
            setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, is_available: !current } : p))
            toast.success("STOCK ACTUALIZADO")
        }
    }

    const fetchStations = async () => {
        if (!restaurant) return
        const { data, error } = await supabase
            .from('prep_stations')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('is_active', true)
            .order('name')

        if (!error && data) setStations(data)
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *, 
                    tables (table_name), 
                    order_items (
                        id,
                        quantity, 
                        notes,
                        status,
                        products (id, name, station_id, preparation_time)
                    )
                `)
                .eq('restaurant_id', restaurant?.id)
                .in('status', ['pending', 'preparing', 'ready'])
                .order('created_at', { ascending: true })

            if (!error && data) {
                if (data.length > orders.length && lastOrderCount > 0) {
                    playSound('new')
                }
                setOrders(data)
                setLastOrderCount(data.length)
            }
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, newStatus: OrderStatus) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
        if (!error) {
            fetchData()
            toast.success(`PEDIDO ACTUALIZADO`)
        }
    }

    const updateItemStatus = async (itemId: string, newStatus: string, orderId: string, currentOrderStatus: string) => {
        const { error } = await supabase.from('order_items').update({ status: newStatus }).eq('id', itemId)
        if (!error) {
            // 🚀 Automatización: Si el pedido está en cola y se inicia un item, mover a Fogón Activo
            if (currentOrderStatus === 'pending') {
                await supabase.from('orders').update({ status: 'preparing' }).eq('id', orderId)
            }
            fetchData()
            toast.success(`ÍTEM ACTUALIZADO`)
        } else {
            toast.error("Error al actualizar ítem")
        }
    }

    const getElapsedFormatted = (dateString: string) => {
        const start = new Date(dateString).getTime()
        const diffMs = currentTime.getTime() - start
        const totalSecs = Math.max(0, Math.floor(diffMs / 1000))
        const mins = Math.floor(totalSecs / 60)
        const secs = totalSecs % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getMinutes = (dateString: string) => {
        const start = new Date(dateString).getTime()
        return Math.floor((currentTime.getTime() - start) / 60000)
    }

    const getTimeStyles = (minutes: number) => {
        if (minutes < 5) return { text: 'text-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50/50' }
        if (minutes < 10) return { text: 'text-orange-500', border: 'border-orange-200', bg: 'bg-orange-50/50' }
        return { text: 'text-rose-500', border: 'border-rose-300', bg: 'bg-rose-50/50' }
    }

    // 🧠 LÓGICA DE FILTRADO POR ESTACIÓN
    const filteredOrders = orders.map(order => {
        if (activeStationId === "TODAS") return order;

        const stationItems = order.order_items.filter(item =>
            item.products?.station_id === activeStationId
        );

        if (stationItems.length === 0) return null;

        return {
            ...order,
            order_items: stationItems
        };
    }).filter(Boolean) as Order[];

    // 📊 RESUMEN DE PRODUCCIÓN
    const productionSummary = filteredOrders
        .filter(o => o.status !== 'ready')
        .flatMap(o => o.order_items)
        .filter(i => i.status !== 'ready')
        .reduce((acc: any, item: any) => {
            const name = item.products?.name || 'Desconocido'
            acc[name] = (acc[name] || 0) + item.quantity
            return acc
        }, {})

    // 👑 ORDENAMIENTO DE PRIORIDAD: VIPs al principio, luego por tiempo
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const priorityA = (a as any).priority ? 1 : 0;
        const priorityB = (b as any).priority ? 1 : 0;
        if (priorityA !== priorityB) return priorityB - priorityA;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const activePreparingCount = filteredOrders.filter(o => o.status === 'preparing').length

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans relative overflow-hidden">
            {/* BACKGROUND LAYERS */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 opacity-20 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-[120px] bg-slate-100/40 pointer-events-none" />

            <div className="relative z-10 p-6 md:p-10 space-y-8 flex flex-col h-screen overflow-hidden">
                {/* HEADER EJECUTIVO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900">
                                KDS <span className="text-orange-600">PRO</span>
                            </h1>
                            <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest italic">Live Sync</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Selector de Estaciones */}
                        <div className="flex bg-white/60 p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar max-w-[400px]">
                            <button
                                onClick={() => setActiveStationId('TODAS')}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap",
                                    activeStationId === 'TODAS'
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white"
                                )}
                            >
                                TODAS
                            </button>
                            {stations.map(station => (
                                <button
                                    key={station.id}
                                    onClick={() => setActiveStationId(station.id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap",
                                        activeStationId === station.id
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white"
                                    )}
                                >
                                    {station.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 bg-white/60 px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase mb-0.5">ESTADO</p>
                                <p className="text-lg font-black italic text-slate-900 tracking-tight">{activePreparingCount} EN MARCHA</p>
                            </div>
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => setIsSummaryOpen(true)}
                                className="h-12 px-5 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black italic text-[10px] uppercase tracking-widest flex gap-2"
                            >
                                <List className="w-4 h-4" /> RESUMEN
                            </Button>
                            <Button
                                onClick={() => setIsStockOpen(true)}
                                className="h-12 px-5 bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 rounded-2xl font-black italic text-[10px] uppercase tracking-widest flex gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" strokeWidth={3} /> STOCK
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsMuted(!isMuted)}
                                className="h-12 w-12 bg-white/60 hover:bg-white border border-slate-200 rounded-2xl shadow-sm"
                            >
                                {isMuted ? <VolumeX className="w-6 h-6 text-rose-500" strokeWidth={3} /> : <Volume2 className="w-6 h-6 text-emerald-500" strokeWidth={3} />}
                            </Button>
                        </div>

                        <Link href="/admin">
                            <Button variant="ghost" className="h-12 w-12 bg-white/60 hover:bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <ArrowLeft className="w-6 h-6 text-slate-400" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* BOARD OPERATIVO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
                    {STATUS_COLUMNS.map(column => (
                        <div key={column.id} className="flex flex-col bg-white/40 border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 underline decoration-orange-500/30 decoration-4 underline-offset-4">{column.label}</h2>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">SISTEMA DE MONITOREO ACTIVO</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center font-black text-white shadow-lg">
                                    {sortedOrders.filter(o => o.status === column.id).length}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                {sortedOrders.filter(o => o.status === column.id).length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                                        <Package className="w-16 h-16 mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest italic">Sin pedidos activos</p>
                                    </div>
                                ) : (
                                    sortedOrders.filter(o => o.status === column.id).map(order => {
                                        const totalItems = order.order_items.length;
                                        const readyItems = order.order_items.filter(i => i.status === 'ready').length;
                                        const preparingItemsCount = order.order_items.filter(i => i.status === 'preparing').length;
                                        const hasUnstartedItems = order.order_items.some(i => !i.status || i.status === 'pending');
                                        const progress = (readyItems / totalItems) * 100;
                                        const minutes = getMinutes(order.created_at);
                                        const styles = getTimeStyles(minutes);

                                        return (
                                            <div
                                                key={order.id}
                                                className={cn(
                                                    "bg-white border-2 rounded-[2.2rem] p-7 shadow-xl transition-all flex flex-col gap-6 relative overflow-hidden",
                                                    styles.border,
                                                    minutes >= 10 && "animate-pulse ring-4 ring-rose-500/10",
                                                    (order as any).priority && "border-[#FFD700] ring-4 ring-[#FFD700]/20"
                                                )}
                                            >
                                                {(order as any).priority && (
                                                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#FFD700] text-slate-900 font-black italic text-[9px] uppercase tracking-widest rounded-bl-2xl flex items-center gap-2">
                                                        <Star className="w-3 h-3 fill-slate-900" /> PRIORIDAD VIP
                                                    </div>
                                                )}
                                                {/* HEADER TARJETA */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "min-w-[60px] px-4 h-14 rounded-2xl border-2 flex items-center justify-center font-black italic text-lg whitespace-nowrap shadow-sm",
                                                            styles.bg, styles.text, "border-slate-300"
                                                        )}>
                                                            #{order.tables?.table_name || 'H'}
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <div className={cn(
                                                                "px-4 py-2 rounded-xl text-[12px] font-black border-2 flex items-center gap-2 shadow-sm bg-white",
                                                                styles.text, "border-slate-200"
                                                            )}>
                                                                <Clock className="w-4 h-4 text-slate-900" strokeWidth={3} />
                                                                <span className="text-slate-900">{getElapsedFormatted(order.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-3 justify-end">
                                                            <span className="text-lg font-black italic text-slate-900">{readyItems}/{totalItems}</span>
                                                            <Package className="w-6 h-6 text-slate-900" strokeWidth={3} />
                                                        </div>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">ITEMS LISTOS</p>
                                                    </div>
                                                </div>

                                                {/* BARRA DE PROGRESO */}
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-700",
                                                            progress === 100 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-orange-500"
                                                        )}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleOrderExpand(order.id);
                                                    }}
                                                    className="w-full flex items-center justify-center py-2 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors group/expand"
                                                >
                                                    <div className={cn(
                                                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                                        expandedOrders.includes(order.id) ? "text-slate-600" : "text-orange-600 animate-bounce"
                                                    )}>
                                                        {expandedOrders.includes(order.id) ? "Cerrar Detalles" : "Ver Pedido Completo"}
                                                        <Flame className={cn("w-4 h-4 transition-transform", expandedOrders.includes(order.id) && "rotate-180")} strokeWidth={3} />
                                                    </div>
                                                </button>

                                                {expandedOrders.includes(order.id) && (
                                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {/* ALERTA DE OLVIDO */}
                                                        {hasUnstartedItems && order.status === 'preparing' && (
                                                            <div className="bg-orange-500 border-2 border-orange-600 p-5 rounded-[1.5rem] flex items-center gap-4 animate-pulse shadow-lg">
                                                                <div className="bg-white p-2 rounded-full shadow-inner">
                                                                    <AlertTriangle className="w-5 h-5 text-orange-600" strokeWidth={3} />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <p className="text-[12px] font-black text-white uppercase tracking-widest leading-none">⚠️ ATENCIÓN COCINA</p>
                                                                    <p className="text-[13px] font-black italic text-orange-50 uppercase mt-1">Hay productos sin iniciar en esta comanda</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* ITEMS LIST */}
                                                        <div className="space-y-4">
                                                            {order.order_items.map((item, idx) => {
                                                                const station = stations.find(s => s.id === item.products?.station_id);
                                                                const isReady = item.status === 'ready';
                                                                const isPreparing = item.status === 'preparing';
                                                                const isPending = !item.status || item.status === 'pending';

                                                                return (
                                                                    <div key={idx} className={cn(
                                                                        "p-4 rounded-[1.5rem] border-2 transition-all flex flex-col gap-3",
                                                                        isReady ? "bg-emerald-50/30 border-emerald-100/50 opacity-60" :
                                                                            isPreparing ? "bg-orange-50/50 border-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.1)] scale-[1.02]" :
                                                                                "bg-slate-50 border-slate-100 opacity-40 grayscale-[0.5]"
                                                                    )}>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-4">
                                                                                <span className={cn(
                                                                                    "text-xl font-black italic",
                                                                                    isReady ? "text-emerald-600" : "text-orange-600"
                                                                                )}>{item.quantity}X</span>
                                                                                <div className="flex flex-col">
                                                                                    <span className={cn(
                                                                                        "text-[15px] font-black uppercase tracking-tight italic",
                                                                                        isReady ? "line-through text-slate-400" : "text-slate-900"
                                                                                    )}>{item.products?.name}</span>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        {station && activeStationId === 'TODAS' && (
                                                                                            <span className="text-[9px] font-black text-white px-2 py-0.5 rounded bg-orange-600 shadow-sm">
                                                                                                {station.name.toUpperCase()}
                                                                                            </span>
                                                                                        )}
                                                                                        {item.products?.preparation_time && (
                                                                                            <span className={cn(
                                                                                                "text-[9px] font-black uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded",
                                                                                                minutes > item.products.preparation_time ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-500"
                                                                                            )}>
                                                                                                <Timer className="w-3 h-3" /> {item.products.preparation_time} MIN
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <Button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    updateItemStatus(item.id, isReady ? 'preparing' : 'ready', order.id, order.status);
                                                                                }}
                                                                                className={cn(
                                                                                    "h-12 px-6 rounded-xl text-[12px] font-black uppercase italic transition-all flex items-center gap-2 shadow-lg",
                                                                                    isReady
                                                                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                                                        : "bg-orange-500 text-white hover:bg-orange-600 border-2 border-orange-400 shadow-orange-500/20"
                                                                                )}
                                                                            >
                                                                                {isReady ? (
                                                                                    <><CheckCircle className="w-5 h-5" strokeWidth={3} /> LISTO</>
                                                                                ) : (
                                                                                    <><Play className="w-5 h-5 fill-white" strokeWidth={3} /> INICIAR</>
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                        {item.notes && (
                                                                            <div className="ml-9 p-4 bg-orange-100 border-l-4 border-orange-500 rounded-lg shadow-inner">
                                                                                <p className="text-[12px] font-black italic text-orange-950 uppercase leading-snug">
                                                                                    {item.notes}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* GENERAL NOTES */}
                                                        {order.notes && (
                                                            <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] flex items-start gap-3 shadow-inner">
                                                                <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                                <div className="space-y-1">
                                                                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic">Nota de Comanda</p>
                                                                    <p className="text-xs font-black italic text-amber-950 uppercase leading-snug">"{order.notes}"</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* FOOTER ACTIONS */}
                                                        <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                                                            {order.status === 'pending' && (
                                                                <Button onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateStatus(order.id, 'preparing');
                                                                }} className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black italic text-[11px] uppercase tracking-widest shadow-xl">
                                                                    <Play className="w-4 h-4 mr-2 fill-white" />
                                                                    INICIAR ESTA ORDEN
                                                                </Button>
                                                            )}
                                                            {order.status === 'preparing' && (
                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateStatus(order.id, 'ready');
                                                                    }}
                                                                    className={cn(
                                                                        "w-full h-14 font-black italic text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2",
                                                                        progress === 100
                                                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30"
                                                                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30"
                                                                    )}
                                                                >
                                                                    {progress === 100 ? (
                                                                        <><CheckCircle className="w-4 h-4" /> MARCAR TODO LISTO</>
                                                                    ) : (
                                                                        <><SkipForward className="w-4 h-4" /> TERMINAR FORZADO</>
                                                                    )}
                                                                </Button>
                                                            )}
                                                            {order.status === 'ready' && (
                                                                <Button onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateStatus(order.id, 'delivered');
                                                                }} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black italic text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/30">
                                                                    ENTREGAR A MESERO
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RESUMEN DE PRODUCCIÓN MODAL */}
            {isSummaryOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end p-6 md:p-10 pointer-events-none">
                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-md pointer-events-auto" onClick={() => setIsSummaryOpen(false)} />
                    <div className="relative w-full max-w-md h-full bg-white rounded-[3rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-right-10 duration-500">
                        <div className="p-10 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">RESUMEN <span className="text-orange-600">TOTAL</span></h2>
                                    <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1 italic">Consolidado de producción actual</p>
                                </div>
                                <Button onClick={() => setIsSummaryOpen(false)} variant="ghost" className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-200">
                                    <ArrowLeft className="w-6 h-6 text-slate-900" strokeWidth={3} />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-4">
                            {Object.entries(productionSummary).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                    <ShoppingBag className="w-20 h-20 mb-6 text-slate-300" strokeWidth={1} />
                                    <p className="text-sm font-black italic uppercase tracking-[0.2em]">No hay ítems en marcha</p>
                                </div>
                            ) : (
                                Object.entries(productionSummary).map(([name, qty]: any) => (
                                    <div key={name} className="flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl group hover:border-orange-200 transition-all">
                                        <span className="text-[15px] font-black italic uppercase tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">{name}</span>
                                        <div className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black italic text-lg shadow-lg group-hover:bg-orange-600 transition-colors">
                                            {qty}x
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-10 bg-slate-900 text-white">
                            <div className="flex items-center gap-4">
                                <Zap className="w-8 h-8 text-orange-500 fill-orange-500" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Operación Proactiva</p>
                                    <p className="text-sm font-bold italic tracking-tight">Listo para organizar producción en masa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GESTOR DE STOCK MODAL */}
            {isStockOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl pointer-events-auto" onClick={() => setIsStockOpen(false)} />
                    <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-12 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">GESTOR <span className="text-orange-600">STOCK</span></h2>
                                <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1 italic">Control crítico de disponibilidad de menú</p>
                            </div>
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={3} />
                                <input
                                    type="text"
                                    placeholder="BUSCAR PRODUCTO..."
                                    value={searchStock}
                                    onChange={(e) => setSearchStock(e.target.value)}
                                    className="w-full h-16 pl-14 pr-6 bg-white border-2 border-slate-200 rounded-3xl font-black italic text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-orange-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allProducts
                                    .filter(p => p.name.toLowerCase().includes(searchStock.toLowerCase()))
                                    .map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => toggleProductAvailability(product.id, product.is_available)}
                                            className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-4 text-left group",
                                                product.is_available
                                                    ? "bg-white border-slate-200 hover:border-orange-500"
                                                    : "bg-rose-50 border-rose-200 hover:border-rose-400"
                                            )}
                                        >
                                            <div className="flex w-full justify-between items-start">
                                                <span className={cn(
                                                    "text-[13px] font-black uppercase tracking-tight italic flex-1 pr-4",
                                                    product.is_available ? "text-slate-900" : "text-rose-900"
                                                )}>{product.name}</span>
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-active:scale-95",
                                                    product.is_available ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                                )}>
                                                    {product.is_available ? <Check className="w-5 h-5" strokeWidth={4} /> : <VolumeX className="w-5 h-5" strokeWidth={4} />}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                    product.is_available ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                )}>
                                                    {product.is_available ? "DISPONIBLE" : "AGOTADO"}
                                                </div>
                                                {!product.is_available && <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />}
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(15, 23, 42, 0.2); 
                    border-radius: 20px; 
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
