"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Loader2, ShoppingBag, Search, Plus, Star, Minus, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto">
                        <span className="text-4xl">🍽️</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Restaurante no encontrado</h1>
                    <p className="text-slate-500 text-sm">La URL <code className="bg-slate-100 px-2 py-1 rounded text-xs">/{slug}/menu</code> no corresponde a ningún restaurante registrado.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando menú...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
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
                                <p className="text-xl font-black italic tracking-tight" style={{ color: restaurant?.primary_color || '#ea580c' }}>
                                    {formatPrice(product.price)}
                                </p>
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

            {/* FOOTER */}
            <footer className="border-t border-slate-100 py-8 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {restaurant?.name} · Powered by JAMALI OS
                </p>
            </footer>
        </div>
    )
}
