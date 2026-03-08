"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag, X, Receipt, Minus, Plus, List, Banknote, Smartphone, Loader2, Settings2 } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { CartItem, getItemTotal, formatModifiers } from "@/app/admin/pos/types"

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
        <div className={cn("w-full md:w-[350px] lg:w-[480px] bg-white border-t md:border-t-0 md:border-l-2 border-slate-100 flex flex-col shrink-0 font-sans text-slate-900 shadow-2xl z-30", !showCartMobile ? "hidden md:flex" : "flex flex-1")}>
            <div className="p-6 md:p-8 border-b-2 border-slate-50 shrink-0 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/20">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">RESUMEN <span className="text-orange-600">ORDEN</span></h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={onClear} className="h-8 px-3 text-[10px] font-black tracking-widest text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all">
                        LIMPIAR
                    </Button>
                    <Button variant="ghost" onClick={() => setShowCartMobile(false)} className="md:hidden h-10 w-10 p-0 rounded-xl bg-slate-100">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-3 md:space-y-4 custom-scrollbar bg-white">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center scale-90">
                        <div className="p-8 bg-slate-100 rounded-[2.5rem] mb-6">
                            <Receipt className="w-20 h-20 text-slate-400" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.4em] italic text-slate-900">Esperando Selección...</p>
                    </div>
                ) : (
                    cart.map((item, idx) => {
                        const modText = formatModifiers(item.modifiers)
                        const itemTotal = getItemTotal(item)
                        return (
                            <div key={item.cartKey || item.product.id} className="flex items-center gap-4 bg-slate-50 border-2 border-white rounded-[1.8rem] p-4 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-slate-100 text-slate-900 flex items-center justify-center rounded-2xl font-black italic text-xs md:text-base shadow-sm group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                                    {item.qty}x
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-xs md:text-sm text-slate-900 truncate uppercase tracking-tight">{item.product.name}</p>
                                    {modText && (
                                        <p className="text-[9px] text-orange-600 font-bold mt-0.5 flex items-center gap-1 truncate">
                                            <Settings2 className="w-3 h-3 shrink-0" />
                                            {modText}
                                        </p>
                                    )}
                                    <p className="text-[10px] md:text-xs font-black italic text-slate-400 uppercase tracking-widest">{formatPrice(item.product.price)}{item.modifiers && item.modifiers.length > 0 ? ' + extras' : ''}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <p className="font-black text-sm md:text-lg text-slate-900 italic tracking-tighter leading-none">{formatPrice(itemTotal)}</p>
                                    <div className="flex gap-1.5 translate-y-1">
                                        <button onClick={() => onRemove(item.product.id)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => onAdd(item.product)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Checkout Footer */}
            <div className="p-6 md:p-10 bg-slate-950 shadow-[0_-30px_60px_rgba(0,0,0,0.1)] border-t border-slate-100 shrink-0 text-white rounded-t-[3rem]">
                <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                    <div className="flex justify-between text-slate-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest italic">
                        <span>Subtotal Neto</span>
                        <span className="text-white">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest italic">
                        <span>Servicio e Impuestos ({taxInfo || 'IVA 0%'})</span>
                        <span className="text-white">{formatPrice(taxAmount)}</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex justify-between items-end pt-2">
                        <div className="flex flex-col">
                            <span className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest italic">Total a Recaudar</p>
                            </span>
                            <p className="text-4xl md:text-6xl font-black italic tracking-tighter text-white leading-none drop-shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                                {formatPrice(total)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => alert("GESTIÓN DE CUENTA: Cargando módulo de división y unión de mesas...")}
                        className="w-full h-12 bg-white/5 border border-white/10 text-slate-400 font-black uppercase italic text-[10px] tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all rounded-2xl gap-3 flex items-center justify-center disabled:opacity-30"
                        disabled={cart.length === 0}
                    >
                        <List className="w-4 h-4" /> GESTIÓN DE CUENTA
                    </button>

                    <div className="grid grid-cols-1 gap-4">
                        <Button
                            onClick={() => onCheckout('ADVANCED')}
                            className="w-full h-20 md:h-24 bg-orange-600 hover:bg-orange-500 text-slate-950 font-black uppercase text-lg md:text-2xl italic tracking-tighter rounded-[1.8rem] md:rounded-[2.5rem] shadow-[0_10px_40px_rgba(234,88,12,0.3)] group active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
                            disabled={cart.length === 0 || isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <Banknote className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
                                        <span>PAGAR Y CERRAR</span>
                                    </div>
                                    <span className="text-[8px] md:text-[10px] opacity-60 tracking-[0.3em] mt-1">SISTEMA ANTI-FRICCIÓN ACTIVO</span>
                                </>
                            )}
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
