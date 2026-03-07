"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, X, Receipt, Minus, Plus, List, Banknote, Smartphone, Loader2 } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { CartItem } from "@/app/admin/pos/types"

interface CartPanelProps {
    cart: CartItem[]
    onAdd: (product: any) => void
    onRemove: (productId: string) => void
    onClear: () => void
    showCartMobile: boolean
    setShowCartMobile: (val: boolean) => void
    isProcessing: boolean
    onCheckout: (method: string) => void
    subtotal: number
    taxAmount: number
    taxInfo: string
    total: number
}

export function CartPanel({
    cart,
    onAdd,
    onRemove,
    onClear,
    showCartMobile,
    setShowCartMobile,
    isProcessing,
    onCheckout,
    subtotal,
    taxAmount,
    taxInfo,
    total
}: CartPanelProps) {
    return (
        <div className={cn("w-full md:w-[350px] lg:w-[450px] bg-slate-950/80 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/10 flex flex-col shrink-0 font-sans text-white", !showCartMobile ? "hidden md:flex" : "flex flex-1")}>
            <div className="p-6 md:p-8 border-b border-white/5 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                    <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">RESUMEN <span className="text-slate-500">ORDEN</span></h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={onClear} className="h-8 px-2 text-[10px] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10">
                        LIMPIAR
                    </Button>
                    <Button variant="ghost" onClick={() => setShowCartMobile(false)} className="md:hidden h-8 w-8 p-0 rounded-lg bg-white/5">
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-3 md:space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                        <Receipt className="w-20 h-20 mb-4" />
                        <p className="text-sm font-black uppercase tracking-[0.2em] italic">Esperando Items...</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 text-black flex items-center justify-center rounded-lg md:rounded-xl font-black italic text-[10px] md:text-sm">
                                {item.qty}x
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs md:text-sm text-white truncate uppercase">{item.product.name}</p>
                                <p className="text-[10px] md:text-xs font-mono text-slate-500">{formatPrice(item.product.price)}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black italic text-sm">${(item.product.price * item.qty).toLocaleString()}</p>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => onRemove(item.product.id)} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all">
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => onAdd(item.product)} className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Checkout Footer */}
            <div className="p-6 md:p-8 bg-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10 shrink-0 text-white">
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                    <div className="flex justify-between text-slate-500 font-bold uppercase text-[8px] md:text-[10px] tracking-widest">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-bold uppercase text-[8px] md:text-[10px] tracking-widest">
                        <span>Impuestos ({taxInfo || 'IVA 0%'})</span>
                        <span>{formatPrice(taxAmount)}</span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex justify-between items-end">
                        <p className="text-[10px] md:text-xs font-black italic text-orange-500 uppercase tracking-widest">TOTAL A PAGAR</p>
                        <p className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg leading-none">
                            {formatPrice(total)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Button
                        onClick={() => alert("GESTIÓN DE CUENTA: Cargando módulo de división y unión de mesas...")}
                        variant="ghost"
                        className="w-full h-12 bg-white/5 border border-white/10 text-orange-400 font-black uppercase italic text-[10px] tracking-[0.3em] hover:bg-orange-500 hover:text-black transition-all rounded-2xl gap-3"
                        disabled={cart.length === 0}
                    >
                        <List className="w-4 h-4" /> Gestión de Cuenta (Split / Merge)
                    </Button>

                    <div className="flex gap-2 md:gap-3">
                        <Button
                            onClick={() => onCheckout('CASH')}
                            className="flex-1 h-16 md:h-20 bg-orange-600 hover:bg-orange-700 text-black font-black uppercase text-base md:text-lg italic tracking-[0.1em] md:tracking-[0.2em] rounded-2xl md:rounded-3xl shadow-2xl shadow-orange-600/30 group active:scale-95 transition-all"
                            disabled={cart.length === 0 || isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Banknote className="w-5 h-5 md:w-7 md:h-7 mr-2 md:mr-4 group-hover:scale-110 transition-transform" />
                                    PAGAR AHORA
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => onCheckout('DEBIT')}
                            variant="ghost" className="h-16 w-16 md:h-20 md:w-20 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl hover:bg-white/10"
                            disabled={cart.length === 0 || isProcessing}
                        >
                            <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(255, 255, 255, 0.05); 
                    border-radius: 10px; 
                }
            `}</style>
        </div>
    )
}
