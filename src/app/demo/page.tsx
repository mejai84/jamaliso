"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Store,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Database,
    BarChart3,
    Zap,
    LayoutDashboard,
    Smartphone,
    Users,
    ArrowLeft,
    Sparkles,
    Loader2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { saveDemoLead } from "@/actions/leads"

const steps = [
    {
        id: "type",
        title: "¿Qué tipo de negocio lideras?",
        desc: "Personalizaremos las herramientas para tu modelo operativo.",
        options: [
            { id: "casual", label: "Comida Casual / Rápida", icon: Store },
            { id: "fine", label: "Alta Cocina / Mantel", icon: Smartphone },
            { id: "bar", label: "Bar / Discoteca", icon: Users },
            { id: "chain", label: "Franquicia / Cadena", icon: Database },
        ]
    },
    {
        id: "challenge",
        title: "¿Cuál es tu mayor reto hoy?",
        desc: "Enfocaremos el tour inicial en solucionar esta prioridad.",
        options: [
            { id: "inventory", label: "Control de Inventarios y Costos", icon: Database },
            { id: "sales", label: "Velocidad de Caja y Servicio", icon: Zap },
            { id: "reports", label: "Reportes y Analítica en tiempo real", icon: BarChart3 },
            { id: "staff", label: "Gestión de Personal y Propinas", icon: Users },
        ]
    },
    {
        id: "profile",
        title: "Estamos listos para construir tu entorno",
        desc: "Ingresa tus datos para generar tu acceso exclusivo a la demo.",
    }
]

export default function DemoWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [selections, setSelections] = useState<Record<string, string>>({})
    const [isSimulating, setIsSimulating] = useState(false)
    const [progress, setProgress] = useState(0)
    const [profile, setProfile] = useState({ name: '', email: '' })

    const handleSelect = (stepId: string, optionId: string) => {
        setSelections(prev => ({ ...prev, [stepId]: optionId }))
        if (currentStep < 2) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300)
        }
    }

    const startSimulation = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSimulating(true)

        // Capturar el lead en segundo plano
        saveDemoLead({
            name: profile.name,
            email: profile.email,
            type: selections.type || 'unknown',
            challenge: selections.challenge || 'unknown'
        })
    }

    useEffect(() => {
        if (isSimulating) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval)
                        setTimeout(() => {
                            // Redirigir al dashboard con los flags de demo
                            router.push(`/admin?demo=true&type=${selections.type}&challenge=${selections.challenge}&user=${encodeURIComponent(profile.name)}`)
                        }, 800)
                        return 100
                    }
                    return prev + 2
                })
            }, 50)
            return () => clearInterval(interval)
        }
    }, [isSimulating, router, selections, profile.name])

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
    } as any

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-500/20 selection:text-orange-900 overflow-hidden flex flex-col">
            {/* Minimal Header */}
            <header className="p-8 flex items-center justify-between relative z-10">
                <Link href="/landing" className="flex items-center gap-2 group">
                    <Image
                        src="/images/jamali-os-transparent.png"
                        alt="JAMALI OS"
                        width={180}
                        height={60}
                        className="h-10 w-auto object-contain"
                    />
                </Link>
                {currentStep > 0 && !isSimulating && (
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Atrás
                    </button>
                )}
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <AnimatePresence mode="wait">
                    {!isSimulating ? (
                        <motion.div
                            key={currentStep}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="max-w-2xl w-full"
                        >
                            <div className="space-y-4 text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-black uppercase tracking-wider">
                                    Paso {currentStep + 1} de 3
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                                    {steps[currentStep].title}
                                </h1>
                                <p className="text-lg text-slate-500 font-medium">
                                    {steps[currentStep].desc}
                                </p>
                            </div>

                            {currentStep < 2 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {steps[currentStep].options?.map((option) => {
                                        const Icon = option.icon
                                        const isSelected = selections[steps[currentStep].id] === option.id
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSelect(steps[currentStep].id, option.id)}
                                                className={`group p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden ${isSelected
                                                    ? "border-orange-500 bg-white shadow-xl shadow-orange-500/10"
                                                    : "border-slate-200 bg-white hover:border-orange-200 hover:shadow-lg"
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${isSelected ? "bg-orange-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"
                                                    }`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-lg">{option.label}</h3>
                                                {isSelected && (
                                                    <div className="absolute top-6 right-6 text-orange-500">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <form onSubmit={startSimulation} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 ml-1">Tu Nombre</label>
                                            <input
                                                required
                                                type="text"
                                                value={profile.name}
                                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                                placeholder="Ej. Juan Pérez"
                                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-semibold text-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-500 ml-1">Email de Negocio</label>
                                            <input
                                                required
                                                type="email"
                                                value={profile.email}
                                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                                placeholder="juan@tu-restaurante.com"
                                                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none transition-all font-semibold text-slate-900"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all shadow-lg flex items-center justify-center gap-2 group"
                                    >
                                        Generar Entorno Demo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="simulation"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="max-w-md w-full text-center space-y-12"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-orange-500 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                                    <Sparkles className="w-16 h-16 text-white" />
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/20 blur-[60px] rounded-full -z-10" />
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                                    {progress < 40 ? "Configurando Tenant..." : progress < 80 ? "Pre-cargando Inventarios..." : "Listo para Brillar"}
                                </h2>

                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-orange-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="flex flex-col items-center gap-3 text-slate-400 font-bold text-sm uppercase tracking-widest">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Personalizando JAMALI OS para {profile.name}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Decor */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full -z-0 translate-x-1/3 -translate-y-1/3" />
            <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full -z-0 -translate-x-1/3 translate-y-1/3" />
        </div>
    )
}
