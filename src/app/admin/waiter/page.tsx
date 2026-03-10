"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useRestaurant } from "@/providers/RestaurantProvider"
import {
    createOrderWithNotes,
    addItemsToOrder,
    mergeTables,
    transferOrderItem,
    sendKitchenMessage,
    splitOrder,
    voidFullOrder,
    voidOrderItem,
    updateOrderStatusSecure,
    requestPayment
} from "@/actions/orders-fixed"
import { toast } from "sonner"
import { Table, Product, Category, CartItem } from "./types"

// Components
import { WaiterHeader } from "@/components/admin/waiter/WaiterHeader"
import { TableGrid } from "@/components/admin/waiter/TableGrid"
import { TableOptions } from "@/components/admin/waiter/TableOptions"
import { OrderInterface } from "@/components/admin/waiter/OrderInterface"
import { InternalChatModal } from "@/components/shared/InternalChatModal"
import { BillPreviewModal } from "@/components/admin/waiter/BillPreviewModal"
import { TransferItemModal } from "@/components/admin/waiter/TransferItemModal"
import { SplitCheckModal } from "@/components/admin/waiter/SplitCheckModal"
import { VoidAuthModal } from "@/components/admin/orders/VoidAuthModal"
import { ActiveOrderNotesModal } from "@/components/admin/waiter/ActiveOrderNotesModal"

export default function WaiterAppPremium() {
    const { restaurant, loading: contextLoading } = useRestaurant()
    const router = useRouter()

    // UI State
    const [view, setView] = useState<'tables' | 'order' | 'options'>('tables')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isNotesOpen, setIsNotesOpen] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Data State
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [realTables, setRealTables] = useState<Table[]>([])

    // Order/Cart State
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [orderNotes, setOrderNotes] = useState("")
    const [isPriority, setIsPriority] = useState(false)

    // Modal/Mode States
    const [isBillPreview, setIsBillPreview] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [kitchenMsg, setKitchenMsg] = useState("")
    const [waiterEmail, setWaiterEmail] = useState("Mesero")
    const [mergeMode, setMergeMode] = useState<{ active: boolean, sourceId: string | null }>({ active: false, sourceId: null })
    const [isTransferMode, setIsTransferMode] = useState(false)
    const [itemToTransfer, setItemToTransfer] = useState<any>(null)
    const [isSplitMode, setIsSplitMode] = useState(false)
    const [selectedForSplit, setSelectedForSplit] = useState<{ itemId: string, quantity: number }[]>([])
    const [pendingSync, setPendingSync] = useState<any[]>([])
    const [voidAuth, setVoidAuth] = useState<{ active: boolean, type: 'order' | 'item' | 'release', id: string, extra?: any } | null>(null)

    // Load pending orders + waiter email on mount
    useEffect(() => {
        const saved = localStorage.getItem('jamali_pending_orders')
        if (saved) setPendingSync(JSON.parse(saved))
        // Get waiter name for chat
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.email) setWaiterEmail(data.user.email.split('@')[0])
        })
    }, [])

    // Background Sync Effect
    useEffect(() => {
        const syncInterval = setInterval(async () => {
            if (pendingSync.length > 0 && navigator.onLine) {
                console.log("Attempting to sync pending orders...", pendingSync.length)
                const toSync = [...pendingSync]
                const remaining = []

                for (const order of toSync) {
                    try {
                        const result = await createOrderWithNotes(order)
                        if (!result.success) remaining.push(order)
                        else {
                            toast.success(`PEDIDO SINCRONIZADO: MESA ${order.table_id.substring(0, 4)}...`)
                        }
                    } catch (e) {
                        remaining.push(order)
                    }
                }

                setPendingSync(remaining)
                localStorage.setItem('jamali_pending_orders', JSON.stringify(remaining))
            }
        }, 30000) // Every 30 seconds

        return () => clearInterval(syncInterval)
    }, [pendingSync])

    // ⚡ Real-time subscription + data fetch
    useEffect(() => {
        if (!contextLoading && restaurant) {
            fetchData()
            const timer = setInterval(() => setCurrentTime(new Date()), 10000)

            // Real-time: escuchar cambios de órdenes (cocina marca ready, nuevos pedidos, etc.)
            const channel = supabase.channel('waiter-orders-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` }, (payload) => {
                    fetchData()
                    if (payload.eventType === 'UPDATE' && (payload.new as any)?.status === 'ready') {
                        toast.info('🍽️ PEDIDO LISTO PARA ENTREGAR', { duration: 8000, icon: '✅' })
                    }
                })
                .subscribe()

            return () => { clearInterval(timer); supabase.removeChannel(channel) }
        }
    }, [restaurant, contextLoading])

    const fetchData = async () => {
        console.log("Fetching Waiter Data...", { restaurantId: restaurant?.id, contextLoading })
        if (!restaurant) {
            setLoading(false)
            return
        }
        setLoading(true)

        try {
            const [catsRes, prodsRes, tabsRes] = await Promise.all([
                supabase.from('categories').select('*').eq('restaurant_id', restaurant.id),
                supabase.from('products').select('*').eq('restaurant_id', restaurant.id).eq('is_available', true),
                supabase.from('tables').select('*').eq('restaurant_id', restaurant.id).order('table_number')
            ])

            if (catsRes.data) setCategories(catsRes.data)
            if (prodsRes.data) setProducts(prodsRes.data as any)

            if (tabsRes.data) {
                const tables = tabsRes.data as any[]
                const { data: activeOrders } = await supabase
                    .from('orders')
                    .select('id, table_id, total, status, priority, created_at')
                    .eq('restaurant_id', restaurant.id)
                    .in('status', ['pending', 'preparing', 'ready', 'delivered', 'payment_requested'])
                    .order('created_at', { ascending: false })

                // Fix: Para cada mesa, encontrar SOLO la orden más reciente (evita "mesa zombi")
                const enrichedTables = tables.map(t => {
                    const tableOrders = (activeOrders || []).filter(o => o.table_id === t.id)
                    const latestOrder = tableOrders.length > 0 ? tableOrders[0] : null

                    return {
                        ...t,
                        active_order: latestOrder ? {
                            id: latestOrder.id,
                            total: latestOrder.total,
                            status: latestOrder.status,
                            priority: latestOrder.priority,
                            created_at: latestOrder.created_at
                        } : undefined,
                        active_orders: tableOrders // Guardamos todas las órdenes para soporte de cuentas paralelas
                    }
                })
                setRealTables(enrichedTables)
            }
        } catch (error) {
            console.error("Waiter Portal Error:", error)
        } finally {
            setLoading(false)
        }
    }

    // Cart Actions
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

    const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index))
    const updateCartQty = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
    }
    const updateItemNote = (index: number, note: string) => {
        setCart(prev => prev.map((item, i) => i === index ? { ...item, notes: note } : item))
    }

    // Business Logic Actions
    const handleMarchar = async () => {
        if (!selectedTable || cart.length === 0 || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Sesión no válida")

            const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0)
            const taxRate = (restaurant?.tax_percentage || 0) / 100
            const serviceRate = (restaurant?.service_charge_percentage || 0) / 100
            const tax = cartSubtotal * taxRate
            const serviceCharge = (restaurant?.apply_service_charge) ? (cartSubtotal * serviceRate) : 0

            const orderData = {
                restaurant_id: restaurant!.id,
                user_id: user.id,
                waiter_id: user.id,
                table_id: selectedTable.id,
                items: cart.map(i => ({
                    product_id: i.product.id,
                    quantity: i.qty,
                    unit_price: i.product.price,
                    subtotal: i.product.price * i.qty,
                    notes: i.notes
                })),
                subtotal: cartSubtotal,
                tax,
                service_charge: serviceCharge,
                total: cartSubtotal + tax + serviceCharge,
                notes: orderNotes,
                priority: isPriority
            }

            try {
                const result = await createOrderWithNotes(orderData)
                if (result.success) {
                    await supabase.from('tables').update({ status: 'occupied' }).eq('id', selectedTable.id)
                    toast.success("COMANDA ENVIADA A COCINA")
                    setCart([]); setOrderNotes(""); setIsPriority(false); setView('tables');
                    fetchData()
                } else {
                    throw new Error(result.error)
                }
            } catch (err: any) {
                // Si falla por red, guardamos localmente
                if (!navigator.onLine || err.message.includes("fetch") || err.message.includes("network")) {
                    const newPending = [...pendingSync, orderData]
                    setPendingSync(newPending)
                    localStorage.setItem('jamali_pending_orders', JSON.stringify(newPending))
                    toast.warning("SIN CONEXIÓN: Pedido guardado localmente. Se enviará automáticamente al volver el Wi-Fi.", { duration: 10000 })
                    setCart([]); setOrderNotes(""); setIsPriority(false); setView('tables');
                } else {
                    toast.error(err.message)
                }
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeliverOrder = async () => {
        if (!selectedTable?.active_order || submitting) return
        setSubmitting(true)
        try {
            const result = await updateOrderStatusSecure(selectedTable.active_order.id, 'delivered')
            if (result.success) {
                toast.success("ORDEN ENTREGADA")
                setView('tables'); fetchData()
            } else {
                toast.error(result.error || "Error al entregar")
            }
        } finally { setSubmitting(false) }
    }

    const handleSplitCheck = async () => {
        if (!selectedTable?.active_order || selectedForSplit.length === 0 || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const result = await splitOrder(selectedTable.active_order.id, selectedForSplit, user.id)
            if (result.success) {
                toast.success("CUENTA DIVIDIDA")
                setIsSplitMode(false); setSelectedForSplit([]); setView('tables'); fetchData()
            }
        } catch (e: any) { toast.error(e.message) } finally { setSubmitting(false) }
    }

    const toggleSplitItem = (itemId: string, maxQty: number) => {
        setSelectedForSplit(prev => prev.find(i => i.itemId === itemId) ? prev.filter(i => i.itemId !== itemId) : [...prev, { itemId, quantity: 1 }])
    }

    const handleMergeTables = async (targetId: string) => {
        if (!mergeMode.sourceId || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Sesión no válida")
                return
            }
            const result = await mergeTables(mergeMode.sourceId, targetId, user.id)
            if (result.success) {
                toast.success("MESAS UNIDAS EXITOSAMENTE")
                setMergeMode({ active: false, sourceId: null })
                setView('tables')
                await fetchData()
            } else {
                toast.error(result.error || "No se pudo unir las mesas")
            }
        } catch (e: any) {
            toast.error("Error de red: " + e.message)
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
                toast.success("ÍTEM TRANSFERIDO");
                setIsTransferMode(false);
                setItemToTransfer(null);
                setView('tables');
                await fetchData();
            } else {
                toast.error(result.error || "Ocurrió un error al transferir");
            }
        } catch (e: any) {
            toast.error(e.message || "Error de red");
        } finally {
            setSubmitting(false);
        }
    }

    const handleSendKitchenMsg = async () => {
        if (!kitchenMsg || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const result = await sendKitchenMessage(restaurant!.id, user?.email || "Mesero", kitchenMsg)
            if (result.success) {
                toast.success("MENSAJE ENVIADO"); setKitchenMsg(""); setIsChatOpen(false)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleConfirmVoid = async (pin: string, reason: string) => {
        if (!voidAuth || submitting) return
        setSubmitting(true)
        try {
            let result;
            if (voidAuth.type === 'order') {
                result = await voidFullOrder(voidAuth.id, pin, reason)
            } else if (voidAuth.type === 'item') {
                result = await voidOrderItem(voidAuth.id, pin, reason)
            } else if (voidAuth.type === 'release') {
                if (selectedTable?.active_order) {
                    result = await voidFullOrder(selectedTable.active_order.id, pin, "FORCAR LIBERACIÓN: " + reason)
                } else {
                    const { error } = await supabase.from('tables').update({ status: 'free' }).eq('id', voidAuth.id)
                    result = { success: !error, error: error?.message }
                }
            }

            if (result?.success) {
                toast.success("OPERACIÓN AUTORIZADA Y REGISTRADA")
                setVoidAuth(null)
                setView('tables')
                fetchData()
            } else {
                toast.error(result?.error || "Error en la operación")
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen bg-[#F8FAFC]">
            {/* 🖼️ FONDO PREMIUM (Synced with Dashboard) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-[0.15]" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full animate-in fade-in duration-1000">
                <WaiterHeader
                    view={view}
                    onBack={() => setView('tables')}
                    onOpenChat={() => setIsChatOpen(true)}
                />

                <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                    {view === 'tables' ? (
                        <TableGrid
                            loading={loading}
                            tables={realTables}
                            mergeMode={mergeMode}
                            currentTime={currentTime}
                            onCancelMerge={() => setMergeMode({ active: false, sourceId: null })}
                            onMerge={handleMergeTables}
                            onTableClick={(table) => {
                                setSelectedTable(table)
                                setView((table.status === 'occupied' && table.active_order) ? 'options' : 'order')
                            }}
                            onFetchData={fetchData}
                        />
                    ) : view === 'options' ? (
                        <TableOptions
                            table={selectedTable!}
                            submitting={submitting}
                            onAddItems={() => setView('order')}
                            onBillPreview={async (orderId) => {
                                const targetId = orderId || selectedTable?.active_order?.id
                                if (!targetId) return
                                const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', targetId)
                                if (items) { (selectedTable as any).items = items; setIsBillPreview(true) }
                            }}
                            onMergeTables={() => setMergeMode({ active: true, sourceId: selectedTable?.id || null })}
                            onSplitCheck={async (orderId) => {
                                const targetId = orderId || selectedTable?.active_order?.id
                                if (!targetId) return
                                const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', targetId)
                                if (items) { (selectedTable as any).items = items; (selectedTable as any).active_order_id = targetId; setIsSplitMode(true) }
                            }}
                            onTransferItems={async (orderId) => {
                                const targetId = orderId || selectedTable?.active_order?.id
                                if (!targetId) return
                                const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', targetId)
                                if (items) { (selectedTable as any).items = items; (selectedTable as any).active_order_id = targetId; setIsTransferMode(true) }
                            }}
                            onPay={async (orderId) => {
                                const targetId = orderId || selectedTable?.active_order?.id
                                if (!targetId) return;
                                setSubmitting(true);
                                try {
                                    const result = await requestPayment(targetId)
                                    if (result.success) {
                                        toast.success("COBRO NOTIFICADO AL CAJERO", {
                                            description: "La cuenta ha sido solicitada. Dirija al cliente a caja.",
                                            icon: "🔔"
                                        });
                                    } else {
                                        toast.error(result.error || "Error al solicitar cobro")
                                    }
                                    setView('tables');
                                    fetchData();
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            onDeliver={async (orderId) => {
                                const targetId = orderId || selectedTable?.active_order?.id
                                if (!targetId || submitting) return
                                setSubmitting(true)
                                try {
                                    const result = await updateOrderStatusSecure(targetId, 'delivered')
                                    if (result.success) {
                                        toast.success("ORDEN ENTREGADA")
                                        setView('tables'); fetchData()
                                    } else {
                                        toast.error(result.error || "Error al entregar")
                                    }
                                } finally { setSubmitting(false) }
                            }}
                            onManageNotes={async (orderId) => {
                                const targetId = orderId || selectedTable?.active_order?.id
                                if (!targetId) return
                                const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', targetId)
                                if (items) { (selectedTable as any).items = items; (selectedTable as any).active_order_id = targetId; setIsNotesOpen(true) }
                            }}
                            onRelease={() => {
                                setVoidAuth({ active: true, type: 'release', id: selectedTable!.id })
                            }}
                            onVoidOrder={(orderId) => {
                                setVoidAuth({ active: true, type: 'order', id: orderId || selectedTable!.active_order?.id || '' })
                            }}
                        />
                    ) : (
                        <OrderInterface
                            table={selectedTable}
                            categories={categories}
                            products={products}
                            cart={cart}
                            activeCategory={activeCategory}
                            searchTerm={searchTerm}
                            submitting={submitting}
                            isPriority={isPriority}
                            restaurant={restaurant}
                            orderNotes={orderNotes} // Pass orderNotes
                            onUpdateOrderNotes={setOrderNotes} // Pass setter
                            onAddToCart={addToCart}
                            onRemoveFromCart={removeFromCart}
                            onUpdateCartQty={updateCartQty}
                            onUpdateItemNote={updateItemNote}
                            onTogglePriority={() => setIsPriority(!isPriority)}
                            onMarchar={handleMarchar}
                            setActiveCategory={setActiveCategory}
                            setSearchTerm={setSearchTerm}
                        />
                    )}
                </main>
            </div>

            {/* Modals */}
            <InternalChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                restaurantId={restaurant?.id || ''}
                myArea="waiter"
                myName={waiterEmail}
            />

            <BillPreviewModal
                isOpen={isBillPreview}
                onClose={() => setIsBillPreview(false)}
                table={selectedTable}
                restaurant={restaurant}
            />

            <TransferItemModal
                isOpen={isTransferMode}
                onClose={() => { setIsTransferMode(false); setItemToTransfer(null) }}
                table={selectedTable}
                allTables={realTables}
                itemToTransfer={itemToTransfer}
                setItemToTransfer={setItemToTransfer}
                onTransfer={handleTransferItem}
            />

            <SplitCheckModal
                isOpen={isSplitMode}
                onClose={() => setIsSplitMode(false)}
                table={selectedTable}
                selectedItems={selectedForSplit}
                onToggleItem={toggleSplitItem}
                onSplit={handleSplitCheck}
                submitting={submitting}
            />

            {voidAuth?.active && (
                <VoidAuthModal
                    title={voidAuth.type === 'release' ? "AUTORIZAR LIBERACIÓN" : "AUTORIZAR ANULACIÓN"}
                    description={
                        voidAuth.type === 'release'
                            ? "La liberación manual de mesas activas es un evento de alta prioridad."
                            : "Esta acción quedará registrada en el log de auditoría del restaurante."
                    }
                    onConfirm={handleConfirmVoid}
                    onCancel={() => setVoidAuth(null)}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                }
                .animate-pulse-red { animation: pulse-red 2s infinite; }
            `}</style>
            {/* 📝 MODAL DE OBSERVACIONES ACTIVAS */}
            <ActiveOrderNotesModal
                isOpen={isNotesOpen}
                onClose={() => setIsNotesOpen(false)}
                table={selectedTable}
                onRefresh={fetchData}
            />
        </div >
    )
}
