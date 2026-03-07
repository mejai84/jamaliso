"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Ticket } from "lucide-react"
import { Coupon, Profile } from "./types"

// Components
import { CouponsHeader } from "@/components/admin/coupons/CouponsHeader"
import { CouponCard } from "@/components/admin/coupons/CouponCard"
import { CouponModal } from "@/components/admin/coupons/CouponModal"

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        code: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: 0,
        min_purchase: 0,
        usage_limit: '' as string | number,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        customer_id: '',
        seasonal_tag: '',
        active: true
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [couponsRes, profilesRes] = await Promise.all([
            supabase.from('coupons').select('*').order('created_at', { ascending: false }),
            supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true })
        ])

        if (couponsRes.data) setCoupons(couponsRes.data as any)
        if (profilesRes.data) setProfiles(profilesRes.data as any)
        setLoading(false)
    }

    const handleOpenModal = (coupon?: Coupon) => {
        if (coupon) {
            setFormData({
                id: coupon.id,
                code: coupon.code,
                description: coupon.description || '',
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                min_purchase: coupon.min_purchase,
                usage_limit: coupon.usage_limit || '',
                start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().split('T')[0] : '',
                end_date: coupon.end_date ? new Date(coupon.end_date).toISOString().split('T')[0] : '',
                customer_id: coupon.customer_id || '',
                seasonal_tag: coupon.seasonal_tag || '',
                active: coupon.active
            })
        } else {
            setFormData({
                id: '',
                code: '',
                description: '',
                discount_type: 'percentage',
                discount_value: 0,
                min_purchase: 0,
                usage_limit: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                customer_id: '',
                seasonal_tag: '',
                active: true
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const dataToSave = {
            code: formData.code.toUpperCase(),
            description: formData.description,
            discount_type: formData.discount_type,
            discount_value: Number(formData.discount_value),
            min_purchase: Number(formData.min_purchase),
            usage_limit: formData.usage_limit === '' ? null : Number(formData.usage_limit),
            start_date: formData.start_date || new Date().toISOString(),
            end_date: formData.end_date || null,
            customer_id: formData.customer_id || null,
            seasonal_tag: formData.seasonal_tag || null,
            active: formData.active
        }

        try {
            if (formData.id) {
                const { error } = await supabase.from('coupons').update(dataToSave).eq('id', formData.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('coupons').insert([dataToSave])
                if (error) throw error
            }
            setIsModalOpen(false)
            loadData()
        } catch (error: any) {
            alert(error.message || 'Error al guardar el cupón')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        await supabase.from('coupons').update({ active: !currentStatus }).eq('id', id)
        loadData()
    }

    const deleteCoupon = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este cupón?')) return
        await supabase.from('coupons').delete().eq('id', id)
        loadData()
    }

    return (
        <div className="min-h-screen bg-[#020406] text-white p-4 md:p-8 font-sans selection:bg-orange-500 selection:text-black relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-1000 relative z-10 text-white">
                <CouponsHeader onAddOpen={() => handleOpenModal()} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading && coupons.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-96 rounded-[3.5rem] bg-slate-900/50 border border-white/5 animate-pulse" />
                        ))
                    ) : coupons.map(coupon => (
                        <CouponCard
                            key={coupon.id}
                            coupon={coupon}
                            profiles={profiles}
                            onEdit={handleOpenModal}
                            onToggleStatus={toggleStatus}
                            onDelete={deleteCoupon}
                        />
                    ))}
                </div>

                {coupons.length === 0 && !loading && (
                    <div className="text-center py-40 bg-slate-900/40 rounded-[4rem] border-2 border-dashed border-white/5 animate-in zoom-in duration-700">
                        <Ticket className="w-32 h-32 mx-auto mb-8 text-white/10" />
                        <p className="text-3xl font-black opacity-20 uppercase tracking-[0.4em] italic mb-6 leading-none">Librería de Cupones Vacía</p>
                        <Button
                            variant="ghost"
                            className="text-orange-500 font-black uppercase tracking-[0.3em] italic hover:bg-orange-500/5 px-10 h-16 rounded-2xl gap-3 text-sm"
                            onClick={() => handleOpenModal()}
                        >
                            <Plus className="w-5 h-5" /> CONFIGURAR PRIMERA OFERTA
                        </Button>
                    </div>
                )}
            </div>

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                submitting={submitting}
                onSubmit={handleSubmit}
                profiles={profiles}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
            `}</style>
        </div>
    )
}
