"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCachedRestaurantBySlug } from "@/actions/cache"
import {
    Loader2,
    ArrowRight,
    UtensilsCrossed,
    Globe,
    MapPin,
    Clock,
    MessageCircle,
    Instagram,
    Facebook,
    Youtube,
    Music2,
    Pin as Pinterest,
    Star,
    ChefHat,
    Bike,
    ChevronDown,
    Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Restaurant = {
    id: string
    name: string
    logo_url: string | null
    primary_color: string
    slug: string
    subdomain: string
    is_web_active: boolean
    cuisine_type?: string
    address_text?: string
    google_maps_link?: string
    whatsapp_float_enabled?: boolean
    whatsapp_custom_message?: string
    promo_banner_text?: string
    promo_banner_enabled?: boolean
    instagram_url?: string
    facebook_url?: string
    tiktok_url?: string
    youtube_url?: string
    pinterest_url?: string
}

export default function RestaurantLandingPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params?.slug as string
    const [scrolled, setScrolled] = useState(false)

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)
        if (slug) loadRestaurant()
        return () => window.removeEventListener("scroll", handleScroll)
    }, [slug])

    const loadRestaurant = async () => {
        setLoading(true)
        const stringSlug = Array.isArray(slug) ? slug[0] : slug;
        const res = await getCachedRestaurantBySlug(stringSlug);

        if (!res) {
            setError(`Restaurante "${slug}" no encontrado`)
            setLoading(false)
            return
        }

        setRestaurant(res)
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error || !restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
                <Globe className="w-16 h-16 text-slate-200 mb-6" />
                <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Página no encontrada</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{error}</p>
                <Button onClick={() => router.push('/')} className="mt-8 bg-slate-900 text-white rounded-xl h-12 px-8 uppercase font-black text-[10px] tracking-widest">
                    VOLVER A JAMALI OS
                </Button>
            </div>
        )
    }

    const primaryColor = restaurant.primary_color || '#ea580c'

    return (
        <div className="h-screen bg-white text-slate-900 font-sans selection:bg-orange-100 flex flex-col overflow-hidden">

            {/* 🏷️ TOP BANNER PROMOCIONAL (Header Part) */}
            {restaurant.promo_banner_enabled && (
                <div className="bg-orange-600 py-3 px-6 text-center shrink-0">
                    <p className="text-[10px] md:text-xs font-black text-white uppercase italic tracking-[0.2em] animate-pulse">
                        {restaurant.promo_banner_text || '¡BIENVENIDO A NUESTRA EXPERIENCIA DIGITAL!'}
                    </p>
                </div>
            )}

            {/* 🛰️ NAVBAR */}
            <nav className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 shrink-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-50 shrink-0">
                            {restaurant.logo_url ? (
                                <img src={restaurant.logo_url} alt={restaurant.name} className="w-7 h-7 object-contain" />
                            ) : (
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs" style={{ backgroundColor: primaryColor }}>
                                    {restaurant.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-lg font-black italic uppercase tracking-tighter hidden sm:block">{restaurant.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6 mr-6">
                            {[
                                { icon: Instagram, url: restaurant.instagram_url },
                                { icon: Facebook, url: restaurant.facebook_url },
                                { icon: Music2, url: restaurant.tiktok_url },
                                { icon: Youtube, url: restaurant.youtube_url }
                            ].map((s, i) => s.url && (
                                <a key={i} href={s.url} target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <s.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                        <Button
                            onClick={() => router.push(`/${slug}/menu`)}
                            className="bg-slate-900 text-white rounded-full h-11 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10"
                        >
                            PEDIR AHORA
                        </Button>
                    </div>
                </div>
            </nav>

            {/* 🏔️ HERO SECTION (Body / Main Content) */}
            <main className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* FONDO PREMIUM */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070"
                        className="w-full h-full object-cover scale-110 blur-[2px] opacity-20"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-8 animate-pulse duration-[3000ms]">
                            {restaurant.logo_url ? (
                                <img src={restaurant.logo_url} alt={restaurant.name} className="w-14 h-14 object-contain" />
                            ) : (
                                <UtensilsCrossed className="w-8 h-8 text-orange-600" />
                            )}
                        </div>
                        <div className="space-y-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-orange-600 italic">Chef-Crafted Experience</p>
                            <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.9] text-slate-900">
                                {restaurant.name}
                            </h1>
                            <p className="text-base md:text-xl font-bold text-slate-500 max-w-2xl mx-auto italic leading-relaxed">
                                Descubre el auténtico sabor de la cocina <span className="text-slate-900 underline decoration-orange-500 underline-offset-4">{restaurant.cuisine_type || 'local'}</span> con ingredientes frescos y pasión en cada plato.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button
                            onClick={() => router.push(`/${slug}/menu`)}
                            className="bg-slate-900 text-white rounded-3xl h-16 px-12 text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl gap-3 w-full sm:w-auto group"
                        >
                            VER CARTA DIGITAL <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </div>

                    <div className="pt-12 flex items-center justify-center gap-12 border-t border-slate-100/50">
                        <div className="text-center group">
                            <Star className="w-5 h-5 text-orange-400 mx-auto mb-2 group-hover:scale-125 transition-all" fill="currentColor" />
                            <p className="text-xs font-black italic">4.9 Calificación</p>
                        </div>
                        <div className="text-center group">
                            <Bike className="w-5 h-5 text-emerald-500 mx-auto mb-2 group-hover:scale-125 transition-all" />
                            <p className="text-xs font-black italic">Delivery Local</p>
                        </div>
                    </div>
                </div>

                {/* ANIMATED DECORATION */}
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-100 rounded-full blur-[100px] opacity-30" />
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-20" />
            </main>

            {/* 💬 WHATSAPP FLOATING */}
            {restaurant.whatsapp_float_enabled && (
                <a
                    href={`https://wa.me/${restaurant.id}?text=${encodeURIComponent(restaurant.whatsapp_custom_message || '¡Hola! vengo de tu web landing y tengo una consulta.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-10 right-10 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce duration-[3000ms]"
                >
                    <MessageCircle className="w-9 h-9 fill-current" />
                </a>
            )}

            {/* 👣 FOOTER (Footer Part - Simple & Clean) */}
            <footer className="py-8 px-6 border-t border-slate-100 shrink-0 text-center bg-white z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    © 2026 <span className="text-slate-900">{restaurant.name}</span> · POWERED BY JAMALI OS
                </p>
            </footer>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
