"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Types
import { Product, Category, CartItem } from "./types"

// Components
import { PosHeader } from "@/components/admin/pos/PosHeader"
import { CategorySidebar } from "@/components/admin/pos/CategorySidebar"
import { ProductGrid } from "@/components/admin/pos/ProductGrid"
import { CartPanel } from "@/components/admin/pos/CartPanel"
import { ReceiptModal } from "@/components/admin/pos/ReceiptModal"

export default function PosPremiumPage() {
    const { restaurant } = useRestaurant()
    const router = useRouter()

    // UI State
    const [loading, setLoading] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [cart, setCart] = useState<CartItem[]>([])
    const [receiptModal, setReceiptModal] = useState<any>(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [showCartMobile, setShowCartMobile] = useState(false)
    const [activeSession, setActiveSession] = useState<any>(null)

    // Data State
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [taxes, setTaxes] = useState<any[]>([])

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        if (restaurant) fetchData()
        return () => clearInterval(timer)
    }, [restaurant])

    const fetchData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Cargar Sesión de Caja Activa
        if (user) {
            const { data: session } = await supabase
                .from('cashbox_sessions')
                .select('*, cashboxes(name)')
                .eq('user_id', user.id)
                .eq('status', 'OPEN')
                .maybeSingle()

            if (session) setActiveSession(session)
        }

        // 2. Cargar Categorías y Productos
        const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', restaurant?.id).is('deleted_at', null)
        const { data: prods } = await supabase.from('products').select('*').eq('restaurant_id', restaurant?.id).eq('is_available', true).is('deleted_at', null)

        // 3. Cargar Configuración Regional
        const { data: config } = await supabase.from('settings').select('value').eq('restaurant_id', restaurant?.id).eq('key', 'regional_config').maybeSingle()
        if (config?.value) {
            const { data: taxData } = await supabase.from('regional_taxes').select('*').eq('country', config.value.country).eq('is_active', true)
            if (taxData) setTaxes(taxData)
        }

        if (cats) setCategories(cats)
        if (prods) setProducts(prods as any)
        setLoading(false)
    }

    const handleCheckout = async (method: string) => {
        if (!activeSession) {
            toast.error("ERROR: Debes abrir turno/caja antes de vender.")
            router.push('/admin/cashier')
            return
        }

        setIsProcessing(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast.error("Sesión expirada")
            return
        }

        try {
            const orderData = {
                p_user_id: user.id,
                p_cashbox_session_id: activeSession.id,
                p_payment_method: method,
                p_subtotal: subtotal,
                p_total: total,
                p_items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.qty,
                    unit_price: item.product.price
                }))
            }

            const { data, error } = await supabase.rpc('complete_sale_atomic', orderData)

            if (error) throw error

            if (data?.success) {
                toast.success("Venta Procesada Correctamente")
                setReceiptModal({
                    orderId: data.order_id,
                    total: total,
                    items: [...cart],
                    method: method,
                    date: new Date()
                })
                setCart([])
            }
        } catch (error: any) {
            console.error("Checkout Error:", error)
            toast.error(error.message || "Error al procesar el pago")
        } finally {
            setIsProcessing(false)
        }
    }

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id)
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item)
            }
            return [...prev, { product, qty: 1 }]
        })
        toast.success(`+1 ${product.name}`, { duration: 1000 })
    }

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) return { ...item, qty: Math.max(0, item.qty - 1) }
            return item
        }).filter(item => item.qty > 0))
    }

    const clearCart = () => {
        setCart([])
        toast.info("Carrito vaciado")
    }

    const subtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0)
    const taxRate = taxes.reduce((acc, t) => acc + (t.tax_percentage / 100), 0)
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCat = activeCategory === 'all' || p.category_id === activeCategory
        return matchesSearch && matchesCat
    })

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans">
                <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic animate-pulse">Iniciando Terminal POS Premium...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white font-sans relative overflow-hidden flex flex-col h-screen">
            {/* 🖼️ FONDO PREMIUM */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none" />
            <div className="absolute inset-0 backdrop-blur-[80px] bg-slate-950/90 pointer-events-none" />

            <PosHeader currentTime={currentTime} />

            <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
                <CategorySidebar
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                <ProductGrid
                    products={filteredProducts}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAdd={addToCart}
                    showCartMobile={showCartMobile}
                />

                <CartPanel
                    cart={cart}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                    onClear={clearCart}
                    showCartMobile={showCartMobile}
                    setShowCartMobile={setShowCartMobile}
                    isProcessing={isProcessing}
                    onCheckout={handleCheckout}
                    subtotal={subtotal}
                    taxAmount={taxAmount}
                    taxInfo={taxes.map(t => `${t.tax_name} ${t.tax_percentage}%`).join(' + ')}
                    total={total}
                />

                {/* Mobile Cart Trigger */}
                {!showCartMobile && cart.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden animate-in slide-in-from-bottom border border-white/10 rounded-full shadow-2xl overflow-hidden">
                        <Button
                            onClick={() => setShowCartMobile(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-black font-black italic rounded-full h-14 px-8 flex items-center gap-3 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            VER ORDEN ({cart.length})
                        </Button>
                    </div>
                )}
            </div>

            <ReceiptModal
                receipt={receiptModal}
                onClose={() => setReceiptModal(null)}
                restaurantName={restaurant?.name}
            />
        </div>
    )
}
