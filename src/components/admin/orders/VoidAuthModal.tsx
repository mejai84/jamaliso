"use client"

import { useState } from "react"
import { ShieldAlert, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoidAuthModalProps {
    onConfirm: (pin: string, reason: string) => Promise<void>
    onCancel: () => void
    title: string
    description?: string
}

export function VoidAuthModal({ onConfirm, onCancel, title, description }: VoidAuthModalProps) {
    const [pin, setPin] = useState("")
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        if (!pin || !reason) return
        setLoading(true)
        await onConfirm(pin, reason)
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-[3rem] w-full max-w-md p-10 space-y-8 shadow-2xl border-4 border-rose-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <ShieldAlert className="w-40 h-40 text-rose-600" />
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{title}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        {description || "Se requiere autorización de supervisor para anular registros."}
                    </p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Pin de Supervisor</label>
                        <input
                            type="password"
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-2xl font-black tracking-[1em] focus:border-rose-500 outline-none transition-all text-center placeholder:tracking-normal"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Razón de la Anulación</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 font-black uppercase text-xs italic focus:border-rose-500 outline-none transition-all"
                        >
                            <option value="">Seleccionar razón...</option>
                            <option value="Error de captura">Error de captura</option>
                            <option value="Cliente desistió">Cliente desistió</option>
                            <option value="Producto en mal estado">Producto en mal estado</option>
                            <option value="Demora excesiva">Demora excesiva</option>
                            <option value="Prueba técnica">Prueba técnica</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 relative z-10">
                    <Button
                        onClick={onCancel}
                        variant="ghost"
                        className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest italic text-slate-400 hover:text-slate-900 transition-all"
                    >
                        CANCELAR
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!pin || !reason || loading}
                        className="flex-1 h-16 rounded-2xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest italic shadow-xl shadow-rose-600/20 active:scale-95 transition-all hover:bg-rose-700 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONFIRMAR"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
