"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"

// Types
import { BusinessInfo, TaxSettings } from "./types"

// Components
import { BusinessSettingsHeader } from "@/components/admin/settings/business/BusinessSettingsHeader"
import { IdentityForm } from "@/components/admin/settings/business/IdentityForm"
import { TaxForm } from "@/components/admin/settings/business/TaxForm"
import { ForensicPreview } from "@/components/admin/settings/business/ForensicPreview"

export default function BusinessSettingsPage() {
    const { restaurant } = useRestaurant()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
        business_name: "",
        identification_number: "",
        phone: "",
        email: "",
        address: "",
        website: "",
        currency: "COP",
        currency_symbol: "$"
    })
    const [taxSettings, setTaxSettings] = useState<TaxSettings>({
        tax_name: "IVA",
        tax_percentage: 0,
        consumption_tax: 0,
        include_tax_in_price: true,
        invoice_prefix: "",
        invoice_start_number: 1,
        legal_text: ""
    })

    useEffect(() => {
        const fetchSettings = async () => {
            if (!restaurant?.id) return
            const { data } = await supabase.from('settings').select('*').eq('restaurant_id', restaurant.id)
            if (data) {
                const info = data.find(s => s.key === 'business_info')?.value
                const taxes = data.find(s => s.key === 'tax_settings')?.value
                if (info) setBusinessInfo(info as BusinessInfo)
                if (taxes) setTaxSettings(taxes as TaxSettings)
            }
            setLoading(false)
        }
        fetchSettings()
    }, [restaurant])

    const handleSave = async () => {
        setSaving(true)
        try {
            const { error: infoError } = await supabase
                .from('settings')
                .upsert({
                    restaurant_id: restaurant?.id,
                    key: 'business_info',
                    value: businessInfo,
                    description: 'Public business identity and contact info'
                }, { onConflict: 'restaurant_id, key' })

            const { error: taxError } = await supabase
                .from('settings')
                .upsert({
                    restaurant_id: restaurant?.id,
                    key: 'tax_settings',
                    value: taxSettings,
                    description: 'Fiscal and tax parameters'
                }, { onConflict: 'restaurant_id, key' })

            if (infoError || taxError) throw new Error("Error al guardar")
            toast.success("Configuración de Elite Ledger guardada correctamente")
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic animate-pulse">Sincronizando Business Logic Hub...</p>
                    <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Master Identity v5.4</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-transparent text-foreground p-4 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
            {/* 🌌 AMBIANCE LAYER */}
            <div className="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-primary/[0.02] to-transparent pointer-events-none z-0" />
            <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-30 z-0 animate-pulse" />

            <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in duration-1000 relative z-10">
                <BusinessSettingsHeader saving={saving} onSave={handleSave} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <IdentityForm businessInfo={businessInfo} onChange={setBusinessInfo} />

                    <div className="space-y-12 animate-in slide-in-from-right-12 duration-1000">
                        <TaxForm taxSettings={taxSettings} onChange={setTaxSettings} />
                        <ForensicPreview businessName={businessInfo.business_name} />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.95; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 5s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
