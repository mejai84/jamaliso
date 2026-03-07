"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KitchenChatModalProps {
    isOpen: boolean
    onClose: () => void
    kitchenMsg: string
    setKitchenMsg: (msg: string) => void
    onSend: () => void
    submitting: boolean
}

export function KitchenChatModal({
    isOpen,
    onClose,
    kitchenMsg,
    setKitchenMsg,
    onSend,
    submitting
}: KitchenChatModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">CHAT <span className="text-orange-500">COCINA</span></h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Mensajes rápidos a producción</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {["CUBIERTOS", "LIMPIAR MESA", "HIELO BAR", "URGENTE"].map(m => (
                            <button key={m} onClick={() => setKitchenMsg(m)} className="p-3 border border-slate-100 rounded-2xl text-[10px] font-black hover:bg-orange-50 hover:border-orange-200 transition-all uppercase">{m}</button>
                        ))}
                    </div>
                    <textarea
                        placeholder="Escribe un mensaje..."
                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={kitchenMsg}
                        onChange={e => setKitchenMsg(e.target.value)}
                    />
                    <Button onClick={onSend} disabled={submitting || !kitchenMsg} className="w-full h-14 bg-orange-600 text-white font-black uppercase rounded-2xl">ENVIAR A COCINA</Button>
                </div>
            </div>
        </div>
    )
}
