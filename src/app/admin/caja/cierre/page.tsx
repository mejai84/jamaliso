'use client'

import { useState, useEffect } from 'react'
import { initiateShiftClose, acceptHandoff, getPendingHandoff } from '@/lib/handoff'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function CierreTurnoPage() {
    const [step, setStep] = useState<'counting' | 'confirm' | 'waiting' | 'accept'>('counting')
    const [physicalCash, setPhysicalCash] = useState('')
    const [incomingUser, setIncomingUser] = useState('')
    const [signature, setSignature] = useState('')
    const [handoff, setHandoff] = useState<any>(null)
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        // Cargar staff del restaurante para seleccionar quién entra
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)

            const { data: profileData } = await supabase.from('profiles').select('restaurant_id').eq('id', user?.id).single()

            if (profileData?.restaurant_id) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, role')
                    .in('role', ['cajero', 'admin', 'owner'])
                    .eq('restaurant_id', profileData.restaurant_id)
                    .neq('id', user?.id)

                setStaff(profiles ?? [])
            }

            // Ver si hay un traspaso pendiente para este usuario
            if (user) {
                const pending = await getPendingHandoff(user.id)
                if (pending) {
                    setHandoff(pending)
                    setStep('accept')
                }
            }
        }
        load()
    }, [])

    // ── CAJERA SALIENTE: confirmar cierre ──
    const handleClose = async () => {
        setLoading(true)
        try {
            // Obtener sesión activa
            const { data: session } = await supabase
                .from('cashbox_sessions')
                .select('id')
                .eq('status', 'open')
                .order('opened_at', { ascending: false })
                .limit(1)
                .single()

            if (!session) {
                alert('No hay sesión de caja activa abierta.')
                setLoading(false)
                return
            }

            const result = await initiateShiftClose({
                sessionId: session!.id,
                physicalCashCounted: parseFloat(physicalCash),
                incomingUserId: incomingUser
            })

            setHandoff(result)
            setStep('waiting')
        } catch (e: any) {
            alert('Error al generar el traspaso: ' + e.message)
        }
        setLoading(false)
    }

    // ── CAJERA ENTRANTE: aceptar ──
    const handleAccept = async () => {
        if (!signature.trim()) {
            alert('Debes escribir tu nombre para confirmar')
            return
        }
        setLoading(true)
        try {
            await acceptHandoff({ handoffId: handoff.id, signature })
            alert('✅ Turno aceptado. Tu sesión de caja ya está activa.')
            window.location.href = '/admin/caja'
        } catch (e: any) {
            alert('Error al aceptar el traspaso: ' + e.message)
        }
        setLoading(false)
    }

    // ────────────────────────────────────────────────────────
    // PANTALLA 1: Contar el dinero
    if (step === 'counting') return (
        <div className="max-w-lg mx-auto p-6 bg-white min-h-[calc(100vh-100px)]">
            <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter text-slate-900">Cierre de turno (Traspaso)</h1>
            <p className="text-slate-500 text-sm mb-6">
                Se generará un acta de traspaso para la cajera entrante con mesas pendientes.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
                <label className="block text-sm font-bold mb-2 text-slate-700">
                    💵 ¿Cuánto dinero físico hay en caja ahora mismo?
                </label>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                    <span className="px-4 bg-slate-50 text-slate-500 border-r border-slate-200 py-3 font-bold">$</span>
                    <input
                        type="number"
                        placeholder="0"
                        value={physicalCash}
                        onChange={e => setPhysicalCash(e.target.value)}
                        className="flex-1 px-4 py-3 outline-none text-xl font-black font-mono text-emerald-600"
                    />
                </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
                <label className="block text-sm font-bold mb-2 text-slate-700">
                    👤 ¿Quién recibe el turno?
                </label>
                <select
                    value={incomingUser}
                    onChange={e => setIncomingUser(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none font-bold text-slate-800 bg-white"
                >
                    <option value="">Seleccionar responsable entrante...</option>
                    {staff.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.full_name} ({s.role.toUpperCase()})
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={() => setStep('confirm')}
                disabled={!physicalCash || !incomingUser}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/30 disabled:opacity-40 transition-all active:scale-[0.98]"
            >
                Continuar al Resumen →
            </button>
            <button
                onClick={() => window.location.href = '/admin/cashier'}
                className="w-full h-14 bg-transparent text-slate-500 hover:text-slate-800 rounded-xl font-bold text-sm mt-2 transition-all"
            >
                Cancelar
            </button>
        </div>
    )

    // ────────────────────────────────────────────────────────
    // PANTALLA 2: Confirmar
    if (step === 'confirm') return (
        <div className="max-w-lg mx-auto p-6 bg-white min-h-[calc(100vh-100px)]">
            <h1 className="text-2xl font-black mb-1 tracking-tighter uppercase text-slate-900">Confirmar Cierre</h1>
            <p className="text-slate-500 text-sm mb-6">Revisa y confirma la declaración de turno.</p>

            {/* Resumen financiero */}
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 mb-4 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm">Dinero contado (Físico)</span>
                    <span className="font-black text-xl font-mono text-slate-900">${parseFloat(physicalCash || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold text-sm">Sistema esperaba</span>
                    <span className="font-mono text-slate-400 font-bold text-xs uppercase bg-slate-100 px-2 py-1 rounded">Cálculo al generar</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="font-bold text-slate-700 text-sm">Cajera o Cajero Entrante</span>
                    <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-blue-100">
                        {staff.find(s => s.id === incomingUser)?.full_name}
                    </span>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800 flex gap-3 shadow-sm">
                <span className="text-xl">⚠️</span>
                <p className="font-semibold leading-relaxed">Al confirmar, tu sesión quedará cerrada con pendiente. Las mesas abiertas pasarán al cajero entrante solo tras su aceptación y firma.</p>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleClose}
                    disabled={loading}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🔒 Cerrar y Traspasar Mi Turno'}
                </button>
                <button
                    onClick={() => setStep('counting')}
                    className="w-full h-14 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                >
                    ← Volver atrás
                </button>
            </div>
        </div>
    )

    // ────────────────────────────────────────────────────────
    // PANTALLA 3: Esperando
    if (step === 'waiting') return (
        <div className="max-w-lg mx-auto p-6 bg-slate-50 min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 animate-pulse">
                <span className="text-4xl">⏳</span>
            </div>
            <h1 className="text-2xl font-black mb-2 tracking-tighter uppercase text-slate-900">Acta en Cola</h1>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
                Esperando que <strong className="text-slate-900">{staff.find(s => s.id === incomingUser)?.full_name}</strong> inicie sesión y acepte el traspaso.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-sm text-emerald-800 shadow-sm max-w-sm w-full">
                <p className="font-black mb-1">✅ Turno cerrado localmente</p>
                <p className="opacity-80 leading-relaxed font-medium">Puedes retirarte de la estación. La Cajera Entrante verá la pantalla de firma automática.</p>
            </div>
        </div>
    )

    // ────────────────────────────────────────────────────────
    // PANTALLA 4: Cajera ENTRANTE acepta el traspaso
    if (step === 'accept' && handoff) return (
        <div className="max-w-lg mx-auto p-6 bg-slate-50 min-h-[calc(100vh-100px)] pt-12">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg font-black italic">!</div>
                <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Acta de Traspaso Pendiente</h1>
            </div>
            <p className="text-slate-500 text-sm mb-6 ml-13 font-medium">
                <strong className="text-slate-800">{handoff.outgoing_profile?.full_name}</strong> entregó su turno. Contrata, revisa y firma la recepción de la estación.
            </p>

            {/* Resumen financiero */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 mb-4">
                <h3 className="font-black text-xs mb-4 text-slate-400 border-b border-slate-100 pb-2">RESUMEN FINANCIERO DECLARADO</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-600">Declarado por Saliente (Gaveta)</span>
                        <span className="font-black text-lg font-mono text-emerald-600">
                            ${handoff.physical_cash_counted?.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">Sistema esperaba</span>
                        <span className="font-mono font-bold text-slate-400">${handoff.system_cash_expected?.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between items-center pt-3 mt-1 border-t border-slate-100 ${handoff.cash_difference < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        <span className="font-black">Diferencia Cierre</span>
                        <span className="font-black text-xl font-mono">
                            {handoff.cash_difference >= 0 ? '+' : ''}
                            ${handoff.cash_difference?.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mesas pendientes */}
            {handoff.pending_tables?.length > 0 && (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 mb-4">
                    <h3 className="font-black text-xs mb-3 text-slate-400">
                        🪑 MESAS EN CURSO/SIN COBRAR ({handoff.pending_tables.length})
                    </h3>
                    <div className="space-y-1">
                        {handoff.pending_tables.map((t: any) => (
                            <div key={t.id} className="flex justify-between text-sm py-2 px-3 bg-slate-50 rounded-xl font-medium">
                                <span className="text-slate-700 uppercase">Mesa {t.tables?.table_number} — <span className="opacity-60">{t.status}</span></span>
                                <span className="font-black font-mono text-slate-900">${t.total?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Firma digital */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
                <label className="block text-sm font-black mb-3 text-blue-900 uppercase">
                    ✍️ CORTESÍA: Tu Firma Electrónica
                </label>
                <input
                    type="text"
                    placeholder="Ej. Nombre y Apellido"
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 outline-none font-bold placeholder-blue-300 text-blue-900 bg-white focus:border-blue-400 transition-colors shadow-sm text-center"
                />
                <p className="text-[10px] text-blue-500 font-bold mt-3 text-center uppercase tracking-wider">
                    Al firmar accedes legalmente las cajas y mesas
                </p>
            </div>

            <button
                onClick={handleAccept}
                disabled={loading || !signature.trim()}
                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-slate-900/30 disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : '✅ Aceptar Traspaso e Iniciar'}
            </button>
        </div>
    )

    return null
}
