"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { MonitorIcon, Loader2 } from "lucide-react"
import QRCodeStyling from "qr-code-styling"
import { transferOrderBetweenTables } from "@/actions/orders-fixed"
import { toast } from "sonner"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { Table } from "./types"

// Components
import { TablesHeader } from "@/components/admin/tables/TablesHeader"
import { TableListView } from "@/components/admin/tables/TableListView"
import { FloorPlanView } from "@/components/admin/tables/FloorPlanView"
import { TableFormModal } from "@/components/admin/tables/TableFormModal"
import { TransferTableModal } from "@/components/admin/tables/TransferTableModal"

export default function TablesAdminPage() {
    const { restaurant } = useRestaurant()
    const [tables, setTables] = useState<Table[]>([])
    const [loading, setLoading] = useState(true)
    const [isVisualView, setIsVisualView] = useState(false)
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [savingLayout, setSavingLayout] = useState(false)
    const [activeZone, setActiveZone] = useState<string>("TODAS")
    const [isHeatmapMode, setIsHeatmapMode] = useState(false)
    const [tableSales, setTableSales] = useState<Record<string, number>>({})

    // Transferencia
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [transferSourceTable, setTransferSourceTable] = useState<Table | null>(null)
    const [transferTargetTableId, setTransferTargetTableId] = useState<string>("")
    const [activeOrderToTransfer, setActiveOrderToTransfer] = useState<string | null>(null)

    // Layout Editor
    const [draggedTableId, setDraggedTableId] = useState<string | null>(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (restaurant) {
            loadTables()
            const channel = supabase.channel('tables-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${restaurant.id}` }, () => loadTables())
                .subscribe()
            return () => { supabase.removeChannel(channel) }
        }
    }, [restaurant])

    const loadTables = async () => {
        if (!restaurant) return
        setLoading(true)
        const { data, error } = await supabase.from('tables').select('*').eq('restaurant_id', restaurant.id).order('table_number', { ascending: true })
        if (!error && data) setTables(data as Table[])
        setLoading(false)
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const tableData = {
            table_number: parseInt(formData.get('table_number') as string),
            table_name: formData.get('table_name') as string,
            capacity: parseInt(formData.get('capacity') as string),
            location: formData.get('location') as string,
            shape: formData.get('shape') as Table['shape'],
            restaurant_id: restaurant?.id
        }

        if (isEditModalOpen && selectedTable) {
            const { error } = await supabase.from('tables').update(tableData).eq('id', selectedTable.id)
            if (!error) {
                toast.success("Calibración de mesa guardada")
                setIsEditModalOpen(false)
                setSelectedTable(null)
                loadTables()
            } else toast.error("Error: " + error.message)
        } else {
            const tNum = tableData.table_number
            const { data: newTable, error } = await supabase.from('tables').insert({
                ...tableData,
                qr_code: `T${tNum}-${Math.random().toString(36).substr(2, 9)}`,
                status: 'available',
                x_pos: 200, y_pos: 200, width: 140, height: 140, rotation: 0
            }).select().single()
            if (!error && newTable) {
                setTables(prev => [...prev, newTable as Table])
                setIsAddModalOpen(false)
                toast.success("Nueva mesa integrada")
            } else toast.error("Error: " + error?.message)
        }
    }

    const saveLayout = async () => {
        setSavingLayout(true)
        try {
            const updates = tables.map(t => ({ ...t, x_pos: Math.round(t.x_pos), y_pos: Math.round(t.y_pos) }))
            const { error } = await supabase.from('tables').upsert(updates, { onConflict: 'id' })
            if (error) throw error
            toast.success("Arquitectura sincronizada")
            loadTables()
        } catch (error: any) { toast.error(error.message) }
        finally { setSavingLayout(false) }
    }

    const initiateTransfer = async (table: Table) => {
        const { data: order } = await supabase.from('orders').select('id').eq('table_id', table.id).in('status', ['pending', 'preparing', 'ready', 'delivered', 'paying']).single()
        if (!order) return toast.error("Sin pedido activo para transferir")
        setTransferSourceTable(table)
        setActiveOrderToTransfer(order.id)
        setIsTransferModalOpen(true)
    }

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrderToTransfer || !transferTargetTableId) return
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const result = await transferOrderBetweenTables({ order_id: activeOrderToTransfer, target_table_id: transferTargetTableId, user_id: user?.id!, reason: "Transferencia desde Mapa" })
            if (result.success) {
                toast.success(result.message)
                setIsTransferModalOpen(false)
                loadTables()
            }
        } catch (error: any) { toast.error(error.message) }
    }

    const deleteTable = async (table: Table) => {
        if (!confirm(`¿Eliminar ${table.table_name}?`)) return
        const { error } = await supabase.from('tables').delete().eq('id', table.id)
        if (!error) { toast.info("Mesa purgada"); loadTables(); }
    }

    const generateQRCode = (table: Table) => {
        const qrCode = new QRCodeStyling({
            width: 600, height: 600, type: "svg", data: `${window.location.origin}/menu-qr?table=${table.qr_code}`,
            image: "/logo.png", dotsOptions: { color: "#ff4d00", type: "rounded" },
            backgroundOptions: { color: "#ffffff" }, imageOptions: { crossOrigin: "anonymous", margin: 15, imageSize: 0.4 },
            cornersSquareOptions: { color: "#000000", type: "extra-rounded" }, cornersDotOptions: { color: "#ff4d00", type: "dot" }
        })
        qrCode.download({ name: `MESA-${table.table_number}-JAMALISO`, extension: "png" })
        toast.success(`QR Descargado`)
    }

    const toggleHeatmap = async () => {
        if (!isHeatmapMode) {
            const { data: sales } = await supabase.from('orders').select('table_id, total').not('table_id', 'is', null)
            const salesMap: Record<string, number> = {}
            sales?.forEach(order => { if (order.table_id) salesMap[order.table_id] = (salesMap[order.table_id] || 0) + (order.total || 0) })
            setTableSales(salesMap)
        }
        setIsHeatmapMode(!isHeatmapMode)
    }

    const updateTableDimension = (id: string, field: keyof Table, value: number) => {
        setTables(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
    }

    const handleMouseDown = (e: React.MouseEvent, tableId: string) => {
        if (!isVisualView || isHeatmapMode) return
        e.preventDefault()
        setDraggedTableId(tableId)
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedTableId || !containerRef.current) return
        const containerRect = containerRef.current.getBoundingClientRect()
        const snappedX = Math.round((e.clientX - containerRect.left - offset.x) / 20) * 20
        const snappedY = Math.round((e.clientY - containerRect.top - offset.y) / 20) * 20
        setTables(prev => prev.map(t => t.id === draggedTableId ? { ...t, x_pos: Math.max(0, snappedX), y_pos: Math.max(0, snappedY) } : t))
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000">
                <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic animate-pulse">Arquitectando Salón Digital...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500 overflow-hidden flex flex-col h-screen relative">
            {/* 🖼️ FONDO PREMIUM SOFT */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 opacity-10 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-[120px] bg-white/40 pointer-events-none" />

            <div className="max-w-[1700px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 relative z-10 p-8 flex-1 overflow-y-auto custom-scrollbar">

                <TablesHeader
                    activeZone={activeZone}
                    onZoneChange={setActiveZone}
                    isVisualView={isVisualView}
                    onViewToggle={setIsVisualView}
                    onAddTable={() => setIsAddModalOpen(true)}
                />

                {isVisualView ? (
                    <FloorPlanView
                        tables={tables}
                        activeZone={activeZone}
                        isHeatmapMode={isHeatmapMode}
                        onToggleHeatmap={toggleHeatmap}
                        onSaveLayout={saveLayout}
                        savingLayout={savingLayout}
                        tableSales={tableSales}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={() => setDraggedTableId(null)}
                        updateTableDimension={updateTableDimension}
                        initiateTransfer={initiateTransfer}
                        onEdit={(t) => { setSelectedTable(t); setIsEditModalOpen(true); }}
                        onDelete={deleteTable}
                        containerRef={containerRef}
                        draggedTableId={draggedTableId}
                    />
                ) : (
                    <TableListView
                        tables={tables.filter(t => activeZone === "TODAS" || t.location === activeZone)}
                        onGenerateQR={generateQRCode}
                        onTransfer={initiateTransfer}
                        onEdit={(t) => { setSelectedTable(t); setIsEditModalOpen(true); }}
                        onDelete={deleteTable}
                    />
                )}

                <div className="p-10 bg-foreground rounded-[4rem] text-background flex flex-col md:flex-row items-center justify-between shadow-3xl metric-bar relative overflow-hidden">
                    <div className="flex items-center gap-10 relative z-10">
                        <MonitorIcon className="w-10 h-10 text-primary" />
                        <div className="space-y-1">
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Master Tables Node</h4>
                            <p className="text-[10px] text-background/40 font-black uppercase tracking-[0.4em] italic leading-none">SYSTEM v8.42 • KERNEL OPTIMIZED FOR REAL-TIME SPATIAL SYNC</p>
                        </div>
                    </div>
                    <div className="flex gap-12 mt-8 md:mt-0 relative z-10">
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-white/20 italic">Total Nodes</p>
                            <p className="text-2xl font-black italic tracking-tighter text-emerald-500">{tables.length} MESAS ACTIVAS</p>
                        </div>
                    </div>
                </div>
            </div>

            <TableFormModal
                isOpen={isAddModalOpen || isEditModalOpen}
                table={selectedTable}
                onSubmit={handleFormSubmit}
                onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedTable(null); }}
            />

            <TransferTableModal
                isOpen={isTransferModalOpen}
                sourceTable={transferSourceTable}
                targetTableId={transferTargetTableId}
                onTargetChange={setTransferTargetTableId}
                tables={tables}
                onSubmit={handleTransferSubmit}
                onClose={() => setIsTransferModalOpen(false)}
            />

            <style jsx global>{`
                .blueprint-grid {
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    background-position: center center;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,102,0,0.1); border-radius: 20px; }
            `}</style>
        </div>
    )
}
