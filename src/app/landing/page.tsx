"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    LayoutDashboard, Database, Zap, Sparkles, Smartphone,
    Server, Shield, ArrowRight, BarChart3, Users, Receipt,
    ShoppingBag, Globe, Play, Menu, Github, Linkedin, Mail,
    CreditCard, Cloud, CheckCircle2, ChevronRight, TrendingUp, X
} from "lucide-react"
import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import Image from "next/image"

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
}

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export default function ModernSaaSLanding() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [lang, setLang] = useState<'es' | 'en'>('es')
    const [isYearly, setIsYearly] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const toggleLang = () => setLang(l => l === 'es' ? 'en' : 'es')

    // Diccionario de traducciones
    const t = {
        es: {
            nav: { product: "Producto", features: "Funciones", pricing: "Precios", demo: "Demo", login: "Entrar", reqDemo: "Solicitar Demo" },
            hero: {
                badge: "🚀 JAMALI OS 2.0 — Disponible Ahora",
                title: "POS con IA y Sistema",
                titleSpan: "Operativo para Restaurantes",
                desc: "Gestiona pedidos, inventario, empleados y marketing con inteligencia artificial desde una sola plataforma. Construido para restaurantes que quieren crecer.",
                reqDemo: "Solicitar Demo Gratis",
                watchDemo: "Ver en Acción"
            },
            trust: "Restaurantes modernos ya confían en JAMALI OS",
            problem: {
                title: "El problema que enfrentan",
                titleSpan: "los restaurantes.",
                desc: "La mayoría de restaurantes dependen de múltiples herramientas desconectadas para gestionar pedidos, inventario y marketing. El resultado: caos.",
                cards: [
                    { title: "Sistemas desconectados que no se hablan entre sí", icon: "❌" },
                    { title: "Control de inventario manual y propenso a errores", icon: "❌" },
                    { title: "Cero visibilidad real sobre márgenes y ventas", icon: "❌" },
                    { title: "Sin marketing ni fidelización automatizada", icon: "❌" }
                ]
            },
            solution: {
                title: "Una plataforma para gestionarlo todo.",
                desc: "JAMALI OS centraliza la operación de tu restaurante en una sola plataforma impulsada por infraestructura cloud moderna y herramientas de IA."
            },
            featuresTitle: "Funcionalidades Clave",
            featuresSubtitle: "Todo lo que necesitas para gestionar un restaurante moderno, en una sola plataforma.",
            features: [
                { title: "POS Inteligente", desc: "Pagos ultra rápidos, gestión de mesas y división de cuentas diseñados para la velocidad." },
                { title: "Inventario Automático", desc: "Controla ingredientes en tiempo real. Conoce exactamente cuánto te cuesta cada plato." },
                { title: "Analítica del Restaurante", desc: "Paneles en vivo mostrando ventas, productos estrella y horas pico al instante." },
                { title: "Gestión de Empleados", desc: "Controla turnos, calcula nóminas y administra horarios de forma segura." },
                { title: "Marketing con IA", desc: "Genera descripciones de menú e imágenes para redes sociales con Inteligencia Artificial." },
                { title: "Pedidos Online", desc: "Permite a tus clientes pedir desde su móvil vía código QR o tu web pública." }
            ],
            midCta: { text: "¿Listo para transformar tu restaurante?", btn: "Solicitar Demo Gratis" },
            showcase: {
                f1: { title: "Interfaz POS diseñada para la velocidad.", desc: "Opera al máximo de capacidad en horas pico. Nuestro POS minimiza los clics, haciendo la toma de pedidos y cobros casi instantánea.", list: ["Soporte para pedidos en mesa", "División rápida de cuentas", "Resiliencia sin conexión"] },
                f2: { title: "Conoce tus números en tiempo real.", desc: "No esperes a fin de mes para conocer tus márgenes. Rastrea los ingresos diarios, costos de comida y el rendimiento de tus meseros en vivo.", link: "Explorar Analíticas" }
            },
            howTo: {
                title: "Cómo funciona",
                stepLabel: "PASO",
                steps: [
                    { step: "01", title: "Configura tu restaurante", desc: "Importa tu menú vía CSV o créalo manualmente. Configura impuestos y mesas en minutos." },
                    { step: "02", title: "Comienza a gestionar pedidos", desc: "Capacita a tu personal en menos de 10 minutos. Empieza a procesar comandas y pagos de inmediato." },
                    { step: "03", title: "Crece con IA y Datos", desc: "Usa nuestra analítica y funciones de IA para optimizar costos, reducir mermas y crear campañas." }
                ]
            },
            ai: {
                badge: "Plataforma Nativa de IA",
                title: "Crecimiento gastronómico impulsado por IA.",
                desc: "JAMALI OS incluye herramientas integradas de Inteligencia Artificial que actúan como tu gerente virtual. Desde crear descripciones profesionales de platos hasta predecir necesidades de inventario.",
                items: [
                    { title: "Genera imágenes de platos", desc: "Crea fotos profesionales de tus platillos para redes sociales y menú digital." },
                    { title: "Crea posts para redes", desc: "Genera contenido listo para Instagram, Facebook y TikTok en segundos." },
                    { title: "Analiza tendencias de ventas", desc: "Identifica patrones de consumo y anticipa la demanda de ingredientes." },
                    { title: "Recomienda precios", desc: "Optimiza tus márgenes con sugerencias basadas en costos y competencia." }
                ]
            },
            techStack: {
                title: "Construido con tecnología moderna",
                desc: "Infraestructura cloud de clase empresarial que escala con tu negocio.",
                items: [
                    { name: "Next.js", desc: "Framework React" },
                    { name: "TypeScript", desc: "Código tipado" },
                    { name: "PostgreSQL", desc: "Base de datos" },
                    { name: "Supabase", desc: "Backend cloud" },
                    { name: "Vercel", desc: "Infraestructura" },
                    { name: "OpenAI", desc: "Modelos IA" }
                ]
            },
            cta: { title: "Empieza a gestionar tu", titleSpan: "restaurante como un profesional.", desc: "Únete a otros restaurantes modernos que usan JAMALI OS para escalar sus operaciones.", btn: "Solicitar Demo" },
            roi: {
                title: "Análisis Financiero: ROI Inmediato",
                desc: "Implementar JAMALI OS no es un gasto, es una inversión con retorno directo. Nuestros clientes reportan una reducción media del 12% en mermas y un incremento del 18% en ventas gracias a la agilidad del POS y el marketing con IA.",
                stats: [
                    { label: 'Ahorro Operativo', val: '-15%' },
                    { label: 'Ventas Online', val: '+25%' },
                    { label: 'Rotación Meseros', val: '-30%' },
                    { label: 'Error Humano', val: '~0%' }
                ]
            },
            pricing: {
                title: "Precios simples",
                titleSpan: "para cada etapa.",
                desc: "Planes diseñados para crecer contigo, desde un food truck hasta una cadena multi-sede.",
                monthly: "Mensual",
                yearly: "Anual",
                save: "Ahorra 20%",
                currency: "COP",
                perMonth: "/ mes",
                billedYearly: "Facturado anualmente",
                annualTotalLabel: "Total anual:",
                popular: "Recomendado",
                tiers: [
                    {
                        name: "Emprendedor",
                        price: "69.000",
                        desc: "Para negocios que inician con fuerza.",
                        features: ["1 Sede", "Facturación Electrónica DIAN", "POS Ilimitado", "Mermas Básicas", "QR Menu Básico"],
                        btn: "Probar Gratis"
                    },
                    {
                        name: "Evolución",
                        price: "149.000",
                        desc: "Control total con analítica avanzada e IA.",
                        features: ["1 Sede", "IA Guardian (Anti-fraude)", "Escandallos Automáticos", "Ventas Online Pro", "Marketing IA", "Soporte Priority"],
                        btn: "Elegir Evolución",
                        highlight: true
                    },
                    {
                        name: "Enterprise",
                        price: "289.000",
                        desc: "La central de mando para grandes cadenas.",
                        features: ["Multi-sede Central", "Módulo de Nómina", "Concierge IA v2", "Infraestructura Dedicada", "Account Manager", "API Access"],
                        btn: "Contactar Ventas"
                    }
                ]
            },
            footer: { desc: "El sistema operativo inteligente diseñado para maximizar la rentabilidad y eficiencia de los restaurantes modernos.", company: "Compañía", features: "Funciones", pricing: "Precios", privacy: "Privacidad", terms: "Términos", integrations: "Integraciones", changelog: "Novedades", about: "Sobre Nosotros", contact: "Contacto" }
        },
        en: {
            nav: { product: "Product", features: "Features", pricing: "Pricing", demo: "Demo", login: "Log in", reqDemo: "Request Demo" },
            hero: {
                badge: "🚀 JAMALI OS 2.0 — Available Now",
                title: "AI-Powered POS &",
                titleSpan: "Restaurant Operating System",
                desc: "Manage orders, inventory, employees and marketing from a single AI-powered platform built for modern restaurants.",
                reqDemo: "Request Free Demo",
                watchDemo: "See it in Action"
            },
            trust: "Modern restaurants already trust JAMALI OS",
            problem: {
                title: "The problem restaurants",
                titleSpan: "face today.",
                desc: "Most restaurants rely on multiple disconnected tools to manage orders, inventory and marketing. The result: chaos.",
                cards: [
                    { title: "Disconnected systems that don't talk to each other", icon: "❌" },
                    { title: "Manual inventory tracking prone to errors", icon: "❌" },
                    { title: "Zero real visibility into margins and sales", icon: "❌" },
                    { title: "No automated marketing or customer retention", icon: "❌" }
                ]
            },
            solution: {
                title: "One platform to manage everything.",
                desc: "JAMALI OS centralizes restaurant operations into a single platform powered by modern cloud infrastructure and AI tools."
            },
            featuresTitle: "Core Features",
            featuresSubtitle: "Everything you need to run a modern restaurant, in one single platform.",
            features: [
                { title: "Smart POS", desc: "Lightning fast checkouts, table management, and split payments built for speed." },
                { title: "Inventory Automation", desc: "Track ingredients in real-time. Know exactly how much every dish costs." },
                { title: "Restaurant Analytics", desc: "Live dashboards showing sales, top products, and peak hours instantly." },
                { title: "Employee Management", desc: "Track hours, calculate payroll, and manage shift schedules securely." },
                { title: "AI Marketing", desc: "Generate social media posts and menu descriptions with built-in AI." },
                { title: "Online Orders", desc: "Let customers order directly from their phone via QR or your public site." }
            ],
            midCta: { text: "Ready to transform your restaurant?", btn: "Request Free Demo" },
            showcase: {
                f1: { title: "POS Interface designed for speed.", desc: "Operate at maximum capacity during peak hours. Our POS minimizes clicks, making order taking and payment processing near instantaneous.", list: ["Table-side ordering support", "Quick split checks", "Offline resilience"] },
                f2: { title: "Know your numbers in real-time.", desc: "Don't wait until the end of the month to know your margins. Track daily revenue, food cost, and top-performing staff live.", link: "Explore Analytics" }
            },
            howTo: {
                title: "How it works",
                stepLabel: "STEP",
                steps: [
                    { step: "01", title: "Setup your restaurant", desc: "Import your menu via CSV or create it manually. Configure taxes and tables in minutes." },
                    { step: "02", title: "Start managing orders", desc: "Train your staff in less than 10 minutes. Begin processing orders and payments immediately." },
                    { step: "03", title: "Grow with AI & Data", desc: "Use our analytics and AI features to optimize costs, lower waste, and run marketing campaigns." }
                ]
            },
            ai: {
                badge: "AI Native Platform",
                title: "AI-powered restaurant growth.",
                desc: "JAMALI OS includes built-in AI tools that act as your virtual manager. From creating professional food descriptions to predicting inventory needs.",
                items: [
                    { title: "Generate food images", desc: "Create professional photos of your dishes for social media and digital menus." },
                    { title: "Create social posts", desc: "Generate ready-to-publish content for Instagram, Facebook and TikTok in seconds." },
                    { title: "Analyze sales trends", desc: "Identify consumption patterns and anticipate ingredient demand." },
                    { title: "Recommend pricing", desc: "Optimize your margins with suggestions based on costs and competition." }
                ]
            },
            techStack: {
                title: "Built with modern technology",
                desc: "Enterprise-class cloud infrastructure that scales with your business.",
                items: [
                    { name: "Next.js", desc: "React Framework" },
                    { name: "TypeScript", desc: "Typed Code" },
                    { name: "PostgreSQL", desc: "Database" },
                    { name: "Supabase", desc: "Cloud Backend" },
                    { name: "Vercel", desc: "Infrastructure" },
                    { name: "OpenAI", desc: "AI Models" }
                ]
            },
            cta: { title: "Start managing your", titleSpan: "restaurant like a pro.", desc: "Join other modern restaurants using JAMALI OS to scale their operations.", btn: "Request Demo" },
            roi: {
                title: "Financial Analysis: Immediate ROI",
                desc: "Implementing JAMALI OS is not an expense, it's an investment with direct returns. Our clients report an average 12% reduction in waste and an 18% increase in sales thanks to POS agility and AI marketing.",
                stats: [
                    { label: 'Operational Savings', val: '-15%' },
                    { label: 'Online Sales', val: '+25%' },
                    { label: 'Waiter Turnover', val: '-30%' },
                    { label: 'Human Error', val: '~0%' }
                ]
            },
            pricing: {
                title: "Simple pricing",
                titleSpan: "for every stage.",
                desc: "Plans designed to grow with you, from a food truck to a multi-branch chain.",
                monthly: "Monthly",
                yearly: "Yearly",
                save: "Save 20%",
                currency: "USD",
                perMonth: "/ mo",
                billedYearly: "Billed annually",
                annualTotalLabel: "Annual total:",
                popular: "Most Popular",
                tiers: [
                    {
                        name: "Entrepreneur",
                        price: "18",
                        desc: "For businesses starting strong.",
                        features: ["1 Location", "Compliant Invoicing", "Unlimited POS", "Basic Waste Tracking", "Basic QR Menu"],
                        btn: "Start Free Trial"
                    },
                    {
                        name: "Evolution",
                        price: "38",
                        desc: "Total control with advanced analytics and AI.",
                        features: ["1 Location", "AI Guardian (Anti-fraud)", "Automatic Recipe Costing", "Online Sales Pro", "AI Marketing", "Priority Support"],
                        btn: "Choose Evolution",
                        highlight: true
                    },
                    {
                        name: "Enterprise",
                        price: "74",
                        desc: "The command center for large chains.",
                        features: ["Multi-branch Central", "Payroll Module", "IA Reservation Concierge", "Dedicated Infrastructure", "Account Manager", "API Access"],
                        btn: "Contact Sales"
                    }
                ]
            },
            footer: { desc: "The intelligent operating system designed to maximize profitability and efficiency for modern restaurants.", company: "Company", features: "Features", pricing: "Pricing", privacy: "Privacy Policy", terms: "Terms of Service", integrations: "Integrations", changelog: "Changelog", about: "About Us", contact: "Contact" }
        }
    }

    const c = t[lang]

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-orange-500/20 selection:text-orange-900 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            {/* 1. NAVBAR */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm" : "bg-transparent py-6"}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image
                                src="/images/jamali-os-transparent.png"
                                alt="JAMALI OS Logo"
                                width={240}
                                height={80}
                                className="h-16 w-auto object-contain"
                            />
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <a href="#product" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">{c.nav.product}</a>
                            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">{c.nav.features}</a>
                            <a href="#pricing" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">{c.nav.pricing}</a>
                            <a href="#demo" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">{c.nav.demo}</a>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={toggleLang} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase border border-slate-200 px-2 py-1 rounded">
                            {lang === 'es' ? 'EN' : 'ES'}
                        </button>
                        <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">{c.nav.login}</Link>
                        <Link href="/demo" className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-orange-500 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)]">
                            {c.nav.reqDemo}
                        </Link>
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-900 border border-slate-200 p-2 rounded-xl bg-white shadow-sm active:scale-95 transition-all">
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                <a href="#product" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-lg font-bold text-slate-900 border-b border-slate-50">{c.nav.product}</a>
                                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-lg font-bold text-slate-900 border-b border-slate-50">{c.nav.features}</a>
                                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-lg font-bold text-slate-900 border-b border-slate-50">{c.nav.pricing}</a>
                                <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-lg font-bold text-slate-900 border-b border-slate-50">{c.nav.demo}</a>
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-lg font-bold text-slate-900 border-b border-slate-50">{c.nav.login}</Link>
                                <div className="pt-4">
                                    <Link href="/demo" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                                        {c.nav.reqDemo} <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                                <button onClick={toggleLang} className="w-full py-3 mt-4 text-sm font-bold text-slate-500 uppercase flex items-center justify-between px-4 border border-slate-100 rounded-xl">
                                    <span>{lang === 'es' ? 'English' : 'Español'}</span>
                                    <Globe className="w-5 h-5 outline-none" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* 2. HERO SECTION */}
            <section className="relative z-10 pt-40 pb-20 px-6 min-h-screen flex flex-col items-center justify-center">
                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-sm text-orange-600 font-semibold mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>{c.hero.badge}</span>
                        <ChevronRight className="w-4 h-4 text-orange-400" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[1.1]"
                    >
                        {c.hero.title} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                            {c.hero.titleSpan}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        {c.hero.desc}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Link href="/demo" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/20">
                            {c.hero.reqDemo} <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a href="#video" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            {c.hero.watchDemo} <Play className="w-4 h-4" />
                        </a>
                    </motion.div>
                </div>

                {/* Hero Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="w-full max-w-5xl mx-auto mt-20 relative"
                >
                    <div className="relative aspect-[16/9] bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-2xl shadow-slate-900/10 z-10">
                        <Image src="/images/ui-dashboard.png" alt="JAMALI OS Dashboard" fill className="object-cover object-top" priority />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Floating POS mock */}
                    <motion.div
                        initial={{ x: 40, y: 40, opacity: 0 }}
                        animate={{ x: 0, y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.7 }}
                        className="absolute -bottom-12 -right-12 w-[45%] rounded-2xl border-[6px] border-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] overflow-hidden hidden md:block z-20 aspect-[4/3] bg-white group"
                    >
                        <Image src="/images/ui-pos.png" alt="JAMALI OS POS" fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* 3. TRUST SECTION */}
            <section className="py-16 border-y border-slate-100 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.trust}</p>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                        {[
                            { label: lang === 'es' ? 'Restaurantes' : 'Restaurants', val: '10+' },
                            { label: lang === 'es' ? 'Pedidos procesados' : 'Orders processed', val: '5K+' },
                            { label: lang === 'es' ? 'Tiempo de actividad' : 'Uptime', val: '99.9%' },
                            { label: lang === 'es' ? 'Soporte' : 'Support', val: '24/7' },
                        ].map((s, i) => (
                            <div key={i} className="px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm min-w-[130px]">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">{s.val}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. PROBLEM SECTION */}
            <section id="product" className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <motion.div {...fadeUp}>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                            {c.problem.title} <br /><span className="text-slate-400">{c.problem.titleSpan}</span>
                        </h2>
                        <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-md font-medium">
                            {c.problem.desc}
                        </p>
                    </motion.div>
                    <motion.div {...fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {c.problem.cards.map((issue, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-red-50/50 border border-red-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                                <span className="text-2xl leading-none mt-0.5">❌</span>
                                <h3 className="text-slate-800 font-bold text-sm leading-relaxed">{issue.title}</h3>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 5. SOLUTION SECTION */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <motion.div {...fadeUp} className="inline-block p-10 rounded-[3.5rem] bg-orange-50/50 border border-orange-100/50 mb-8 shadow-sm backdrop-blur-sm">
                        <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={220} height={80} className="w-48 h-auto" />
                    </motion.div>
                    <motion.h2 {...fadeUp} className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        {c.solution.title}
                    </motion.h2>
                    <motion.p {...fadeUp} className="text-xl text-slate-500 leading-relaxed font-medium">
                        {c.solution.desc}
                    </motion.p>
                </div>
            </section>

            {/* 6. FEATURES GRID */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">{c.featuresTitle}</h2>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">{c.featuresSubtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {c.features.map((feature, i) => {
                            const Icon = i === 0 ? Receipt : i === 1 ? Database : i === 2 ? BarChart3 : i === 3 ? Users : i === 4 ? Sparkles : Smartphone;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group p-8 rounded-3xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-crosshair"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50/50 border border-orange-100 text-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-3 shadow-sm">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 6.5 THE SUITE SHOWCASE */}
            <section className="py-24 overflow-hidden bg-slate-900 border-y border-slate-800 relative z-10 w-full">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-30">
                    <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">{lang === 'es' ? 'El Ecosistema' : 'The Ecosystem'}</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-4">
                        {lang === 'es' ? '+25 Módulos Especializados' : '+25 Specialized Modules'}
                    </h2>
                    <p className="text-slate-400 mt-4 font-medium max-w-2xl mx-auto">
                        {lang === 'es'
                            ? 'Todo lo que necesitas para operar, desde CRM de clientes élite hasta gestión de nómina, control de mermas y auditoría de seguridad.'
                            : 'Everything you need to operate, from elite customer CRM to payroll management, waste control, and security auditing.'}
                    </p>
                </div>

                <div className="relative flex gap-6 w-full max-w-[100vw] overflow-hidden">
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: "-50%" }}
                        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                        className="flex gap-6 min-w-max hover:[animation-play-state:paused]"
                    >
                        {[
                            '/assets/modules_screenshots/2_dashboard_administrativo.png',
                            '/assets/modules_screenshots/1_kds_production.png',
                            '/assets/modules_screenshots/20_business_intelligence.png',
                            '/assets/modules_screenshots/22_jamali_guardian.png',
                            '/assets/modules_screenshots/17_menu_catalog_studio.png',
                            '/assets/modules_screenshots/3_centro_de_pedidos.png',
                            '/assets/modules_screenshots/6_geometria_salon.png',
                            '/assets/modules_screenshots/11_nomina_dashboard.png',
                            // Duplicated for seamless loop
                            '/assets/modules_screenshots/2_dashboard_administrativo.png',
                            '/assets/modules_screenshots/1_kds_production.png',
                            '/assets/modules_screenshots/20_business_intelligence.png',
                            '/assets/modules_screenshots/22_jamali_guardian.png',
                            '/assets/modules_screenshots/17_menu_catalog_studio.png',
                            '/assets/modules_screenshots/3_centro_de_pedidos.png',
                            '/assets/modules_screenshots/6_geometria_salon.png',
                            '/assets/modules_screenshots/11_nomina_dashboard.png'
                        ].map((src, idx) => (
                            <div key={idx} className="w-[300px] md:w-[500px] lg:w-[600px] shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl relative block bg-slate-800 group">
                                <Image src={src} alt="JAMALI OS Module" width={1200} height={800} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-60 group-hover:opacity-100 cursor-pointer" />
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="relative flex gap-6 w-full max-w-[100vw] overflow-hidden mt-6">
                    <motion.div
                        initial={{ x: "-50%" }}
                        animate={{ x: 0 }}
                        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                        className="flex gap-6 min-w-max hover:[animation-play-state:paused]"
                    >
                        {[
                            '/assets/modules_screenshots/13_nomina_pagos.png',
                            '/assets/modules_screenshots/8_elite_database_crm.png',
                            '/assets/modules_screenshots/14_kernel_inventory.png',
                            '/assets/modules_screenshots/23_auditoria_roles.png',
                            '/assets/modules_screenshots/24_caja_negra_trazabilidad.png',
                            '/assets/modules_screenshots/16_compras_ingresos.png',
                            '/assets/modules_screenshots/19_promociones_cupones.png',
                            '/assets/modules_screenshots/27_core_infra_servidores.png',
                            // Duplicated for seamless loop
                            '/assets/modules_screenshots/13_nomina_pagos.png',
                            '/assets/modules_screenshots/8_elite_database_crm.png',
                            '/assets/modules_screenshots/14_kernel_inventory.png',
                            '/assets/modules_screenshots/23_auditoria_roles.png',
                            '/assets/modules_screenshots/24_caja_negra_trazabilidad.png',
                            '/assets/modules_screenshots/16_compras_ingresos.png',
                            '/assets/modules_screenshots/19_promociones_cupones.png',
                            '/assets/modules_screenshots/27_core_infra_servidores.png'
                        ].map((src, idx) => (
                            <div key={idx} className="w-[300px] md:w-[500px] lg:w-[600px] shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl relative block bg-slate-800 group">
                                <Image src={src} alt="JAMALI OS Module" width={1200} height={800} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700 opacity-50 group-hover:opacity-100 cursor-pointer" />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 6.75 MID-PAGE CTA */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/10">
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter text-center md:text-left">{c.midCta.text}</h3>
                    <Link href="/demo" className="shrink-0 px-10 py-5 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all flex items-center gap-3 text-lg shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-95">
                        {c.midCta.btn} <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* 7. PRODUCT SHOWCASE */}
            <section className="py-32 px-6 border-y border-slate-100 bg-slate-50/30">
                <div className="max-w-7xl mx-auto space-y-32">
                    {/* Feature Highlight 1 */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative aspect-square md:aspect-[4/3] bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl group">
                            <Image src="/images/ui-pos.png" alt="POS Speed" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent pointer-events-none" />
                        </div>
                        <div className="order-1 lg:order-2 space-y-8">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200">01</div>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{c.showcase.f1.title}</h3>
                            <p className="text-lg text-slate-500 leading-relaxed font-medium">{c.showcase.f1.desc}</p>
                            <ul className="space-y-4">
                                {c.showcase.f1.list.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 font-semibold">
                                        <div className="bg-orange-100 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-orange-600" /></div> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Feature Highlight 2 */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm border border-slate-200">02</div>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{c.showcase.f2.title}</h3>
                            <p className="text-lg text-slate-500 leading-relaxed font-medium">{c.showcase.f2.desc}</p>
                            <Link href="/demo" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700">
                                {c.showcase.f2.link} <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="relative aspect-square md:aspect-[4/3] bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-2xl group">
                            <Image src="/images/ui-dashboard.png" alt="Analytics" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. HOW IT WORKS */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-20 text-center">{c.howTo.title}</h2>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-slate-100 -z-10" />

                        {c.howTo.steps.map((item, i) => {
                            const Icon = i === 0 ? Database : i === 1 ? Receipt : TrendingUp;
                            return (
                                <div key={i} className="relative flex flex-col items-center text-center space-y-6">
                                    <div className="w-24 h-24 rounded-full bg-white border-[4px] border-slate-50 shadow-md flex items-center justify-center text-orange-500 mb-2 relative z-10">
                                        <Icon className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-3">
                                        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">{c.howTo.stepLabel} {item.step}</span>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{item.title}</h3>
                                        <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* 9. AI SECTION */}
            <section className="py-32 px-6 bg-gradient-to-b from-orange-50 to-white relative">
                <div className="max-w-5xl mx-auto text-center space-y-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 border border-orange-200 text-orange-600 font-bold text-sm shadow-sm">
                        <Sparkles className="w-4 h-4" /> {c.ai.badge}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">{c.ai.title}</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        {c.ai.desc}
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left pt-10">
                        {c.ai.items.map((f, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:border-orange-500/50 transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-5 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg text-white font-bold mb-2 relative z-10">{f.title}</h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. TECH STACK */}
            <section className="py-24 border-y border-slate-100 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
                    <div className="space-y-4">
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{c.techStack.title}</h3>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto">{c.techStack.desc}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {c.techStack.items.map((tech, i) => (
                            <div key={i} className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm">
                                    {tech.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900 text-sm">{tech.name}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{tech.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 11. PRICING SECTION */}
            <section id="pricing" className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                            {c.pricing.title} <span className="text-orange-500">{c.pricing.titleSpan}</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            {c.pricing.desc}
                        </p>

                        {/* Toggle Placeholder */}
                        <div className="flex items-center justify-center gap-4 pt-8">
                            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>{c.pricing.monthly}</span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className="w-14 h-7 bg-slate-200 rounded-full p-1 relative transition-colors hover:bg-slate-300"
                            >
                                <motion.div
                                    animate={{ x: isYearly ? 28 : 0 }}
                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                            <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>{c.pricing.yearly}</span>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                {c.pricing.save}
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {c.pricing.tiers.map((tier, i) => (
                            <div
                                key={i}
                                className={`relative p-10 rounded-[3rem] border-2 transition-all hover:-translate-y-2 ${tier.highlight
                                    ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-orange-500/10"
                                    : "bg-white text-slate-900 border-slate-100 hover:border-orange-200"
                                    }`}
                            >
                                {tier.highlight && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        {c.pricing.popular}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase">{tier.name}</h3>
                                        <p className={`text-sm font-medium mt-1 ${tier.highlight ? "text-slate-400" : "text-slate-500"}`}>{tier.desc}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-sm font-bold opacity-60 ${tier.highlight ? "text-slate-400" : "text-slate-500"}`}>{c.pricing.currency}</span>
                                            <div className="flex flex-col">
                                                {isYearly && (
                                                    <span className={`text-sm font-bold line-through opacity-50 ${tier.highlight ? "text-slate-400" : "text-slate-500"}`}>
                                                        ${tier.price}
                                                    </span>
                                                )}
                                                <span className="text-5xl font-black italic tracking-tighter">
                                                    ${isYearly
                                                        ? (lang === 'es'
                                                            ? (Math.floor(parseFloat(tier.price.replace('.', '')) * 0.8)).toLocaleString('es-CO')
                                                            : (parseFloat(tier.price) * 0.8).toFixed(0)
                                                        )
                                                        : tier.price
                                                    }
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold opacity-60">{c.pricing.perMonth}</span>
                                        </div>
                                        {isYearly && (
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${tier.highlight ? "text-orange-400" : "text-orange-600"}`}>
                                                {c.pricing.annualTotalLabel} ${lang === 'es'
                                                    ? (Math.floor(parseFloat(tier.price.replace('.', '')) * 0.8 * 12)).toLocaleString('es-CO')
                                                    : (parseFloat(tier.price) * 0.8 * 12).toFixed(0)
                                                } {c.pricing.currency}
                                            </p>
                                        )}
                                    </div>

                                    <ul className="space-y-4 py-8 border-y border-white/10">
                                        {tier.features.map((f, j) => (
                                            <li key={j} className="flex items-center gap-3 text-sm font-semibold">
                                                <CheckCircle2 className={`w-5 h-5 ${tier.highlight ? "text-orange-500" : "text-emerald-500"}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href="/demo"
                                        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tier.highlight
                                            ? "bg-orange-500 text-white hover:bg-orange-600"
                                            : "bg-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white"
                                            }`}
                                    >
                                        {tier.btn} <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Financial Analysis Brief */}
                    <div className="mt-20 p-12 rounded-[3.5rem] bg-orange-50/30 border border-orange-100 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">{c.roi.title}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed font-sans">
                                {c.roi.desc}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                            {c.roi.stats.map((stat, i) => (
                                <div key={stat.label} className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm text-center min-w-[140px]">
                                    <p className="text-2xl font-black italic tracking-tighter text-orange-600 leading-none">{stat.val}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-none">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 12. FINAL CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/20 blur-[100px] rounded-full" />

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                            {c.cta.title} <br />{c.cta.titleSpan}
                        </h2>
                        <p className="text-lg text-slate-400 font-medium">{c.cta.desc}</p>
                        <div className="flex justify-center pt-10">
                            <Link href="/demo" className="px-12 py-6 bg-orange-500 text-white font-black rounded-3xl hover:bg-orange-600 transition-all flex items-center gap-3 text-xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] hover:-translate-y-1">
                                {c.cta.btn} <ArrowRight className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 12. FOOTER */}
            <footer className="py-12 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 md:gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/images/jamali-os-transparent.png"
                                alt="JAMALI OS Logo"
                                width={280}
                                height={80}
                                className="h-20 w-auto object-contain grayscale opacity-80 hover:grayscale-0 transition-all hover:opacity-100"
                            />
                        </Link>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium">
                            {c.footer.desc}
                        </p>
                        <div className="flex items-center gap-4 text-slate-400">
                            <a href="mailto:contact@jamalios.com" className="hover:text-slate-900 transition-colors"><Mail className="w-5 h-5" /></a>
                            <a href="https://github.com/jamalios" className="hover:text-slate-900 transition-colors" target="_blank" rel="noreferrer"><Github className="w-5 h-5" /></a>
                            <a href="https://linkedin.com/company/jamalios" className="hover:text-slate-900 transition-colors" target="_blank" rel="noreferrer"><Linkedin className="w-5 h-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">{c.nav.product}</h4>
                        <ul className="space-y-4 text-sm font-medium text-slate-500">
                            <li><a href="#features" className="hover:text-slate-900 transition-colors">{c.footer.features}</a></li>
                            <li><a href="#pricing" className="hover:text-slate-900 transition-colors">{c.footer.pricing}</a></li>
                            <li><Link href="/integrations" className="hover:text-slate-900 transition-colors">{c.footer.integrations}</Link></li>
                            <li><Link href="/changelog" className="hover:text-slate-900 transition-colors">{c.footer.changelog}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">{c.footer.company}</h4>
                        <ul className="space-y-4 text-sm font-medium text-slate-500">
                            <li><Link href="/about" className="hover:text-slate-900 transition-colors">{c.footer.about}</Link></li>
                            <li><Link href="/contact" className="hover:text-slate-900 transition-colors">{c.footer.contact}</Link></li>
                            <li><Link href="/privacy" className="hover:text-slate-900 transition-colors">{c.footer.privacy}</Link></li>
                            <li><Link href="/terms" className="hover:text-slate-900 transition-colors">{c.footer.terms}</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-100 text-sm font-medium text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p>© 2026 JAMALI OS. All rights reserved.</p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@jamalios.com</p>
                </div>
            </footer>
        </div>
    )
}
