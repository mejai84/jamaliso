"use client"

import { Button } from "@/components/ui/button"
import {
    DollarSign,
    CheckCircle2,
    ChefHat,
    X,
    RefreshCcw,
    Plus,
    ShoppingBag,
    Activity,
    Box,
    MonitorIcon,
    ArrowLeft,
    Zap,
    Cpu,
    Loader2,
    ShieldCheck,
    Layers,
    Signal
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { Order, Product } from "./types"

// Components
import { OrderKPI } from "@/components/admin/orders/OrderKPI"
import { OrderCard } from "@/components/admin/orders/OrderCard"
import { EmptyState } from "@/components/admin/orders/EmptyState"
import { CreateOrderModal } from "@/components/admin/orders/CreateOrderModal"
import { OrderDetailModal } from "@/components/admin/orders/OrderDetailModal"

function OrdersContent() {
    const { restaurant } = useRestaurant()
    const searchParams = useSearchParams()
    const orderIdFromUrl = searchParams.get('order')

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newOrderItems, setNewOrderItems] = useState<(Product & { quantity: number })[]>([])
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
    const [selectedTableId, setSelectedTableId] = useState<string>("")
    const [tables, setTables] = useState<any[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [includeTip, setIncludeTip] = useState(true)

    // Split Order State
    const [isSplitting, setIsSplitting] = useState(false)
    const [selectedItemsForSplit, setSelectedItemsForSplit] = useState<{ itemId: string, quantity: number }[]>([])

    // Customer Search State
    const [allCustomers, setAllCustomers] = useState<any[]>([])
    const [customerSearch, setCustomerSearch] = useState("")

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (name)
                    ),
                    tables (table_name)
                `)
                .eq('restaurant_id', restaurant?.id)
                .order('created_at', { ascending: false })

            if (error) {
                const { data: simpleData } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('restaurant_id', restaurant?.id)
                    .order('created_at', { ascending: false })
                setOrders(simpleData?.map(order => ({ ...order, order_items: [], tables: null })) || [])
            } else {
                setOrders(data || [])
            }
        } catch (err) {
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const fetchInitialData = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
            setCurrentUser(profile)
        }
        const { data: tablesData } = await supabase.from('tables').select('*').eq('restaurant_id', restaurant?.id).eq('active', true).order('table_number', { ascending: true })
        setTables(tablesData || [])
        const { data: customers } = await supabase.from('profiles').select('id, full_name, phone, loyalty_points').eq('restaurant_id', restaurant?.id)
        setAllCustomers(customers || [])
        const { data: prodData } = await supabase.from('products').select('*').eq('restaurant_id', restaurant?.id).eq('is_available', true).order('name')
        setProducts(prodData || [])
    }

    useEffect(() => {
        if (restaurant) {
            fetchOrders()
            fetchInitialData()
        }
        const interval = setInterval(() => { if (restaurant) fetchOrders() }, 30000)
        return () => clearInterval(interval)
    }, [restaurant])

    useEffect(() => {
        if (orderIdFromUrl && orders.length > 0) {
            const ord = orders.find(o => o.id === orderIdFromUrl)
            if (ord) setSelectedOrder(ord)
        }
    }, [orderIdFromUrl, orders])

    const handleCreateOrder = async () => {
        if (newOrderItems.length === 0) return alert("Añade productos")
        try {
            const total = newOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
            const orderData = {
                restaurant_id: restaurant?.id,
                status: 'pending',
                order_type: 'pickup',
                total,
                subtotal: total,
                guest_info: {
                    name: customerName || (selectedTableId ? tables.find(t => t.id === selectedTableId)?.table_name : "Cliente Casa"),
                    phone: customerPhone
                },
                user_id: selectedCustomerId,
                payment_method: 'cash',
                payment_status: 'pending',
                waiter_id: currentUser?.id,
                table_id: selectedTableId || null
            }
            const { data: order, error } = await supabase.from('orders').insert([orderData]).select().single()
            if (error) throw error
            const itemsToInsert = newOrderItems.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price
            }))
            await supabase.from('order_items').insert(itemsToInsert)
            if (selectedTableId) await supabase.from('tables').update({ status: 'occupied' }).eq('id', selectedTableId)
            setIsCreateOpen(false); setNewOrderItems([]); setCustomerName(""); setCustomerPhone(""); setSelectedCustomerId(null); setSelectedTableId("");
            fetchOrders(); toast.success("ORDEN DE COMANDA REGISTRADA")
        } catch (e: any) { toast.error("Error al crear: " + e.message) }
    }

    const selectCustomer = (c: any) => {
        setSelectedCustomerId(c.id); setCustomerName(c.full_name); setCustomerPhone(c.phone || ""); setCustomerSearch("")
    }

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('orders').update({ status }).eq('id', id)
        fetchOrders(); setSelectedOrder(null); toast.info(`Estado de orden actualizado a ${status.toUpperCase()}`)
    }

    const handlePayment = async (method: string, order: Order) => {
        if (!currentUser) return toast.error("Sesión no detectada")
        const tip = includeTip && restaurant?.apply_service_charge ? (order.total * (restaurant.service_charge_percentage! / 100)) : 0
        const total = order.total + tip
        if (method === 'cash' || method === 'credit') {
            if (!confirm(`¿Confirmas el pago via ${method.toUpperCase()} por $${total.toLocaleString()}?`)) return
        }
        try {
            const { processOrderPayment } = await import("@/actions/pos")
            const res = await processOrderPayment(order.id, currentUser.id, method as any, total, tip)
            if (res.success) {
                fetchOrders(); setSelectedOrder(null); toast.success(`VENTA REGISTRADA [$${method.toUpperCase()}]`)
            } else toast.error(res.error)
        } catch (e: any) { toast.error(e.message) }
    }

    const activeProcessing = orders.filter(o => ['pending', 'preparing'].includes(o.status))
    const paymentPending = orders.filter(o => ['ready', 'payment_pending', 'out_for_delivery'].includes(o.status))
    const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status))

    return (
        <div className="min-h-screen bg-transparent text-foreground p-4 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent pointer-events-none z-0" />
            <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-20 z-0 animate-pulse" />

            <div className="max-w-[1700px] mx-auto space-y-16 animate-in fade-in duration-1000 relative z-10">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 border-b border-border/50 pb-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2.5rem] bg-card border border-border shadow-3xl hover:bg-muted active:scale-90 transition-all group overflow-hidden relative">
                                <ArrowLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform relative z-10" />
                            </Button>
                        </Link>
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-foreground text-glow whitespace-nowrap">CENTRO DE <span className="text-primary italic">PEDIDOS</span></h1>
                                <div className="px-5 py-2 bg-primary/10 border-2 border-primary/20 rounded-[1.5rem] text-[11px] font-black text-primary tracking-[0.3em] italic uppercase shadow-xl animate-pulse flex items-center gap-3">
                                    <ShoppingBag className="w-4 h-4" /> OPERATIONS_ENGINE_V4
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.5em] italic flex items-center gap-4 opacity-60">
                                <Zap className="w-5 h-5 text-primary" /> Auditoría de Comanda, Despacho & Flujo de Caja
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <Button onClick={() => setIsCreateOpen(true)} className="h-20 px-10 bg-foreground text-background hover:bg-primary hover:text-white font-black uppercase text-xs tracking-[0.4em] italic rounded-[2.5rem] shadow-3xl transition-all gap-5 border-none group active:scale-95 whitespace-nowrap">
                            <Plus className="w-7 h-7 group-hover:scale-110 transition-transform" /> NUEVO PEDIDO ELITE
                        </Button>
                        <Link href="/admin/kitchen">
                            <Button variant="ghost" className="h-20 px-10 rounded-[2.5rem] bg-card border-4 border-border/40 font-black uppercase text-xs tracking-[0.4em] italic shadow-3xl transition-all gap-5 hover:border-primary/40 group active:scale-95">
                                <ChefHat className="w-7 h-7 group-hover:scale-110 transition-transform text-primary" /> MONITOR COCINA
                            </Button>
                        </Link>
                        <Button onClick={fetchOrders} variant="ghost" className="h-20 w-20 bg-card border-4 border-border/40 rounded-[2.5rem] hover:text-primary hover:border-primary/40 shadow-3xl transition-all group/btn active:scale-95">
                            <RefreshCcw className={cn("w-8 h-8 group-hover/btn:rotate-180 transition-transform duration-700", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    <OrderKPI label="En Producción" value={activeProcessing.length} color="text-orange-500" icon={<ChefHat className="w-20 h-20" />} sub="KITCHEN_NODES" delay={0} highlight />
                    <OrderKPI label="Por Cobrar" value={paymentPending.length} color="text-rose-500" icon={<DollarSign className="w-20 h-20" />} sub="CASH_DUE_NOW" delay={100} />
                    <OrderKPI label="Despachos Hoy" value={completedOrders.length} color="text-emerald-500" icon={<CheckCircle2 className="w-20 h-20" />} sub="COMPLETED_SYC" delay={200} />
                    <OrderKPI label="Ventas Brutas" value={`$${orders.reduce((a, b) => a + b.total, 0).toLocaleString()}`} color="text-blue-500" icon={<Activity className="w-20 h-20" />} sub="TOTAL_GROSS_REVENUE" delay={300} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 px-8 py-4 bg-orange-500/5 border border-orange-500/20 rounded-full w-fit">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <h2 className="text-[10px] font-black text-orange-500 tracking-[0.4em] uppercase italic leading-none">Producción Activa</h2>
                        </div>
                        <div className="space-y-6">
                            {activeProcessing.map((order, idx) => (
                                <OrderCard key={order.id} order={order} onView={() => setSelectedOrder(order)} delay={idx * 50} />
                            ))}
                            {activeProcessing.length === 0 && <EmptyState label="LISTA DE COMANDA VACÍA" sub="NO SE DETECTAN PEDIDOS EN TRÁNSITO DE FOGÓN" icon={<Cpu className="w-16 h-16" />} />}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4 px-8 py-4 bg-rose-500/5 border border-rose-500/20 rounded-full w-fit shadow-lg shadow-rose-500/10">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                            <h2 className="text-[10px] font-black text-rose-500 tracking-[0.4em] uppercase italic leading-none">Pendiente de Cierre</h2>
                        </div>
                        <div className="space-y-6">
                            {paymentPending.map((order, idx) => (
                                <OrderCard key={order.id} order={order} onView={() => setSelectedOrder(order)} delay={idx * 50} isCritical />
                            ))}
                            {paymentPending.length === 0 && <EmptyState label="SIN CUENTAS PENDIENTES" sub="TODAS LAS MESAS HAN SIDO CONCILIADAS" icon={<ShieldCheck className="w-16 h-16" />} />}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4 px-8 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-full w-fit opacity-60">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <h2 className="text-[10px] font-black text-emerald-500 tracking-[0.4em] uppercase italic leading-none">Historial Reciente</h2>
                        </div>
                        <div className="space-y-6 opacity-40 hover:opacity-100 transition-opacity">
                            {completedOrders.slice(0, 10).map((order, idx) => (
                                <OrderCard key={order.id} order={order} onView={() => setSelectedOrder(order)} delay={idx * 50} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-foreground rounded-[4rem] text-background flex flex-col md:flex-row items-center justify-between shadow-3xl group/metric relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/metric:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-10 relative z-10">
                        <div className="w-20 h-20 rounded-[2rem] bg-background/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl group-hover/metric:rotate-12 transition-transform duration-500">
                            <MonitorIcon className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,77,0,0.6)]" />
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Master Operations Hub</h4>
                            <p className="text-[10px] text-background/40 font-black uppercase tracking-[0.4em] italic leading-none">SYSTEM v8.42 • KERNEL OPTIMIZED FOR POS_REALTIME_SYNC</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-12 mt-8 md:mt-0 relative z-10">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-1 italic">Active Nodes</p>
                            <p className="text-2xl font-black italic tracking-tighter text-emerald-500">{orders.length} PEDIDOS ACTIVOS</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-1 italic">Network Health</p>
                            <p className="text-2xl font-black italic tracking-tighter text-white">SA-EAST_TRANSIT</p>
                        </div>
                    </div>
                </div>
            </div>

            <CreateOrderModal
                isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                products={products} newOrderItems={newOrderItems} setNewOrderItems={setNewOrderItems}
                customerSearch={customerSearch} setCustomerSearch={setCustomerSearch}
                allCustomers={allCustomers} selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId}
                customerName={customerName} setCustomerName={setCustomerName}
                customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
                selectedTableId={selectedTableId} setSelectedTableId={setSelectedTableId}
                tables={tables} onSubmit={handleCreateOrder} onSelectCustomer={selectCustomer}
            />

            <OrderDetailModal
                order={selectedOrder} onClose={() => setSelectedOrder(null)}
                isSplitting={isSplitting} setIsSplitting={setIsSplitting}
                selectedItemsForSplit={selectedItemsForSplit} setSelectedItemsForSplit={setSelectedItemsForSplit}
                restaurant={restaurant} includeTip={includeTip} setIncludeTip={setIncludeTip}
                onUpdateStatus={updateStatus} onHandlePayment={handlePayment}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,102,0,0.1); border-radius: 20px; }
                .text-glow { text-shadow: 0 0 20px rgba(255,102,0,0.2); }
            `}</style>
        </div>
    )
}

export default function AdminOrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="flex flex-col items-center gap-8">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Sincronizando Historial Táctico...</p>
                </div>
            </div>
        }>
            <OrdersContent />
        </Suspense>
    )
}
