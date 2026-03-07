"use client"

import { LayoutGrid, Zap, Search, Plus, X, ShoppingBag, Star, ChefHat, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { Product, Category, CartItem, Table } from "@/app/admin/waiter/types"

interface OrderInterfaceProps {
    table: Table | null
    categories: Category[]
    products: Product[]
    cart: CartItem[]
    activeCategory: string
    searchTerm: string
    submitting: boolean
    isPriority: boolean
    restaurant: any
    onAddToCart: (product: Product) => void
    onRemoveFromCart: (index: number) => void
    onUpdateCartQty: (index: number, delta: number) => void
    onUpdateItemNote: (index: number, note: string) => void
    onTogglePriority: () => void
    onMarchar: () => void
    setActiveCategory: (id: string) => void
    setSearchTerm: (term: string) => void
}

const QUICK_MODS = ["SIN CEBOLLA", "TÉRMINO MEDIO", "BIEN ASADO", "EXTRA QUESO", "SIN SAL", "PARA LLEVAR"]

export function OrderInterface({
    table,
    categories,
    products,
    cart,
    activeCategory,
    searchTerm,
    submitting,
    isPriority,
    restaurant,
    onAddToCart,
    onRemoveFromCart,
    onUpdateCartQty,
    onUpdateItemNote,
    onTogglePriority,
    onMarchar,
    setActiveCategory,
    setSearchTerm
}: OrderInterfaceProps) {
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCat = activeCategory === 'all' || p.category_id === activeCategory
        return matchesSearch && matchesCat
    })

    const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.product.price * curr.qty), 0)
    const taxRate = (restaurant?.tax_percentage || 0) / 100
    const serviceRate = (restaurant?.service_charge_percentage || 0) / 100
    const tax = cartSubtotal * taxRate
    const serviceCharge = (restaurant?.apply_service_charge) ? (cartSubtotal * serviceRate) : 0
    const total = cartSubtotal + tax + serviceCharge

    return (
        <div className="h-full flex overflow-hidden">
            {/* CATEGORY SIDEBAR */}
            <div className="w-20 md:w-28 bg-white/40 border-r border-slate-200 flex flex-col py-6 overflow-y-auto shrink-0">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={cn("flex flex-col items-center gap-2 p-4 border-l-4", activeCategory === 'all' ? "border-orange-500 bg-orange-50 text-orange-600" : "border-transparent text-slate-400")}
                >
                    <LayoutGrid className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase italic">ALL</span>
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn("flex flex-col items-center gap-2 p-5 border-l-4", activeCategory === cat.id ? "border-orange-500 bg-orange-50 text-orange-600" : "border-transparent text-slate-400")}
                    >
                        <span className="text-[8px] font-black uppercase text-center italic leading-tight">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* PRODUCT LIST */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b border-slate-200 bg-white/40 space-y-4">
                    {/* ⚡ QUICK-ADD FAVORITES */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-2 shrink-0 px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[9px] font-black italic uppercase shadow-lg shadow-orange-500/20">
                            <Zap className="w-3 h-3 fill-white" /> TOP 5
                        </div>
                        {products.slice(0, 5).map(prod => (
                            <button
                                key={prod.id}
                                onClick={() => onAddToCart(prod)}
                                className="shrink-0 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black italic text-slate-700 hover:border-orange-400 hover:text-orange-600 transition-all shadow-sm active:scale-95"
                            >
                                + {prod.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Buscar en menú..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 text-sm text-slate-900 shadow-inner focus:border-orange-500 focus:outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredProducts.map(prod => {
                        const isOutOfStock = prod.use_inventory && (prod.stock_quantity || 0) <= 0;
                        return (
                            <div
                                key={prod.id}
                                onClick={() => !isOutOfStock && onAddToCart(prod)}
                                className={cn(
                                    "bg-white border border-slate-100 rounded-2xl p-4 active:scale-95 transition-all shadow-sm flex flex-col h-32 justify-between relative group overflow-hidden",
                                    isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"
                                )}
                            >
                                {prod.use_inventory && !isOutOfStock && (
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-100 rounded-md text-[7px] font-black text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        STOCK: {prod.stock_quantity}
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-slate-950/5 flex items-center justify-center">
                                        <div className="bg-rose-600 text-white text-[8px] font-black px-2 py-1 rounded-full rotate-[-10deg] shadow-lg">AGOTADO</div>
                                    </div>
                                )}
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase line-clamp-2 text-slate-900 leading-none mb-1">{prod.name}</p>
                                    <p className="text-lg font-black italic font-mono text-orange-600 leading-none">{formatPrice(prod.price)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CART SIDEBAR */}
            <div className="w-80 bg-white/80 border-l border-slate-200 flex flex-col shrink-0 hidden lg:flex">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase text-slate-900">{table?.table_name}</h2>
                    <ShoppingBag className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.map((item, i) => (
                        <div key={i} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500 text-white flex items-center justify-center rounded-lg font-black text-xs">{item.qty}x</div>
                                <p className="flex-1 text-[10px] font-bold text-slate-900 uppercase truncate">{item.product.name}</p>
                                <button onClick={() => onRemoveFromCart(i)}><X className="w-4 h-4 text-rose-400" /></button>
                            </div>

                            {/* 📝 QUICK MODIFIERS */}
                            <div className="mt-3 flex flex-wrap gap-1">
                                {QUICK_MODS.map(mod => (
                                    <button
                                        key={mod}
                                        onClick={() => onUpdateItemNote(i, (item.notes ? item.notes + ", " : "") + mod)}
                                        className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[7px] font-black text-slate-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all uppercase"
                                    >
                                        {mod}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-3 flex gap-1">
                                <input
                                    placeholder="Nota personalizada..."
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] text-slate-600 italic"
                                    value={item.notes || ""}
                                    onChange={e => onUpdateItemNote(i, e.target.value)}
                                />
                                <button onClick={() => onUpdateCartQty(i, -1)} className="px-3 bg-white border border-slate-200 rounded-lg font-bold">-</button>
                                <button onClick={() => onUpdateCartQty(i, 1)} className="px-3 bg-white border border-slate-200 rounded-lg font-bold">+</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-y border-slate-200 bg-white/50">
                    <button
                        onClick={onTogglePriority}
                        className={cn(
                            "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                            isPriority
                                ? "bg-amber-50 border-amber-300 shadow-lg shadow-amber-200/50"
                                : "bg-white border-slate-100 grayscale opacity-40 hover:opacity-100 hover:grayscale-0"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                isPriority ? "bg-amber-400 text-white animate-pulse" : "bg-slate-100 text-slate-400"
                            )}>
                                <Star className={cn("w-5 h-5", isPriority && "fill-white")} />
                            </div>
                            <div className="text-left">
                                <p className={cn("text-[10px] font-black uppercase tracking-widest", isPriority ? "text-amber-600" : "text-slate-400")}>Prioridad</p>
                                <p className={cn("text-xs font-bold italic", isPriority ? "text-amber-900" : "text-slate-600")}>MARCAR COMO VIP</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-12 h-6 rounded-full relative transition-all",
                            isPriority ? "bg-amber-400" : "bg-slate-200"
                        )}>
                            <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                isPriority ? "left-7" : "left-1"
                            )} />
                        </div>
                    </button>
                </div>
                <div className="p-6 border-t border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="space-y-2 border-b border-slate-200 pb-4">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SUBTOTAL</p>
                            <p className="text-sm font-bold text-slate-600 font-mono">{formatPrice(cartSubtotal)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">IMPUESTOS ({restaurant?.tax_percentage}%)</p>
                            <p className="text-sm font-bold text-slate-600 font-mono">{formatPrice(tax)}</p>
                        </div>
                        {restaurant?.apply_service_charge && (
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SERVICIO ({restaurant?.service_charge_percentage}%)</p>
                                <p className="text-sm font-bold text-slate-600 font-mono">{formatPrice(serviceCharge)}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-end pt-2">
                        <p className="text-[10px] font-black text-orange-500 uppercase">TOTAL FINAL</p>
                        <p className="text-4xl font-black italic text-slate-900 tracking-tighter">
                            {formatPrice(total)}
                        </p>
                    </div>
                    <Button onClick={onMarchar} disabled={submitting || cart.length === 0} className="w-full h-16 bg-orange-600 text-white font-black uppercase rounded-2xl shadow-xl shadow-orange-600/10 border-b-4 border-orange-800 transition-all active:scale-95 group">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                            <div className="flex items-center justify-center gap-3">
                                <ChefHat className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span>MARCHAR A COCINA</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
