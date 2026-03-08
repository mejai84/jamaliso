"use client"

import { LayoutGrid, Zap, Search, Plus, X, ShoppingBag, Star, ChefHat, Loader2, ArrowRight } from "lucide-react"
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
            <div className="w-24 md:w-32 bg-white border-r-2 border-slate-200 flex flex-col py-8 overflow-y-auto shrink-0 shadow-sm relative z-20">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={cn("flex flex-col items-center gap-3 p-5 border-l-4 transition-all", activeCategory === 'all' ? "border-slate-900 bg-slate-50 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600")}
                >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm", activeCategory === 'all' ? "bg-slate-900 text-white" : "bg-slate-100")}>
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase italic tracking-widest leading-none">TODOS</span>
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn("flex flex-col items-center gap-3 p-5 border-l-4 transition-all", activeCategory === cat.id ? "border-slate-900 bg-slate-50 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600")}
                    >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm", activeCategory === cat.id ? "bg-slate-900 text-white" : "bg-slate-100")}>
                            <ChefHat className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-center italic leading-tight tracking-wider">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* PRODUCT LIST */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]/50 relative z-10">
                <div className="p-8 border-b-2 border-slate-100 bg-white/60 backdrop-blur-xl space-y-6 shadow-sm">
                    {/* ⚡ QUICK-ADD FAVORITES */}
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-2 shrink-0 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black italic uppercase shadow-lg">
                            <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> FAVORITOS
                        </div>
                        {products.slice(0, 5).map(prod => (
                            <button
                                key={prod.id}
                                onClick={() => onAddToCart(prod)}
                                className="shrink-0 px-6 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black italic text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-95 group"
                            >
                                <Plus className="w-3 h-3 inline-block mr-1 text-slate-400 group-hover:text-orange-600 transition-colors" />
                                {prod.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            placeholder="Buscar en el menú inteligente..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-slate-900 shadow-inner focus:border-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 custom-scrollbar">
                    {filteredProducts.map(prod => {
                        const isOutOfStock = prod.use_inventory && (prod.stock_quantity || 0) <= 0;
                        return (
                            <div
                                key={prod.id}
                                onClick={() => !isOutOfStock && onAddToCart(prod)}
                                className={cn(
                                    "bg-white border-2 rounded-[2.5rem] p-6 active:scale-95 transition-all shadow-sm flex flex-col h-48 justify-between relative group overflow-hidden",
                                    isOutOfStock ? "opacity-40 grayscale cursor-not-allowed border-slate-100" : "cursor-pointer border-slate-50 hover:border-slate-900 hover:shadow-2xl hover:-translate-y-1"
                                )}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-125 transition-all pointer-events-none">
                                    <ChefHat className="w-24 h-24 text-slate-900" />
                                </div>

                                {prod.use_inventory && !isOutOfStock && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-slate-50 rounded-lg text-[8px] font-black text-slate-400 transition-colors border border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                                        STK: {prod.stock_quantity}
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] flex items-center justify-center z-20">
                                        <div className="bg-rose-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full rotate-[-12deg] shadow-2xl border-2 border-rose-400 scale-110">AGOTADO</div>
                                    </div>
                                )}
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[11px] font-black uppercase line-clamp-2 text-slate-900 leading-tight group-hover:text-orange-600 transition-colors uppercase italic tracking-tighter">{prod.name}</p>
                                    <p className="text-xl font-black italic font-mono text-slate-900 leading-none group-hover:text-orange-600 transition-colors">{formatPrice(prod.price)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CART SIDEBAR */}
            <div className="w-80 bg-white border-l-2 border-slate-200 flex flex-col shrink-0 hidden lg:flex shadow-2xl">
                <div className="p-6 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">{table?.table_name}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">RESUMEN DE CUENTA</p>
                    </div>
                    <ShoppingBag className="w-6 h-6 text-orange-600 drop-shadow-sm" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/20">
                    {cart.map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border-2 border-slate-100 shadow-sm hover:border-orange-200 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-xl font-black text-sm italic shadow-lg">{item.qty}x</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black text-slate-900 uppercase truncate italic leading-tight">{item.product.name}</p>
                                    <p className="text-[10px] font-bold text-orange-600 font-mono">{formatPrice(item.product.price * item.qty)}</p>
                                </div>
                                <button onClick={() => onRemoveFromCart(i)} className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center transition-colors group">
                                    <X className="w-4 h-4 text-slate-300 group-hover:text-rose-500" />
                                </button>
                            </div>

                            {/* 📝 QUICK MODIFIERS */}
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {QUICK_MODS.map(mod => (
                                    <button
                                        key={mod}
                                        onClick={() => onUpdateItemNote(i, (item.notes ? item.notes + ", " : "") + mod)}
                                        className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[8px] font-black text-slate-600 hover:bg-orange-600 hover:text-white hover:border-orange-700 transition-all uppercase italic"
                                    >
                                        {mod}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        placeholder="Nota personalizada..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 italic focus:bg-white focus:border-orange-300 outline-none transition-all"
                                        value={item.notes || ""}
                                        onChange={e => onUpdateItemNote(i, e.target.value)}
                                    />
                                </div>
                                <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                                    <button onClick={() => onUpdateCartQty(i, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-black text-slate-600 hover:bg-rose-500 hover:text-white transition-all">-</button>
                                    <div className="w-8 h-8 flex items-center justify-center font-black text-xs text-slate-900">{item.qty}</div>
                                    <button onClick={() => onUpdateCartQty(i, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-black text-slate-600 hover:bg-emerald-500 hover:text-white transition-all">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                            <ShoppingBag className="w-16 h-16 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">CARRITO VACÍO</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-y-2 border-slate-200 bg-white shadow-inner">
                    <button
                        onClick={onTogglePriority}
                        className={cn(
                            "w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between group overflow-hidden relative",
                            isPriority
                                ? "bg-amber-500 border-amber-600 shadow-xl shadow-amber-500/20"
                                : "bg-white border-slate-200 grayscale-0 opacity-100 hover:border-amber-400 group"
                        )}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all shadow-md",
                                isPriority ? "bg-white text-amber-600 animate-pulse" : "bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-500"
                            )}>
                                <Star className={cn("w-6 h-6", isPriority && "fill-amber-600")} />
                            </div>
                            <div className="text-left">
                                <p className={cn("text-[10px] font-black uppercase tracking-widest", isPriority ? "text-amber-100" : "text-slate-400 group-hover:text-amber-600")}>Prioridad</p>
                                <p className={cn("text-sm font-black italic uppercase leading-none mt-0.5", isPriority ? "text-white" : "text-slate-900")}>Marchar como VIP</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-12 h-6 rounded-full relative transition-all border-2 z-10",
                            isPriority ? "bg-white border-white" : "bg-slate-200 border-slate-300"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 w-4 h-4 rounded-full transition-all shadow-md",
                                isPriority ? "left-6 bg-amber-600" : "left-0.5 bg-white"
                            )} />
                        </div>
                        {isPriority && (
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-white/10 to-amber-600/0 animate-shimmer" />
                        )}
                    </button>
                </div>

                <div className="p-6 bg-slate-900 border-t-2 border-black space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">SUBTOTAL</p>
                            <p className="text-sm font-black text-white font-mono">{formatPrice(cartSubtotal)}</p>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                <Zap className="w-3 h-3 text-orange-500 fill-orange-500" />
                                IMPUESTOS ({restaurant?.tax_percentage}%)
                            </p>
                            <p className="text-sm font-black text-slate-300 font-mono">+{formatPrice(tax)}</p>
                        </div>
                        {restaurant?.apply_service_charge && (
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">CARGO POR SERVICIO ({restaurant?.service_charge_percentage}%)</p>
                                <p className="text-sm font-black text-slate-300 font-mono">+{formatPrice(serviceCharge)}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 shadow-inner">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic mb-1">TOTAL A COBRAR</p>
                                <p className="text-5xl font-black italic text-white tracking-tighter drop-shadow-xl">
                                    {formatPrice(total)}
                                </p>
                            </div>
                            <div className="pb-1">
                                <ShoppingBag className="w-10 h-10 text-white/10" />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onMarchar}
                        disabled={submitting || cart.length === 0}
                        className="w-full h-20 bg-orange-600 text-white font-black uppercase rounded-[2rem] shadow-2xl shadow-orange-600/30 border-b-8 border-orange-800 transition-all active:border-b-0 active:translate-y-1 hover:bg-orange-500 group relative overflow-hidden"
                    >
                        {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
                            <div className="flex items-center justify-center gap-4 relative z-10">
                                <ChefHat className="w-7 h-7 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                                <span className="text-lg italic tracking-tighter">ENVIAR A COCINA</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
