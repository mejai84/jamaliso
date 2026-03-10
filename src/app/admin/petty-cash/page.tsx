"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Search, History } from "lucide-react"
import { PettyCashVoucher, Employee } from "./types"
import { numeroALetras, handlePrint } from "./utils"

// Components
import { PettyCashHeader } from "@/components/admin/petty-cash/PettyCashHeader"
import { VoucherTable } from "@/components/admin/petty-cash/VoucherTable"
import { EmissionModal } from "@/components/admin/petty-cash/EmissionModal"
import { InspectionModal } from "@/components/admin/petty-cash/InspectionModal"

export default function PettyCashPage() {
    const [vouchers, setVouchers] = useState<PettyCashVoucher[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewVoucher, setPreviewVoucher] = useState<PettyCashVoucher | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [lastSavedVoucher, setLastSavedVoucher] = useState<any>(null)

    useEffect(() => {
        fetchVouchers()
        fetchEmployees()
    }, [])

    async function fetchVouchers() {
        setLoading(true)
        const { data } = await supabase
            .from('petty_cash_vouchers')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setVouchers(data)
        setLoading(false)
    }

    async function fetchEmployees() {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('role', ['admin', 'manager', 'staff', 'cook', 'waiter', 'cashier', 'cleaner'])

        if (data) setEmployees(data)
    }

    const handleSubmit = async (formData: any, signature: string) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No se encontró sesión de usuario");

            const { data: profile } = await supabase
                .from('profiles')
                .select('restaurant_id')
                .eq('id', user.id)
                .single();

            if (!profile?.restaurant_id) throw new Error("No se encontró restaurant_id en el perfil");

            const voucherToSave = {
                ...formData,
                date: new Date().toISOString().split('T')[0],
                status: 'paid',
                signature_data: signature,
                restaurant_id: profile.restaurant_id
            };

            const { data, error } = await supabase
                .from('petty_cash_vouchers')
                .insert([voucherToSave])
                .select()
                .single()

            if (error) throw error;

            setLastSavedVoucher(data);
            setShowSuccess(true);
            fetchVouchers();
        } catch (error: any) {
            console.error(error);
            alert(`Error al guardar comprobante: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewFromForm = (formData: any, signature: string | null) => {
        const tempVoucher: PettyCashVoucher = {
            id: 'preview',
            voucher_number: 0,
            date: new Date().toLocaleDateString('es-CO'),
            beneficiary_name: formData.beneficiary_name,
            cargo: formData.cargo || 'OPERADOR',
            amount: formData.amount,
            amount_in_words: formData.amount_in_words,
            concept: formData.concept,
            accounting_code: formData.accounting_code,
            category: formData.category,
            signature_data: signature
        };
        setPreviewVoucher(tempVoucher);
        setIsPreviewOpen(true);
    }

    const filteredVouchers = vouchers.filter(v =>
        v.beneficiary_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.concept.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col">
            {/* 🖼️ FONDO PREMIUM PIXORA */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-12 animate-in fade-in duration-1000">

                <PettyCashHeader onEmit={() => { setShowSuccess(false); setIsModalOpen(true); }} />

                <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 animate-in slide-in-from-bottom-6 group">
                    <div className="p-10 border-b-2 border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                                Auditoría de <span className="text-orange-600">Movimientos</span>
                            </h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] italic leading-none mt-2">Flujo de caja menor y protocolos de gasto</p>
                        </div>

                        <div className="relative w-full md:w-[450px] group/search">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/search:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="IDENTIFICADOR O CONCEPTO..."
                                className="w-full h-16 bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-8 outline-none focus:border-orange-500/30 transition-all text-sm font-black italic uppercase text-slate-900 placeholder:text-slate-300 shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <VoucherTable
                        vouchers={filteredVouchers}
                        onPreview={(v) => { setPreviewVoucher(v); setIsPreviewOpen(true); }}
                        onPrint={handlePrint}
                    />
                </div>
            </div>

            <EmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employees={employees}
                onSubmit={handleSubmit}
                onPreview={handlePreviewFromForm}
                onPrint={handlePrint}
                loading={loading}
                showSuccess={showSuccess}
                lastSavedVoucher={lastSavedVoucher}
                numeroALetras={numeroALetras}
            />

            <InspectionModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                voucher={previewVoucher}
                onPrint={handlePrint}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,102,0,0.1); border-radius: 20px; }
            `}</style>
        </div>
    )
}
