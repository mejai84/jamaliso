"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ClipboardList, ChefHat, Check, AlertCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { NotesSelectorModal } from "@/components/shared/NotesSelectorModal"
import { updateOrderItemNotes } from "@/actions/orders-fixed"
import { toast } from "sonner"

interface ActiveOrderNotesModalProps {
    isOpen: boolean
    onClose: () => void
    table: any
    onRefresh: () => void
}

export function ActiveOrderNotesModal({
    isOpen,
    onClose,
    table,
    onRefresh
}: ActiveOrderNotesModalProps) {
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)

    const items = (table as any)?.items || []

    const handleSaveNotes = async (notes: string) => {
        if (!selectedItem) return
        setIsSaving(true)
        try {
            const result = await updateOrderItemNotes(selectedItem.id, notes, "")
            if (result.success) {
                toast.success("Observación actualizada y enviada a cocina")
                onRefresh()
                setSelectedItem(null)
            } else {
                toast.error("Error al actualizar")
            }
        } catch (e) {
            toast.error("Error crítico al actualizar notas")
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
                                    Gestionar Observaciones
                                </h3>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">
                                    Mesa {table?.table_name} · Pedido en curso
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Info Alert */}
                    <div className="bg-amber-50 border-y border-amber-100/50 px-8 py-4 flex items-center gap-4 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white outline outline-4 outline-amber-500/10">
                            <ChefHat className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-black text-amber-700 uppercase italic leading-tight">
                            Atención: Las modificaciones se verán reflejadas en tiempo real en las pantallas de cocina.
                        </p>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-slate-50/30">
                        {items.length > 0 ? (
                            items.map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedItem(item)
                                        setIsNotesModalOpen(true)
                                    }}
                                    className="w-full text-left bg-white border-2 border-white hover:border-orange-500/20 hover:shadow-xl p-5 rounded-[2rem] transition-all group relative overflow-hidden active:scale-[0.98]"
                                >
                                    <div className="flex items-start justify-between relative z-10">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black italic">
                                                    {item.quantity}x
                                                </span>
                                                <h4 className="font-black italic uppercase text-slate-900 tracking-tight">
                                                    {item.products?.name}
                                                </h4>
                                            </div>

                                            <div className="mt-3 ml-11">
                                                <div className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black italic uppercase tracking-tighter shadow-sm inline-block",
                                                    item.notes
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-slate-100 text-slate-300 border border-slate-200"
                                                )}>
                                                    {item.notes || "Sin especificaciones"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex flex-col items-end gap-2">
                                            <span className="text-xs font-black italic text-slate-400">
                                                {formatPrice(item.subtotal)}
                                            </span>
                                            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-orange-600/20">
                                                <RefreshCw className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[7px] font-black uppercase tracking-widest italic">Enviado</span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 mx-auto flex items-center justify-center opacity-40">
                                    <ClipboardList className="w-10 h-10 text-slate-200" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No hay productos en esta orden</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t-2 border-slate-50 bg-white shrink-0">
                        <Button
                            onClick={onClose}
                            className="w-full h-16 bg-slate-900 text-white font-black uppercase rounded-2xl shadow-xl hover:bg-orange-600 transition-all active:scale-95 text-xs italic tracking-widest"
                        >
                            Volver a Mesa
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Modal de Notas (Reutilizando el que creamos antes) */}
            <NotesSelectorModal
                isOpen={isNotesModalOpen}
                onClose={() => setIsNotesModalOpen(false)}
                initialNotes={selectedItem?.notes || ""}
                onSave={handleSaveNotes}
                title={selectedItem?.products?.name || "Observaciones"}
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </AnimatePresence>
    )
}
