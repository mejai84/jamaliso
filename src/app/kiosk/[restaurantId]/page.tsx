"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { createKioskOrder } from "@/actions/kiosk"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Clock,
    ChevronRight,
    UtensilsCrossed,
    Store,
    CreditCard,
    Banknote,
    Coffee,
    Plus,
    Minus,
    Trash2,
    ShoppingBag,
    CheckCircle2
} from "lucide-react"

export default function KioskApp() {
    const params = useParams()
    const slug = params?.restaurantId as string

    const [restaurant, setRestaurant] = useState<any>(null)
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])

    // UI State
    const [isIdle, setIsIdle] = useState(true)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [cart, setCart] = useState<any[]>([])
    const [checkoutStep, setCheckoutStep] = useState<'menu' | 'name' | 'payment' | 'success'>('menu')
    const [customerName, setCustomerName] = useState("")

    useEffect(() => {
        let idleTimer: NodeJS.Timeout

        const resetIdle = () => {
            if (!isIdle) {
                // Solo reiniciamos el temporizador si no estamos en reposo absoluto
                clearTimeout(idleTimer)
                const timeout = (settings?.idle_timeout_seconds || 60) * 1000
                idleTimer = setTimeout(() => {
                    setIsIdle(true)
                    setCart([]) // Vaciar carrito si abandona el kiosco
                    setCheckoutStep('menu')
                    setCustomerName("")
                }, timeout)
            }
        }

        // Eventos táctiles y de clic para despertar a Kiosco
        window.addEventListener('touchstart', resetIdle)
        window.addEventListener('click', resetIdle)
        window.addEventListener('keydown', resetIdle)

        resetIdle()
        return () => {
            clearTimeout(idleTimer)
            window.removeEventListener('touchstart', resetIdle)
            window.removeEventListener('click', resetIdle)
            window.removeEventListener('keydown', resetIdle)
        }
    }, [settings, isIdle])

    useEffect(() => {
        if (slug) {
            loadKioskData()
        }
    }, [slug])

    const loadKioskData = async () => {
        setLoading(true)
        try {
            // 1. Cargar Restaurante por Subdominio/Slug
            const { data: resData } = await supabase
                .from('restaurants')
                .select('*')
                .eq('slug', slug)
                .single()

            if (resData) {
                setRestaurant(resData)

                // 2. Cargar Settings del Kiosco
                const { data: kioskData } = await supabase
                    .from('kiosk_settings')
                    .select('*')
                    .eq('restaurant_id', resData.id)
                    .single()

                if (kioskData) setSettings(kioskData)

                // 3. Cargar Categorías
                const { data: catData } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('restaurant_id', resData.id)
                    .order('order_index', { ascending: true })

                if (catData && catData.length > 0) {
                    setCategories(catData)
                    setActiveCategory(catData[0].id)
                }

                // 4. Cargar Productos Activos
                const { data: prodData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('restaurant_id', resData.id)
                    .eq('status', 'active')

                if (prodData) setProducts(prodData)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const startOrder = () => {
        setIsIdle(false)
        setCheckoutStep('menu')
    }

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { product, quantity: 1 }]
        })
    }

    const updateQuantity = (productId: string, increment: number) => {
        setCart((prev: any[]) => prev.map(item => {
            if (item.product.id === productId) {
                const newQuantity = Math.max(0, item.quantity + increment)
                return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
            }
            return item
        }).filter(Boolean) as any[])
    }

    const handleFinalizeOrder = async (method: 'card' | 'cash') => {
        setLoading(true)
        try {
            const res = await createKioskOrder({
                restaurant_id: restaurant.id,
                customer_name: customerName || 'Cliente Kiosco',
                payment_method: method,
                cart: cart,
                total: cartTotal
            })

            if (res.success) {
                setCheckoutStep('success')
                toast.success("¡ORDEN ENVIADA A COCINA!")
            } else {
                toast.error("Error al procesar: " + res.error)
            }
        } catch (e) {
            toast.error("Error crítico de conexión")
        } finally {
            setLoading(false)
        }
    }

    const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl font-black italic animate-pulse">Iniciando Terminal...</div>

    if (!restaurant || !settings?.is_active) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Store className="w-24 h-24 text-slate-700 opacity-50" />
                <h1 className="text-4xl font-black italic uppercase text-slate-500">Terminal Fuera de Servicio</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Este kiosco no está configurado o ha sido desactivado.</p>
            </div>
        )
    }

    const primaryColor = settings.theme_color || '#dc2626'

    // ==========================================
    // 🎭 PANTALLA DE REPOSO (SCREENSAVER)
    // ==========================================
    if (isIdle) {
        return (
            <div onClick={startOrder} className="fixed inset-0 cursor-pointer overflow-hidden bg-slate-900 flex flex-col items-center justify-center z-50">
                {settings.screensaver_video_url ? (
                    <video
                        src={settings.screensaver_video_url}
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
                )}

                <div className="relative z-10 w-full p-8 md:p-16 flex flex-col items-center justify-center h-full text-center space-y-12 animate-in fade-in duration-1000">
                    {restaurant.logo_url && (
                        <div className="w-32 h-32 md:w-48 md:h-48 bg-white/10 backdrop-blur-xl rounded-[3rem] p-6 shadow-2xl flex items-center justify-center border-2 border-white/20">
                            <img src={restaurant.logo_url} className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                    )}

                    <div className="space-y-4 max-w-[80vw]">
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
                            {settings.welcome_title}
                        </h1>
                        <p className="text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-lg">
                            {settings.welcome_subtitle}
                        </p>
                    </div>

                    <div className="absolute bottom-16 animate-bounce">
                        <button
                            className="px-16 py-8 rounded-full text-3xl font-black italic uppercase shadow-2xl transition-transform hover:scale-105 active:scale-95 text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span className="flex items-center gap-4">
                                TOCA PARA COMENZAR <ChevronRight className="w-10 h-10" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================
    // 🍔 MODO MENÚ (PEDIDO DINÁMICO)
    // ==========================================
    const filteredProducts = products.filter(p => p.category_id === activeCategory)

    return (
        <div className="fixed inset-0 bg-slate-50 flex overflow-hidden font-sans select-none">
            {/* LADO IZQUIERDO: MENÚ Y CATEGORÍAS */}
            <div className="flex-1 flex flex-col h-full relative">

                {/* Header Categorías */}
                <div className="h-32 bg-white border-b-2 border-slate-100 shadow-sm shrink-0 flex items-end px-8 pb-4 gap-4 overflow-x-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-8 py-5 rounded-3xl font-black italic uppercase text-lg whitespace-nowrap transition-all shadow-sm ${activeCategory === cat.id
                                ? "text-white scale-105 shadow-xl origin-bottom"
                                : "bg-slate-50 text-slate-400 border-2 border-slate-100 active:scale-95"
                                }`}
                            style={{ backgroundColor: activeCategory === cat.id ? primaryColor : undefined }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid de Productos */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => checkoutStep === 'menu' && addToCart(product)}
                                className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group active:scale-95"
                            >
                                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                                    {product.image_url ? (
                                        <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <UtensilsCrossed className="w-16 h-16 text-slate-300" />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                                    <p className="absolute bottom-4 left-4 right-4 text-white font-black text-2xl italic drop-shadow-xl text-center">
                                        ${product.price.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-6 text-center space-y-2 h-32 flex flex-col justify-between">
                                    <h4 className="font-black font-sans uppercase text-slate-900 leading-tight line-clamp-2">{product.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-snug line-clamp-2">{product.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LADO DERECHO: CARRITO Y CHECKOUT (Panel Lateral) */}
            <div className="w-[450px] bg-white border-l-2 border-slate-100 shadow-2xl relative flex flex-col shrink-0 z-20">
                {/* Cabecera Ticket */}
                <div className="h-32 bg-slate-900 text-white flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Tu Pedido</h2>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{restaurant.name}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                </div>

                {/* Área Scrollable (Carrito o Pasos) */}
                <div className="flex-1 overflow-y-auto bg-slate-50 relative p-6">

                    {/* PASO 1: CARRO DE COMPRAS */}
                    {checkoutStep === 'menu' && (
                        <div className="space-y-4">
                            {cart.length === 0 ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                                    <UtensilsCrossed className="w-24 h-24 mb-6 opacity-50" />
                                    <p className="text-2xl font-black italic uppercase text-slate-400">Carrito Vacío</p>
                                    <p className="font-bold text-sm uppercase tracking-widest mt-2 opacity-50">Toca los productos a la izquierda para armar tu pedido.</p>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-900 truncate uppercase text-sm">{item.product.name}</p>
                                            <p className="text-xs font-bold text-slate-400 italic">${item.product.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500 font-bold text-xl active:scale-90"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <span className="w-8 text-center font-black text-lg text-slate-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                className="w-10 h-10 text-white rounded-xl shadow-sm flex items-center justify-center font-bold text-xl active:scale-90"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* PASO 2: NOMBRE */}
                    {checkoutStep === 'name' && (
                        <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300 absolute inset-0 bg-white p-8">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Tu Nombre</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Para llamarte cuando la orden esté lista.</p>

                            <input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Escribe tu nombre..."
                                className="w-full text-center text-4xl font-black uppercase italic p-8 bg-slate-50 border-4 border-slate-100 rounded-[3rem] focus:border-indigo-400 outline-none transition-colors"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* PASO 3: PAGO */}
                    {checkoutStep === 'payment' && (
                        <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300 absolute inset-0 bg-white p-8 space-y-6">
                            <div>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-center">Método de Pago</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">¿CÓMO DESEAS ABONAR ESTA ORDEN?</p>
                            </div>

                            <div className="grid gap-4 mt-8">
                                {settings.allow_card_payment && (
                                    <button
                                        onClick={() => handleFinalizeOrder('card')}
                                        className="w-full p-8 rounded-[3rem] border-4 border-slate-100 hover:border-blue-500 bg-slate-50 hover:bg-white text-center transition-all group active:scale-95"
                                    >
                                        <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-black uppercase italic text-slate-900 group-hover:text-blue-600">Tarjeta</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inserta en el datáfono</p>
                                    </button>
                                )}
                                {settings.allow_cash_payment && (
                                    <button
                                        onClick={() => handleFinalizeOrder('cash')}
                                        className="w-full p-8 rounded-[3rem] border-4 border-slate-100 hover:border-emerald-500 bg-slate-50 hover:bg-white text-center transition-all group active:scale-95"
                                    >
                                        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Banknote className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <p className="text-2xl font-black uppercase italic text-slate-900 group-hover:text-emerald-600">Efectivo</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Paga en la caja principal</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PASO 4: ÉXITO */}
                    {checkoutStep === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 absolute inset-0 bg-slate-900 p-8 text-center text-white space-y-8 z-50">
                            <div className="w-32 h-32 bg-emerald-500 rounded-[3rem] flex items-center justify-center rotate-3 shadow-2xl shadow-emerald-500/50">
                                <CheckCircle2 className="w-16 h-16 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black italic tracking-tighter uppercase">¡Orden Recibida!</h2>
                                <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700">
                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">TU NÚMERO DE PEDIDO</p>
                                    <p className="text-6xl font-black italic">#{Math.floor(Math.random() * 900) + 100}</p>
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-8 opacity-50">Retira tu ticket debajo e imprímelo.</p>
                            </div>

                            <button
                                onClick={() => setIsIdle(true)}
                                className="absolute bottom-8 px-12 py-6 bg-slate-800 hover:bg-slate-700 rounded-full font-black uppercase tracking-widest text-[10px] text-slate-300"
                            >
                                TERMINAR
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Fijo Total */}
                {checkoutStep !== 'success' && (
                    <div className="bg-white p-6 border-t-2 border-slate-100 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] shrink-0 z-30">
                        <div className="flex items-end justify-between mb-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Orden</p>
                            <p className="text-4xl font-black italic tracking-tighter text-slate-900">${cartTotal.toLocaleString()}</p>
                        </div>

                        {checkoutStep === 'menu' && (
                            <button
                                onClick={() => {
                                    if (settings.require_customer_name) setCheckoutStep('name')
                                    else setCheckoutStep('payment')
                                }}
                                disabled={cart.length === 0}
                                className={cn(
                                    "w-full h-20 rounded-[2rem] font-black italic uppercase text-2xl tracking-tight transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4",
                                    cart.length === 0 ? "bg-slate-200 text-slate-400 shadow-none" : "text-white"
                                )}
                                style={{ backgroundColor: cart.length > 0 ? primaryColor : undefined }}
                            >
                                CONTINUAR <ChevronRight className="w-8 h-8" />
                            </button>
                        )}

                        {checkoutStep === 'name' && (
                            <button
                                onClick={() => setCheckoutStep('payment')}
                                disabled={customerName.trim().length === 0}
                                className={cn(
                                    "w-full h-20 rounded-[2rem] font-black italic uppercase text-2xl tracking-tight transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 text-white"
                                )}
                                style={{ backgroundColor: customerName.trim().length > 0 ? primaryColor : '#cbd5e1' }}
                            >
                                IR AL PAGO <ChevronRight className="w-8 h-8" />
                            </button>
                        )}

                        {(checkoutStep === 'name' || checkoutStep === 'payment') && (
                            <button
                                onClick={() => setCheckoutStep(checkoutStep === 'payment' && settings.require_customer_name ? 'name' : 'menu')}
                                className="w-full h-12 mt-4 rounded-full font-bold uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-colors"
                            >
                                VOLVER ATRÁS
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
} 
