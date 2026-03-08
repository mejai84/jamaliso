"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2, ShoppingBag, Bell, ArrowRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Types
import { Product, Category, CartItem, ModifierGroup, SelectedModifier, generateCartKey, getItemTotal } from "./types"

// Components
import { PosHeader } from "@/components/admin/pos/PosHeader"
import { CategorySidebar } from "@/components/admin/pos/CategorySidebar"
import { ProductGrid } from "@/components/admin/pos/ProductGrid"
import { CartPanel } from "@/components/admin/pos/CartPanel"
import { ReceiptModal } from "@/components/admin/pos/ReceiptModal"
import { CheckoutModal } from "@/components/admin/pos/CheckoutModal"
import { ModifierModal } from "@/components/admin/pos/ModifierModal"

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
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
    const [pendingTables, setPendingTables] = useState<any[]>([])
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)

    // Modifier State
    const [modifierModalOpen, setModifierModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [productModifierGroups, setProductModifierGroups] = useState<ModifierGroup[]>([])

    // Data State
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [taxes, setTaxes] = useState<any[]>([])

    // Cache modifier groups per product to avoid re-fetching
    const [modifierCache, setModifierCache] = useState<Record<string, ModifierGroup[]>>({})

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        if (restaurant) fetchData()
        return () => clearInterval(timer)
    }, [restaurant])

    const searchParams = useSearchParams()
    const tableId = searchParams.get('table')

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

        // 4. Si viene de una mesa, cargar el carrito con la orden activa
        if (tableId && prods) {
            const { data: order } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('table_id', tableId)
                .in('status', ['pending', 'preparing', 'ready', 'delivered', 'payment_requested'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (order && order.order_items) {
                setActiveOrderId(order.id)
                const tableCartItems: CartItem[] = order.order_items.map((oi: any) => {
                    const product = prods.find(p => p.id === oi.product_id)
                    if (!product) return null
                    return {
                        product: product as any,
                        qty: oi.quantity,
                        cartKey: generateCartKey(oi.product_id, []),
                        modifiers: [] // TODO: Load modifiers if they exist
                    }
                }).filter(Boolean) as CartItem[]

                setCart(tableCartItems)
                toast.info(`Orden de mesa cargada: ${formatPrice(order.total)}`)
            }
        }

        // 5. Buscar mesas solicitando cobro (usan payment_requested)
        const { data: qpTables } = await supabase
            .from('orders')
            .select('table_id, tables(table_name), total')
            .in('status', ['payment_requested', 'delivered'])
            .eq('restaurant_id', restaurant?.id)
        if (qpTables) setPendingTables(qpTables)

        setLoading(false)
    }

    // Fetch modifier groups for a specific product
    const fetchModifiers = async (productId: string): Promise<ModifierGroup[]> => {
        // Check cache first
        if (modifierCache[productId] !== undefined) return modifierCache[productId]

        try {
            // Get linked modifier group IDs
            const { data: links } = await supabase
                .from('product_modifier_groups')
                .select('modifier_group_id, sort_order')
                .eq('product_id', productId)
                .order('sort_order')

            if (!links || links.length === 0) {
                setModifierCache(prev => ({ ...prev, [productId]: [] }))
                return []
            }

            const groupIds = links.map(l => l.modifier_group_id)

            // Get groups with their options
            const { data: groups } = await supabase
                .from('modifier_groups')
                .select('*')
                .in('id', groupIds)
                .eq('is_active', true)
                .order('sort_order')

            if (!groups) return []

            const { data: options } = await supabase
                .from('modifier_options')
                .select('*')
                .in('group_id', groupIds)
                .eq('is_available', true)
                .order('sort_order')

            const result: ModifierGroup[] = groups.map(g => ({
                ...g,
                options: (options || []).filter(o => o.group_id === g.id)
            }))

            setModifierCache(prev => ({ ...prev, [productId]: result }))
            return result
        } catch (e) {
            console.error("Error fetching modifiers:", e)
            return []
        }
    }

    const handleProductClick = async (product: Product) => {
        const groups = await fetchModifiers(product.id)

        if (groups.length > 0) {
            setSelectedProduct(product)
            setProductModifierGroups(groups)
            setModifierModalOpen(true)
        } else {
            addToCart(product)
        }
    }

    const handleModifierConfirm = (modifiers: SelectedModifier[]) => {
        if (!selectedProduct) return
        addToCart(selectedProduct, modifiers)
        setModifierModalOpen(false)
        setSelectedProduct(null)
    }

    const handleCheckout = () => {
        if (!activeSession) {
            toast.error("ERROR: Debes abrir turno/caja antes de vender.")
            router.push('/admin/cashier')
            return
        }
        setCheckoutModalOpen(true)
    }

    const handleFinalConfirm = async (checkoutData: any) => {
        setIsProcessing(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast.error("Sesión expirada")
            setIsProcessing(false)
            return
        }

        try {
            const p_items = cart.map(item => ({
                product_id: item.product.id,
                quantity: item.qty,
                unit_price: item.product.price,
                modifiers: item.modifiers || []
            }))

            const { data, error } = await supabase.rpc('complete_sale_atomic', {
                p_user_id: user.id,
                p_cashbox_session_id: activeSession.id,
                p_payment_method: checkoutData.payments.length > 1 ? 'mixed' : (checkoutData.payments[0]?.method || 'cash'),
                p_subtotal: subtotal,
                p_tax: taxAmount,
                p_total: checkoutData.total,
                p_items: JSON.stringify(p_items),
                p_table_id: tableId || null,
                p_notes: JSON.stringify({
                    ...checkoutData,
                    applied_tax: taxAmount,
                    active_order_id: activeOrderId
                })
            })

            if (error) throw error

            if (data?.success) {
                if (tableId) {
                    await supabase.from('tables').update({ status: 'free' }).eq('id', tableId)
                    if (activeOrderId) {
                        await supabase.from('orders').update({ status: 'completed' }).eq('id', activeOrderId)
                    }
                }

                toast.success(checkoutData.is_incident ? "Incidente registrado y mesa liberada" : "Venta procesada exitosamente")

                setReceiptModal({
                    id: data.sale_id,
                    total: checkoutData.total,
                    payment_method: 'ADVANCED',
                    items: cart,
                    created_at: new Date().toISOString(),
                    payments: checkoutData.payments,
                    change: (checkoutData.payments.reduce((acc: number, curr: any) => acc + curr.amount, 0)) - checkoutData.total
                })

                setCart([])
                setCheckoutModalOpen(false)
                setActiveOrderId(null)
                if (tableId) router.replace('/admin/pos')
                fetchData()
            }
        } catch (e: any) {
            console.error("Sale Error:", e)
            toast.error("Error al procesar venta: " + (e.message || "Error desconocido"))
        } finally {
            setIsProcessing(false)
        }
    }

    const addToCart = (product: Product, modifiers?: SelectedModifier[]) => {
        const cartKey = generateCartKey(product.id, modifiers)
        setCart(prev => {
            const existing = prev.find(item => item.cartKey === cartKey)
            if (existing) {
                return prev.map(item => item.cartKey === cartKey ? { ...item, qty: item.qty + 1 } : item)
            }
            return [...prev, { product, qty: 1, modifiers, cartKey }]
        })
        const modText = modifiers && modifiers.length > 0 ? ` (${modifiers.map(m => m.name).join(', ')})` : ''
        toast.success(`+1 ${product.name}${modText}`, { duration: 1000 })
    }

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) return { ...item, qty: Math.max(0, item.qty - 1) }
            return item
        }).filter(item => item.qty > 0))
    }

    const removeCartItem = (cartKey: string) => {
        setCart(prev => {
            const item = prev.find(i => i.cartKey === cartKey)
            if (!item) return prev
            if (item.qty <= 1) return prev.filter(i => i.cartKey !== cartKey)
            return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i)
        })
    }

    const clearCart = () => {
        setCart([])
        toast.info("Carrito vaciado")
    }

    const subtotal = cart.reduce((acc, curr) => acc + getItemTotal(curr), 0)
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
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col h-screen">
            {/* 🖼️ FONDO PREMIUM PIXORA (Standardized Across Modules) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <PosHeader currentTime={currentTime} />

            <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="flex flex-col gap-4">
                    <CategorySidebar
                        categories={categories}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />

                    {/* Bóveda de Cobros Pendientes */}
                    {pendingTables.length > 0 && (
                        <div className="hidden md:flex flex-col p-4 space-y-4 bg-slate-900/5 backdrop-blur-md rounded-[2.5rem] border border-white/40 shadow-xl ml-4">
                            <div className="flex items-center gap-2 px-2">
                                <Bell className="w-4 h-4 text-orange-500 animate-bounce" />
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-tighter italic">Cobros Pendientes</h4>
                            </div>
                            <div className="space-y-2 overflow-y-auto max-h-[40vh] custom-scrollbar pr-2">
                                {pendingTables.map((pt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => router.push(`/admin/pos?table=${pt.table_id}`)}
                                        className="w-full p-4 bg-white rounded-2xl border border-slate-100 hover:border-orange-500 hover:shadow-lg transition-all text-left flex flex-col gap-1 group active:scale-95"
                                    >
                                        <span className="text-xs font-black italic uppercase tracking-tighter text-slate-900">{pt.tables?.table_name || 'MESA'}</span>
                                        <span className="text-lg font-black text-orange-600 tracking-tight">{formatPrice(pt.total)}</span>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">CARGAR COMANDA</span>
                                            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ProductGrid
                    products={filteredProducts}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onAdd={handleProductClick}
                    showCartMobile={showCartMobile}
                />

                <CartPanel
                    cart={cart}
                    onAdd={handleProductClick}
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
                restaurant={restaurant}
            />

            {/* Modifier Modal */}
            <ModifierModal
                isOpen={modifierModalOpen}
                product={selectedProduct}
                modifierGroups={productModifierGroups}
                onConfirm={handleModifierConfirm}
                onClose={() => { setModifierModalOpen(false); setSelectedProduct(null) }}
            />

            {/* Advanced Checkout Modal */}
            <CheckoutModal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                cart={cart}
                subtotal={subtotal}
                taxAmount={taxAmount}
                total={total}
                onConfirm={handleFinalConfirm}
                isProcessing={isProcessing}
            />
        </div>
    )
}
