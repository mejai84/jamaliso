"use client"

import { useRef, useState, useEffect } from "react"
import { X, ShieldCheck, Wallet, CheckCircle, Printer, Loader2, Trash2, Camera, ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PettyCashVoucher, Employee, EXPENSE_CONCEPTS } from "@/app/admin/petty-cash/types"

interface EmissionModalProps {
    isOpen: boolean
    onClose: () => void
    employees: Employee[]
    onSubmit: (voucher: any, signature: string) => Promise<void>
    onPreview: (voucher: any, signature: string | null) => void
    onPrint: (voucher: any) => void
    loading: boolean
    showSuccess: boolean
    lastSavedVoucher: any
    numeroALetras: (num: number) => string
}

export function EmissionModal({
    isOpen,
    onClose,
    employees,
    onSubmit,
    onPreview,
    onPrint,
    loading,
    showSuccess,
    lastSavedVoucher,
    numeroALetras
}: EmissionModalProps) {
    const [signature, setSignature] = useState<string | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("other")

    const [formData, setFormData] = useState({
        beneficiary_name: "",
        cargo: "",
        amount: 0,
        amount_in_words: "",
        concept: "",
        accounting_code: "5105",
        category: "Otros"
    })

    const handleEmployeeSelect = (id: string) => {
        setSelectedEmployeeId(id)
        if (id === "other") {
            setFormData({ ...formData, beneficiary_name: "", cargo: "" })
        } else {
            const emp = employees.find(e => e.id === id)
            if (emp) {
                setFormData({
                    ...formData,
                    beneficiary_name: emp.full_name,
                    cargo: emp.role.toUpperCase()
                })
            }
        }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        let x, y
        if ('touches' in e) {
            x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width)
            y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
        } else {
            x = (e.clientX - rect.left) * (canvas.width / rect.width)
            y = (e.clientY - rect.top) * (canvas.height / rect.height)
        }
        ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#000';
        ctx.beginPath(); ctx.moveTo(x, y);
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return
        const rect = canvas.getBoundingClientRect()
        let x, y
        if ('touches' in e) {
            e.preventDefault(); x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width); y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
        } else {
            x = (e.clientX - rect.left) * (canvas.width / rect.width); y = (e.clientY - rect.top) * (canvas.height / rect.height)
        }
        ctx.lineTo(x, y); ctx.stroke();
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        if (canvasRef.current) setSignature(canvasRef.current.toDataURL())
    }

    const clearSignature = () => {
        const canvas = canvasRef.current; const ctx = canvas?.getContext('2d')
        if (canvas && ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); setSignature(null) }
    }

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current
            if (canvas && canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect()
                canvas.width = rect.width; canvas.height = rect.height; setSignature(null)
            }
        }
        if (isOpen && !showSuccess) { setTimeout(resizeCanvas, 100); window.addEventListener('resize', resizeCanvas) }
        return () => window.removeEventListener('resize', resizeCanvas)
    }, [isOpen, showSuccess])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="bg-slate-950/40 backdrop-blur-3xl w-full max-w-5xl rounded-[4rem] border border-white/5 shadow-3xl relative overflow-hidden flex flex-col max-h-[95vh] outline-none">
                <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none -mr-20 -mt-20">
                    <Wallet className="w-96 h-96 text-orange-500" />
                </div>

                <div className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02] relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-orange-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 italic">Emission Protocol</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Autorizar <span className="text-orange-500">Egreso</span></h1>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 text-slate-500 hover:bg-white/5 hover:text-white active:scale-90 transition-all border border-transparent" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <div className="p-12 overflow-y-auto custom-scrollbar relative z-10 selection:bg-primary selection:text-primary-foreground">
                    {showSuccess ? (
                        <div className="text-center py-16 space-y-10 animate-in zoom-in-95 duration-700">
                            <div className="w-40 h-40 bg-primary/10 text-primary rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-3xl shadow-primary/10 relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] animate-ping" />
                                <CheckCircle className="w-20 h-20 relative z-10" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-6xl font-black text-foreground uppercase tracking-tighter italic leading-none">Protocolo <br /> <span className="text-primary italic">Confirmado</span></h2>
                                <p className="text-muted-foreground mt-4 font-bold italic uppercase tracking-widest text-sm opacity-60">El comprobante P-{String(lastSavedVoucher?.voucher_number).padStart(5, '0')} ha sido indexado.</p>
                            </div>
                            <div className="flex flex-col gap-5 pt-10 max-w-md mx-auto">
                                <Button onClick={() => onPrint(lastSavedVoucher)} className="h-24 text-2xl font-black bg-foreground text-background hover:bg-primary hover:text-primary-foreground gap-5 rounded-[2rem] shadow-3xl transition-all uppercase italic tracking-[0.1em] border-none group">
                                    <Printer className="w-8 h-8 group-hover:scale-110 transition-transform" /> DESCARGAR TICKET
                                </Button>
                                <Button variant="ghost" onClick={onClose} className="h-16 font-black rounded-2xl text-muted-foreground/40 hover:text-foreground uppercase text-[10px] tracking-[0.3em] italic hover:bg-muted/50 transition-all">
                                    CONCLUIR OPERACIÓN Y CERRAR
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); if (signature) onSubmit(formData, signature) }} className="space-y-12">
                            <div className="grid grid-cols-1 gap-10">
                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-primary italic font-black text-sm shadow-sm">01</div>
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Entidad Receptora del Capital</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8 p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-inner">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Selección Maestro</label>
                                            <select className="w-full h-18 bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 outline-none focus:border-orange-500/40 transition-all font-black italic text-sm text-white appearance-none cursor-pointer" value={selectedEmployeeId} onChange={(e) => handleEmployeeSelect(e.target.value)}>
                                                <option value="other" className="bg-slate-900 uppercase">VENTA DIRECTA / PROVEEDOR EXTERNO</option>
                                                {employees.map(emp => <option key={emp.id} value={emp.id} className="bg-slate-900 uppercase">{emp.full_name.toUpperCase()} — [{emp.role.toUpperCase()}]</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-6 italic">Identificación Nominal</label>
                                            <input required className="w-full h-18 bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 outline-none focus:border-orange-500/40 transition-all font-black text-lg text-white uppercase" placeholder="NOMBRE COMPLETO" value={formData.beneficiary_name} onChange={e => setFormData({ ...formData, beneficiary_name: e.target.value.toUpperCase() })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 italic font-black text-sm shadow-sm">02</div>
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Valuación Financiera</h2>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-8 p-10 bg-white/[0.02] rounded-[3.5rem] border border-white/5 shadow-inner">
                                        <div className="md:col-span-1 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/60 ml-6 italic">Magnitud del Egreso ($)</label>
                                            <div className="relative">
                                                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-orange-500 font-black text-2xl italic opacity-50">$</span>
                                                <input required type="number" className="w-full h-24 bg-white/[0.03] border-none ring-4 ring-orange-500/10 focus:ring-orange-500/30 rounded-[2.5rem] pl-16 pr-8 outline-none transition-all font-black text-4xl text-orange-500 text-center italic shadow-2xl" placeholder="0" value={formData.amount || ""} onChange={e => {
                                                    const val = parseFloat(e.target.value) || 0; setFormData({ ...formData, amount: val, amount_in_words: numeroALetras(val) })
                                                }} />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500/60 ml-6 italic">Valor Indexado en Letras</label>
                                            <div className="w-full h-24 bg-white/[0.02] border border-white/5 rounded-[2.5rem] px-10 flex items-center text-slate-600 font-black uppercase italic tracking-tighter text-sm leading-relaxed shadow-sm">
                                                {formData.amount_in_words || "PROTOCOLO DE VALOR VACÍO"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 italic font-black text-sm shadow-sm">03</div>
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Contexto Operativo & Causal</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8 p-10 bg-white/[0.02] rounded-[3.5rem] border border-white/5 shadow-inner">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500/60 ml-6 italic">Naturaleza del Gasto</label>
                                            <input required list="concepts-list" className="w-full h-20 bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 outline-none focus:border-orange-500/30 transition-all font-black italic text-white placeholder:text-slate-800" placeholder="EJ: INSUMOS CRÍTICOS..." value={formData.concept} onChange={e => setFormData({ ...formData, concept: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500/60 ml-6 italic">Clasificador Contable</label>
                                            <select className="w-full h-20 bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 outline-none focus:border-orange-500/30 transition-all font-black italic text-white cursor-pointer appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="Limpieza" className="bg-slate-900">PROTOCOLOS DE LIMPIEZA</option>
                                                <option value="Comida / Insumos" className="bg-slate-900">MATERIA PRIMA (COCINA)</option>
                                                <option value="Reparaciones" className="bg-slate-900">MANTENIMIENTO TÉCNICO</option>
                                                <option value="Servicios Públicos" className="bg-slate-900">SUMINISTROS & SERVICIOS</option>
                                                <option value="Nómina" className="bg-slate-900">PASIVOS LABORALES (ADELANTOS)</option>
                                                <option value="Otros" className="bg-slate-900">REQUERIMIENTOS VARIOS</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 italic font-black text-sm shadow-sm">04</div>
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Protocolo de Seguridad (Firma)</h2>
                                    </div>
                                    <div className="p-10 bg-white/[0.02] rounded-[4rem] border-2 border-dashed border-white/10 shadow-sm group/signature">
                                        <div className="flex justify-between items-center mb-8 px-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Autenticación Biométrica/Digital</p>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase italic opacity-40">Firma requerida para liberación de fondos</p>
                                            </div>
                                            {signature && <Button type="button" variant="ghost" size="sm" className="h-10 px-6 text-rose-500 text-[10px] font-black hover:bg-rose-500/10 rounded-xl uppercase tracking-widest gap-2 border border-transparent hover:border-rose-500/20" onClick={clearSignature}><Trash2 className="w-4 h-4" /> RESETEAR FIRMA</Button>}
                                        </div>
                                        <div className="relative bg-black rounded-[3rem] overflow-hidden shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] h-80 ring-1 ring-white/10 group-hover/signature:ring-orange-500/20 transition-all duration-500">
                                            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
                                            {!signature && <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.02]"><Camera className="w-32 h-32 mb-4" /><span className="text-5xl font-black text-white uppercase italic tracking-[0.3em] -rotate-3 leading-none">VALIDACIÓN DIGITAL</span></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <datalist id="concepts-list">{EXPENSE_CONCEPTS.map(c => <option key={c} value={c} />)}</datalist>

                            <div className="flex flex-col md:flex-row gap-6 pt-10">
                                <Button type="button" variant="outline" onClick={() => onPreview(formData, signature)} disabled={!formData.beneficiary_name || formData.amount <= 0 || !signature} className="w-full md:w-1/3 h-24 text-base font-black uppercase tracking-[0.3em] border-2 border-white/10 rounded-[2.5rem] text-slate-700 hover:text-white hover:border-white transition-all italic shadow-xl bg-white/5 active:scale-95 flex flex-col items-center justify-center gap-1">
                                    <Eye className="w-6 h-6 border-none shadow-none" /><span>AUDITAR PREVIA</span>
                                </Button>
                                <Button type="submit" disabled={loading || !signature || !formData.beneficiary_name || formData.amount <= 0} className={cn("flex-1 h-24 text-3xl font-black uppercase tracking-[0.1em] transition-all rounded-[2.5rem] shadow-2xl italic border-none group relative overflow-hidden", (!signature || loading || !formData.beneficiary_name || formData.amount <= 0) ? "bg-white/5 text-slate-800 cursor-not-allowed opacity-50" : "bg-orange-600 text-black hover:bg-orange-500 hover:scale-[1.02] shadow-orange-500/20 active:scale-95")}>
                                    {loading ? <div className="flex items-center gap-6"><Loader2 className="w-10 h-10 animate-spin" /><span className="text-xl">INDEXANDO DATOS...</span></div> : <div className="flex items-center justify-center gap-6">EJECUTAR DESEMBOLSO<ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" /></div>}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
