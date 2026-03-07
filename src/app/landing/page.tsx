"use client"

import Link from "next/link"
import {
    ChefHat, Zap, BarChart3, Smartphone, Shield, Globe,
    ArrowRight, CheckCircle2, Star, Users, Receipt,
    MonitorSmartphone, Bell, QrCode, TrendingUp, Menu
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const FEATURES = [
    {
        icon: MonitorSmartphone,
        title: "KDS PRO",
        desc: "Cocina sin papel. Órdenes en tiempo real con semáforo de urgencia y alertas sonoras.",
        color: "#ea580c"
    },
    {
        icon: Smartphone,
        title: "Waiter Pro",
        desc: "Portal de meseros optimizado para móvil. Comanda, divide cuentas, une mesas y más.",
        color: "#2563eb"
    },
    {
        icon: Receipt,
        title: "POS Inteligente",
        desc: "Punto de venta con cálculo de impuestos, propinas y múltiples métodos de pago.",
        color: "#059669"
    },
    {
        icon: QrCode,
        title: "QR por Mesa",
        desc: "Cada mesa tiene su código. El cliente escanea, arma su pedido y lo envía a cocina.",
        color: "#7c3aed"
    },
    {
        icon: BarChart3,
        title: "Reportes en Vivo",
        desc: "KPIs, ventas por día, exporta PDF y CSV. Todo actualizado al segundo.",
        color: "#dc2626"
    },
    {
        icon: Users,
        title: "Multi-Empleado",
        desc: "Roles RBAC: Admin, Mesero, Cocinero, Cajero. Cada uno ve solo su módulo.",
        color: "#0891b2"
    },
    {
        icon: Bell,
        title: "Notificaciones",
        desc: "Alertas en tiempo real entre cocina y salón. Sonoras, visuales e inteligentes.",
        color: "#ca8a04"
    },
    {
        icon: Globe,
        title: "Multi-Restaurante",
        desc: "Un solo panel para gestionar múltiples sucursales o marcas independientes.",
        color: "#9333ea"
    }
]

const PRICING = [
    {
        name: "Starter",
        price: "GRATIS",
        priceNote: "hasta 50 órdenes/mes",
        features: [
            "1 restaurante",
            "KDS + Waiter Pro",
            "Hasta 10 mesas",
            "Carta pública con QR",
            "Soporte por chat"
        ],
        cta: "Empezar Gratis",
        popular: false
    },
    {
        name: "Pro",
        price: "$149.000",
        priceNote: "COP / mes",
        features: [
            "Todo del Starter +",
            "Órdenes ilimitadas",
            "POS + Reportes",
            "Inventario básico",
            "Dividir cuenta / Unir mesas",
            "Exportar PDF y CSV",
            "Dominio personalizado",
            "Soporte prioritario"
        ],
        cta: "Comenzar Prueba",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Cotizar",
        priceNote: "facturación anual",
        features: [
            "Todo del Pro +",
            "Multi-sucursal",
            "API abierta",
            "Logística y delivery",
            "Marketing integrado",
            "Nómina y RRHH",
            "Onboarding dedicado",
            "SLA garantizado"
        ],
        cta: "Contactar Ventas",
        popular: false
    }
]

export default function LandingJamaliOS() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            {/* ══════════════════════════════════════════════════════ */}
            {/* NAVBAR */}
            {/* ══════════════════════════════════════════════════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                            <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                        </div>
                        <span className="text-lg font-black italic uppercase tracking-tighter">JAMALI <span className="text-orange-500">OS</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Funciones</a>
                        <a href="#pricing" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Precios</a>
                        <a href="#demo" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Demo</a>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-orange-500 transition-all shadow-lg">
                            Registrarse
                        </Link>
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
                        <a href="#features" className="block text-sm font-bold text-slate-600">Funciones</a>
                        <a href="#pricing" className="block text-sm font-bold text-slate-600">Precios</a>
                        <Link href="/login" className="block text-sm font-bold text-slate-600">Login</Link>
                        <Link href="/register" className="block w-full text-center py-3 bg-slate-900 text-white text-sm font-black rounded-xl">Registrarse</Link>
                    </div>
                )}
            </nav>

            {/* ══════════════════════════════════════════════════════ */}
            {/* HERO */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-white to-blue-50/30 pointer-events-none" />
                <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">SaaS para Restaurantes · Colombia</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.9]">
                        Tu restaurante,
                        <br />
                        <span className="text-orange-500">en piloto automático</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Control total desde la comanda hasta el cierre. JAMALI OS es el sistema operativo
                        diseñado para maximizar la rentabilidad y eficiencia de tu cocina y salón.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/register/wizard" className="px-10 py-5 bg-slate-900 text-white font-black uppercase text-sm tracking-wider rounded-2xl hover:bg-orange-500 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3">
                            Empezar mi Onboarding <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a href="#demo" className="px-10 py-5 bg-white text-slate-900 font-black uppercase text-sm tracking-wider rounded-2xl border-2 border-slate-200 hover:border-orange-400 transition-all flex items-center gap-3">
                            Ver Ecosistema en Vivo <Zap className="w-4 h-4 text-orange-500" />
                        </a>
                    </div>

                    <div className="relative mt-16 group">
                        <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000" />
                        <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white shadow-[0_50px_100px_rgba(0,0,0,0.15)] bg-slate-100">
                            <Image
                                src="/jamali_os_dashboard_mockup_1772892029558.png"
                                alt="Dashboard Mockup"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-12 text-slate-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold">Sin contratos forzosos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold">Migración asistida</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold">Multi-dispositivo</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* SOCIAL PROOF */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="py-12 border-y border-slate-100 bg-slate-50/50">
                <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10">
                    {[
                        { n: "500+", l: "Órdenes diarias" },
                        { n: "15+", l: "Restaurantes" },
                        { n: "99.9%", l: "Uptime" },
                        { n: "< 2s", l: "Latencia KDS" },
                    ].map((s, i) => (
                        <div key={i} className="text-center px-6">
                            <p className="text-3xl font-black italic tracking-tighter text-slate-900">{s.n}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.l}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* FEATURES GRID */}
            {/* ══════════════════════════════════════════════════════ */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-4 mb-16">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Funcionalidades</span>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                            Todo lo que <span className="text-orange-500">necesitas</span>
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Desde la comanda hasta el reporte de cierre. Sin código, sin hardware especial.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="group p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110" style={{ backgroundColor: f.color + '15', color: f.color }}>
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* HOW IT WORKS */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="py-24 px-6 bg-slate-900 text-white">
                <div className="max-w-5xl mx-auto text-center space-y-16">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Cómo funciona</span>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                            Listo en <span className="text-orange-500">5 minutos</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Regístrate", desc: "Crea tu cuenta gratis. Sin tarjeta, sin compromisos.", icon: Users },
                            { step: "02", title: "Configura", desc: "Sube tu logo, agrega tu menú y define tus mesas. Nosotros generamos tu carta digital.", icon: ChefHat },
                            { step: "03", title: "Opera", desc: "Tus meseros toman pedidos, cocina los recibe en el KDS, tú ves todo en reportes.", icon: TrendingUp }
                        ].map((s, i) => (
                            <div key={i} className="space-y-6 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                                    <s.icon className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Paso {s.step}</span>
                                    <h3 className="text-xl font-black italic uppercase tracking-tight">{s.title}</h3>
                                    <p className="text-sm text-slate-400">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* DEMO SECTION */}
            {/* ══════════════════════════════════════════════════════ */}
            <section id="demo" className="py-24 px-6">
                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Pruébalo ahora</span>
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                        Demo <span className="text-orange-500">en vivo</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">Explora un restaurante de prueba completo con datos reales.</p>

                    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
                        <Link href="/pargo-rojo/menu" className="p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-orange-400 hover:shadow-xl transition-all group text-left">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🐟</span>
                            </div>
                            <h3 className="font-black italic uppercase text-sm mb-1">Pargo Rojo</h3>
                            <p className="text-[10px] text-slate-400 font-bold">Restaurante de mar · Caucasia</p>
                            <p className="text-xs text-orange-500 font-bold mt-3 flex items-center gap-1">Ver carta digital <ArrowRight className="w-3 h-3" /></p>
                        </Link>
                        <Link href="/admin/dashboard" className="p-8 bg-slate-900 border-2 border-slate-800 rounded-3xl hover:border-orange-400 hover:shadow-xl transition-all group text-left">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="font-black italic uppercase text-sm mb-1 text-white">Panel Admin</h3>
                            <p className="text-[10px] text-slate-500 font-bold">Gestión de cocina y ventas</p>
                            <p className="text-xs text-orange-500 font-bold mt-3 flex items-center gap-1">Ver Backoffice <ArrowRight className="w-3 h-3" /></p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* PRICING */}
            {/* ══════════════════════════════════════════════════════ */}
            <section id="pricing" className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center space-y-4 mb-16">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Precios</span>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                            Simple y <span className="text-orange-500">transparente</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {PRICING.map((plan, i) => (
                            <div key={i} className={`relative p-8 rounded-3xl border-2 transition-all ${plan.popular
                                ? "bg-slate-900 text-white border-orange-500 shadow-2xl shadow-orange-500/10 scale-105"
                                : "bg-white border-slate-100"
                                }`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                        Más Popular
                                    </div>
                                )}
                                <div className="space-y-4 mb-8">
                                    <h3 className="text-sm font-black uppercase tracking-widest">{plan.name}</h3>
                                    <div>
                                        <span className="text-4xl font-black italic tracking-tighter">{plan.price}</span>
                                        <span className={`text-xs font-bold ml-2 ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.priceNote}</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-xs font-bold">
                                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-orange-500' : 'text-emerald-500'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className={`block w-full text-center py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all ${plan.popular
                                    ? "bg-orange-500 text-white hover:bg-orange-400"
                                    : "bg-slate-900 text-white hover:bg-orange-500"
                                    }`}>
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* CTA FINAL */}
            {/* ══════════════════════════════════════════════════════ */}
            <section className="py-24 px-6 bg-slate-900">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-tight">
                        Digitaliza tu restaurante <span className="text-orange-500">hoy</span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Únete a los restaurantes que ya operan con JAMALI OS. Setup en 5 minutos, sin hardware especial.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-3 px-12 py-6 bg-orange-500 text-white font-black uppercase text-sm tracking-wider rounded-2xl hover:bg-orange-400 transition-all shadow-2xl shadow-orange-500/30">
                        Crear Mi Restaurante Gratis <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════ */}
            {/* FOOTER */}
            {/* ══════════════════════════════════════════════════════ */}
            <footer className="py-12 px-6 border-t border-slate-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                        </div>
                        <span className="text-sm font-black italic uppercase tracking-tighter">JAMALI <span className="text-orange-500">OS</span></span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        © 2026 JAMALI OS · Antigravity Platform · Hecho en Colombia 🇨🇴
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Privacidad</a>
                        <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Términos</a>
                        <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Soporte</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
