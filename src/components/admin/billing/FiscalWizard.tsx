'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShieldCheck,
    FileText,
    Key,
    Rocket,
    ChevronRight,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Info,
    Smartphone,
    X,
    Cpu
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveFiscalConfig } from '@/actions/billing-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FiscalWizardProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId: string;
}

const STEPS = [
    { id: 'empresa', title: 'Empresa', icon: FileText, description: 'Datos legales y de hardware' },
    { id: 'software', title: 'Software', icon: Smartphone, description: 'ID y PIN de la DIAN' },
    { id: 'certificate', title: 'Certificado', icon: Key, description: 'Firma digital .p12' },
    { id: 'activation', title: 'Activación', icon: Rocket, description: 'Set de pruebas y producción' }
]

export function FiscalWizard({ isOpen, onClose, restaurantId }: FiscalWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [completed, setCompleted] = useState(false)

    const [formData, setFormData] = useState({
        nit: '',
        businessName: '',
        plateNumber: 'JAM-001',
        softwareId: '',
        softwarePin: '',
        certificate: '',
        certPassword: '',
        testSetId: '',
        technicalKey: '',
        prefix: 'JAM',
        startNumber: 1,
        isProduction: false
    })

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await saveFiscalConfig(restaurantId, formData)
            toast.success("¡Configuración fiscal guardada exitosamente!")
            setCompleted(true)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Background Blur Overlay */}
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
                className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden font-sans max-h-[90vh] overflow-y-auto"
            >
                {/* 🛡️ Header Pixora */}
                <div className="p-8 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
                            <Cpu className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                Configuración <span className="text-orange-500 text-glow">SOFTWARE DIAN</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">
                                JAMALI OS • Fiscal Engine v3.0 • Hardware Verified
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="p-6 md:p-10">
                    {completed ? (
                        <div className="py-12 text-center animate-in zoom-in duration-700">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10"
                            >
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </motion.div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">¡Sistema Vinculado!</h2>
                            <p className="text-slate-400 font-bold italic mb-10 max-w-md mx-auto leading-relaxed">
                                JAMALI OS ahora está legalmente operativo con la DIAN en ambiente de {formData.isProduction ? 'PRODUCCIÓN' : 'HABILITACIÓN'}.
                            </p>
                            <Button className="h-16 px-12 bg-white text-slate-950 font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl hover:bg-slate-100" onClick={() => window.location.reload()}>
                                Finalizar y Reiniciar
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Stepper Visual */}
                            <div className="flex justify-between relative px-2 md:px-4">
                                <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/5 -z-0 hidden md:block" />
                                {STEPS.map((step, idx) => {
                                    const Icon = step.icon
                                    const isActive = idx === currentStep
                                    const isPast = idx < currentStep

                                    return (
                                        <div key={step.id} className="flex flex-col items-center gap-2 md:gap-3 z-10">
                                            <motion.div
                                                animate={{
                                                    backgroundColor: isActive ? '#EA580C' : isPast ? '#22C55E' : '#111827',
                                                    borderColor: isActive ? '#F97316' : isPast ? '#10B981' : '#1F2937',
                                                    scale: isActive ? 1.1 : 1
                                                }}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border flex items-center justify-center transition-all shadow-lg shadow-black/50"
                                            >
                                                {isPast ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <Icon className={cn("w-4 h-4 md:w-5 md:h-5", isActive ? "text-white" : "text-slate-500")} />}
                                            </motion.div>
                                            <span className={cn("text-[7px] md:text-[9px] font-black uppercase tracking-widest italic text-center", isActive ? "text-orange-500" : "text-slate-500")}>
                                                {step.title}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                            <Card className="p-6 md:p-10 bg-white/[0.02] border-white/5 rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black italic uppercase text-white leading-none">{STEPS[currentStep].title}</h3>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{STEPS[currentStep].description}</p>
                                        </div>

                                        {currentStep === 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">NIT de la Empresa</Label>
                                                    <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold" placeholder="900.123.456-7" value={formData.nit} onChange={e => setFormData({ ...formData, nit: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Razón Social</Label>
                                                    <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold" placeholder="Nombre en RUT" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Placa de Máquina (Hardware)</Label>
                                                    <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold" value={formData.plateNumber} onChange={e => setFormData({ ...formData, plateNumber: e.target.value })} />
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 1 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                <div className="space-y-3 col-span-2">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Software ID (DIAN)</Label>
                                                    <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold tracking-widest text-orange-500" value={formData.softwareId} onChange={e => setFormData({ ...formData, softwareId: e.target.value })} />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Software PIN</Label>
                                                    <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold" type="password" value={formData.softwarePin} onChange={e => setFormData({ ...formData, softwarePin: e.target.value })} />
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <div
                                                    className="p-8 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] text-center hover:bg-white/[0.03] transition-colors cursor-pointer group relative"
                                                    onClick={() => document.getElementById('cert-file-input')?.click()}
                                                >
                                                    <Key className="w-12 h-12 mx-auto mb-4 text-orange-500 group-hover:scale-110 transition-transform" />
                                                    {formData.certificate ? (
                                                        <>
                                                            <span className="text-sm font-black italic uppercase text-emerald-400 tracking-widest">✅ Certificado Cargado</span>
                                                            <p className="text-[10px] text-slate-500 mt-2 uppercase font-black tracking-tighter">Haz clic para reemplazar</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-black italic uppercase text-white tracking-widest">Inyectar Certificado (.p12)</span>
                                                            <p className="text-[10px] text-slate-500 mt-2 uppercase font-black tracking-tighter">JAMALI OS Securitize Engine · Haz clic para seleccionar</p>
                                                        </>
                                                    )}
                                                    <Input
                                                        id="cert-file-input"
                                                        type="file"
                                                        accept=".p12,.pfx"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (!file) return
                                                            const reader = new FileReader()
                                                            reader.onload = (ev) => {
                                                                const base64 = (ev.target?.result as string).split(',')[1]
                                                                setFormData(fd => ({ ...fd, certificate: base64 }))
                                                            }
                                                            reader.readAsDataURL(file)
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">PIN del Certificado</Label>
                                                    <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold" type="password" value={formData.certPassword} onChange={e => setFormData({ ...formData, certPassword: e.target.value })} />
                                                </div>
                                            </div>
                                        )}


                                        {currentStep === 3 && (
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Test Set ID</Label>
                                                        <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold" value={formData.testSetId} onChange={e => setFormData({ ...formData, testSetId: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Prefijo Fiscal</Label>
                                                        <Input className="h-14 bg-black/40 border-white/10 rounded-xl font-bold uppercase" value={formData.prefix} onChange={e => setFormData({ ...formData, prefix: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 p-8 bg-orange-600/10 border border-orange-600/20 rounded-3xl">
                                                    <input type="checkbox" className="w-6 h-6 accent-orange-600" checked={formData.isProduction} onChange={e => setFormData({ ...formData, isProduction: e.target.checked })} />
                                                    <div>
                                                        <p className="text-xs font-black italic uppercase text-orange-500 tracking-widest">Activar Ambiente de Producción</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1 italic">
                                                            Advertencia: La emisión será legalmente vinculante ante la DIAN.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="mt-12 flex justify-between">
                                    <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0 || loading} className="font-black italic uppercase text-[10px] tracking-widest text-slate-500 pr-10">
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                                    </Button>
                                    <Button onClick={handleNext} disabled={loading} className="h-16 px-12 bg-orange-600 shadow-xl shadow-orange-600/20 text-white font-black uppercase text-xs italic tracking-widest rounded-2xl hover:bg-orange-500">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : currentStep === STEPS.length - 1 ? 'Activar Software DIAN' : 'Siguiente Paso'}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
