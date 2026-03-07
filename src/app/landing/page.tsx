"use client"

import Link from "next/link"
import {
    ChefHat, Zap, BarChart3, Smartphone, Shield, Globe,
    ArrowRight, CheckCircle2, Star, Users, Receipt,
    MonitorSmartphone, Bell, QrCode, TrendingUp, Menu,
    MessageCircle, Play, Laptop, HardDrive, LayoutDashboard,
    Clock, Rocket, Sparkles, ShieldCheck, Heart, Layers, Database, Cloud
} from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

const FEATURES = [
    {
        icon: Receipt,
        title: "Punto de Venta (POS)",
        desc: "Comandas ultra-rápidas, división de cuentas en segundos y cierre de caja sin descuadres.",
        color: "#ea580c"
    },
    {
        icon: QrCode,
        title: "Carta Digital & QR",
        desc: "Permite que el cliente pida y pague desde su mesa. Sin esperas, sin fricción, más rotación.",
        color: "#7c3aed"
    },
    {
        icon: BarChart3,
        title: "Control de Stock Pro",
        desc: "Inventario automatizado por receta. Sabrás exactamente cuánto te cuesta cada plato.",
        color: "#059669"
    },
    {
        icon: MonitorSmartphone,
        title: "KDS (Monitor Cocina)",
        desc: "Adiós a los tickets perdidos. Gestión visual de tiempos y prioridades en tiempo real.",
        color: "#2563eb"
    }
]

const PRICING = [
    {
        id: "starter",
        name: "Starter",
        price: "$0",
        priceNote: "Ideal para iniciar",
        features: [
            "Hasta 50 órdenes/mes",
            "1 restaurante",
            "KDS + Waiter App",
            "Carta pública con QR",
            "Soporte por Ticket"
        ],
        cta: "Empezar Gratis",
        popular: false
    },
    {
        id: "pro",
        name: "Pro",
        price: "$149.000",
        priceNote: "COP / mes",
        features: [
            "Órdenes ilimitadas",
            "Gestión de Recetas",
            "POS + Reportes Financieros",
            "Inventario en tiempo real",
            "Dominio Personalizado",
            "Soporte WhatsApp"
        ],
        cta: "Pruébalo Gratis 14 días",
        popular: true
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Cotizar",
        priceNote: "Para cadenas y grupos",
        features: [
            "Multi-sucursal ilimitado",
            "API Abierta (Integraciones)",
            "Módulo de Nómina & RRHH",
            "Marketing Automatizado",
            "Account Manager Dedicado",
            "SLA garantizado 99.9%"
        ],
        cta: "Agenda una Demo",
        popular: false
    }
]

export default function LandingJamaliOS() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">

            {/* ══════════════════════════════════════════════════════ */}
            {/* WHATSAPP FLOATING BUTTON */}
            {/* ══════════════════════════════════════════════════════ */}
            <a
                href="https://wa.me/573000000000?text=Hola!%20Quiero%20una%20demo%20de%20Jamali%20OS"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all group lg:flex items-center gap-3 hidden"
            >
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="font-bold text-sm tracking-tight pr-2">Hablar con un experto</span>
            </a>

            {/* ══════════════════════════════════════════════════════ */}
            {/* NAVBAR */}
            {/* ══════════════════════════════════════════════════════ */}
            <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm py-2" : "bg-transparent py-4"}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 group">
                        <Image
                            src="/images/jamali-os-logo.png"
                            alt="JAMALI OS"
                            width={240}
                            height={60}
                            className="h-14 md:h-16 w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                        />
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        <a href="#solucion" className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-colors">Solución</a>
                        <a href="#modulos" className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-colors">Módulos</a>
                        <a href="#precios" className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-colors">Precios</a>
                        <Link href="/login" className="text-xs font-black text-slate-900 uppercase tracking-widest">Entrar</Link>
                        <Link href="/register/wizard" className="px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                            Prueba Gratis
                        </Link>
                    </div>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 bg-slate-100 rounded-xl">
                        <Menu className="w-5 h-5 text-slate-900" />
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-8 space-y-4 animate-in slide-in-from-top duration-300">
                        <a href="#solucion" className="block text-sm font-black text-slate-900 uppercase tracking-widest">Solución</a>
                        <a href="#modulos" className="block text-sm font-black text-slate-900 uppercase tracking-widest">Módulos</a>
                        <Link href="/login" className="block text-sm font-black text-slate-900 uppercase tracking-widest">Entrar</Link>
                        <Link href="/register/wizard" className="block w-full text-center py-4 bg-orange-500 text-white text-sm font-black rounded-2xl">Empezar Ahora</Link>
                    </div>
                )}
            </nav>

            {/* ══════════════════════════════════════════════════════ */}
            {/* HERO SECTION */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="relative pt-40 pb-32 px-6 overflow-hidden">
                {/* Visual Decor */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-orange-500/5 blur-[150px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full -z-10" />

                <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-16 items-center">
                    <div className="lg:col-span-7 space-y-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-50 border border-orange-100 rounded-full">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">El primer OS Inteligente para Restaurantes</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight leading-[1] text-slate-900">
                            El Cerebro Operativo de <br /><span className="text-orange-500">tu Restaurante.</span>
                        </h1>

                        <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                            Controla Ventas, Inventarios y Nómina en un solo lugar. <br className="hidden md:block" />La plataforma en la nube sin hardware costoso ni contratos.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                            <Link href="/register/wizard" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-full hover:bg-orange-500 transition-all shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 active:scale-95 group">
                                Iniciar Prueba Gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="https://wa.me/573000000000?text=Hola!%20Quiero%20Agendar%20una%20Demo%20de%20Jamali%20OS" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 font-black uppercase text-xs tracking-widest rounded-full border-2 border-slate-200 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-4">
                                Agendar Demo en vivo <Play className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-12 pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                                        <div className="w-full h-full bg-slate-300" /> {/* Placeholder Avocado */}
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="flex gap-1 text-orange-500">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Confianza de 127+ Dueños en Colombia</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 w-full relative group">
                        {/* PLACEHOLDER VIDEO/IMAGE HERO */}
                        <div className="relative aspect-[4/5] bg-slate-900 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden border-[12px] border-white ring-1 ring-slate-100">
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-white/20">
                                <Laptop className="w-20 h-20" />
                                <span className="font-black italic uppercase tracking-widest text-xs">MOCKUP: CROSS-DEVICE MÓVIL/TABLET</span>
                            </div>
                            {/* IMAGEN REAL UNA VEZ DISPONIBLE */}
                            {/* <Image src="/images/hero_mockup.png" fill className="object-cover" alt="..." /> */}

                            <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 animate-in fade-in slide-in-from-bottom duration-1000">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                                        <BarChart3 className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ventas Hoy</p>
                                        <p className="text-2xl font-black italic text-white">$4.850.000 <span className="text-xs text-emerald-400 leading-none truncate">+15%</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SOCIAL PROOF TECNOLOGICO */}
                <div className="max-w-7xl mx-auto mt-32 border-t border-slate-100 pt-12">
                    <p className="text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Diseñado para la eficiencia operativa en LatAm con tecnología de clase mundial</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Next.js Logo */}
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                            <svg className="w-6 h-6" viewBox="0 0 180 180" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M89.9998 179.998C139.705 179.998 179.998 139.705 179.998 89.9989C179.998 40.2934 139.705 0 89.9998 0C40.2943 0 0 40.2934 0 89.9989C0 139.705 40.2943 179.998 89.9998 179.998ZM82.2599 122.378L52.8123 79.5085H63.3647L86.6346 113.844L113.845 79.5085H124.397L92.812 119.567V146.505H82.2599V122.378Z" />
                            </svg>
                            Next.js
                        </div>
                        {/* Vercel Logo */}
                        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                            <svg className="w-6 h-6" viewBox="0 0 116 100" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z" />
                            </svg>
                            Vercel
                        </div>
                        {/* Supabase text */}
                        <div className="flex items-center gap-2 font-bold text-xl text-emerald-500">
                            <Database className="w-5 h-5" />
                            Supabase
                        </div>
                        {/* Google Cloud text */}
                        <div className="flex items-center gap-2 font-bold text-xl text-blue-500">
                            <Cloud className="w-5 h-5" />
                            Google Cloud
                        </div>
                    </div>
                </div>
            </section >

            {/* ══════════════════════════════════════════════════════ */}
            {/* THE PAIN POINT SECTION */}
            {/* ══════════════════════════════════════════════════════ */}
            <section id="solucion" className="py-32 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-12 order-2 lg:order-1">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">El Problema</span>
                            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight leading-tight">
                                ¿Cansado de sistemas <br className="hidden md:block" /><span className="text-slate-400">lentos y complejos?</span>
                            </h2>
                        </div>

                        <div className="space-y-8">
                            {[
                                { t: "Hardware Costoso", d: "Olvídate de comprar terminales POS de millones. Usa cualquier tablet o celular.", i: HardDrive },
                                { t: "Error en Comandas", d: "Sincronización instantánea entre mesero y cocina. Cero platos perdidos.", i: Bell },
                                { t: "Pérdida de Inventario", d: "Nuestra receta maestra descuenta stock al gramo en tiempo real.", i: Layers },
                            ].map((p, idx) => (
                                <div key={idx} className="flex gap-6 group">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                                        <p.i className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black italic uppercase tracking-tight">{p.t}</h4>
                                        <p className="text-slate-500 font-medium text-sm">{p.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6">
                        <div className="aspect-square bg-slate-200 rounded-[3.5rem] relative overflow-hidden group">
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-slate-400">
                                <LayoutDashboard className="w-14 h-14" />
                                <span className="font-black italic uppercase tracking-widest text-[10px]">VIDEO: FLUJO DE COMANDA RÁPIDA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* MODULES SECTION */}
            {/* ══════════════════════════════════════════════════════ */}
            <section id="modulos" className="py-32 px-6">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-6">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Módulos de Ecosistema</span>
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight">
                            Diseñado para la <span className="text-orange-500 underline decoration-4 decoration-orange-500/20 underline-offset-[8px]">operación real</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-all group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: f.color + '10', color: f.color }}>
                                    <f.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900 mb-4">{f.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* CERO FRICCIÓN / ADVANTAGE */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />

                <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Tu Ventaja Competitiva</span>
                            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight leading-loose">
                                Cero Fricción, <br className="hidden md:block" /><span className="text-orange-500">Más Rentabilidad</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {[
                                { t: "Instalación Instantánea", d: "Sin técnicos. Abre el navegador y vuela.", i: Zap },
                                { t: "Multi-Sucursal", d: "Controla 1 o 100 locales desde un solo lugar.", i: Globe },
                                { t: "Respaldo Realtime", d: "Tus datos seguros 24/7 en la nube.", i: ShieldCheck },
                                { t: "0% Comisiones", d: "Pagas tu suscripción fija, nada más.", i: Rocket },
                            ].map((adv, i) => (
                                <div key={i} className="space-y-3 p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all">
                                    <adv.i className="w-6 h-6 text-orange-500" />
                                    <h4 className="text-sm font-black italic uppercase tracking-tight">{adv.t}</h4>
                                    <p className="text-[11px] text-slate-400 font-medium">{adv.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[16/10] bg-white/5 rounded-[3rem] border-2 border-white/10 flex items-center justify-center flex-col gap-4 text-white/10 group">
                            <BarChart3 className="w-16 h-16 group-hover:scale-110 transition-transform" />
                            <span className="font-black italic uppercase tracking-widest text-xs">MOCKUP: REPORTES AVANZADOS EN VIVO</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* PRICING TABLE */}
            {/* ══════════════════════════════════════════════════════ */}
            <section id="precios" className="py-32 px-6">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-6">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Planes Justos</span>
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight">
                            Transparente desde el <span className="text-orange-500">día cero</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {PRICING.map((plan, i) => (
                            <div key={i} className={`relative p-12 rounded-[3.5rem] border-[3px] transition-all ${plan.popular
                                ? "bg-slate-900 text-white border-orange-500 shadow-[0_40px_80px_rgba(249,115,22,0.15)] scale-105 z-10"
                                : "bg-white border-slate-100 hover:border-slate-200"
                                }`}>
                                {plan.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                                        MÁS RECOMENDADO
                                    </div>
                                )}

                                <div className="space-y-6 mb-12">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-black italic uppercase tracking-tight">{plan.name}</h3>
                                        <div className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", plan.popular ? "bg-orange-500/20 text-orange-500" : "bg-slate-100 text-slate-500")}>Suscripción</div>
                                    </div>
                                    <div>
                                        <span className="text-5xl font-black italic tracking-tighter">{plan.price}</span>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.priceNote}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-12">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">¿Qué incluye?</p>
                                    <ul className="space-y-4">
                                        {plan.features.map((f, j) => (
                                            <li key={j} className="flex items-start gap-4 text-xs font-bold leading-tight">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"}`}>
                                                    <CheckCircle2 className="w-3 h-3" />
                                                </div>
                                                <span className={plan.popular ? "text-slate-200" : "text-slate-600"}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link href="/register/wizard" className={`block w-full text-center py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 ${plan.popular
                                    ? "bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20"
                                    : "bg-slate-900 text-white hover:bg-orange-500 shadow-slate-900/10"
                                    }`}>
                                    {plan.cta}
                                </Link>

                                {plan.id === 'pro' && (
                                    <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">Sin contratos forzosos · Cancela cuando quieras</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* FAQ STRIP */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="py-24 px-6 border-y border-slate-100 bg-slate-50/50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                    {[
                        { q: "¿Necesito Internet?", a: "Funciona en la nube, optimizado para redes 4G/5G." },
                        { q: "¿Equipos Especiales?", a: "Cero. Usa iPads, Androids o Celulares." },
                        { q: "¿Factura Legal?", a: "Cumplimiento DIAN/España integrado." },
                        { q: "¿Comisiones?", a: "0% por venta. Solo tu mensualidad fija." },
                    ].map((faq, i) => (
                        <div key={i} className="space-y-2">
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">{faq.q}</p>
                            <p className="text-xs text-slate-500 font-bold">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* FINAL CTA */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="py-32 px-6 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight text-white leading-tight">
                        Eleva tu operación <br /><span className="text-orange-500">al siguiente nivel.</span>
                    </h2>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Únete a la revolución de la gestión gastronómica en Colombia. Setup instantáneo.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/register/wizard" className="w-full sm:w-auto px-12 py-6 bg-orange-500 text-white font-black uppercase text-xs tracking-widest rounded-full hover:bg-orange-400 transition-all shadow-[0_20px_50px_rgba(249,115,22,0.3)] flex items-center justify-center gap-4 active:scale-95">
                            Empezar Onboarding <Rocket className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="flex items-center justify-center gap-8 text-white/40 pt-8">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Seguro AES-256</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 fill-orange-500 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Apoyo local</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* FOOTER */}
            {/* ══════════════════════════════════════════════════════ */}
            <footer className="py-20 px-6 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    <div className="md:col-span-2 space-y-8">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/images/jamali-os-logo.png"
                                alt="JAMALI OS"
                                width={220}
                                height={55}
                                className="h-12 md:h-14 w-auto object-contain"
                            />
                        </div>
                        <p className="text-slate-400 font-medium text-sm max-w-sm leading-relaxed">
                            El sistema operativo inteligente diseñado para maximizar la rentabilidad
                            y eficiencia de restaurantes modernos en Latinoamérica.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Producto</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-600">
                            <li><a href="#solucion" className="hover:text-orange-500 transition-colors">Solución</a></li>
                            <li><a href="#modulos" className="hover:text-orange-500 transition-colors">Módulos</a></li>
                            <li><a href="#precios" className="hover:text-orange-500 transition-colors">Precios</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Soporte</h4>
                        <ul className="space-y-4 text-sm font-bold text-slate-600">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Centro de Ayuda</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">API Docs</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Status</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
                        © 2026 JAMALI OS · Antigravity Platform · Hecho en Colombia 🇨🇴
                    </p>
                    <div className="flex items-center gap-8">
                        <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-500 transition-colors italic">Privacidad</a>
                        <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-500 transition-colors italic">Términos</a>
                    </div>
                </div>
            </footer>
        </div >
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
