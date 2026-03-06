"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import {
    Users,
    Utensils,
    ChefHat,
    ArrowRight,
    LogOut,
    Plus,
    Minus,
    Search,
    X,
    CheckCircle2,
    Loader2,
    ArrowLeftRight,
    Receipt,
    Zap,
    Signal,
    Activity,
    Smartphone,
    ShieldCheck,
    Briefcase,
    Globe,
    Lock,
    ArrowLeft,
    Table as TableIcon,
    Flame,
    ShoppingBag,
    LayoutGrid,
    Star,
    Bell,
    AlertCircle,
    MessageSquare,
    Link2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { createOrderWithNotes, addItemsToOrder, mergeTables, transferOrderItem, sendKitchenMessage } from "@/actions/orders-fixed"
import { toast } from "sonner"
import { cn, formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// ----------------------------------------------------------------------
// TIPOS
// ----------------------------------------------------------------------
type Table = {
    id: string
    table_name: string
    status: 'free' | 'occupied' | 'reserved'
    capacity: number
    active_order?: {
        id: string
        total: number
        status: string
        priority: boolean
        created_at: string
    }
}

type Product = {
    id: string
    name: string
    price: number
    category_id: string
    stock_quantity?: number
    use_inventory?: boolean
}

type Category = {
    id: string
    name: string
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------
export default function WaiterAppPremium() {
    const { restaurant } = useRestaurant()
    const router = useRouter()
    const [view, setView] = useState<'tables' | 'order' | 'options'>('tables')
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [cart, setCart] = useState<{ product: Product, qty: number, notes?: string }[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [orderNotes, setOrderNotes] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [isPriority, setIsPriority] = useState(false)
    const [isSplitMode, setIsSplitMode] = useState(false)
    const [selectedForSplit, setSelectedForSplit] = useState<{ itemId: string, quantity: number }[]>([])
    const [currentTime, setCurrentTime] = useState(new Date())

    // Nuevos Estados Enterprise
    const [isBillPreview, setIsBillPreview] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [kitchenMsg, setKitchenMsg] = useState("")
    const [mergeMode, setMergeMode] = useState<{ active: boolean, sourceId: string | null }>({ active: false, sourceId: null })
    const [isTransferMode, setIsTransferMode] = useState(false)
    const [itemToTransfer, setItemToTransfer] = useState<any>(null)

    const QUICK_MODS = ["SIN CEBOLLA", "TÉRMINO MEDIO", "BIEN ASADO", "EXTRA QUESO", "SIN SAL", "PARA LLEVAR"]

    // Data
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [realTables, setRealTables] = useState<Table[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (restaurant) {
            fetchData()
            const timer = setInterval(() => setCurrentTime(new Date()), 10000)
            return () => clearInterval(timer)
        }
    }, [restaurant])

    const fetchData = async () => {
        if (!restaurant) return
        setLoading(true)

        // Fetch cats & prods
        const [catsRes, prodsRes, tabsRes] = await Promise.all([
            supabase.from('categories').select('*').eq('restaurant_id', restaurant.id),
            supabase.from('products').select('*').eq('restaurant_id', restaurant.id).eq('is_available', true),
            supabase.from('tables').select('*').eq('restaurant_id', restaurant.id).order('table_name')
        ])

        if (catsRes.data) setCategories(catsRes.data)
        if (prodsRes.data) setProducts(prodsRes.data as any)

        if (tabsRes.data) {
            const tables = tabsRes.data as any[]
            // Fetch active orders for these tables
            const { data: activeOrders } = await supabase
                .from('orders')
                .select('id, table_id, total, status, priority, created_at')
                .eq('restaurant_id', restaurant.id)
                .in('status', ['pending', 'preparing', 'ready'])
                .order('created_at', { ascending: false })

            const enrichedTables = tables.map(t => {
                const order = activeOrders?.find(o => o.table_id === t.id)
                return {
                    ...t,
                    active_order: order ? {
                        id: order.id,
                        total: order.total,
                        status: order.status,
                        priority: order.priority,
                        created_at: order.created_at
                    } : undefined
                }
            })
            setRealTables(enrichedTables)
        }
        setLoading(false)
    }

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id && !item.notes)
            if (existing) {
                return prev.map(item => (item.product.id === product.id && !item.notes) ? { ...item, qty: item.qty + 1 } : item)
            }
            return [...prev, { product, qty: 1 }]
        })
        toast.success(`+1 ${product.name}`)
    }

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index))
    }

    const updateCartQty = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = Math.max(1, item.qty + delta)
                return { ...item, qty: newQty }
            }
            return item
        }))
    }

    const updateItemNote = (index: number, note: string) => {
        setCart(prev => prev.map((item, i) => i === index ? { ...item, notes: note } : item))
    }

    const handleMarchar = async () => {
        if (!selectedTable || cart.length === 0 || submitting) return
        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Sesión no válida")

            const items = cart.map(i => ({
                product_id: i.product.id,
                quantity: i.qty,
                unit_price: i.product.price,
                subtotal: i.product.price * i.qty,
                notes: i.notes
            }))

            const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0)

            // Cálculos dinámicos basados en config del restaurante
            const taxRate = (restaurant?.tax_percentage || 0) / 100
            const serviceRate = (restaurant?.service_charge_percentage || 0) / 100

            const tax = cartSubtotal * taxRate
            const serviceCharge = (restaurant?.apply_service_charge) ? (cartSubtotal * serviceRate) : 0
            const total = cartSubtotal + tax + serviceCharge

            const orderData = {
                restaurant_id: restaurant!.id,
                user_id: user.id,
                waiter_id: user.id, // Simplificación: usar auth user
                table_id: selectedTable.id,
                items,
                subtotal: cartSubtotal,
                tax: tax,
                service_charge: serviceCharge,
                total: total,
                notes: orderNotes,
                priority: isPriority
            }

            const result = await createOrderWithNotes(orderData)
            if (result.success) {
                await supabase.from('tables').update({ status: 'occupied' }).eq('id', selectedTable.id)
                toast.success("COMANDA ENVIADA A COCINA")
                setCart([])
                setOrderNotes("")
                setIsPriority(false)
                setView('tables')
                fetchData()
            } else {
                toast.error(result.error || "Error al enviar comanda")
            }
        } catch (e: any) {
            toast.error("Error: " + e.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeliverOrder = async () => {
        if (!selectedTable?.active_order || submitting) return
        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'delivered' })
                .eq('id', selectedTable.active_order.id)

            if (!error) {
                toast.success("ORDEN ENTREGADA AL CLIENTE")
                setView('tables')
                fetchData()
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleSplitCheck = async () => {
        if (!selectedTable?.active_order || selectedForSplit.length === 0 || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { splitOrder } = await import("@/actions/orders-fixed")
            const result = await splitOrder(selectedTable.active_order.id, selectedForSplit, user.id)

            if (result.success) {
                toast.success("CUENTA DIVIDIDA: NUEVA ORDEN CREADA")
                setIsSplitMode(false)
                setSelectedForSplit([])
                setView('tables')
                fetchData()
            }
        } catch (e: any) {
            toast.error("Error al dividir cuenta: " + e.message)
        } finally {
            setSubmitting(false)
        }
    }

    const toggleSplitItem = (itemId: string, maxQty: number) => {
        setSelectedForSplit(prev => {
            const existing = prev.find(i => i.itemId === itemId)
            if (existing) return prev.filter(i => i.itemId !== itemId)
            return [...prev, { itemId, quantity: 1 }]
        })
    }

    const handleMergeTables = async (targetId: string) => {
        if (!mergeMode.sourceId || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const result = await mergeTables(mergeMode.sourceId, targetId, user.id)
            if (result.success) {
                toast.success("MESAS UNIDAS EXITOSAMENTE")
                setMergeMode({ active: false, sourceId: null })
                fetchData()
            } else {
                toast.error(result.error)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleTransferItem = async (targetTableId: string) => {
        if (!itemToTransfer || !selectedTable?.active_order || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const result = await transferOrderItem(selectedTable.active_order.id, targetTableId, itemToTransfer.id, 1, user.id)
            if (result.success) {
                toast.success("ÍTEM TRANSFERIDO")
                setIsTransferMode(false)
                setItemToTransfer(null)
                setView('tables')
                fetchData()
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleSendKitchenMsg = async () => {
        if (!kitchenMsg || submitting) return
        setSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()
        const result = await sendKitchenMessage(restaurant!.id, user?.email || "Mesero", kitchenMsg)
        if (result.success) {
            toast.success("MENSAJE ENVIADO")
            setKitchenMsg("")
            setIsChatOpen(false)
        }
        setSubmitting(false)
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCat = activeCategory === 'all' || p.category_id === activeCategory
        return matchesSearch && matchesCat
    })

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen bg-[#F8FAFC]">
            {/* 🖼️ FONDO PREMIUM */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1550966841-3ee5ad60a05a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                {/* HEADER */}
                <header className="p-6 border-b border-slate-200 bg-white/40 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        {view !== 'tables' && (
                            <button onClick={() => setView('tables')} className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-slate-900">WAITER <span className="text-orange-600">PRO</span></h1>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">SISTEMA DE COMANDAS MÓVIL</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all shadow-sm"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                            <span className="text-[8px] font-black uppercase text-emerald-500">LIVE SYNC</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden relative">
                    {view === 'tables' ? (
                        <div className="h-full flex flex-col p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
                                    {mergeMode.active ? (
                                        <span className="text-indigo-600 animate-pulse flex items-center gap-2">
                                            <Link2 className="w-6 h-6" /> SELECCIONA MESA DESTINO
                                        </span>
                                    ) : (
                                        <>Gestión de <span className="text-orange-600">Salón</span></>
                                    )}
                                </h2>
                                <div className="flex gap-2">
                                    {mergeMode.active ? (
                                        <Button onClick={() => setMergeMode({ active: false, sourceId: null })} className="bg-rose-500 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase italic">CANCELAR UNIÓN</Button>
                                    ) : (
                                        <>
                                            <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase">
                                                {realTables.filter(t => t.status === 'free').length} Libres
                                            </div>
                                            <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[9px] font-black text-orange-600 uppercase">
                                                {realTables.filter(t => t.status === 'occupied').length} Ocupadas
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {realTables.map(table => {
                                        const isActive = table.status === 'occupied' && table.active_order;
                                        const elapsedMs = isActive ? currentTime.getTime() - new Date(table.active_order!.created_at).getTime() : 0;
                                        const elapsedMins = Math.floor(elapsedMs / 60000);

                                        return (
                                            <div
                                                key={table.id}
                                                onClick={() => {
                                                    if (mergeMode.active) {
                                                        if (table.id === mergeMode.sourceId) return;
                                                        if (table.status !== 'occupied') {
                                                            toast.error("Solo puedes unir mesas ocupadas con órdenes activas");
                                                            return;
                                                        }
                                                        handleMergeTables(table.id);
                                                        return;
                                                    }
                                                    setSelectedTable(table)
                                                    if (table.status === 'occupied') setView('options')
                                                    else setView('order')
                                                }}
                                                className={cn(
                                                    "relative aspect-square rounded-[2rem] p-6 flex flex-col justify-between border transition-all cursor-pointer active:scale-95 group overflow-hidden shadow-sm",
                                                    mergeMode.active && table.id !== mergeMode.sourceId && table.status === 'occupied' ? "border-indigo-400 ring-4 ring-indigo-500/20 animate-pulse" : "",
                                                    mergeMode.active && table.id === mergeMode.sourceId ? "opacity-40 grayscale pointer-events-none" : "",
                                                    !mergeMode.active && table.status === 'free'
                                                        ? "bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-100/50 hover:border-emerald-300 shadow-emerald-500/5"
                                                        : cn(
                                                            "bg-white shadow-xl",
                                                            table.active_order?.status === 'ready' ? "border-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" : "border-orange-200/50",
                                                            table.active_order?.priority && "border-amber-400 ring-4 ring-amber-400/20",
                                                            elapsedMins >= 20 && table.active_order?.status !== 'ready' && "border-rose-500 ring-4 ring-rose-500/30 animate-pulse-red"
                                                        )
                                                )}
                                            >
                                                {elapsedMins >= 20 && table.active_order?.status !== 'ready' && (
                                                    <div className="absolute inset-0 bg-rose-500/5 border-2 border-rose-500 rounded-[2rem] pointer-events-none flex items-center justify-center opacity-40">
                                                        <AlertCircle className="w-12 h-12 text-rose-500" strokeWidth={1} />
                                                    </div>
                                                )}
                                                {table.active_order?.status === 'ready' && (
                                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 animate-bounce" />
                                                )}
                                                <div className="flex justify-between items-start relative z-10">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-xl flex items-center justify-center border font-black italic text-xs",
                                                        table.status === 'free' ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "bg-orange-100 border-orange-200 text-orange-600"
                                                    )}>
                                                        {table.capacity}
                                                    </div>
                                                    {table.status === 'occupied' && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className={cn(
                                                                "px-2 py-1 rounded-lg animate-pulse flex items-center gap-1",
                                                                table.active_order?.status === 'ready' ? "bg-emerald-500" : "bg-orange-500"
                                                            )}>
                                                                {table.active_order?.status === 'ready' && <Bell className="w-2.5 h-2.5 text-white animate-ring" />}
                                                                <p className="text-[7px] font-black text-white italic tracking-tighter truncate">
                                                                    {table.active_order?.status === 'ready' ? 'READY' : 'BUSY'}
                                                                </p>
                                                            </div>
                                                            {isActive && (
                                                                <div className="flex items-center gap-1 text-orange-600">
                                                                    <Zap className="w-3 h-3 fill-orange-600" />
                                                                    <span className="text-[10px] font-mono font-black">{elapsedMins}m</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className={cn(
                                                            "text-[8px] font-black uppercase tracking-[0.2em]",
                                                            table.status === 'free' ? "text-emerald-500" : "text-orange-500"
                                                        )}>
                                                            {table.status === 'free' ? 'DISPONIBLE' : 'EN SERVICIO'}
                                                        </p>
                                                        {table.active_order?.priority && (
                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        )}
                                                    </div>
                                                    <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">{table.table_name}</h3>
                                                    {isActive && (
                                                        <div className={cn(
                                                            "mt-2 flex items-center gap-2 font-black italic font-mono text-sm",
                                                            elapsedMins >= 20 ? "text-rose-600 bg-rose-50 px-2 py-1 rounded-lg animate-bounce" : "text-orange-600"
                                                        )}>
                                                            <Activity className="w-3.5 h-3.5" />
                                                            {formatPrice(table.active_order!.total)}
                                                            {elapsedMins >= 20 && <span className="text-[10px] ml-1 uppercase">¡CRÍTICO!</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : view === 'options' ? (
                        <div className="h-full flex flex-col p-4 md:p-12 items-center justify-center space-y-8 md:space-y-12 max-w-2xl mx-auto w-full animate-in zoom-in duration-300">
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-orange-500/10 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-center border border-orange-500/20 mx-auto mb-6 md:mb-8 shadow-xl shadow-orange-500/5">
                                    <TableIcon className="w-10 h-10 md:w-16 md:h-16 text-orange-500" />
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-slate-900">{selectedTable?.table_name}</h2>
                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic">MESA ACTIVA</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full">
                                <Button onClick={() => setView('order')} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-orange-500 hover:text-white transition-all font-black uppercase text-xs italic">
                                    <Plus className="w-6 h-6 mb-2 text-orange-500" />
                                    ADICIONAR ITEMS
                                </Button>
                                <Button onClick={() => setIsBillPreview(true)} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-slate-900 hover:text-white transition-all font-black uppercase text-xs italic">
                                    <Receipt className="w-6 h-6 mb-2 text-blue-500" />
                                    VER PRE-CUENTA
                                </Button>
                                <Button onClick={() => setMergeMode({ active: true, sourceId: selectedTable?.id || null })} className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-indigo-500 hover:text-white transition-all font-black uppercase text-xs italic">
                                    <Link2 className="w-6 h-6 mb-2 text-indigo-500 group-hover:text-white" />
                                    UNIR MESAS
                                </Button>
                                <Button
                                    onClick={async () => {
                                        const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', selectedTable?.active_order?.id)
                                        if (items) {
                                            (selectedTable as any).items = items
                                            setIsSplitMode(true)
                                        }
                                    }}
                                    className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-orange-600 hover:text-white transition-all font-black uppercase text-xs italic"
                                >
                                    <ArrowLeftRight className="w-6 h-6 mb-2 text-orange-500" />
                                    DIVIDIR CUENTA
                                </Button>
                                <Button
                                    onClick={async () => {
                                        const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', selectedTable?.active_order?.id)
                                        if (items) {
                                            (selectedTable as any).items = items
                                            setIsTransferMode(true)
                                        }
                                    }}
                                    className="h-24 md:h-32 bg-white border border-slate-200 rounded-3xl flex flex-col hover:bg-indigo-600 hover:text-white transition-all font-black uppercase text-xs italic"
                                >
                                    <Signal className="w-6 h-6 mb-2 text-indigo-400" />
                                    TRANSFERIR ITEMS
                                </Button>
                                <Button onClick={() => router.push(`/admin/pos?table=${selectedTable?.id}`)} className="h-24 md:h-32 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-3xl flex flex-col hover:bg-emerald-500 hover:text-white transition-all font-black uppercase text-xs italic">
                                    <Receipt className="w-6 h-6 mb-2" />
                                    PAGAR CUENTA
                                </Button>
                                {selectedTable?.active_order?.status === 'ready' && (
                                    <Button
                                        onClick={handleDeliverOrder}
                                        disabled={submitting}
                                        className="h-24 md:h-32 bg-emerald-600 border border-emerald-400 text-white rounded-3xl flex flex-col hover:bg-emerald-700 transition-all font-black uppercase text-xs italic col-span-2 shadow-lg shadow-emerald-500/20 animate-bounce"
                                    >
                                        <CheckCircle2 className="w-8 h-8 mb-2" />
                                        ENTREGAR A CLIENTE (PEDIDO LISTO)
                                    </Button>
                                )}
                                <Button onClick={async () => {
                                    if (!confirm("¿LIBERAR MESA?")) return;
                                    await supabase.from('tables').update({ status: 'free' }).eq('id', selectedTable?.id);
                                    fetchData(); setView('tables');
                                }} className="h-24 md:h-32 bg-rose-50 border border-rose-100 text-rose-500 rounded-3xl flex flex-col hover:bg-rose-500 hover:text-white transition-all font-black uppercase text-xs italic col-span-2">
                                    <X className="w-6 h-6 mb-2" />
                                    LIBERAR MESA
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex overflow-hidden">
                            <div className="w-20 md:w-28 bg-white/40 border-r border-slate-200 flex flex-col py-6 overflow-y-auto shrink-0">
                                <button onClick={() => setActiveCategory('all')} className={cn("flex flex-col items-center gap-2 p-4 border-l-4", activeCategory === 'all' ? "border-orange-500 bg-orange-50 text-orange-600" : "border-transparent text-slate-400")}>
                                    <LayoutGrid className="w-5 h-5" />
                                    <span className="text-[8px] font-black uppercase italic">ALL</span>
                                </button>
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={cn("flex flex-col items-center gap-2 p-5 border-l-4", activeCategory === cat.id ? "border-orange-500 bg-orange-50 text-orange-600" : "border-transparent text-slate-400")}>
                                        <span className="text-[8px] font-black uppercase text-center italic leading-tight">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="p-4 border-b border-slate-200 bg-white/40 space-y-4">
                                    {/* ⚡ QUICK-ADD FAVORITES */}
                                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                                        <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[9px] font-black italic uppercase shadow-lg shadow-orange-500/20">
                                            <Zap className="w-3 h-3 fill-white" /> TOP 5
                                        </div>
                                        {products.slice(0, 5).map(prod => (
                                            <button
                                                key={prod.id}
                                                onClick={() => addToCart(prod)}
                                                className="shrink-0 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black italic text-slate-700 hover:border-orange-400 hover:text-orange-600 transition-all shadow-sm active:scale-95"
                                            >
                                                + {prod.name.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input placeholder="Buscar en menú..." className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 text-sm text-slate-900 shadow-inner focus:border-orange-500 focus:outline-none transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {filteredProducts.map(prod => {
                                        const isOutOfStock = prod.use_inventory && (prod.stock_quantity || 0) <= 0;
                                        return (
                                            <div
                                                key={prod.id}
                                                onClick={() => !isOutOfStock && addToCart(prod)}
                                                className={cn(
                                                    "bg-white border border-slate-100 rounded-2xl p-4 active:scale-95 transition-all shadow-sm flex flex-col h-32 justify-between relative group overflow-hidden",
                                                    isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"
                                                )}
                                            >
                                                {prod.use_inventory && !isOutOfStock && (
                                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-100 rounded-md text-[7px] font-black text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                                        STOCK: {prod.stock_quantity}
                                                    </div>
                                                )}
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 bg-slate-950/5 flex items-center justify-center">
                                                        <div className="bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-full rotate-[-10deg] shadow-lg">AGOTADO</div>
                                                    </div>
                                                )}
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase line-clamp-2 text-slate-900 leading-none mb-1">{prod.name}</p>
                                                    <p className="text-lg font-black italic font-mono text-orange-600 leading-none">{formatPrice(prod.price)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="w-80 bg-white/80 border-l border-slate-200 flex flex-col shrink-0 hidden lg:flex">
                                <div className="p-6 border-b border-slate-200 flex items-center justify-between"><h2 className="text-lg font-black uppercase text-slate-900">{selectedTable?.table_name}</h2><ShoppingBag className="w-5 h-5 text-orange-500" /></div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {cart.map((item, i) => (
                                        <div key={i} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500 text-white flex items-center justify-center rounded-lg font-black text-xs">{item.qty}x</div>
                                                <p className="flex-1 text-[10px] font-bold text-slate-900 uppercase truncate">{item.product.name}</p>
                                                <button onClick={() => removeFromCart(i)}><X className="w-4 h-4 text-rose-400" /></button>
                                            </div>

                                            {/* 📝 QUICK MODIFIERS */}
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {QUICK_MODS.map(mod => (
                                                    <button
                                                        key={mod}
                                                        onClick={() => updateItemNote(i, (item.notes ? item.notes + ", " : "") + mod)}
                                                        className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[7px] font-black text-slate-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all uppercase"
                                                    >
                                                        {mod}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="mt-3 flex gap-1">
                                                <input placeholder="Nota personalizada..." className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] text-slate-600 italic" value={item.notes || ""} onChange={e => updateItemNote(i, e.target.value)} />
                                                <button onClick={() => updateCartQty(i, -1)} className="px-3 bg-white border border-slate-200 rounded-lg font-bold">-</button>
                                                <button onClick={() => updateCartQty(i, 1)} className="px-3 bg-white border border-slate-200 rounded-lg font-bold">+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 border-y border-slate-200 bg-white/50">
                                    <button
                                        onClick={() => setIsPriority(!isPriority)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                            isPriority
                                                ? "bg-amber-50 border-amber-300 shadow-lg shadow-amber-200/50"
                                                : "bg-white border-slate-100 grayscale opacity-40 hover:opacity-100 hover:grayscale-0"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                isPriority ? "bg-amber-400 text-white animate-pulse" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <Star className={cn("w-5 h-5", isPriority && "fill-white")} />
                                            </div>
                                            <div className="text-left">
                                                <p className={cn("text-[10px] font-black uppercase tracking-widest", isPriority ? "text-amber-600" : "text-slate-400")}>Prioridad</p>
                                                <p className={cn("text-xs font-bold italic", isPriority ? "text-amber-900" : "text-slate-600")}>MARCAR COMO VIP</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-12 h-6 rounded-full relative transition-all",
                                            isPriority ? "bg-amber-400" : "bg-slate-200"
                                        )}>
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                                isPriority ? "left-7" : "left-1"
                                            )} />
                                        </div>
                                    </button>
                                </div>
                                <div className="p-6 border-t border-slate-200 bg-slate-50/50 space-y-4">
                                    <div className="space-y-2 border-b border-slate-200 pb-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SUBTOTAL</p>
                                            <p className="text-sm font-bold text-slate-600 font-mono">{formatPrice(cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0))}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">IMPUESTOS ({restaurant?.tax_percentage}%)</p>
                                            <p className="text-sm font-bold text-slate-600 font-mono">{formatPrice(cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0) * ((restaurant?.tax_percentage || 0) / 100))}</p>
                                        </div>
                                        {restaurant?.apply_service_charge && (
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SERVICIO ({restaurant?.service_charge_percentage}%)</p>
                                                <p className="text-sm font-bold text-slate-600 font-mono">{formatPrice(cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0) * ((restaurant?.service_charge_percentage || 0) / 100))}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <p className="text-[10px] font-black text-orange-500 uppercase">TOTAL FINAL</p>
                                        <p className="text-4xl font-black italic text-slate-900 tracking-tighter">
                                            {formatPrice(
                                                cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0) *
                                                (1 + ((restaurant?.tax_percentage || 0) / 100) + (restaurant?.apply_service_charge ? (restaurant?.service_charge_percentage || 0) / 100 : 0))
                                            )}
                                        </p>
                                    </div>
                                    <Button onClick={handleMarchar} disabled={submitting || cart.length === 0} className="w-full h-16 bg-orange-600 text-white font-black uppercase rounded-2xl shadow-xl shadow-orange-600/10 border-b-4 border-orange-800 transition-all active:scale-95 group">
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                            <div className="flex items-center justify-center gap-3">
                                                <ChefHat className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                <span>MARCHAR A COCINA</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                <nav className="p-4 border-t border-slate-200 bg-white/80 lg:hidden flex flex-col gap-4">
                    <button
                        onClick={() => setIsPriority(!isPriority)}
                        className={cn(
                            "w-full h-12 rounded-xl border-2 flex items-center justify-between px-6 transition-all",
                            isPriority ? "bg-amber-50 border-amber-300 text-amber-600" : "border-slate-100 text-slate-400"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Star className={cn("w-4 h-4", isPriority && "fill-amber-500")} />
                            <span className="text-[10px] font-black uppercase italic tracking-widest">PEDIDO VIP / PRIORITARIO</span>
                        </div>
                        <div className={cn(
                            "w-10 h-5 rounded-full relative transition-all",
                            isPriority ? "bg-amber-400" : "bg-slate-200"
                        )}>
                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", isPriority ? "left-6" : "left-1")} />
                        </div>
                    </button>
                    <Button onClick={handleMarchar} disabled={submitting || cart.length === 0} className="flex-1 h-14 bg-orange-600 text-white font-black uppercase rounded-xl text-xs">{submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `MARCHAR ${isPriority ? 'ORDEN VIP' : 'COMANDA'} (${cart.length})`}</Button>
                </nav>

                {/* � KITCHEN CHAT MODAL */}
                {isChatOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsChatOpen(false)} />
                        <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">CHAT <span className="text-orange-500">COCINA</span></h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mensajes rápidos a producción</p>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {["CUBIERTOS", "LIMPIAR MESA", "HIELO BAR", "URGENTE"].map(m => (
                                        <button key={m} onClick={() => setKitchenMsg(m)} className="p-3 border border-slate-100 rounded-2xl text-[10px] font-black hover:bg-orange-50 hover:border-orange-200 transition-all uppercase">{m}</button>
                                    ))}
                                </div>
                                <textarea
                                    placeholder="Escribe un mensaje..."
                                    className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    value={kitchenMsg}
                                    onChange={e => setKitchenMsg(e.target.value)}
                                />
                                <Button onClick={handleSendKitchenMsg} disabled={submitting || !kitchenMsg} className="w-full h-14 bg-orange-600 text-white font-black uppercase rounded-2xl">ENVIAR A COCINA</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🧾 BILL PREVIEW MODAL */}
                {isBillPreview && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsBillPreview(false)} />
                        <div className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-10 border-b border-slate-100 text-center">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{restaurant?.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Pre-Cuenta / Borrador</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 space-y-6 font-mono text-xs text-slate-600">
                                <div className="border-b border-dashed border-slate-200 pb-4 space-y-2">
                                    <p className="flex justify-between uppercase"><span>Mesa</span> <span>{selectedTable?.table_name}</span></p>
                                    <p className="flex justify-between uppercase"><span>Fecha</span> <span>{new Date().toLocaleDateString()}</span></p>
                                </div>
                                <div className="space-y-4">
                                    {(selectedTable as any).items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between gap-4">
                                            <span className="shrink-0">{item.quantity}x</span>
                                            <span className="flex-1 uppercase">{item.products?.name}</span>
                                            <span className="shrink-0">{formatPrice(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-dashed border-slate-200 pt-4 space-y-2 text-sm font-black">
                                    <p className="flex justify-between"><span>SUBTOTAL</span> <span>{formatPrice(selectedTable?.active_order?.total || 0)}</span></p>
                                    <p className="text-[9px] text-slate-400 italic font-normal text-center mt-6 uppercase">Este documento no es una factura válida.</p>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <Button onClick={() => setIsBillPreview(false)} className="flex-1 h-14 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl">CERRAR</Button>
                                <Button onClick={() => window.print()} className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><Briefcase className="w-5 h-5" /></Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🔄 TRANSFER ITEM PICKER */}
                {isTransferMode && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => { setIsTransferMode(false); setItemToTransfer(null); }} />
                        <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                            <div className="p-8 bg-indigo-600 text-white">
                                <h3 className="text-xl font-black italic tracking-tighter uppercase">{itemToTransfer ? 'PASO 2: MESA DESTINO' : 'PASO 1: SELECCIONA ITEM'}</h3>
                                <p className="text-[10px] font-bold text-indigo-200 uppercase mt-1">
                                    {itemToTransfer ? `¿A dónde enviamos ${itemToTransfer.products?.name}?` : '¿Qué producto quieres mover de mesa?'}
                                </p>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {!itemToTransfer ? (
                                    <div className="space-y-3">
                                        {(selectedTable as any).items?.map((item: any) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setItemToTransfer(item)}
                                                className="w-full p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-black italic text-[10px]">{item.quantity}x</div>
                                                    <div>
                                                        <p className="font-black italic text-slate-900 uppercase text-xs">{item.products?.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400">{formatPrice(item.unit_price)}</p>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {realTables.filter(t => t.id !== selectedTable?.id).map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleTransferItem(t.id)}
                                                className={cn(
                                                    "p-6 rounded-[1.5rem] border-2 transition-all flex flex-col items-center justify-center gap-2 active:scale-95",
                                                    t.status === 'occupied' ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white border-slate-100 text-slate-400"
                                                )}
                                            >
                                                <TableIcon className="w-6 h-6" />
                                                <span className="font-black italic uppercase text-xs">{t.table_name}</span>
                                                <span className="text-[8px] font-bold opacity-60 uppercase">{t.status === 'occupied' ? 'OCUPADA' : 'LIBRE'}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-between items-center">
                                {itemToTransfer && (
                                    <button onClick={() => setItemToTransfer(null)} className="text-xs font-black uppercase text-indigo-600">VOLVER</button>
                                )}
                                <button onClick={() => { setIsTransferMode(false); setItemToTransfer(null); }} className="text-xs font-black uppercase text-slate-400 ml-auto">CANCELAR</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* �🔄 SPLIT CHECK MODAL */}
                {isSplitMode && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl pointer-events-auto" onClick={() => setIsSplitMode(false)} />
                        <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">DIVIDIR <span className="text-orange-600">CUENTA</span></h2>
                                    <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1">Selecciona productos para mover</p>
                                </div>
                                <button onClick={() => setIsSplitMode(false)} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-8 flex-1 overflow-y-auto space-y-3 custom-scrollbar max-h-[50vh]">
                                {(selectedTable as any).items?.map((item: any) => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleSplitItem(item.id, item.quantity)}
                                        className={cn(
                                            "w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                            selectedForSplit.some(s => s.itemId === item.id)
                                                ? "bg-orange-50 border-orange-500 shadow-md translate-x-1"
                                                : "bg-white border-slate-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm transition-all",
                                                selectedForSplit.some(s => s.itemId === item.id) ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                {item.quantity}x
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black italic text-slate-900 uppercase text-xs truncate max-w-[200px]">{item.products?.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{formatPrice(item.unit_price)}</p>
                                            </div>
                                        </div>
                                        {selectedForSplit.some(s => s.itemId === item.id) && <CheckCircle2 className="w-6 h-6 text-orange-500" strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100">
                                <Button
                                    onClick={handleSplitCheck}
                                    disabled={submitting || selectedForSplit.length === 0}
                                    className="w-full h-16 bg-slate-900 text-white font-black italic uppercase rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            <ArrowLeftRight className="w-5 h-5 text-orange-500" />
                                            MOVER A NUEVA CUENTA
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                }
                .animate-pulse-red { animation: pulse-red 2s infinite; }
                @keyframes ring {
                    0% { transform: rotate(0); }
                    10% { transform: rotate(20deg); }
                    20% { transform: rotate(-15deg); }
                    30% { transform: rotate(10deg); }
                    40% { transform: rotate(-5deg); }
                    50% { transform: rotate(0); }
                    100% { transform: rotate(0); }
                }
                .animate-ring { animation: ring 1.5s ease infinite; }
            `}</style>
        </div>
    )
}
