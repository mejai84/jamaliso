"use client"

import { useState, useEffect } from "react"
import {
    X, Banknote, CreditCard, Smartphone, Receipt,
    ArrowRight, Calculator, AlertCircle, Trash2,
    Percent, User, Users, ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { CartItem } from "@/app/admin/pos/types"
import { toast } from "sonner"

interface CheckoutModalProps {
    isOpen: boolean
    onClose: () => void
    cart: CartItem[]
    subtotal: number
    taxAmount: number
    total: number
    onConfirm: (data: any) => void
    isProcessing: boolean
}

export function CheckoutModal({
    isOpen,
    onClose,
    cart,
    subtotal,
    taxAmount,
    total: initialTotal,
    onConfirm,
    isProcessing
}: CheckoutModalProps) {
    const [tipType, setTipType] = useState<'percent' | 'manual' | 'none'>('percent')
    const [tipValue, setTipValue] = useState(10) // 10% suggested
    const [serviceCharge, setServiceCharge] = useState(0)
    const [discountValue, setDiscountValue] = useState(0)
    const [splitParts, setSplitParts] = useState(1)
    const [payments, setPayments] = useState<{ method: string, amount: number }[]>([])
    const [cashReceived, setCashReceived] = useState(0)
    const [isIncident, setIsIncident] = useState(false)
    const [incidentReason, setIncidentReason] = useState("")
    const [isCourtesy, setIsCourtesy] = useState(false)
    const [courtesyReason, setCourtesyReason] = useState("")

    const [pinModalOpen, setPinModalOpen] = useState(false)
    const [pinBuffer, setPinBuffer] = useState("")

    if (!isOpen) return null

    const calculatedTip = tipType === 'percent' ? (subtotal * (tipValue / 100)) : tipValue
    const finalTotal = subtotal + taxAmount + calculatedTip + serviceCharge - discountValue

    const handleAddPayment = (method: string, amount: number) => {
        setPayments([...payments, { method, amount }])
    }

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0)
    const remaining = Math.max(0, finalTotal - totalPaid)
    const change = Math.max(0, totalPaid - finalTotal)

    const handleSubmit = () => {
        if (totalPaid < finalTotal && !isIncident && !isCourtesy) {
            toast.error("El pago está incompleto")
            return
        }

        // REQUIERE PIN PARA DESCUENTOS, INCIDENTES O CORTESÍAS
        if (isIncident || isCourtesy || discountValue > 0) {
            setPinModalOpen(true)
            return
        }

        executeConfirm()
    }

    const executeConfirm = () => {
        onConfirm({
            payments,
            tip: calculatedTip,
            service_charge: serviceCharge,
            discount_amount: discountValue,
            total: finalTotal,
            is_incident: isIncident,
            incident_reason: incidentReason,
            is_courtesy: isCourtesy,
            courtesy_reason: courtesyReason,
            authorized_by: (isIncident || isCourtesy || discountValue > 0) ? "SUPERVISOR_PIN_VALIDATED" : "CASHIER"
        })
    }

    const handlePinConfirm = () => {
        if (pinBuffer === "1234") { // Mock supervisor PIN
            setPinModalOpen(false)
            setPinBuffer("")
            executeConfirm()
        } else {
            toast.error("PIN DE SUPERVISOR INCORRECTO")
            setPinBuffer("")
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            {/* PIN MODAL OVERLAY */}
            {pinModalOpen && (
                <div className="absolute inset-0 z-[110] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-6 text-center animate-in zoom-in-95">
                    <div className="max-w-xs w-full space-y-8">
                        <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-orange-500/20">
                            <ShieldAlert className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">AUTORIZACIÓN REQUERIDA</h3>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ingrese PIN de Supervisor para {isCourtesy ? 'CORTESÍA' : isIncident ? 'INCIDENTE' : 'DESCUENTO'}</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-4 h-4 rounded-full border-2 border-white/20 ${pinBuffer.length >= i ? 'bg-orange-500 border-orange-500' : ''}`} />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map(n => (
                                <button
                                    key={n}
                                    onClick={() => {
                                        if (n === 'C') setPinBuffer("")
                                        else if (n === '✓') handlePinConfirm()
                                        else if (pinBuffer.length < 4) setPinBuffer(pinBuffer + n)
                                    }}
                                    className="h-16 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 font-black text-xl text-white transition-all active:scale-95"
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setPinModalOpen(false)} className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-rose-500 transition-colors">CANCELAR OPERACIÓN</button>
                    </div>
                </div>
            )}

            <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative border-4 border-white">

                {/* 1. CONFIGURACIÓN DE CUENTA (LEFT) */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-10 border-r border-slate-100 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Ajustes de <span className="text-orange-600">Cobro</span></h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">Blindaje de Facturación Jamali OS</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-rose-500 hover:text-white rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Propinas y Cargos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Percent className="w-4 h-4 text-orange-600" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Propina Sugerida</h4>
                            </div>
                            <div className="flex gap-2">
                                {[0, 5, 10, 15].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setTipType('percent'); setTipValue(p) }}
                                        className={`flex-1 py-4 rounded-2xl font-black italic text-sm transition-all border-2 ${tipType === 'percent' && tipValue === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-orange-500'}`}
                                    >
                                        {p}%
                                    </button>
                                ))}
                                <button className="flex-1 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-slate-400 text-[10px] italic hover:border-orange-500 uppercase">Manual</button>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-orange-600" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">División de Cuenta</h4>
                            </div>
                            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm">
                                <button onClick={() => setSplitParts(Math.max(1, splitParts - 1))} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black">-</button>
                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-black italic tracking-tighter text-slate-900">{splitParts}</span>
                                    <p className="text-[8px] font-black text-slate-400 uppercase">PARTES IGUALES</p>
                                </div>
                                <button onClick={() => setSplitParts(splitParts + 1)} className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black">+</button>
                            </div>
                            {splitParts > 1 && (
                                <p className="text-center font-black text-orange-600 italic tracking-tighter">
                                    Pagan {formatPrice(finalTotal / splitParts)} por persona
                                </p>
                            )}
                        </section>
                    </div>

                    {/* Descuentos y Seguridad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-rose-500" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Gestión de Incidentes</h4>
                            </div>
                            <button
                                onClick={() => setIsIncident(!isIncident)}
                                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black uppercase italic text-[10px] transition-all ${isIncident ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50'}`}
                            >
                                <ShieldAlert className="w-5 h-5" />
                                {isIncident ? 'MESA MARCADA COMO INCIDENTE' : 'CLIENTE SE FUE SIN PAGAR'}
                            </button>
                            {isIncident && (
                                <textarea
                                    className="w-full bg-white border-2 border-rose-200 rounded-2xl p-4 text-xs font-medium focus:ring-rose-500"
                                    placeholder="Explique el incidente (auditado)..."
                                    value={incidentReason}
                                    onChange={(e) => setIncidentReason(e.target.value)}
                                />
                            )}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-orange-500" />
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Cortesía Especial (AUDITADO)</h4>
                            </div>
                            <button
                                onClick={() => { setIsCourtesy(!isCourtesy); if (!isCourtesy) { setIsIncident(false); setDiscountValue(0); } }}
                                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-black uppercase italic text-[10px] transition-all ${isCourtesy ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-white text-orange-500 border-orange-100 hover:bg-orange-50'}`}
                            >
                                <Users className="w-5 h-5" />
                                {isCourtesy ? 'CORTESÍA ACTIVA (0.00)' : 'APLICAR CORTESÍA TOTAL'}
                            </button>
                            {isCourtesy && (
                                <textarea
                                    className="w-full bg-white border-2 border-orange-200 rounded-2xl p-4 text-xs font-medium focus:ring-orange-500"
                                    placeholder="Motivo de la cortesía (quedará en la hoja de auditoría)..."
                                    value={courtesyReason}
                                    onChange={(e) => setCourtesyReason(e.target.value)}
                                />
                            )}
                        </section>
                    </div>
                </div>

                {/* 2. PROCESO DE PAGO (RIGHT) */}
                <div className="w-full md:w-[450px] bg-slate-900 border-l border-white/5 p-8 md:p-12 flex flex-col text-white">
                    <div className="flex-1 space-y-10">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4 italic">Total Neto a Cobrar</p>
                            <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-none text-orange-500 animate-pulse">
                                {formatPrice(finalTotal)}
                            </h2>
                            <div className="flex justify-center flex-wrap gap-2 mt-6">
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white/50 border border-white/10 italic">SUBT: {formatPrice(subtotal)}</span>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white/50 border border-white/10 italic">TAX: {formatPrice(taxAmount)}</span>
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-orange-500 border border-orange-500/30 italic">TIP: {formatPrice(calculatedTip)}</span>
                            </div>
                        </div>

                        {/* Pagos Realizados */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest italic px-2">
                                <span>Pagos Registrados</span>
                                <span>{payments.length} recibidos</span>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                {payments.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                {p.method === 'cash' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                            </div>
                                            <span className="text-[10px] font-black uppercase italic">{p.method}</span>
                                        </div>
                                        <span className="text-lg font-black tracking-tighter italic">{formatPrice(p.amount)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Calculadora de Cambio */}
                            {remaining > 0 ? (
                                <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-[2rem] flex flex-col items-center justify-center gap-2">
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Saldo Pendiente</p>
                                    <p className="text-4xl font-black italic tracking-tighter text-orange-500">{formatPrice(remaining)}</p>
                                </div>
                            ) : (
                                <div className="p-6 bg-emerald-600/10 border border-emerald-500/20 rounded-[2rem] flex flex-col items-center justify-center gap-2">
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Cambio a Entregar (Vuelto)</p>
                                    <p className="text-4xl font-black italic tracking-tighter text-emerald-500">{formatPrice(change)}</p>
                                </div>
                            )}
                        </div>

                        {/* Selector de Métodos */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    const amount = prompt("Monto en Efectivo?", remaining.toString())
                                    if (amount) handleAddPayment('cash', Number(amount))
                                }}
                                className="h-20 bg-white/5 hover:bg-orange-500 hover:text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-all group border border-white/5"
                            >
                                <Banknote className="w-6 h-6 group-hover:scale-110" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Efectivo</span>
                            </button>
                            <button
                                onClick={() => handleAddPayment('card', remaining)}
                                className="h-20 bg-white/5 hover:bg-emerald-500 hover:text-white rounded-3xl flex flex-col items-center justify-center gap-2 transition-all group border border-white/5"
                            >
                                <CreditCard className="w-6 h-6 group-hover:scale-110" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Tarjeta</span>
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isProcessing || (totalPaid < finalTotal && !isIncident)}
                        className="h-24 bg-white text-slate-900 hover:bg-orange-500 hover:text-white rounded-[2rem] font-black uppercase text-xl italic tracking-tighter shadow-2xl transition-all group active:scale-95 disabled:opacity-20 flex flex-col leading-none"
                    >
                        {isProcessing ? (
                            <ArrowRight className="w-8 h-8 animate-spin" />
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <span>{isIncident ? 'CERRAR COMO INCIDENTE' : 'FINALIZAR COBRO'}</span>
                                    <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                                </div>
                                <span className="text-[8px] opacity-40 mt-1 uppercase tracking-widest font-black">Emitir Ticket de Venta</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(0, 0, 0, 0.05); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
