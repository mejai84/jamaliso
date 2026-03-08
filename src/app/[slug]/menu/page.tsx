"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import {
    Loader2,
    ArrowRight,
    ShoppingBag,
    Search,
    Plus,
    Star,
    Minus,
    X,
    MessageCircle,
    Instagram,
    Facebook,
    Youtube,
    Music2,
    Pin as Pinterest,
    MapPin,
    Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/store/cart-context"
import Link from "next/link"
import { Product as LibProduct } from "@/lib/data"

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string
    is_available: boolean
}

type Category = {
    id: string
    name: string
}

type Restaurant = {
    id: string
    name: string
    logo_url: string | null
    primary_color: string
    slug: string
    subdomain: string
    is_web_active: boolean
    web_mode?: 'menu' | 'ecommerce'
    whatsapp_float_enabled?: boolean
    whatsapp_custom_message?: string
    promo_banner_text?: string
    promo_banner_enabled?: boolean
    address_text?: string
    google_maps_link?: string
    instagram_url?: string
    facebook_url?: string
    tiktok_url?: string
    youtube_url?: string
    pinterest_url?: string
    cuisine_type?: string
}

export default function SlugMenuPage() {
    const params = useParams()
    const slug = params?.slug as string

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [activeCategory, setActiveCategory] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isInactive, setIsInactive] = useState(false)
    const { addItem, cartTotal, cartCount } = useCart()

    useEffect(() => {
        if (slug) loadRestaurantAndMenu()
    }, [slug])

    const loadRestaurantAndMenu = async () => {
        setLoading(true)

        // 1. Buscar restaurante por slug o subdomain
        const { data: res } = await supabase
            .from('restaurants')
            .select('*')
            .or(`slug.eq.${slug},subdomain.eq.${slug}`)
            .maybeSingle()

        if (!res) {
            setError(`Restaurante "${slug}" no encontrado`)
            setLoading(false)
            return
        }

        if (!res.is_web_active) {
            setRestaurant(res)
            setIsInactive(true)
            setLoading(false)
            return
        }

        setRestaurant(res)

        // 2. Cargar categorías y productos de ESE restaurante
        const [catsRes, prodsRes] = await Promise.all([
            supabase.from('categories').select('*').eq('restaurant_id', res.id).order('name'),
            supabase.from('products').select('*').eq('restaurant_id', res.id).eq('is_available', true).order('name')
        ])

        if (catsRes.data) setCategories(catsRes.data)
        if (prodsRes.data) setProducts(prodsRes.data as Product[])
        setLoading(false)
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCat = activeCategory === 'all' || p.category_id === activeCategory
        return matchesSearch && matchesCat
    })

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
                <div className="fixed inset-0 bg-slate-100 opacity-50" />
                <div className="relative z-10 text-center space-y-6 p-8 max-w-md">
                    <div className="w-24 h-24 bg-white border-2 border-slate-200 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl group">
                        <X className="w-10 h-10 text-rose-500 group-hover:rotate-90 transition-transform" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none mb-3">Página no encontrada</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            El restaurante <span className="text-slate-900">"{slug}"</span> no existe en el ecosistema Jamali OS.
                        </p>
                    </div>
                    <Button onClick={() => window.location.href = '/'} className="h-12 px-8 bg-slate-900 text-white rounded-xl font-black italic uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10">
                        VOLVER AL INICIO
                    </Button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-6">
                    <div className="relative w-16 h-16 mx-auto">
                        <Loader2 className="w-16 h-16 animate-spin text-orange-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-slate-900 rounded-full animate-ping" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Conectando con JAMALI OS...</p>
                </div>
            </div>
        )
    }

    if (isInactive) {
        return (
            <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col items-center justify-center">
                {/* 🖼️ FONDO PREMIUM PIXORA */}
                <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
                <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

                <div className="relative z-10 p-8 max-w-lg w-full text-center space-y-10 animate-in fade-in zoom-in duration-1000">
                    <div className="space-y-4">
                        <div className="w-32 h-32 bg-white border-2 border-slate-100 rounded-[3rem] p-4 flex items-center justify-center mx-auto shadow-2xl">
                            {restaurant?.logo_url ? (
                                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full rounded-[2rem] flex items-center justify-center font-black text-white text-3xl" style={{ backgroundColor: restaurant?.primary_color || '#ea580c' }}>
                                    {restaurant?.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600 italic mb-2">Próximamente Web App</h2>
                            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
                                {restaurant?.name}
                            </h1>
                        </div>
                    </div>

                    <div className="bg-white/40 backdrop-blur-md border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                            "Estamos preparando nuestra nueva experiencia digital para que puedas realizar tus pedidos desde cualquier lugar."
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <div className="h-[2px] w-8 bg-slate-200" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">En preparación</p>
                            <div className="h-[2px] w-8 bg-slate-200" />
                        </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        POWERED BY <span className="text-slate-900 font-black">JAMALI OS</span>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* 🏷️ PROMO BANNER */}
            {restaurant?.promo_banner_enabled && (
                <div className="bg-orange-600 py-3 px-6 text-center animate-in slide-in-from-top duration-500 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] md:text-xs font-black text-white uppercase italic tracking-[0.2em]">
                        {restaurant?.promo_banner_text || '¡BIENVENIDO A NUESTRA TIENDA ONLINE!'}
                    </p>
                </div>
            )}

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {restaurant?.logo_url ? (
                            <img src={restaurant.logo_url} alt={restaurant.name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: restaurant?.primary_color || '#ea580c' }}>
                                {restaurant?.name?.charAt(0) || 'R'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-black italic uppercase tracking-tight text-slate-900">{restaurant?.name}</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Carta Digital</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* SEARCH */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Buscar en el menú..."
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 focus:border-orange-300 focus:outline-none transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* CATEGORIES */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={cn(
                            "shrink-0 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            activeCategory === 'all'
                                ? "text-white shadow-lg" : "bg-slate-50 text-slate-400 border border-slate-100"
                        )}
                        style={activeCategory === 'all' ? { backgroundColor: restaurant?.primary_color || '#ea580c' } : {}}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "shrink-0 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                activeCategory === cat.id
                                    ? "text-white shadow-lg" : "bg-slate-50 text-slate-400 border border-slate-100"
                            )}
                            style={activeCategory === cat.id ? { backgroundColor: restaurant?.primary_color || '#ea580c' } : {}}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* PRODUCTS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            {product.image_url && (
                                <div className="relative h-48 bg-slate-50 overflow-hidden">
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <div className="p-5 space-y-2">
                                <h3 className="font-black text-sm uppercase text-slate-900 leading-tight">{product.name}</h3>
                                {product.description && (
                                    <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-xl font-black italic tracking-tight" style={{ color: restaurant?.primary_color || '#ea580c' }}>
                                        {formatPrice(product.price)}
                                    </p>
                                    <Button
                                        size="icon"
                                        className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-orange-600 shadow-lg shadow-slate-900/10 transition-all transition-transform active:scale-95"
                                        onClick={() => {
                                            const libProd: LibProduct = {
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                category_id: product.category_id,
                                                description: product.description || '',
                                                image: product.image_url || "/images/placeholder.png"
                                            };
                                            addItem(libProd, restaurant!.id);
                                        }}
                                    >
                                        <Plus className="w-5 h-5 text-white" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400">No se encontraron productos</p>
                    </div>
                )}
            </div>

            {/* 💬 WHATSAPP BUTTON */}
            {restaurant?.whatsapp_float_enabled && (
                <a
                    href={`https://wa.me/${restaurant?.id}?text=${encodeURIComponent(restaurant?.whatsapp_custom_message || '¡Hola! vengo de tu web y me gustaría hacer un pedido.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce duration-[3000ms]"
                >
                    <MessageCircle className="w-8 h-8 fill-current" />
                </a>
            )}

            {/* FOOTER */}
            {/* 🛒 FLOATING CART BAR */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-3rem)] max-w-lg">
                    <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl flex items-center justify-between border border-white/10 animate-in slide-in-from-bottom duration-500">
                        <div className="pl-6">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tu Pedido ({cartCount})</p>
                            <p className="text-xl font-black italic text-white leading-none">{formatPrice(cartTotal)}</p>
                        </div>
                        <Link href="/checkout">
                            <Button className="bg-orange-600 hover:bg-orange-500 text-white rounded-2xl h-14 px-8 text-xs font-black uppercase italic tracking-widest shadow-xl shadow-orange-600/20 group">
                                FINALIZAR PEDIDO <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            <footer className="bg-slate-50 border-t border-slate-100 py-12 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: restaurant?.primary_color || '#ea580c' }}>
                                {restaurant?.name?.charAt(0) || 'R'}
                            </div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter">{restaurant?.name}</h2>
                        </div>

                        {restaurant?.address_text && (
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest italic">
                                    <MapPin className="w-4 h-4 text-orange-600" /> {restaurant.address_text}
                                </p>
                                {restaurant?.google_maps_link && (
                                    <a
                                        href={restaurant.google_maps_link}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
                                    >
                                        <Globe className="w-3 h-3" /> VER EN EL MAPA
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 md:text-right">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Síguenos en redes</p>
                            <div className="flex gap-4 md:justify-end">
                                {[
                                    { icon: Instagram, url: restaurant?.instagram_url, color: 'hover:text-orange-600' },
                                    { icon: Facebook, url: restaurant?.facebook_url, color: 'hover:text-blue-600' },
                                    { icon: Music2, url: restaurant?.tiktok_url, color: 'hover:text-slate-900' },
                                    { icon: Youtube, url: restaurant?.youtube_url, color: 'hover:text-red-600' },
                                    { icon: Pinterest, url: restaurant?.pinterest_url, color: 'hover:text-red-700' }
                                ].map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.url || undefined}
                                        target={social.url ? "_blank" : undefined}
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 transition-all",
                                            social.url
                                                ? cn("text-slate-400 hover:-translate-y-1 shadow-md", social.color)
                                                : "text-slate-200 opacity-30 cursor-default"
                                        )}
                                        onClick={(e) => !social.url && e.preventDefault()}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] pt-4">Powered by JAMALI OS</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
