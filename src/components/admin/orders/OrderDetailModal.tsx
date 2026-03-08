"use client"

import { X, Cpu, Layers, Signal, Star, Heart, CheckCircle2, ChefHat, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Order } from "@/app/admin/orders/types"

interface OrderDetailModalProps {
    order: Order | null
    onClose: () => void
    isSplitting: boolean
    setIsSplitting: (val: boolean) => void
    selectedItemsForSplit: { itemId: string, quantity: number }[]
    setSelectedItemsForSplit: React.Dispatch<React.SetStateAction<{ itemId: string, quantity: number }[]>>
    restaurant: any
    includeTip: boolean
    setIncludeTip: (val: boolean) => void
    onUpdateStatus: (id: string, status: string) => void
    onHandlePayment: (method: string, order: Order) => void
    onVoidItem: (itemId: string) => void
    onVoidOrder: (orderId: string) => void
}

export function OrderDetailModal({
    order,
    onClose,
    isSplitting,
    setIsSplitting,
    selectedItemsForSplit,
    setSelectedItemsForSplit,
    restaurant,
    includeTip,
    setIncludeTip,
    onUpdateStatus,
    onHandlePayment,
    onVoidItem,
    onVoidOrder
}: OrderDetailModalProps) {
    if (!order) return null

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card border-4 border-primary/20 rounded-[5rem] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-5xl animate-in zoom-in-95 duration-500 overflow-hidden relative">
                <div className={cn(
                    "p-16 border-b-4 flex justify-between items-start transition-colors relative overflow-hidden group/head",
                    order.status === 'payment_pending' ? 'bg-primary/10 border-primary/20' : 'bg-muted/20 border-border/40'
                )}>
                    <div className="relative z-10 space-y-4">
                        <p className="text-[11px] font-black uppercase text-primary/40 tracking-[0.5em] italic flex items-center gap-3">
                            <Cpu className="w-4 h-4" /> NODE_ORDER_{order.id.split('-')[0].toUpperCase()}
                        </p>
                        <h2 className="text-7xl font-black italic uppercase tracking-tighter text-foreground leading-none">{order.tables?.table_name || 'MOSTRADOR_HUB'}</h2>
                        <div className="flex gap-4">
                            <div className="px-5 py-2 bg-foreground text-background rounded-full text-[10px] font-black uppercase italic tracking-widest">{order.status}</div>
                            <div className="px-5 py-2 bg-muted/40 border-2 border-border text-muted-foreground rounded-full text-[10px] font-black uppercase italic tracking-widest">{order.order_type}</div>
                        </div>
                    </div>
                    <Button variant="ghost" className="h-20 w-20 rounded-[2.5rem] bg-card border-4 border-border/40 hover:bg-primary hover:border-primary/40 hover:text-white transition-all active:scale-90 relative z-10" onClick={onClose}>
                        <X className="w-10 h-10" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-16 space-y-16 custom-scrollbar relative z-10">
                    <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                                    <Layers className="w-4 h-4" /> REGLAS_COMANDA
                                </h3>
                                {!['delivered', 'cancelled'].includes(order.status) && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => { setIsSplitting(!isSplitting); setSelectedItemsForSplit([]); }}
                                        className={cn(
                                            "px-6 h-10 rounded-full font-black uppercase text-[9px] tracking-widest italic border-2 transition-all",
                                            isSplitting ? "bg-rose-500 text-white border-rose-500" : "bg-muted/40 text-muted-foreground border-border/40"
                                        )}
                                    >
                                        {isSplitting ? "CANCELAR" : "DIVIDIR CUENTA"}
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-4">
                                {order.order_items?.map((item: any, i: number) => {
                                    const isSelected = selectedItemsForSplit.find(si => si.itemId === item.id)
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                if (!isSplitting) return
                                                isSelected
                                                    ? setSelectedItemsForSplit(p => p.filter(si => si.itemId !== item.id))
                                                    : setSelectedItemsForSplit(p => [...p, { itemId: item.id, quantity: item.quantity }])
                                            }}
                                            className={cn(
                                                "group/item flex items-center justify-between p-6 rounded-[2.5rem] border-4 transition-all relative overflow-hidden",
                                                isSplitting ? "cursor-pointer" : "",
                                                isSelected ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" : "bg-muted/20 border-border/40 hover:border-primary/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-2xl border-2 transition-all shadow-xl",
                                                    isSelected ? "bg-primary text-black border-primary scale-110" : "bg-card border-border text-primary"
                                                )}>
                                                    {item.quantity}
                                                </div>
                                                <span className="font-black italic uppercase text-lg text-foreground group-hover/item:text-primary transition-colors">{item.products?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="font-black italic text-muted-foreground/60 text-xl">${(item.unit_price * item.quantity).toLocaleString()}</span>
                                                {!['delivered', 'cancelled', 'payment_pending'].includes(order.status) && (
                                                    <Button
                                                        variant="ghost"
                                                        className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 border-2 border-rose-100 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover/item:opacity-100"
                                                        onClick={(e) => { e.stopPropagation(); onVoidItem(item.id); }}
                                                    >
                                                        <ShieldAlert className="w-6 h-6" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="bg-muted/30 border-4 border-border/40 p-12 rounded-[4rem] space-y-10 shadow-inner">
                                <div className="space-y-3">
                                    <h3 className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] italic flex items-center gap-3"> <Signal className="w-4 h-4 text-primary" /> TITULAR_NODAL</h3>
                                    <p className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">{order.guest_info?.name}</p>
                                    <p className="text-sm font-black text-muted-foreground/40 italic">{order.guest_info?.phone || 'ANÓNIMO_SYNC'}</p>
                                </div>

                                <div className="pt-10 border-t-4 border-border/40 space-y-6">
                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic">LOYALTY_MATRIX</p>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10 animate-pulse">
                                            <Star className="w-8 h-8 fill-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black italic uppercase tracking-tighter text-foreground">PROYECCIÓN: +{Math.floor(order.total / 1000)} PTS</p>
                                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Socio de Alta Franja</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 border-t-4 border-border/40 space-y-16">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="space-y-4 w-full md:w-auto">
                                <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] italic flex items-center gap-3"> <Signal className="w-4 h-4 text-primary" /> FACTURACIÓN</p>
                                <div className="space-y-2">
                                    <p className="text-4xl font-black italic tracking-tighter text-muted-foreground/30 leading-none">NETO: ${order.total.toLocaleString()}</p>
                                    <p className="text-7xl font-black italic tracking-tighter text-foreground leading-none animate-in slide-in-from-left-4 transition-all">
                                        TOTAL: ${(order.total + (includeTip && restaurant?.apply_service_charge ? (order.total * (restaurant.service_charge_percentage! / 100)) : 0)).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {restaurant?.apply_service_charge && (
                                <div className="bg-primary/5 border-4 border-primary/20 p-8 rounded-[3rem] w-full md:w-[450px] space-y-6 shadow-2xl">
                                    <div className="flex items-center gap-4">
                                        <Heart className="w-8 h-8 text-primary fill-primary/20" />
                                        <p className="text-[11px] font-black uppercase text-foreground tracking-[0.3em] italic leading-tight">MÓDULO DE PROPINA SUGERIDA ({restaurant.service_charge_percentage}%)</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setIncludeTip(true)} className={cn("flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-4", includeTip ? "bg-primary text-black border-primary shadow-xl" : "bg-card border-border/40 text-muted-foreground")}>SÍ_INCLUIR</button>
                                        <button onClick={() => setIncludeTip(false)} className={cn("flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-4", !includeTip ? "bg-foreground text-background border-foreground shadow-xl" : "bg-card border-border/40 text-muted-foreground")}>NO_EXCLUIR</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-6 pb-8">
                            {['ready', 'payment_pending', 'out_for_delivery'].includes(order.status) && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                                    <PaymentButton label="EFECTIVO" icon="💵" color="bg-emerald-500" onClick={() => onHandlePayment('cash', order)} />
                                    <PaymentButton label="TARJETA" icon="💳" color="bg-indigo-500" onClick={() => onHandlePayment('card', order)} />
                                    <PaymentButton label="TRANSF." icon="🏦" color="bg-cyan-500" onClick={() => onHandlePayment('transfer', order)} />
                                    <PaymentButton label="CRÉDITO" icon="📋" color="bg-amber-500" onClick={() => onHandlePayment('credit', order)} />
                                </div>
                            )}
                            {order.status === 'pending' && (
                                <ActionBtn
                                    label="MARCHAR PREPARANDO"
                                    icon={<ChefHat className="w-8 h-8" />}
                                    color="bg-foreground"
                                    onClick={() => onUpdateStatus(order.id, 'preparing')}
                                />
                            )}
                            {order.status === 'preparing' && (
                                <ActionBtn
                                    label="MARCAR FINALIZADO"
                                    icon={<CheckCircle2 className="w-8 h-8" />}
                                    color="bg-purple-600"
                                    onClick={() => onUpdateStatus(order.id, 'ready')}
                                />
                            )}
                            {['pending', 'preparing', 'ready'].includes(order.status) && (
                                <ActionBtn
                                    label="ANULAR_ORDEN"
                                    icon={<ShieldAlert className="w-8 h-8" />}
                                    color="bg-rose-500"
                                    onClick={() => onVoidOrder(order.id)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PaymentButton({ label, icon, color, onClick }: any) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "h-24 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 font-black italic uppercase text-[11px] tracking-[0.3em] transition-all shadow-3xl hover:scale-105 active:scale-95 border-none text-white",
                color
            )}
        >
            <span className="text-3xl">{icon}</span>
            {label}
        </Button>
    )
}

function ActionBtn({ label, icon, color, onClick }: any) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "h-24 px-12 rounded-[3rem] font-black italic uppercase text-xl tracking-tighter transition-all shadow-5xl hover:scale-105 active:scale-95 border-none gap-6 text-white",
                color
            )}
        >
            {label} {icon}
        </Button>
    )
}
