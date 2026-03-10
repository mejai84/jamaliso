"use client"

import { LayoutGrid, Zap, Search, Plus, X, ShoppingBag, Star, ChefHat, Loader2, ArrowRight, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { Product, Category, CartItem, Table } from "@/app/admin/waiter/types"
import { useState } from "react"
import { NotesSelectorModal } from "@/components/shared/NotesSelectorModal"

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
    orderNotes: string
    onUpdateOrderNotes: (notes: string) => void
    onAddToCart: (product: Product) => void
    onRemoveFromCart: (index: number) => void
    onUpdateCartQty: (index: number, delta: number) => void
    onUpdateItemNote: (index: number, note: string) => void
    onTogglePriority: () => void
    onMarchar: () => void
    setActiveCategory: (id: string) => void
    setSearchTerm: (term: string) => void
}


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
    setSearchTerm,
    orderNotes,
    onUpdateOrderNotes
}: OrderInterfaceProps) {
    const [noteModal, setNoteModal] = useState<{ isOpen: boolean, activeIndex: number | null, isGlobal?: boolean }>({
        isOpen: false,
        activeIndex: null,
        isGlobal: false
    })

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
        <div className="h-full flex overflow-hidden bg-slate-50/30">
            {/* CATEGORY SIDEBAR */}
            <div className="w-24 md:w-32 bg-white border-r-2 border-slate-50 flex flex-col py-8 overflow-y-auto shrink-0 shadow-sm relative z-20 custom-scrollbar">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={cn("flex flex-col items-center gap-3 p-5 border-l-4 transition-all mb-4", activeCategory === 'all' ? "border-orange-600 bg-orange-50/30 text-slate-900" : "border-transparent text-slate-300 hover:text-slate-600")}
                >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm", activeCategory === 'all' ? "bg-slate-900 text-white" : "bg-slate-50 border border-slate-100")}>
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase italic tracking-widest leading-none">Menú</span>
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn("flex flex-col items-center gap-3 p-5 border-l-4 transition-all", activeCategory === cat.id ? "border-orange-600 bg-orange-50/30 text-slate-900" : "border-transparent text-slate-300 hover:text-slate-600")}
                    >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm", activeCategory === cat.id ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 border border-slate-100")}>
                            <ChefHat className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-center italic leading-tight tracking-wider">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* PRODUCT LIST */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                <div className="p-6 md:p-8 border-b-2 border-slate-50 bg-white/40 backdrop-blur-xl space-y-6 shadow-sm">
                    {/* ⚡ QUICK-ADD FAVORITES */}
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-2 shrink-0 px-5 py-2.5 bg-white border-2 border-slate-50 text-slate-300 rounded-xl text-[9px] font-black italic uppercase shadow-sm">
                            <Zap className="w-3.5 h-3.5 text-orange-400" /> TOP VENTAS
                        </div>
                        {products.slice(0, 5).map(prod => (
                            <button
                                key={prod.id}
                                onClick={() => onAddToCart(prod)}
                                className="shrink-0 px-6 py-2.5 bg-white border-2 border-slate-50 rounded-xl text-[10px] font-black italic text-slate-900 hover:border-orange-500/20 hover:bg-orange-50/30 transition-all shadow-sm active:scale-95 group"
                            >
                                <Plus className="w-3 h-3 inline-block mr-1 text-slate-300 group-hover:text-orange-600 transition-colors" />
                                {prod.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            placeholder="Buscar en el catálogo digital..."
                            className="w-full bg-white border-2 border-slate-50 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-black italic text-slate-900 shadow-sm focus:border-orange-500/20 focus:outline-none transition-all placeholder:text-slate-200"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 custom-scrollbar">
                    {filteredProducts.map(prod => {
                        const isOutOfStock = prod.use_inventory && (prod.stock_quantity || 0) <= 0;
                        return (
                            <div
                                key={prod.id}
                                onClick={() => !isOutOfStock && onAddToCart(prod)}
                                className={cn(
                                    "bg-white border-2 rounded-[3rem] p-6 active:scale-95 transition-all shadow-sm flex flex-col h-56 justify-between relative group overflow-hidden",
                                    isOutOfStock ? "opacity-40 grayscale cursor-not-allowed border-slate-50" : "cursor-pointer border-slate-50 hover:border-orange-500/20 hover:shadow-2xl hover:-translate-y-1 hover:bg-orange-50/10"
                                )}
                            >
                                <div className="absolute -top-4 -right-4 p-8 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-125 transition-all pointer-events-none">
                                    <ChefHat className="w-32 h-32 text-slate-900" />
                                </div>

                                {prod.use_inventory && !isOutOfStock && (
                                    <div className="absolute top-6 right-6 px-3 py-1 bg-slate-50 rounded-lg text-[8px] font-black text-slate-300 transition-colors border border-slate-100 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
                                        STK: {prod.stock_quantity}
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                                        <div className="bg-rose-500 text-white text-[9px] font-black px-5 py-2 rounded-full rotate-[-10deg] shadow-2xl uppercase tracking-widest border-2 border-white">AGOTADO</div>
                                    </div>
                                )}
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-200 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all shadow-sm">
                                    <Plus className="w-7 h-7" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <p className="text-[11px] font-black uppercase line-clamp-2 text-slate-900 leading-tight italic tracking-tighter">{prod.name}</p>
                                    <p className="text-2xl font-black italic text-slate-900 leading-none group-hover:text-orange-600 transition-colors">{formatPrice(prod.price)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CART SIDEBAR */}
            <div className="w-96 bg-white border-l-2 border-slate-50 flex flex-col shrink-0 hidden lg:flex shadow-2xl relative z-30">
                <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                            <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">{table?.table_name}</h2>
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Consola de Pedido</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-inner">
                        <ShoppingBag className="w-7 h-7 text-slate-300" />
                    </div>
                </div>

                {/* 📝 GLOBAL ORDER NOTES */}
                <div className="px-8 py-4 border-b-2 border-slate-50">
                    <button
                        onClick={() => setNoteModal({ isOpen: true, activeIndex: null, isGlobal: true })}
                        className={cn(
                            "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all group/global",
                            orderNotes
                                ? "bg-amber-50 border-amber-200 text-amber-900"
                                : "bg-white border-slate-50 text-slate-400 hover:border-orange-500/20"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <ClipboardList className={cn("w-5 h-5", orderNotes ? "text-amber-500" : "text-slate-200")} />
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-tighter italic">Notas de Comanda</p>
                                <p className="text-[10px] font-black italic max-w-[180px] truncate">
                                    {orderNotes || "Sin instrucciones globales"}
                                </p>
                            </div>
                        </div>
                        <Plus className="w-4 h-4 opacity-30 group-hover/global:opacity-100" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
                    {cart.map((item, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-50 shadow-sm hover:border-orange-500/10 transition-all group/item">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center rounded-2xl font-black text-sm italic shadow-xl group-hover/item:bg-orange-600 transition-colors">{item.qty}x</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 uppercase truncate italic leading-tight tracking-tighter">{item.product.name}</p>
                                    <p className="text-sm font-black text-orange-600 italic mt-0.5">{formatPrice(item.product.price * item.qty)}</p>
                                </div>
                                <button onClick={() => onRemoveFromCart(i)} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 flex items-center justify-center transition-all group/del">
                                    <X className="w-5 h-5 text-slate-200 group-hover/del:text-rose-500" />
                                </button>
                            </div>

                            {/* 📝 NEW NOTE SELECTOR BUTTON */}
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setNoteModal({ isOpen: true, activeIndex: i })}
                                    className={cn(
                                        "flex-1 h-16 rounded-2xl border-2 flex items-center justify-center gap-4 transition-all px-6 group/btn",
                                        item.notes
                                            ? "bg-slate-900 border-slate-900 text-white"
                                            : "bg-slate-50 border-slate-100 text-slate-400 hover:border-orange-500/20 hover:text-slate-900"
                                    )}
                                >
                                    <ClipboardList className={cn("w-5 h-5", item.notes ? "text-orange-400" : "text-slate-200 group-hover/btn:text-orange-500")} />
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-[10px] font-black uppercase tracking-tighter truncate italic">
                                            {item.notes || "Instrucciones de Cocina"}
                                        </p>
                                        <p className="text-[8px] font-black opacity-40 uppercase tracking-widest leading-none mt-0.5">
                                            {item.notes ? "Modificar" : "Personalizar Plato"}
                                        </p>
                                    </div>
                                </button>

                                <div className="flex bg-slate-100/50 rounded-2xl p-1 border-2 border-slate-50">
                                    <button onClick={() => onUpdateCartQty(i, -1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm font-black text-slate-400 hover:bg-rose-500 hover:text-white transition-all">-</button>
                                    <div className="w-10 h-10 flex items-center justify-center font-black text-xs text-slate-900">{item.qty}</div>
                                    <button onClick={() => onUpdateCartQty(i, 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm font-black text-slate-400 hover:bg-emerald-500 hover:text-white transition-all">+</button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <NotesSelectorModal
                        isOpen={noteModal.isOpen}
                        onClose={() => setNoteModal({ isOpen: false, activeIndex: null, isGlobal: false })}
                        initialNotes={noteModal.isGlobal ? orderNotes : (noteModal.activeIndex !== null ? cart[noteModal.activeIndex]?.notes || "" : "")}
                        onSave={(notes) => {
                            if (noteModal.isGlobal) {
                                onUpdateOrderNotes(notes)
                            } else if (noteModal.activeIndex !== null) {
                                onUpdateItemNote(noteModal.activeIndex, notes)
                            }
                        }}
                        title={noteModal.isGlobal ? "Notas Globales de Comanda" : (noteModal.activeIndex !== null ? cart[noteModal.activeIndex]?.product.name : "Observaciones")}
                    />
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 bg-white rounded-[2rem] border-4 border-slate-50 shadow-2xl flex items-center justify-center mb-6 opacity-40">
                                <ShoppingBag className="w-12 h-12 text-slate-200" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-200 italic">Consola Vacía</p>
                        </div>
                    )}
                </div>

                <div className="p-8 border-y-2 border-slate-50 bg-white">
                    <button
                        onClick={onTogglePriority}
                        className={cn(
                            "w-full p-5 rounded-[2rem] border-4 transition-all flex items-center justify-between group overflow-hidden relative",
                            isPriority
                                ? "bg-orange-50 border-orange-100 shadow-xl"
                                : "bg-white border-slate-50 hover:border-orange-500/10"
                        )}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                isPriority ? "bg-orange-600 text-white animate-pulse" : "bg-slate-50 text-slate-300 group-hover:bg-orange-100 group-hover:text-orange-500"
                            )}>
                                <Star className={cn("w-6 h-6", isPriority && "fill-white")} />
                            </div>
                            <div className="text-left">
                                <p className={cn("text-[9px] font-black uppercase tracking-widest italic", isPriority ? "text-orange-400" : "text-slate-300 group-hover:text-orange-600")}>Prioridad Chef</p>
                                <p className={cn("text-base font-black italic uppercase leading-none mt-0.5", isPriority ? "text-orange-900" : "text-slate-900")}>Marchar VIP</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-12 h-6 rounded-full relative transition-all border-2 z-10",
                            isPriority ? "bg-orange-600 border-orange-600" : "bg-slate-100 border-slate-200"
                        )}>
                            <div className={cn(
                                "absolute top-0.5 w-4 h-4 rounded-full transition-all shadow-md",
                                isPriority ? "left-6 bg-white" : "left-0.5 bg-white"
                            )} />
                        </div>
                    </button>
                </div>

                <div className="p-8 bg-white space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">SUBTOTAL NOMINAL</p>
                            <p className="text-lg font-black text-slate-900 italic tracking-tighter">{formatPrice(cartSubtotal)}</p>
                        </div>
                        <div className="flex justify-between items-center group">
                            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic flex items-center gap-2">
                                <Zap className="w-3 h-3 text-orange-400" />
                                TASAS FISCALES
                            </p>
                            <p className="text-lg font-black text-slate-400 italic tracking-tighter">+{formatPrice(tax)}</p>
                        </div>
                        {restaurant?.apply_service_charge && (
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic">SERVICIO SUGERIDO</p>
                                <p className="text-lg font-black text-slate-400 italic tracking-tighter">+{formatPrice(serviceCharge)}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-baseline pt-4 border-t-2 border-slate-50">
                            <div>
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] italic mb-1">Total Comanda</p>
                                <p className="text-6xl font-black italic text-slate-900 tracking-tighter leading-none">
                                    {formatPrice(total)}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={onMarchar}
                            disabled={submitting || cart.length === 0}
                            className="w-full h-24 bg-slate-900 text-white font-black uppercase rounded-[2.5rem] shadow-[0_25px_50px_-15px_rgba(0,0,0,0.3)] hover:bg-orange-600 transition-all active:scale-[0.98] group relative overflow-hidden border-none"
                        >
                            {submitting ? <Loader2 className="w-10 h-10 animate-spin mx-auto opacity-50" /> : (
                                <div className="flex items-center justify-center gap-6 relative z-10 px-8">
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[10px] font-black text-orange-400 tracking-widest italic mb-1">PROTOCOLO</span>
                                        <span className="text-2xl font-black italic tracking-tighter">MARCHAR PEDIDO</span>
                                    </div>
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-all duration-500" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
