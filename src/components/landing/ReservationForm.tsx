"use client"

import { useState } from "react"
import { Calendar, Clock, Users, Phone, User, Mail, MessageSquare, CheckCircle2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createReservation } from "@/actions/reservations"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface ReservationFormProps {
    restaurantId: string
    restaurantName: string
    onClose: () => void
}

export function ReservationForm({ restaurantId, restaurantName, onClose }: ReservationFormProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        reservation_date: "",
        reservation_time: "",
        num_people: 2,
        notes: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await createReservation({
            restaurant_id: restaurantId,
            ...formData
        })

        if (res.success) {
            setSuccess(true)
            toast.success("¡Reserva solicitada con éxito!")
            setTimeout(() => {
                onClose()
            }, 3000)
        } else {
            toast.error("Error al solicitar reserva: " + res.error)
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">¡SOLICITUD RECIBIDA!</h2>
                <p className="text-slate-500 font-medium">Hemos recibido tu solicitud para <span className="text-slate-900 font-bold">{restaurantName}</span>. Te confirmaremos pronto vía WhatsApp.</p>
                <Button onClick={onClose} className="bg-slate-900 text-white rounded-xl h-12 px-8 uppercase font-black text-[10px] tracking-widest">
                    CERRAR
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">RESERVAR <span className="text-orange-500">MESA</span></h2>
                <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <User className="w-3 h-3" /> NOMBRE COMPLETO
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej: Jaime Rodríguez"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={formData.customer_name}
                            onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Phone className="w-3 h-3" /> TELÉFONO WHATSAPP
                        </label>
                        <input
                            required
                            type="tel"
                            placeholder="Ej: 300 1234567"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={formData.customer_phone}
                            onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> CORREO ELECTRÓNICO (OPCIONAL)
                    </label>
                    <input
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-orange-500/50 transition-all"
                        value={formData.customer_email}
                        onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> FECHA
                        </label>
                        <input
                            required
                            type="date"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={formData.reservation_date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setFormData({ ...formData, reservation_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> HORA
                        </label>
                        <input
                            required
                            type="time"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={formData.reservation_time}
                            onChange={e => setFormData({ ...formData, reservation_time: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Users className="w-3 h-3" /> PERSONAS
                        </label>
                        <input
                            required
                            type="number"
                            min="1"
                            max="20"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={formData.num_people}
                            onChange={e => setFormData({ ...formData, num_people: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> NOTAS ESPECIALES
                    </label>
                    <textarea
                        placeholder="Ej: Es un aniversario, mesa tranquila..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-orange-500/50 transition-all resize-none"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
            </div>

            <Button
                disabled={loading}
                className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    "SOLICITAR MI RESERVA"
                )}
            </Button>

            <p className="text-[8px] text-slate-400 font-bold uppercase text-center tracking-widest italic">
                Al solicitar aceptas que el restaurante te contactará para confirmar disponibilidad.
            </p>
        </form>
    )
}
