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
    splitOrder
} from "@/actions/orders-fixed"
import { toast } from "sonner"
import { Table, Product, Category, CartItem } from "./types"

// Components
import { WaiterHeader } from "@/components/admin/waiter/WaiterHeader"
import { TableGrid } from "@/components/admin/waiter/TableGrid"
import { TableOptions } from "@/components/admin/waiter/TableOptions"
import { OrderInterface } from "@/components/admin/waiter/OrderInterface"
import { KitchenChatModal } from "@/components/admin/waiter/KitchenChatModal"
import { BillPreviewModal } from "@/components/admin/waiter/BillPreviewModal"
import { TransferItemModal } from "@/components/admin/waiter/TransferItemModal"
import { SplitCheckModal } from "@/components/admin/waiter/SplitCheckModal"

export default function WaiterAppPremium() {
    const { restaurant, loading: contextLoading } = useRestaurant()
    const router = useRouter()

    // UI State
    const [view, setView] = useState<'tables' | 'order' | 'options'>('tables')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
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
    const [mergeMode, setMergeMode] = useState<{ active: boolean, sourceId: string | null }>({ active: false, sourceId: null })
    const [isTransferMode, setIsTransferMode] = useState(false)
    const [itemToTransfer, setItemToTransfer] = useState<any>(null)
    const [isSplitMode, setIsSplitMode] = useState(false)
    const [selectedForSplit, setSelectedForSplit] = useState<{ itemId: string, quantity: number }[]>([])

    useEffect(() => {
        if (!contextLoading) {
            fetchData()
            const timer = setInterval(() => setCurrentTime(new Date()), 10000)
            return () => clearInterval(timer)
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

            const result = await createOrderWithNotes(orderData)
            if (result.success) {
                await supabase.from('tables').update({ status: 'occupied' }).eq('id', selectedTable.id)
                toast.success("COMANDA ENVIADA A COCINA")
                setCart([]); setOrderNotes(""); setIsPriority(false); setView('tables');
                fetchData()
            } else toast.error(result.error)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeliverOrder = async () => {
        if (!selectedTable?.active_order || submitting) return
        setSubmitting(true)
        try {
            const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', selectedTable.active_order.id)
            if (!error) {
                toast.success("ORDEN ENTREGADA")
                setView('tables'); fetchData()
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
            if (!user) return
            const result = await mergeTables(mergeMode.sourceId, targetId, user.id)
            if (result.success) {
                toast.success("MESAS UNIDAS"); setMergeMode({ active: false, sourceId: null }); fetchData()
            } else toast.error(result.error)
        } finally { setSubmitting(false) }
    }

    const handleTransferItem = async (targetTableId: string) => {
        if (!itemToTransfer || !selectedTable?.active_order || submitting) return
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const result = await transferOrderItem(selectedTable.active_order.id, targetTableId, itemToTransfer.id, 1, user.id)
            if (result.success) {
                toast.success("ÍTEM TRANSFERIDO"); setIsTransferMode(false); setItemToTransfer(null); setView('tables'); fetchData()
            }
        } finally { setSubmitting(false) }
    }

    const handleSendKitchenMsg = async () => {
        if (!kitchenMsg || submitting) return
        setSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()
        const result = await sendKitchenMessage(restaurant!.id, user?.email || "Mesero", kitchenMsg)
        if (result.success) {
            toast.success("MENSAJE ENVIADO"); setKitchenMsg(""); setIsChatOpen(false)
        }
        setSubmitting(false)
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

                <main className="flex-1 overflow-hidden relative">
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
                                setView(table.status === 'occupied' ? 'options' : 'order')
                            }}
                            onFetchData={fetchData}
                        />
                    ) : view === 'options' ? (
                        <TableOptions
                            table={selectedTable!}
                            submitting={submitting}
                            onAddItems={() => setView('order')}
                            onBillPreview={async () => {
                                const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', selectedTable?.active_order?.id)
                                if (items) { (selectedTable as any).items = items; setIsBillPreview(true) }
                            }}
                            onMergeTables={() => setMergeMode({ active: true, sourceId: selectedTable?.id || null })}
                            onSplitCheck={async () => {
                                const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', selectedTable?.active_order?.id)
                                if (items) { (selectedTable as any).items = items; setIsSplitMode(true) }
                            }}
                            onTransferItems={async () => {
                                const { data: items } = await supabase.from('order_items').select('*, products(name)').eq('order_id', selectedTable?.active_order?.id)
                                if (items) { (selectedTable as any).items = items; setIsTransferMode(true) }
                            }}
                            onPay={() => router.push(`/admin/pos?table=${selectedTable?.id}`)}
                            onDeliver={handleDeliverOrder}
                            onRelease={async () => {
                                if (!confirm("¿LIBERAR MESA?")) return
                                await supabase.from('tables').update({ status: 'free' }).eq('id', selectedTable?.id)
                                fetchData(); setView('tables')
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
            <KitchenChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                kitchenMsg={kitchenMsg}
                setKitchenMsg={setKitchenMsg}
                onSend={handleSendKitchenMsg}
                submitting={submitting}
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
        </div >
    )
}
