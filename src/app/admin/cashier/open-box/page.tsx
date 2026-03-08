'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { openCashbox, getPosStatus, forceCloseSessionBySupervisor, transferSessionOperator } from "@/actions/pos"
import { supabase } from "@/lib/supabase/client"
import { Loader2, Wallet, ArrowRight, Banknote, ShieldCheck, ShieldAlert, RotateCcw, UserPlus } from "lucide-react"
import { toast } from "sonner"

export default function OpenBoxPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [shiftId, setShiftId] = useState<string | null>(null)
    const [amount, setAmount] = useState<string>("")
    const [notes, setNotes] = useState("")
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [isSupervisor, setIsSupervisor] = useState(false)
    const [blockedSessionId, setBlockedSessionId] = useState<string | null>(null)

    // Validar que tenga turno activo antes de permitir abrir caja
    useEffect(() => {
        const validateState = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUser(user)

            // Usamos la Server Action para validar estado fiable
            const status = await getPosStatus()

            if (!status.hasActiveShift) {
                alert("Debes iniciar turno primero")
                router.push('/admin/cashier/start-shift')
                return
            }

            if (status.hasOpenCashbox) {
                // Ya tiene caja, ir al dashboard
                router.push('/admin/cashier')
                return
            }

            // Verificar rol de supervisor
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            setIsSupervisor(['admin', 'owner', 'manager'].includes(profile?.role || ''))

            setShiftId(status.activeShift.id)
            setValidating(false)
        }
        validateState()
    }, [router])

    const handleOpenBox = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shiftId || !user || !amount) return

        setLoading(true)
        try {
            const result = await openCashbox(shiftId, parseFloat(amount), notes)
            if (result.success) {
                toast.success("CAJA ABIERTA EXITOSAMENTE")
                router.push("/admin/cashier")
            } else {
                setErrorMsg(result.error || "Error al abrir caja")
                // Si el error es de caja ya abierta, intentamos buscar el ID de esa sesión para el supervisor
                if (result.error?.includes("ya cuenta con una sesión abierta") || result.error?.includes("ya tiene una sesión activa")) {
                    const { data: active } = await supabase.from('cashbox_sessions').select('id').eq('status', 'OPEN').limit(1).maybeSingle()
                    if (active) setBlockedSessionId(active.id)
                }
                setLoading(false)
            }
        } catch (error: any) {
            toast.error("Error crítico: " + error.message)
            setLoading(false)
        }
    }

    const handleForceClose = async () => {
        if (!blockedSessionId) return
        setLoading(true)
        const res = await forceCloseSessionBySupervisor(blockedSessionId, "Cierre de emergencia por supervisor")
        if (res.success) {
            toast.success("SESIÓN PREVIA CERRADA. Ya puedes intentar abrir la tuya.")
            setBlockedSessionId(null); setErrorMsg(null); setLoading(false);
        } else {
            toast.error(res.error || "No se pudo cerrar la sesión"); setLoading(false);
        }
    }

    const handleTransfer = async () => {
        if (!blockedSessionId || !user) return
        setLoading(true)
        const res = await transferSessionOperator(blockedSessionId, user.id, "Transferencia de emergencia (Cambio de operador)")
        if (res.success) {
            toast.success("TE HAS REGISTRADO COMO EL NUEVO RESPONSABLE. Entrando al POS...")
            router.push("/admin/cashier")
        } else {
            toast.error(res.error || "No se pudo transferir la sesión"); setLoading(false);
        }
    }

    if (validating) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/40 italic animate-pulse">Autenticando Acceso a Bóveda...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            <div className="max-w-lg w-full space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">

                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4 ring-1 ring-emerald-500/20">
                        <Wallet className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
                        Apertura de <span className="text-emerald-600">Caja</span>
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                        Ingresa el saldo base inicial para comenzar a operar.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start gap-4 text-rose-600">
                            <ShieldAlert className="w-8 h-8 shrink-0" />
                            <div>
                                <h3 className="text-sm font-black uppercase italic tracking-wider">Acceso Bloqueado</h3>
                                <p className="text-xs font-medium text-rose-500/80 leading-relaxed mt-1">{errorMsg}</p>
                            </div>
                        </div>

                        {isSupervisor && blockedSessionId && (
                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <Button
                                    onClick={handleForceClose}
                                    disabled={loading}
                                    variant="ghost"
                                    className="h-14 rounded-2xl bg-rose-600 text-white font-black text-[10px] uppercase italic tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" /> Cierre de Emergencia
                                </Button>
                                <Button
                                    onClick={handleTransfer}
                                    disabled={loading}
                                    variant="ghost"
                                    className="h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase italic tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" /> Tomar Control
                                </Button>
                                <p className="col-span-2 text-[8px] text-center font-bold text-rose-400 uppercase tracking-widest italic">
                                    Acciones de Supervisor: Estas operaciones quedan registradas en la auditoría de seguridad.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleOpenBox} className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-6 italic">Saldo Inicial (Base)</label>
                        <div className="relative group">
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-orange-500 italic drop-shadow-2xl shadow-orange-500/50">$</span>
                            <input
                                type="number"
                                autoFocus
                                required
                                min="0"
                                className="w-full h-32 bg-white/60 border border-slate-200 group-focus-within:border-orange-500/40 rounded-[2.5rem] pl-16 pr-8 outline-none text-6xl font-black text-slate-900 text-center transition-all placeholder:text-slate-300 shadow-2xl backdrop-blur-3xl"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Observaciones (Opcional)</label>
                        <textarea
                            className="w-full h-24 bg-card border border-border focus:border-emerald-500 rounded-2xl p-4 outline-none resize-none text-sm font-medium transition-all shadow-sm"
                            placeholder="Ej: Entrega de base turno anterior..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading || !amount}
                            className="w-full h-20 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-lg tracking-widest italic shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONFIRMAR APERTURA"}
                            {!loading && <ArrowRight className="w-6 h-6 ml-2" />}
                        </Button>

                        <p className="text-center mt-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-primary" /> Transacción Segura y Auditada
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
