"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { Order, OrderStatus, PrepStation, STATUS_COLUMNS } from "./types"

// Components
import { KitchenHeader } from "@/components/admin/kitchen/KitchenHeader"
import { OrderColumn } from "@/components/admin/kitchen/OrderColumn"
import { ProductionSummaryModal } from "@/components/admin/kitchen/ProductionSummaryModal"
import { StockManagerModal } from "@/components/admin/kitchen/StockManagerModal"

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
        setExpandedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId])
    }

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        if (restaurant) { fetchData(); fetchStations(); }
        const channel = supabase.channel('kitchen-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
                fetchData(); playSound('new'); toast.info("¡NUEVA COMANDA ENTRANTE!");
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchData())
            .subscribe()

        const alertInterval = setInterval(() => {
            if (isMuted) return
            const lateOrders = orders.filter(o => {
                const minutes = Math.floor((new Date().getTime() - new Date(o.created_at).getTime()) / 60000)
                return minutes >= 10 && (o.status === 'pending' || o.status === 'preparing')
            })
            if (lateOrders.length > 0) { playSound('alert'); toast.error("HAY COMANDAS EN CRÍTICO (RETRASADAS)", { duration: 5000 }); }
        }, 30000)

        return () => { clearInterval(timer); clearInterval(alertInterval); supabase.removeChannel(channel); }
    }, [restaurant, orders.length, isMuted])

    useEffect(() => { if (isStockOpen) fetchAllProducts(); }, [isStockOpen])

    const fetchAllProducts = async () => {
        const { data } = await supabase.from('products').select('*').eq('restaurant_id', restaurant?.id).order('name')
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
        const { data, error } = await supabase.from('prep_stations').select('*').eq('restaurant_id', restaurant.id).eq('is_active', true).order('name')
        if (!error && data) setStations(data)
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('orders').select(`*, tables (table_name), order_items (id, quantity, notes, status, products (id, name, station_id, preparation_time))`)
                .eq('restaurant_id', restaurant?.id).in('status', ['pending', 'preparing', 'ready']).order('created_at', { ascending: true })
            if (!error && data) {
                if (data.length > orders.length && lastOrderCount > 0) playSound('new')
                setOrders(data as Order[]); setLastOrderCount(data.length)
            }
        } finally { setLoading(false) }
    }

    const updateStatus = async (id: string, newStatus: OrderStatus) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
        if (!error) { fetchData(); toast.success(`PEDIDO ACTUALIZADO`); }
    }

    const updateItemStatus = async (itemId: string, newStatus: string, orderId: string, currentOrderStatus: string) => {
        const { error } = await supabase.from('order_items').update({ status: newStatus }).eq('id', itemId)
        if (!error) {
            if (currentOrderStatus === 'pending') await supabase.from('orders').update({ status: 'preparing' }).eq('id', orderId)
            fetchData(); toast.success(`ÍTEM ACTUALIZADO`);
        } else toast.error("Error al actualizar ítem")
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

    const filteredOrders = orders.map(order => {
        if (activeStationId === "TODAS") return order;
        const stationItems = order.order_items.filter(item => item.products?.station_id === activeStationId);
        if (stationItems.length === 0) return null;
        return { ...order, order_items: stationItems };
    }).filter(Boolean) as Order[];

    const productionSummary = filteredOrders.filter(o => o.status !== 'ready').flatMap(o => o.order_items).filter(i => i.status !== 'ready')
        .reduce((acc: any, item: any) => { const name = item.products?.name || 'Desconocido'; acc[name] = (acc[name] || 0) + item.quantity; return acc; }, {})

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const priorityA = a.priority ? 1 : 0; const priorityB = b.priority ? 1 : 0;
        if (priorityA !== priorityB) return priorityB - priorityA;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen">
            {/* 🖼️ FONDO PREMIUM PIXORA (Standardized Across Modules) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-6 md:p-10 flex-1 flex flex-col overflow-hidden max-w-[1800px] mx-auto w-full animate-in fade-in duration-1000">
                <KitchenHeader
                    stations={stations}
                    activeStationId={activeStationId}
                    onStationChange={setActiveStationId}
                    activePreparingCount={filteredOrders.filter(o => o.status === 'preparing').length}
                    onOpenSummary={() => setIsSummaryOpen(true)}
                    onOpenStock={() => setIsStockOpen(true)}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted(!isMuted)}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
                    {STATUS_COLUMNS.map(column => (
                        <OrderColumn
                            key={column.id}
                            status={column.id}
                            label={column.label}
                            orders={sortedOrders}
                            expandedOrders={expandedOrders}
                            onToggleOrderExpand={toggleOrderExpand}
                            onUpdateStatus={updateStatus}
                            onUpdateItemStatus={updateItemStatus}
                            getElapsedFormatted={getElapsedFormatted}
                            getMinutes={getMinutes}
                            getTimeStyles={getTimeStyles}
                            stations={stations}
                            activeStationId={activeStationId}
                        />
                    ))}
                </div>
            </div>

            <ProductionSummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} productionSummary={productionSummary} />
            <StockManagerModal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} products={allProducts} onToggleAvailability={toggleProductAvailability} searchQuery={searchStock} onSearchChange={setSearchStock} />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15, 23, 42, 0.2); border-radius: 20px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
