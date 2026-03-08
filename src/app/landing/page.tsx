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
                badge: "JAMALI OS 2.0 ya está disponible",
                title: "Gestiona tu restaurante",
                titleSpan: "con JAMALI OS",
                desc: "El sistema operativo con IA que ayuda a los restaurantes a gestionar ventas, inventario, personal y marketing desde una única plataforma.",
                reqDemo: "Solicitar Demo",
                watchDemo: "Ver Demo"
            },
            trust: "Diseñado para restaurantes modernos",
            problem: {
                title: "Los restaurantes operan",
                titleSpan: "en el caos.",
                desc: "Usar múltiples herramientas que no se comunican entre sí genera errores, pérdida de ingresos y equipos agotados.",
                cards: [
                    { title: "Múltiples herramientas desconectadas" },
                    { title: "Control manual de inventario" },
                    { title: "Poca visibilidad de ventas" },
                    { title: "Sin marketing automatizado" }
                ]
            },
            solution: {
                title: "Una plataforma para gestionarlo todo.",
                desc: "JAMALI OS centraliza la operación de tu restaurante en una sola plataforma impulsada por infraestructura cloud moderna y herramientas de IA."
            },
            features: [
                { title: "POS Inteligente", desc: "Pagos ultra rápidos, gestión de mesas y división de cuentas diseñados para la velocidad." },
                { title: "Inventario Automático", desc: "Controla ingredientes en tiempo real. Conoce exactamente cuánto te cuesta cada plato." },
                { title: "Analítica del Restaurante", desc: "Paneles en vivo mostrando ventas, productos estrella y horas pico al instante." },
                { title: "Gestión de Empleados", desc: "Controla turnos, calcula nóminas y administra horarios de forma segura." },
                { title: "Marketing con IA", desc: "Genera descripciones de menú e imágenes para redes sociales con Inteligencia Artificial." },
                { title: "Pedidos Online", desc: "Permite a tus clientes pedir desde su móvil vía código QR o tu web pública." }
            ],
            showcase: {
                f1: { title: "Interfaz POS diseñada para la velocidad.", desc: "Opera al máximo de capacidad en horas pico. Nuestro POS minimiza los clics, haciendo la toma de pedidos y cobros casi instantánea.", list: ["Soporte para pedidos en mesa", "División rápida de cuentas", "Resiliencia sin conexión"] },
                f2: { title: "Conoce tus números en tiempo real.", desc: "No esperes a fin de mes para conocer tus márgenes. Rastrea los ingresos diarios, costos de comida y el rendimiento de tus meseros en vivo.", link: "Explorar Analíticas" }
            },
            howTo: {
                title: "Cómo funciona",
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
                items: ["Genera imágenes de platos", "Crea posts para redes", "Analiza tendencias de ventas", "Recomienda precios"]
            },
            integrations: { title: "Compatible con infraestructura moderna" },
            cta: { title: "Empieza a gestionar tu", titleSpan: "restaurante como un profesional.", desc: "Únete a otros restaurantes modernos que usan JAMALI OS para escalar sus operaciones.", btn: "Solicitar Demo" },
            footer: { desc: "El sistema operativo inteligente diseñado para maximizar la rentabilidad y eficiencia de los restaurantes modernos.", company: "Compañía", features: "Funciones", pricing: "Precios", privacy: "Privacidad", terms: "Términos", integrations: "Integraciones", changelog: "Novedades", about: "Sobre Nosotros", contact: "Contacto" }
        },
        en: {
            nav: { product: "Product", features: "Features", pricing: "Pricing", demo: "Demo", login: "Log in", reqDemo: "Request Demo" },
            hero: {
                badge: "JAMALI OS 2.0 is now available",
                title: "Run your restaurant",
                titleSpan: "with JAMALI OS",
                desc: "The AI-powered operating system that helps restaurants manage sales, inventory, staff, and marketing from one single platform.",
                reqDemo: "Request Demo",
                watchDemo: "Watch Demo"
            },
            trust: "Built for modern restaurants",
            problem: {
                title: "Restaurants run",
                titleSpan: "on chaos.",
                desc: "Using multiple tools that don't talk to each other leads to errors, lost revenue, and exhausted teams.",
                cards: [
                    { title: "Multiple disconnected tools" },
                    { title: "Manual inventory tracking" },
                    { title: "Poor sales insights" },
                    { title: "No automated marketing" }
                ]
            },
            solution: {
                title: "One platform to manage everything.",
                desc: "JAMALI OS centralizes restaurant operations into a single platform powered by modern cloud infrastructure and AI tools."
            },
            features: [
                { title: "Smart POS", desc: "Lightning fast checkouts, table management, and split payments built for speed." },
                { title: "Inventory Automation", desc: "Track ingredients in real-time. Know exactly how much every dish costs." },
                { title: "Restaurant Analytics", desc: "Live dashboards showing sales, top products, and peak hours instantly." },
                { title: "Employee Management", desc: "Track hours, calculate payroll, and manage shift schedules securely." },
                { title: "AI Marketing", desc: "Generate social media posts and menu descriptions with built-in AI." },
                { title: "Online Orders", desc: "Let customers order directly from their phone via QR or your public site." }
            ],
            showcase: {
                f1: { title: "POS Interface designed for speed.", desc: "Operate at maximum capacity during peak hours. Our POS minimizes clicks, making order taking and payment processing near instantaneous.", list: ["Table-side ordering support", "Quick split checks", "Offline resilience"] },
                f2: { title: "Know your numbers in real-time.", desc: "Don't wait until the end of the month to know your margins. Track daily revenue, food cost, and top-performing staff live.", link: "Explore Analytics" }
            },
            howTo: {
                title: "How it works",
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
                items: ["Generate food images", "Create social posts", "Analyze sales trends", "Recommend pricing"]
            },
            integrations: { title: "Compatible with modern infrastructure" },
            cta: { title: "Start managing your", titleSpan: "restaurant like a pro.", desc: "Join other modern restaurants using JAMALI OS to scale their operations.", btn: "Request Demo" },
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
                                width={180}
                                height={60}
                                className="h-12 w-auto object-contain"
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
                    className="w-full max-w-6xl mx-auto mt-20 relative perspective-[2000px]"
                >
                    <div className="relative aspect-[16/9] md:aspect-[21/9] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transform rotate-x-1 scale-100 hover:scale-[1.01] transition-all duration-1000 ease-out group">
                        <motion.div
                            className="flex h-full w-[400%]"
                            animate={{ x: ["0%", "-25%", "-50%", "-75%", "0%"] }}
                            transition={{
                                duration: 24,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <div className="w-1/4 h-full relative">
                                <Image src="/images/ui-dashboard.png" alt="Dashboard" fill className="object-cover object-top" priority />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-sm">Dashboard Administrativo</div>
                                </div>
                            </div>
                            <div className="w-1/4 h-full relative">
                                <Image src="/images/ui-pos.png" alt="POS Sales" fill className="object-cover object-top" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-sm">Terminal Punto de Venta</div>
                                </div>
                            </div>
                            <div className="w-1/4 h-full relative">
                                <Image src="/images/ui-inventory.png" alt="Inventory" fill className="object-cover object-top" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-sm">Control Kernel Insumos</div>
                                </div>
                            </div>
                            <div className="w-1/4 h-full relative">
                                <Image src="/images/ui-menu.png" alt="Menu Catalog" fill className="object-cover object-top" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold text-sm">Ingeniería Studio Menú</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Overlay Controls UI */}
                        <div className="absolute top-6 left-6 flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 3. TRUST SECTION */}
            <section className="py-12 border-y border-slate-100 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.trust}</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 text-slate-400 grayscale opacity-60">
                        {/* Placeholder generic names for trust */}
                        <span className="font-black text-2xl tracking-tighter">BistroCraft</span>
                        <span className="font-bold text-2xl italic">TheGrill</span>
                        <span className="font-medium text-2xl uppercase tracking-widest">SushiBar</span>
                        <span className="font-bold text-2xl font-serif">Osteria</span>
                        <span className="font-black text-2xl tracking-tighter">TACO&CO</span>
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
                    <motion.div {...fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { title: c.problem.cards[0].title, icon: Server },
                            { title: c.problem.cards[1].title, icon: Database },
                            { title: c.problem.cards[2].title, icon: BarChart3 },
                            { title: c.problem.cards[3].title, icon: Globe }
                        ].map((issue, idx) => (
                            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                    <issue.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-slate-900 font-bold">{issue.title}</h3>
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
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">STEP {item.step}</span>
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 border border-orange-200 text-orange-600 font-bold text-sm">
                        <Sparkles className="w-4 h-4" /> {c.ai.badge}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">{c.ai.title}</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        {c.ai.desc}
                    </p>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-left pt-10">
                        {c.ai.items.map((f, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <Sparkles className="w-6 h-6 text-orange-500 mb-4" />
                                <h4 className="text-slate-900 font-bold">{f}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. INTEGRATIONS */}
            <section className="py-20 border-y border-slate-100 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{c.integrations.title}</h3>
                    <div className="flex flex-wrap justify-center gap-12 items-center text-slate-400">
                        <div className="flex items-center gap-2 font-bold text-xl"><CreditCard className="w-6 h-6" /> Payments</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><Cloud className="w-6 h-6" /> Cloud</div>
                        <div className="flex items-center gap-2 font-bold text-xl"><BarChart3 className="w-6 h-6" /> Analytics</div>
                    </div>
                </div>
            </section>

            {/* 11. FINAL CTA */}
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
                                width={200}
                                height={60}
                                className="h-14 w-auto object-contain grayscale opacity-80 hover:grayscale-0 transition-all hover:opacity-100"
                            />
                        </Link>
                        <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium">
                            {c.footer.desc}
                        </p>
                        <div className="flex items-center gap-4 text-slate-400">
                            <a href="#" className="hover:text-slate-900 transition-colors"><Mail className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-slate-900 transition-colors"><Github className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-slate-900 transition-colors"><Linkedin className="w-5 h-5" /></a>
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
                    <p>contact@jamalios.com</p>
                </div>
            </footer>
        </div>
    )
}
