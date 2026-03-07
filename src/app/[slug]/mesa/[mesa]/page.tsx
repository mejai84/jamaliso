"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Loader2, ShoppingBag, Search, Plus, Minus, X, ChefHat, Star, MessageSquare } from "lucide-react"
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

type CartItem = {
    product: Product
    qty: number
    notes?: string
}

export default function QRMesaPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params?.slug as string
    const mesa = params?.mesa as string

    const [restaurant, setRestaurant] = useState<any>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [activeCategory, setActiveCategory] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showCart, setShowCart] = useState(false)

    useEffect(() => {
        if (slug) loadData()
    }, [slug])

    const loadData = async () => {
        setLoading(true)
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

        const [catsRes, prodsRes] = await Promise.all([
            supabase.from('categories').select('*').eq('restaurant_id', res.id).order('name'),
            supabase.from('products').select('*').eq('restaurant_id', res.id).eq('is_available', true).order('name')
        ])

        if (catsRes.data) setCategories(catsRes.data)
        if (prodsRes.data) setProducts(prodsRes.data as Product[])
        setLoading(false)
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id)
            if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
            return [...prev, { product, qty: 1 }]
        })
    }

    const updateQty = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = item.qty + delta
                return newQty <= 0 ? item : { ...item, qty: newQty }
            }
            return item
        }))
    }

    const removeItem = (index: number) => setCart(prev => prev.filter((_, i) => i !== index))

    const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0)
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

    const handleSendOrder = async () => {
        if (!restaurant) return alert("Error: restaurante no cargado")
        if (cart.length === 0) return alert("Agrega productos")

        setIsSubmitting(true)
        try {
            // 1. Find table by number
            const { data: tableData } = await supabase
                .from('tables')
                .select('id')
                .eq('restaurant_id', restaurant.id)
                .eq('table_number', parseInt(mesa))
                .maybeSingle()

            const tableId = tableData?.id || null

            // 2. Head order
            const orderData = {
                restaurant_id: restaurant.id,
                status: 'pending',
                order_type: 'dine_in',
                total: cartTotal,
                subtotal: cartTotal,
                guest_info: { name: `Mesa ${mesa}`, platform: 'qr' },
                table_id: tableId,
                payment_status: 'pending',
                notes: 'Pedido desde QR - Carta Digital'
            }

            const { data: order, error: orderErr } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single()

            if (orderErr) throw orderErr

            // 3. Items
            const itemsToInsert = cart.map(item => ({
                order_id: order.id,
                product_id: item.product.id,
                quantity: item.qty,
                unit_price: item.product.price,
                status: 'pending',
                notes: item.notes || ''
            }))

            const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert)

            if (itemsErr) throw itemsErr

            if (tableId) {
                await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId)
            }

            alert(`✅ ¡Pedido Enviado a Cocina!\n\nTu orden está en preparación. Pronto el mesero estará contigo.`)
            setCart([])
            setShowCart(false)

        } catch (err: any) {
            console.error("ORDER ERROR:", err)
            alert("Hubo un error al procesar el pedido: " + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchCat = activeCategory === 'all' || p.category_id === activeCategory
        return matchSearch && matchCat
    })

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="text-center space-y-4">
                    <span className="text-5xl">🍽️</span>
                    <h1 className="text-2xl font-black text-slate-900">Restaurante no encontrado</h1>
                    <p className="text-slate-400 text-sm">El código QR no es válido.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        )
    }

    const brandColor = restaurant?.primary_color || '#ea580c'

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {restaurant?.logo_url ? (
                            <img src={restaurant.logo_url} alt={restaurant.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: brandColor }}>
                                {restaurant?.name?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-base font-black italic uppercase tracking-tight text-slate-900">{restaurant?.name}</h1>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: brandColor }}>
                                    Mesa {mesa}
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Carta Digital</span>
                            </div>
                        </div>
                    </div>
                    {/* CART BUTTON */}
                    {cartCount > 0 && (
                        <button
                            onClick={() => setShowCart(true)}
                            className="relative p-3 rounded-2xl text-white shadow-lg active:scale-95 transition-transform"
                            style={{ backgroundColor: brandColor }}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center">
                                {cartCount}
                            </span>
                        </button>
                    )}
                </div>
            </header>

            {/* SEARCH + CATEGORIES */}
            <div className="px-5 pt-5 pb-2 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Buscar en el menú..."
                        className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm focus:border-orange-300 focus:outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={cn("shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            activeCategory === 'all' ? "text-white shadow-md" : "bg-slate-50 text-slate-400 border border-slate-100"
                        )}
                        style={activeCategory === 'all' ? { backgroundColor: brandColor } : {}}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn("shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                                activeCategory === cat.id ? "text-white shadow-md" : "bg-slate-50 text-slate-400 border border-slate-100"
                            )}
                            style={activeCategory === cat.id ? { backgroundColor: brandColor } : {}}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* PRODUCTS */}
            <div className="flex-1 px-5 pb-32 space-y-3">
                {filteredProducts.map(product => {
                    const inCart = cart.find(i => i.product.id === product.id)
                    return (
                        <div key={product.id} className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            {product.image_url && (
                                <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-xs uppercase text-slate-900 leading-tight">{product.name}</h3>
                                {product.description && <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{product.description}</p>}
                                <p className="text-base font-black italic mt-1" style={{ color: brandColor }}>{formatPrice(product.price)}</p>
                            </div>
                            <div className="shrink-0">
                                {inCart ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQty(cart.indexOf(inCart), -1)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center active:scale-90">
                                            <Minus className="w-3 h-3 text-slate-600" />
                                        </button>
                                        <span className="text-sm font-black w-6 text-center">{inCart.qty}</span>
                                        <button onClick={() => updateQty(cart.indexOf(inCart), 1)} className="w-8 h-8 rounded-xl text-white flex items-center justify-center active:scale-90" style={{ backgroundColor: brandColor }}>
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-10 h-10 rounded-xl border-2 flex items-center justify-center active:scale-90 transition-transform"
                                        style={{ borderColor: brandColor, color: brandColor }}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 font-bold">No se encontraron productos</p>
                    </div>
                )}
            </div>

            {/* FLOATING CART BAR */}
            {cartCount > 0 && !showCart && (
                <div className="fixed bottom-0 left-0 right-0 p-5 z-40">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full h-16 rounded-2xl text-white font-black uppercase text-sm tracking-wider shadow-2xl flex items-center justify-between px-6 active:scale-[0.98] transition-transform"
                        style={{ backgroundColor: brandColor }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-xs font-black">{cartCount}</div>
                            <span>Ver Pedido</span>
                        </div>
                        <span className="text-lg font-black italic">{formatPrice(cartTotal)}</span>
                    </button>
                </div>
            )}

            {/* CART SHEET */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex flex-col">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
                    <div className="relative mt-auto bg-white rounded-t-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter">Tu Pedido</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mesa {mesa} · {cartCount} {cartCount === 1 ? 'ítem' : 'ítems'}</p>
                            </div>
                            <button onClick={() => setShowCart(false)} className="p-2 bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ backgroundColor: brandColor }}>
                                        {item.qty}x
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black uppercase text-slate-900 truncate">{item.product.name}</p>
                                        <p className="text-xs font-bold text-slate-400">{formatPrice(item.product.price * item.qty)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => updateQty(i, -1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                                        <button onClick={() => updateQty(i, 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                                        <button onClick={() => removeItem(i)} className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center"><X className="w-3 h-3 text-rose-500" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Estimado</p>
                                <p className="text-3xl font-black italic tracking-tighter" style={{ color: brandColor }}>{formatPrice(cartTotal)}</p>
                            </div>
                            <button
                                disabled={isSubmitting}
                                className="w-full h-16 rounded-2xl text-white font-black uppercase text-sm tracking-wider shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50"
                                style={{ backgroundColor: brandColor }}
                                onClick={handleSendOrder}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChefHat className="w-5 h-5" />}
                                {isSubmitting ? 'PROCESANDO...' : 'ENVIAR PEDIDO A COCINA'}
                            </button>
                            <p className="text-[9px] text-center text-slate-300 font-bold uppercase">Powered by JAMALI OS</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
