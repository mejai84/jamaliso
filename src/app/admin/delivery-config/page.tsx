"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2, AlertCircle } from "lucide-react"

// Types
import { DeliverySettings } from "./types"

// Components
import { DeliveryHeader } from "@/components/admin/delivery-config/DeliveryHeader"
import { StatusMonitor } from "@/components/admin/delivery-config/StatusMonitor"
import { FinancialMatrix } from "@/components/admin/delivery-config/FinancialMatrix"
import { GeospatialParams } from "@/components/admin/delivery-config/GeospatialParams"
import { ChronosMatrix } from "@/components/admin/delivery-config/ChronosMatrix"
import { InternalProtocols } from "@/components/admin/delivery-config/InternalProtocols"
import { GlobalMetric } from "@/components/admin/delivery-config/GlobalMetric"

export default function DeliveryConfigPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<DeliverySettings | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('delivery_settings')
                .select('*')
                .single()

            if (error) throw error
            setSettings(data as DeliverySettings)
        } catch (error: any) {
            console.error('Error fetching settings:', error)
            setMessage({ type: 'error', text: 'Error al cargar configuración de logística' })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!settings) return

        setSaving(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('delivery_settings')
                .update({
                    delivery_fee_enabled: settings.delivery_fee_enabled,
                    delivery_fee: settings.delivery_fee,
                    free_delivery_threshold: settings.free_delivery_threshold,
                    max_delivery_radius_km: settings.max_delivery_radius_km,
                    estimated_delivery_time_min: settings.estimated_delivery_time_min,
                    estimated_delivery_time_max: settings.estimated_delivery_time_max,
                    restaurant_address: settings.restaurant_address,
                    restaurant_phone: settings.restaurant_phone,
                    delivery_active: settings.delivery_active,
                    pickup_active: settings.pickup_active,
                    notes: settings.notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', settings.id)

            if (error) throw error

            setMessage({ type: 'success', text: '✅ Logística sincronizada correctamente' })
            setTimeout(() => setMessage(null), 5000)
            await fetchSettings()
        } catch (error: any) {
            console.error('Error saving settings:', error)
            setMessage({ type: 'error', text: `Error de protocolo: ${error.message}` })
        } finally {
            setSaving(false)
        }
    }

    const updateSetting = (key: keyof DeliverySettings, value: any) => {
        if (!settings) return
        setSettings({ ...settings, [key]: value })
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent font-sans">
            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic animate-pulse">Iniciando Protocolo de Logística...</p>
            </div>
        </div>
    )

    if (!settings) return (
        <div className="min-h-screen p-12 flex flex-col items-center justify-center gap-8 font-sans">
            <AlertCircle className="w-20 h-20 text-red-500 animate-bounce" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Nudo de Configuración No Detectado</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 italic text-center max-w-md leading-loose">
                EL KERNEL DE LOGÍSTICA REQUIERE UNA TABLA DE REFERENCIA ACTIVA EN EL VAULT DE DATOS.
            </p>
        </div>
    )

    return (
        <div className="min-h-screen bg-transparent text-foreground p-4 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
            {/* 🌌 AMBIANCE LAYER */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent pointer-events-none z-0" />
            <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-20 z-0 animate-pulse" />

            <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in duration-1000 relative z-10">
                <DeliveryHeader onSave={handleSave} saving={saving} message={message} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <StatusMonitor settings={settings} onUpdate={updateSetting} />
                    <FinancialMatrix settings={settings} onUpdate={updateSetting} />
                    <GeospatialParams settings={settings} onUpdate={updateSetting} />
                    <ChronosMatrix settings={settings} onUpdate={updateSetting} />
                    <InternalProtocols settings={settings} onUpdate={updateSetting} />
                </div>

                <GlobalMetric />
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    )
}
