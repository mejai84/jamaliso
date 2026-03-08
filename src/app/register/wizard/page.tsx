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
    CreditCard,
    ArrowRight,
    LayoutDashboard,
    Zap,
    X,
    Lock,
    Mail,
    User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { wizardTranslations } from "@/lib/i18n/wizard"
import Link from "next/link"
import Image from "next/image"

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
    const { lang } = useRestaurant()
    const t = wizardTranslations[lang]
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [percent, setPercent] = useState(25)
    const [acceptedTerms, setAcceptedTerms] = useState(false)

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
                toast.success(t.toast.success_pago)
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
                console.error(t.toast.error_restoration, e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('wizard_form_data', JSON.stringify(formData))
    }, [formData])

    const handleNext = () => {
        if (currentStep === 1 && !formData.restaurantName) {
            toast.error(t.toast.error_name)
            return
        }
        if (currentStep === 4) {
            if (!formData.email || !formData.password || !formData.ownerName) {
                toast.error(t.toast.error_creds)
                return
            }
        }
        if (currentStep === 5 && !isPaid) {
            toast.error(t.toast.error_payment)
            return
        }
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePayment = async () => {
        if (!formData.email) {
            toast.error(t.toast.error_email)
            // Opcional: mover validación de email antes del pago
            setCurrentStep(4) // Move back to account step if email missing 
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

            toast.success(t.toast.welcome)
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

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">

                {/* Sidebar Status (Visible en desktop) */}
                <div className="lg:col-span-4 bg-slate-900 rounded-[3.5rem] p-12 text-white flex flex-col justify-between hidden lg:flex shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                    <div className="space-y-16 relative z-10">
                        <Link href="/landing" className="flex items-center gap-4 group">
                            <Image
                                src="/images/jamali-os-transparent.png"
                                alt="JAMALI OS"
                                width={180}
                                height={60}
                                className="h-10 w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        </Link>

                        <div className="space-y-10">
                            {STEPS.map((step) => {
                                const Icon = step.icon
                                const isActive = currentStep === step.id
                                const isCompleted = currentStep > step.id
                                return (
                                    <div key={step.id} className={cn(
                                        "flex items-start gap-5 transition-all duration-700",
                                        isActive ? "opacity-100 translate-x-2" : "opacity-30"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                                            isActive ? "bg-orange-500 border-orange-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.5)] scale-110" :
                                                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/10"
                                        )}>
                                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80 leading-none">{t.fases} 0{step.id}</p>
                                            <h3 className="font-bold text-xl leading-tight uppercase tracking-tight">
                                                {step.id === 1 ? t.steps.identity.title :
                                                    step.id === 2 ? t.steps.infrastructure.title :
                                                        step.id === 3 ? t.steps.branding.title :
                                                            step.id === 4 ? t.steps.account.title :
                                                                t.steps.plan.title}
                                            </h3>
                                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                                                {step.id === 1 ? t.steps.identity.desc :
                                                    step.id === 2 ? t.steps.infrastructure.desc :
                                                        step.id === 3 ? t.steps.branding.desc :
                                                            step.id === 4 ? t.steps.account.desc :
                                                                t.steps.plan.desc}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 space-y-5 relative z-10 transition-all hover:border-white/20">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">{t.kernel_config}</span>
                            <span className="text-sm font-black text-orange-500">{percent}%</span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Wizard Form */}
                <div className="lg:col-span-8 bg-white/70 backdrop-blur-3xl border border-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] p-10 md:p-16 flex flex-col justify-between overflow-hidden relative">

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
                                                    placeholder="EJ: JAMALI OS BISTRO"
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
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">PERSONALIZACIÓN <span className="text-orange-500 decoration-4 underline-offset-8">VISUAL</span></h1>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mb-4">El alma cromática de tu marca blanca</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                        {/* COLOR PICKER COLUMN */}
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">ELIGE TU COLOR DE MARCA</label>
                                                <div className="flex flex-wrap gap-3">
                                                    {['#ff4d00', '#7c3aed', '#2563eb', '#16a34a', '#db2777', '#000000', '#0ea5e9', '#b91c1c'].map(color => (
                                                        <div
                                                            key={color}
                                                            onClick={() => setFormData({ ...formData, primaryColor: color })}
                                                            className={cn(
                                                                "w-14 h-14 rounded-2xl cursor-pointer transition-all border-4 flex items-center justify-center hover:scale-105",
                                                                formData.primaryColor === color ? "border-slate-900 scale-110 shadow-2xl ring-4 ring-slate-900/10" : "border-transparent opacity-50 hover:opacity-100"
                                                            )}
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            {formData.primaryColor === color && <CheckCircle2 className="text-white w-6 h-6 drop-shadow-lg" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">O USA UN COLOR PERSONALIZADO</label>
                                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
                                                    <input
                                                        type="color"
                                                        value={formData.primaryColor}
                                                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                                        className="w-12 h-12 border-none rounded-xl cursor-pointer bg-transparent"
                                                    />
                                                    <span className="text-sm font-black font-mono tracking-widest uppercase text-slate-600">{formData.primaryColor}</span>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center gap-5 relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 shrink-0"
                                                    style={{
                                                        backgroundColor: formData.primaryColor,
                                                        boxShadow: `0 0 30px ${formData.primaryColor}55`
                                                    }}
                                                >
                                                    <Layout className="w-7 h-7" />
                                                </div>
                                                <div className="space-y-1 min-w-0">
                                                    <h4 className="text-lg font-black italic uppercase tracking-tighter truncate">{formData.restaurantName || 'TU RESTAURANTE'}</h4>
                                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] italic leading-tight">MARCA BLANCA ACTIVA</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* LIVE MOCKUP COLUMN */}
                                        <div className="flex flex-col items-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic mb-3 text-center">ASÍ SE VERÁ TU MENÚ DIGITAL</p>
                                            <div className="bg-slate-900 rounded-[3rem] p-3 shadow-2xl aspect-[9/18] w-full max-w-[260px] border-[8px] border-slate-800 relative">
                                                {/* Notch */}
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-b-xl z-30" />

                                                {/* Screen */}
                                                <div className="h-full bg-white rounded-[2rem] overflow-hidden flex flex-col relative no-scrollbar overflow-y-auto">
                                                    {/* Header */}
                                                    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-50 px-3 py-2 flex items-center justify-between shrink-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <div
                                                                className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[6px] font-black"
                                                                style={{ backgroundColor: formData.primaryColor }}
                                                            >
                                                                {(formData.restaurantName || 'R').charAt(0).toUpperCase()}
                                                            </div>
                                                            <p className="text-[8px] font-black italic uppercase text-slate-900 truncate max-w-[100px]">{formData.restaurantName || 'RESTAURANTE'}</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <div className="w-3 h-3 rounded-sm bg-slate-100" />
                                                            <div className="w-3 h-3 rounded-sm bg-slate-100" />
                                                        </div>
                                                    </header>

                                                    {/* Hero */}
                                                    <div className="relative bg-slate-900 flex flex-col items-center justify-center text-center p-6 min-h-[130px] shrink-0">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=60&w=400"
                                                            className="absolute inset-0 w-full h-full object-cover opacity-40"
                                                            alt="hero"
                                                        />
                                                        <div className="relative z-10 space-y-1.5">
                                                            <h5 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">{formData.restaurantName || 'TU RESTAURANTE'}</h5>
                                                            <p className="text-[6px] font-black uppercase tracking-[0.3em] italic leading-none" style={{ color: formData.primaryColor }}>{formData.slug ? `${formData.slug}.jamaliso.com` : 'GASTRONOMÍA PREMIUM'}</p>
                                                            <button
                                                                className="mt-2 h-6 px-3 rounded-md text-[6px] font-black italic uppercase text-white"
                                                                style={{ backgroundColor: formData.primaryColor }}
                                                            >
                                                                VER CARTA DIGITAL
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Categories */}
                                                    <div className="flex gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-slate-50 shrink-0">
                                                        <div className="px-2 py-1 rounded-md text-[6px] font-black italic uppercase shrink-0 text-white" style={{ backgroundColor: formData.primaryColor }}>Todos</div>
                                                        <div className="px-2 py-1 bg-slate-50 text-slate-300 rounded-md text-[6px] font-black italic uppercase shrink-0">Entradas</div>
                                                        <div className="px-2 py-1 bg-slate-50 text-slate-300 rounded-md text-[6px] font-black italic uppercase shrink-0">Fuertes</div>
                                                    </div>

                                                    {/* Product Cards */}
                                                    <div className="flex-1 p-3 space-y-2">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                                                <div className="h-16 bg-slate-50 flex items-center justify-center text-slate-200">
                                                                    <UtensilsCrossed className="w-4 h-4" />
                                                                </div>
                                                                <div className="p-2 space-y-0.5">
                                                                    <p className="text-[7px] font-black uppercase italic text-slate-900">Plato Ejemplo {i}</p>
                                                                    <div className="flex justify-between items-center">
                                                                        <p className="text-[8px] font-black italic" style={{ color: formData.primaryColor }}>$ 45,000</p>
                                                                        <div className="w-4 h-4 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: formData.primaryColor }}>
                                                                            <ChevronRight className="w-2.5 h-2.5" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                                                        <p className="text-[5px] font-black text-slate-300 uppercase tracking-[0.3em]">Powered by JAMALI OS</p>
                                                    </div>
                                                </div>
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

                                    <div className="p-8 bg-slate-900 rounded-[3rem] text-white flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-20" />

                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-3xl flex items-center justify-center">
                                                    <CreditCard className="w-8 h-8 text-orange-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black italic uppercase tracking-tighter">PAGO SEGURO VÍA MERCADO PAGO</h4>
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic leading-tight">ENLACE CIFRADO AES-256</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handlePayment}
                                                disabled={loading || isPaid || !acceptedTerms}
                                                className={cn(
                                                    "rounded-2xl h-16 px-10 font-black italic uppercase text-lg tracking-widest w-full md:w-auto shadow-lg active:scale-95 transition-all text-white",
                                                    isPaid ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" :
                                                        !acceptedTerms ? "bg-slate-700 text-slate-400 cursor-not-allowed border border-white/5" :
                                                            "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                                                )}
                                            >
                                                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
                                                    isPaid ? "PLAN ACTIVADO ✓" : "ACTIVAR AHORA"
                                                )}
                                            </button>
                                        </div>

                                        <div className="pt-6 border-t border-white/10">
                                            <label className="flex items-start gap-4 cursor-pointer group">
                                                <div className="relative mt-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={acceptedTerms}
                                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                        className="peer h-6 w-6 appearance-none rounded-lg border-2 border-white/20 bg-white/5 transition-all checked:bg-orange-500 checked:border-orange-500 focus:outline-none cursor-pointer"
                                                    />
                                                    <CheckCircle2 className="absolute top-1 left-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-white/70 leading-relaxed uppercase tracking-tight">
                                                        Al activar mi plan, acepto los
                                                        <Link href="#" className="text-orange-500 hover:underline mx-1">Términos de Servicio</Link> y la
                                                        <Link href="#" className="text-orange-500 hover:underline mx-1">Política de Privacidad</Link>
                                                        de JAMALI OS.
                                                    </p>
                                                    <p className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
                                                        Autorizo el tratamiento de mis datos personales según la ley de protección de datos.
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
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

                                        <div className="p-8 bg-emerald-50/50 backdrop-blur-md rounded-[2.5rem] border border-emerald-100 flex items-center gap-6 mt-6 transition-all hover:bg-emerald-50">
                                            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                                                <ShieldCheck className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-emerald-700 uppercase italic">Seguridad Nivel Enterprise Activa</p>
                                                <p className="text-[10px] font-medium text-emerald-600/80 leading-relaxed uppercase tracking-tight">TUS DATOS SE ALOJARÁN EN UN NODO DE BASE DE DATOS CIFRADO Y AISLADO (MULTI-TENANT ISOLATION).</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-10 border-t border-slate-100/50 gap-6">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1 || loading}
                            className="order-2 md:order-1 flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> {t.nav.back}
                        </button>

                        <div className="order-1 md:order-2 w-full md:w-auto">
                            {currentStep === 5 ? (
                                <button
                                    onClick={handleFinalize}
                                    disabled={loading || !isPaid}
                                    className={cn(
                                        "w-full md:w-auto h-16 md:h-20 px-14 rounded-3xl font-black uppercase text-xl leading-none tracking-widest flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all duration-300",
                                        isPaid
                                            ? "bg-slate-900 text-white hover:bg-orange-500 shadow-slate-900/20"
                                            : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : (
                                        <>ACTIVAR JAMALI OS <Rocket className="w-7 h-7 text-orange-400 group-hover:animate-bounce" /></>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="w-full md:w-auto h-16 md:h-20 px-14 rounded-3xl bg-orange-500 text-white font-black uppercase text-xl leading-none tracking-widest flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] hover:bg-orange-600 hover:-translate-y-1 active:scale-95 transition-all duration-300"
                                >
                                    {t.nav.next} <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
