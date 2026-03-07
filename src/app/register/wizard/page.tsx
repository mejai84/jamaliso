"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Rocket,
    Store,
    Layout,
    Palette,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Globe,
    UtensilsCrossed,
    Layers,
    Sparkles,
    ShieldCheck,
    CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

const STEPS = [
    { id: 1, title: 'Identidad', icon: Store, desc: 'Nombre y URL de tu negocio' },
    { id: 2, title: 'Infraestructura', icon: Layers, desc: 'Mesas y puntos de servicio' },
    { id: 3, title: 'Branding', icon: Palette, desc: 'Tu estilo visual' },
    { id: 4, title: 'Cuenta', icon: Rocket, desc: 'Tus credenciales maestras' },
    { id: 5, title: 'Plan', icon: CreditCard, desc: 'Elige tu plan y activa' }
]

const PLANS = [
    {
        id: 'emprende',
        name: 'Emprende',
        price: 199000,
        features: ['Hasta 15 mesas', 'KDS Cocina included', 'Pedidos QR Ilimitados', 'Soporte vía Ticket'],
        color: 'blue'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 349000,
        features: ['Mesas Ilimitadas', 'Gestión de Inventariosv2', 'Reportes Avanzados', 'Soporte prioritario WhatsApp'],
        color: 'orange',
        popular: true
    }
]

export default function RegisterWizard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div>}>
            <WizardContent />
        </Suspense>
    )
}

function WizardContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [percent, setPercent] = useState(25)

    // Form State
    const [formData, setFormData] = useState({
        restaurantName: '',
        slug: '',
        cuisineType: 'Tradicional',
        tableCount: 10,
        hasBar: true,
        hasTerrace: false,
        primaryColor: '#ff4d00',
        ownerName: '',
        email: '',
        password: '',
        selectedPlan: 'pro',
        paymentId: ''
    })

    const [isPaid, setIsPaid] = useState(false)

    useEffect(() => {
        setPercent((currentStep / STEPS.length) * 100)
    }, [currentStep])

    useEffect(() => {
        const step = searchParams.get('step')
        const status = searchParams.get('status')
        if (step) {
            setCurrentStep(parseInt(step))
            if (status === 'success') {
                setIsPaid(true)
                toast.success("Pago verificado con éxito. ¡Vamos al último paso!")
            }
        }
    }, [searchParams])

    // Persistir datos del formulario para el redirect de pago
    useEffect(() => {
        const savedData = localStorage.getItem('wizard_form_data')
        if (savedData) {
            try {
                setFormData(JSON.parse(savedData))
            } catch (e) {
                console.error("Error restoration wizard data", e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('wizard_form_data', JSON.stringify(formData))
    }, [formData])

    const handleNext = () => {
        if (currentStep === 1 && !formData.restaurantName) {
            toast.error("Por favor ingresa el nombre de tu restaurante")
            return
        }
        if (currentStep === 4) {
            if (!formData.email || !formData.password || !formData.ownerName) {
                toast.error("Por favor completa tus datos de acceso")
                return
            }
        }
        if (currentStep === 5 && !isPaid) {
            toast.error("Por favor completa el pago para despegar")
            return
        }
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePayment = async () => {
        if (!formData.email) {
            toast.error("Ingresa el email en el siguiente paso para asociar el pago (o vuelve a branding)")
            // Opcional: mover validación de email antes del pago
            setCurrentStep(5) // Saltamos a pedir email si no hay
            return
        }

        setLoading(true)
        try {
            const plan = PLANS.find(p => p.id === formData.selectedPlan)
            const response = await fetch('/api/mercadopago/preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planName: plan?.name,
                    price: plan?.price,
                    restaurantName: formData.restaurantName,
                    email: formData.email
                })
            })

            const data = await response.json()
            if (data.init_point) {
                window.location.href = data.init_point
            } else {
                throw new Error("No se pudo generar el link de pago")
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleFinalize = async () => {
        setLoading(true)
        try {
            // 1. Crear Usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.ownerName,
                        role: 'admin'
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("No se pudo crear el usuario")

            // 2. Crear el Restaurante
            const { data: restData, error: restError } = await supabase
                .from('restaurants')
                .insert({
                    name: formData.restaurantName,
                    subdomain: formData.slug,
                    primary_color: formData.primaryColor,
                    logo_url: '', // TODO: Permitir subida de logo real
                })
                .select()
                .single()

            if (restError) throw restError

            // 3. Vincular Perfil con el Restaurante y Rol
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    restaurant_id: restData.id,
                    role: 'admin'
                })
                .eq('id', authData.user.id)

            if (profileError) throw profileError

            // 4. Provisionamiento inicial (Mesas)
            const tableInserts = Array.from({ length: formData.tableCount }).map((_, i) => ({
                restaurant_id: restData.id,
                table_number: i + 1,
                status: 'free',
                capacity: 4
            }))

            await supabase.from('tables').insert(tableInserts)

            localStorage.removeItem('wizard_form_data')

            toast.success("¡Bienvenido a JAMALI OS! Tu restaurante está listo.")
            router.push('/admin/dashboard')

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-orange-500 selection:text-white">

            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">

                {/* Sidebar Status (Visible en desktop) */}
                <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-between hidden lg:flex shadow-2xl">
                    <div className="space-y-12">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                <Sparkles className="text-white w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase">JAMALI <span className="text-orange-500 drop-shadow-[0_2px_10px_rgba(249,115,22,0.4)]">OS</span></h2>
                        </div>

                        <div className="space-y-8">
                            {STEPS.map((step) => {
                                const Icon = step.icon
                                const isActive = currentStep === step.id
                                const isCompleted = currentStep > step.id
                                return (
                                    <div key={step.id} className={cn(
                                        "flex items-start gap-4 transition-all duration-500",
                                        isActive ? "opacity-100 scale-105" : "opacity-40"
                                    )}>
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all",
                                            isActive ? "bg-orange-500 border-orange-500 text-white shadow-orange-500/50 shadow-lg" :
                                                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 leading-none mb-1">Paso 0{step.id}</p>
                                            <h3 className="font-bold text-lg leading-tight uppercase tracking-tight italic">{step.title}</h3>
                                            <p className="text-[10px] text-white/40 uppercase font-medium">{step.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                            <span>PROGRESO DE CONFIGURACIÓN</span>
                            <span>{percent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Wizard Form */}
                <div className="lg:col-span-8 bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] shadow-2xl p-8 md:p-14 flex flex-col justify-between overflow-hidden relative">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.4 }}
                            className="flex-1"
                        >
                            {currentStep === 1 && (
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">IDENTIDAD DEL <span className="text-orange-500 underline decoration-4 underline-offset-8">NEGOCIO</span></h1>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-8">Define tu nombre y dirección digital</p>
                                    </div>

                                    <div className="grid gap-8">
                                        <div className="space-y-3 group">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4 group-focus-within:text-orange-500 transition-colors">NOMBRE DEL RESTAURANTE</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="EJ: PARGO ROJO BISTRO"
                                                    className="h-16 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500/20 focus:ring-0 px-8 text-xl font-black italic uppercase tracking-tight transition-all"
                                                    value={formData.restaurantName}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        setFormData({
                                                            ...formData,
                                                            restaurantName: val,
                                                            slug: val.toLowerCase().replace(/\s+/g, '-')
                                                        })
                                                    }}
                                                />
                                                <UtensilsCrossed className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200 group-focus-within:text-orange-200 transition-colors" />
                                            </div>
                                        </div>

                                        <div className="space-y-3 group">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">URL PERSONALIZADA (SLUG)</Label>
                                            <div className="flex items-center bg-slate-100 rounded-2xl px-6 border-2 border-transparent focus-within:border-orange-500/20 transition-all">
                                                <span className="text-slate-400 font-bold text-sm italic">jamali.so/</span>
                                                <input
                                                    className="h-16 flex-1 bg-transparent border-none outline-none text-xl font-black italic text-orange-600 tracking-tight lowercase"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.replace(/\s+/g, '-') })}
                                                />
                                                <Globe className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest ml-4 italic">ESTA SERÁ TU DIRECCIÓN PARA PEDIDOS QR Y ADMINISTRACIÓN</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">CONFIGURACIÓN DE <span className="text-orange-500 decoration-4 underline-offset-8">PISO</span></h1>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-8">Estructura operativa de tu salón</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 space-y-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500">CAPACIDAD DE MESAS</Label>
                                                <span className="text-3xl font-black italic text-orange-600">{formData.tableCount}</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="50"
                                                className="w-full accent-orange-500 cursor-pointer"
                                                value={formData.tableCount}
                                                onChange={(e) => setFormData({ ...formData, tableCount: parseInt(e.target.value) })}
                                            />
                                            <p className="text-[9px] font-medium text-slate-400 uppercase leading-relaxed italic text-center">EL SISTEMA GENERARÁ EL MAPA DE MESAS INICIAL AUTOMÁTICAMENTE</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div
                                                onClick={() => setFormData({ ...formData, hasBar: !formData.hasBar })}
                                                className={cn(
                                                    "p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                                                    formData.hasBar ? "bg-orange-500/5 border-orange-500 text-orange-600" : "bg-white border-slate-100 hover:border-slate-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", formData.hasBar ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400")}>
                                                        <UtensilsCrossed className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-black italic uppercase tracking-tight">TIENE BARRA</span>
                                                </div>
                                                {formData.hasBar && <CheckCircle2 className="w-6 h-6 animate-in zoom-in" />}
                                            </div>

                                            <div
                                                onClick={() => setFormData({ ...formData, hasTerrace: !formData.hasTerrace })}
                                                className={cn(
                                                    "p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                                                    formData.hasTerrace ? "bg-orange-500/5 border-orange-500 text-orange-600" : "bg-white border-slate-100 hover:border-slate-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", formData.hasTerrace ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400")}>
                                                        <Globe className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-black italic uppercase tracking-tight">ZONA TERRAZA</span>
                                                </div>
                                                {formData.hasTerrace && <CheckCircle2 className="w-6 h-6 animate-in zoom-in" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">PERSONALIZACIÓN <span className="text-orange-500 decoration-4 underline-offset-8">VISUAL</span></h1>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-8">El alma cromática de tu marca blanca</p>
                                    </div>

                                    <div className="grid gap-12">
                                        <div className="flex flex-wrap gap-4">
                                            {['#ff4d00', '#7c3aed', '#2563eb', '#16a34a', '#db2777', '#000000'].map(color => (
                                                <div
                                                    key={color}
                                                    onClick={() => setFormData({ ...formData, primaryColor: color })}
                                                    className={cn(
                                                        "w-20 h-20 rounded-[2rem] cursor-pointer transition-all border-4 flex items-center justify-center",
                                                        formData.primaryColor === color ? "border-slate-900 scale-110 shadow-2xl" : "border-transparent opacity-40 hover:opacity-100"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {formData.primaryColor === color && <CheckCircle2 className="text-white w-8 h-8 drop-shadow-lg" />}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white flex items-center gap-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                            <div
                                                className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500"
                                                style={{
                                                    backgroundColor: formData.primaryColor,
                                                    boxShadow: `0 0 40px ${formData.primaryColor}66`
                                                }}
                                            >
                                                <Layout className="w-10 h-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-black italic uppercase tracking-tighter">PREVISUALIZACIÓN</h4>
                                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] italic leading-tight">SISTEMA DINÁMICO DE MARCA BLANCA V2.2</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">ACTIVA TU <span className="text-orange-500 decoration-4 underline-offset-8">PLAN</span></h1>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-8">Selecciona la potencia de tu sistema</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {PLANS.map((plan) => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setFormData({ ...formData, selectedPlan: plan.id })}
                                                className={cn(
                                                    "relative p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all flex flex-col gap-6",
                                                    formData.selectedPlan === plan.id ? "bg-white border-orange-500 ring-4 ring-orange-500/10 shadow-2xl scale-[1.02]" : "bg-slate-50 border-slate-100 hover:border-slate-300 opacity-70"
                                                )}
                                            >
                                                {plan.popular && (
                                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg italic tracking-widest">MÁS POPULAR</div>
                                                )}
                                                <div className="flex justify-between items-start">
                                                    <div className={cn("w-14 h-14 rounded-2x flex items-center justify-center rotate-3", plan.color === 'orange' ? "bg-orange-500 text-white" : "bg-blue-500 text-white")}>
                                                        {plan.color === 'orange' ? <Rocket className="w-8 h-8" /> : <Layers className="w-8 h-8" />}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Costo Mensual</p>
                                                        <p className="text-2xl font-black italic text-slate-900 leading-none">${plan.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">{plan.name}</h3>
                                                    <ul className="mt-4 space-y-2">
                                                        {plan.features.map((f, i) => (
                                                            <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-8 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-3xl flex items-center justify-center">
                                                <CreditCard className="w-8 h-8 text-orange-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter">PAGO SEGURO VÍA MERCADO PAGO</h4>
                                                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic leading-tight">ENLACE CIFRADO AES-256</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handlePayment}
                                            disabled={loading || isPaid}
                                            className={cn(
                                                "rounded-2xl h-16 px-10 font-black italic uppercase text-lg tracking-widest w-full md:w-auto shadow-lg active:scale-95 transition-all",
                                                isPaid ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                                            )}
                                        >
                                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                                isPaid ? "PLAN ACTIVADO ✓" : "ACTIVAR AHORA"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-10">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">ACCESO <span className="text-orange-500 decoration-4 underline-offset-8">MAESTRO</span></h1>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-8">Credenciales de seguridad administrativa</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">NOMBRE DEL PROPIETARIO</Label>
                                                <Input
                                                    placeholder="EJ: CESAR JAMALI"
                                                    className="h-16 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500/20 px-6 font-bold uppercase italic"
                                                    value={formData.ownerName}
                                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">EMAIL CORPORATIVO</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="admin@tu-negocio.com"
                                                    className="h-16 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500/20 px-6 font-bold italic"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-4">CONTRASEÑA DE ACCESO</Label>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="h-16 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500/20 px-6 font-black"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>

                                        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4 mt-6">
                                            <ShieldCheck className="text-emerald-500 w-8 h-8" />
                                            <p className="text-[9px] font-bold text-emerald-600 uppercase italic leading-tight">LOS DATOS SE ALOJARÁN EN UN NODO DE BASE DE DATOS CIFRADO Y AISLADO (MULTI-TENANT ISOLATION).</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 1 || loading}
                            className="h-14 md:h-16 px-8 rounded-2xl font-black uppercase text-xs italic tracking-widest flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" /> ATRÁS
                        </Button>

                        {currentStep === 5 ? (
                            <Button
                                onClick={handleFinalize}
                                disabled={loading || !isPaid}
                                className={cn(
                                    "h-14 md:h-16 px-12 rounded-2xl font-black uppercase text-lg italic tracking-widest flex items-center gap-4 shadow-2xl active:scale-95 transition-all w-full md:w-auto",
                                    isPaid ? "bg-slate-900 text-white hover:bg-orange-600" : "bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
                                )}
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>DESPEGAR <Rocket className="w-6 h-6 animate-bounce" /></>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="h-14 md:h-16 px-12 rounded-2xl bg-orange-500 text-white font-black uppercase text-lg italic tracking-widest flex items-center gap-4 hover:shadow-orange-500/50 shadow-2xl active:scale-95 transition-all w-full md:w-auto"
                            >
                                CONTINUAR <ChevronRight className="w-6 h-6" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
