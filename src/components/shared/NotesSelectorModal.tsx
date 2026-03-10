"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Check, AlertTriangle, ChefHat, Plus } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ORDER_NOTES_CATEGORIES } from "@/lib/constants/order-notes"

interface NotesSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    initialNotes: string
    onSave: (notes: string) => void
    title?: string
}

export function NotesSelectorModal({
    isOpen,
    onClose,
    initialNotes,
    onSave,
    title = "Observaciones y Preferencias"
}: NotesSelectorModalProps) {
    const [selectedNotes, setSelectedNotes] = useState<string[]>(
        initialNotes ? initialNotes.split(", ").filter(Boolean) : []
    )
    const [searchTerm, setSearchTerm] = useState("")

    const toggleNote = (note: string) => {
        setSelectedNotes(prev =>
            prev.includes(note)
                ? prev.filter(n => n !== note)
                : [...prev, note]
        )
    }

    const handleSave = () => {
        onSave(selectedNotes.join(", "))
        onClose()
    }

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return ORDER_NOTES_CATEGORIES
        return ORDER_NOTES_CATEGORIES.map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(cat => cat.items.length > 0)
    }, [searchTerm])

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
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-xl">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
                                <ChefHat className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                                    {title}
                                </h3>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">
                                    Personalización del Plato
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-10 py-6 shrink-0 border-b-2 border-slate-50">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200 group-focus-within:text-orange-500 transition-all" />
                            <input
                                placeholder="Filtrar por restricción o ingrediente..."
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-16 pr-6 text-sm font-black italic text-slate-900 outline-none focus:border-orange-500/20 focus:bg-white transition-all placeholder:text-slate-200"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12 bg-slate-50/20">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat, idx) => (
                                <div key={idx} className="space-y-6">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        {cat.title}
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {cat.items.map(item => {
                                            const isSelected = selectedNotes.includes(item)
                                            const isCritical = cat.title.includes("(Crítico)")

                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => toggleNote(item)}
                                                    className={cn(
                                                        "p-4 rounded-3xl border-2 transition-all text-[11px] font-black uppercase italic tracking-tighter text-left flex items-start gap-4",
                                                        isSelected
                                                            ? isCritical
                                                                ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20"
                                                                : "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20"
                                                            : "bg-white border-white hover:border-orange-500/10 hover:shadow-lg text-slate-900"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "bg-white/20"
                                                            : isCritical ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-300"
                                                    )}>
                                                        {isSelected ? <Check className="w-4 h-4" /> : isCritical ? <AlertTriangle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                    </div>
                                                    <span className="leading-tight">{item}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <Search className="w-16 h-16 text-slate-100 mx-auto" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 italic">No se encontraron resultados</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t-2 border-slate-50 shrink-0 flex items-center justify-between bg-white">
                        <div className="flex-1 min-w-0 mr-10">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-2">Resumen de Instrucciones</p>
                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 min-h-[56px] text-xs font-black italic text-slate-900 leading-relaxed overflow-hidden">
                                {selectedNotes.join(", ") || <span className="text-slate-200">Sin observaciones especiales</span>}
                            </div>
                        </div>
                        <Button
                            onClick={handleSave}
                            className="h-20 px-12 bg-slate-900 text-white font-black uppercase rounded-[2rem] shadow-2xl hover:bg-orange-600 transition-all active:scale-95 text-xs italic tracking-widest"
                        >
                            Confirmar Cambios
                        </Button>
                    </div>
                </motion.div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </AnimatePresence>
    )
}
