"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

// Types
import { Driver, PotentialDriver } from "./types"

// Components
import { DriversHeader } from "@/components/admin/drivers/DriversHeader"
import { DriversGrid } from "@/components/admin/drivers/DriversGrid"
import { GlobalMetric } from "@/components/admin/drivers/GlobalMetric"
import { AddDriverModal } from "@/components/admin/drivers/AddDriverModal"

export default function DriversPage() {
    const [loading, setLoading] = useState(true)
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [users, setUsers] = useState<PotentialDriver[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // New Driver Form State
    const [newDriver, setNewDriver] = useState<Partial<Driver>>({
        user_id: "",
        full_name: "",
        phone: "",
        vehicle_type: "motorcycle",
        license_plate: ""
    })

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('delivery_drivers')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setDrivers(data as Driver[])
        setLoading(false)
    }

    const fetchPotentialDrivers = async () => {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .order('full_name')

        const existingDriverIds = drivers.map(d => d.user_id)
        const potential = profiles?.filter(p => !existingDriverIds.includes(p.id)) || []

        setUsers(potential as PotentialDriver[])
    }

    const openAddModal = () => {
        fetchPotentialDrivers()
        setShowAddModal(true)
    }

    const handleCreateDriver = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const driverToInsert = {
                ...newDriver,
                user_id: newDriver.user_id || null
            }

            const { error } = await supabase
                .from('delivery_drivers')
                .insert([driverToInsert])

            if (error) throw error

            setShowAddModal(false)
            setNewDriver({
                user_id: "",
                full_name: "",
                phone: "",
                vehicle_type: "motorcycle",
                license_plate: ""
            })
            fetchDrivers()
            toast.success("Repartidor registrado correctamente")
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        }
    }

    const toggleStatus = async (driverId: string, currentStatus: boolean) => {
        await supabase
            .from('delivery_drivers')
            .update({ is_active: !currentStatus })
            .eq('id', driverId)

        fetchDrivers()
        toast.info(currentStatus ? "Repartidor suspendido" : "Repartidor activado")
    }

    const filteredDrivers = drivers.filter(d =>
        d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone?.includes(searchQuery)
    )

    return (
        <div className="min-h-screen bg-transparent text-foreground p-4 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
            {/* 🌌 AMBIANCE LAYER */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent pointer-events-none z-0" />
            <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40 z-0 animate-pulse" />

            <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in duration-1000 relative z-10">
                <DriversHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onOpenModal={openAddModal}
                />

                <DriversGrid
                    drivers={filteredDrivers}
                    loading={loading}
                    onToggleStatus={toggleStatus}
                />

                <GlobalMetric />
            </div>

            {showAddModal && (
                <AddDriverModal
                    users={users}
                    newDriver={newDriver}
                    setNewDriver={setNewDriver}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleCreateDriver}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    )
}
