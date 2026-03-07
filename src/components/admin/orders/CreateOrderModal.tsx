"use client"

import { X, Search, ShoppingBag, Plus, Minus, Star, MapPin, Layers, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product } from "@/app/admin/orders/types"

interface CreateOrderModalProps {
    isOpen: boolean
    onClose: () => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    products: Product[]
    newOrderItems: (Product & { quantity: number })[]
    setNewOrderItems: React.Dispatch<React.SetStateAction<(Product & { quantity: number })[]>>
    customerSearch: string
    setCustomerSearch: (term: string) => void
    allCustomers: any[]
    selectedCustomerId: string | null
    setSelectedCustomerId: (id: string | null) => void
    customerName: string
    setCustomerName: (name: string) => void
    customerPhone: string
    setCustomerPhone: (phone: string) => void
    selectedTableId: string
    setSelectedTableId: (id: string) => void
    tables: any[]
    onSubmit: () => void
    onSelectCustomer: (customer: any) => void
}

export function CreateOrderModal({
    isOpen,
    onClose,
    searchTerm,
    setSearchTerm,
    products,
    newOrderItems,
    setNewOrderItems,
    customerSearch,
    setCustomerSearch,
    allCustomers,
    selectedCustomerId,
    setSelectedCustomerId,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    selectedTableId,
    setSelectedTableId,
    tables,
    onSubmit,
    onSelectCustomer
}: CreateOrderModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card border-4 border-primary/20 rounded-[5rem] w-full max-w-7xl h-[90vh] flex flex-col shadow-[0_0_150px_rgba(255,102,0,0.15)] relative overflow-hidden group/modal animate-in zoom-in-95 duration-500">
                <div className="p-12 border-b-4 border-border/40 flex justify-between items-center bg-muted/20 relative z-20">
                    <div className="space-y-3">
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">NUEVA <span className="text-primary">COMANDA_ENGINE</span></h2>
                        <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic pl-2 italic">TERMINAL TÁCTICA DE INGRESO RÁPIDO</p>
                    </div>
                    <Button variant="ghost" className="h-16 w-16 rounded-[1.5rem] bg-muted/40 hover:bg-primary hover:text-white transition-all active:scale-90" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* Products Selector Matrix */}
                    <div className="flex-1 p-12 overflow-y-auto custom-scrollbar space-y-10">
                        <div className="relative group/search">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="LOCALIZAR SKU POR NOMBRE O ESTRATEGIA..."
                                className="w-full h-24 pl-24 pr-10 rounded-[3rem] bg-muted/40 border-4 border-border/40 focus:border-primary/50 outline-none font-black text-xl italic tracking-[0.1em] uppercase transition-all text-foreground placeholder:text-muted-foreground/20 shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        const exist = newOrderItems.find(i => i.id === p.id)
                                        if (exist) setNewOrderItems(prev => prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
                                        else setNewOrderItems(prev => [...prev, { ...p, quantity: 1 }])
                                    }}
                                    className="group/btn bg-card/60 border-4 border-border/40 p-8 rounded-[3rem] text-left hover:border-primary/40 hover:bg-primary/5 transition-all relative overflow-hidden active:scale-95 shadow-lg"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover/btn:opacity-10 transition-opacity">
                                        <ShoppingBag className="w-16 h-16 text-primary" />
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-foreground group-hover/btn:text-primary transition-colors leading-tight">{p.name}</h4>
                                        <div className="flex justify-between items-end">
                                            <span className="text-3xl font-black italic text-primary">${p.price.toLocaleString()}</span>
                                            <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Console */}
                    <div className="w-[450px] bg-card/40 border-l-4 border-border/40 backdrop-blur-3xl flex flex-col">
                        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar space-y-12">
                            {/* Loyalty / Customer Field */}
                            <div className="space-y-6">
                                <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                                    <Star className="w-4 h-4 text-primary" /> FIDELIZACIÓN_CLIENTE
                                </label>
                                {!selectedCustomerId ? (
                                    <div className="space-y-4">
                                        <div className="relative group/field">
                                            <input
                                                value={customerSearch}
                                                onChange={e => setCustomerSearch(e.target.value)}
                                                placeholder="VINCULAR CLIENTE..."
                                                className="w-full h-16 bg-muted/40 border-4 border-border rounded-[2rem] px-8 outline-none text-foreground focus:border-primary font-black italic text-xs tracking-wider transition-all uppercase placeholder:text-muted-foreground/10"
                                            />
                                            {customerSearch && (
                                                <div className="absolute top-20 left-4 right-4 bg-card border-4 border-primary/20 rounded-[2.5rem] p-4 z-50 shadow-5xl animate-in fade-in slide-in-from-top-4">
                                                    {allCustomers.filter(c => c.full_name?.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch)).map(c => (
                                                        <button key={c.id} onClick={() => onSelectCustomer(c)} className="w-full p-6 text-left hover:bg-primary/5 rounded-[1.5rem] flex justify-between items-center transition-all group/res">
                                                            <div>
                                                                <p className="text-sm font-black italic uppercase text-foreground group-hover/res:text-primary transition-colors">{c.full_name}</p>
                                                                <p className="text-[10px] font-bold text-muted-foreground/40">{c.phone}</p>
                                                            </div>
                                                            <div className="bg-primary/10 px-4 py-1.5 rounded-full text-[10px] font-black text-primary italic">{c.loyalty_points} PTS</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full h-16 bg-muted/40 border-4 border-border rounded-[2rem] px-8 outline-none font-bold italic text-xs uppercase text-foreground focus:border-primary transition-all shadow-inner" placeholder="NOMBRE GUEST" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-primary p-8 rounded-[2.5rem] text-black relative overflow-hidden group/active">
                                        <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover/active:scale-110 transition-transform">
                                            <Star className="w-full h-full fill-black" />
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest italic opacity-60">Socio Vinculado</p>
                                            <button onClick={() => setSelectedCustomerId(null)} className="p-2 hover:bg-black/10 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
                                        </div>
                                        <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">{customerName}</p>
                                    </div>
                                )}
                            </div>

                            {/* Table Assignment */}
                            <div className="space-y-6">
                                <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-primary" /> NODO_MESA
                                </label>
                                <select
                                    value={selectedTableId}
                                    onChange={e => setSelectedTableId(e.target.value)}
                                    className="w-full h-20 bg-muted/40 border-4 border-border rounded-[2.5rem] px-8 outline-none font-black italic text-xs tracking-widest uppercase transition-all shadow-inner"
                                >
                                    <option value="">SERVICIO RÁPIDO / HUB</option>
                                    {tables.map(t => <option key={t.id} value={t.id}>{t.table_name.toUpperCase()} - {t.location.toUpperCase()}</option>)}
                                </select>
                            </div>

                            {/* Order Items List */}
                            <div className="space-y-6 flex-1">
                                <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                                    <Layers className="w-4 h-4 text-primary" /> CESTA_ACTIVA ({newOrderItems.length})
                                </label>
                                <div className="space-y-4">
                                    {newOrderItems.map(item => (
                                        <div key={item.id} className="group/item bg-muted/20 border-4 border-border/40 p-6 rounded-[2.5rem] flex justify-between items-center hover:border-primary/20 transition-all shadow-inner">
                                            <div className="flex-1 pr-4">
                                                <p className="text-sm font-black italic uppercase text-foreground leading-none mb-1 group-hover/item:text-primary transition-colors">{item.name}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground/40 italic">${item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-card rounded-2xl border-2 border-border p-2">
                                                <button onClick={() => item.quantity > 1 ? setNewOrderItems(p => p.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)) : setNewOrderItems(p => p.filter(i => i.id !== item.id))} className="w-10 h-10 flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-xl transition-all">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-black italic text-lg">{item.quantity}</span>
                                                <button onClick={() => setNewOrderItems(p => p.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} className="w-10 h-10 flex items-center justify-center hover:bg-primary hover:text-black rounded-xl transition-all">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Checkout Footer */}
                        <div className="p-10 bg-card border-t-4 border-border/40 space-y-8">
                            <div className="flex justify-between items-end">
                                <span className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic">TOTAL_ESTIMADO</span>
                                <span className="text-5xl font-black italic tracking-tighter text-primary animate-pulse">
                                    ${newOrderItems.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()}
                                </span>
                            </div>
                            <Button
                                onClick={onSubmit}
                                disabled={newOrderItems.length === 0}
                                className="w-full h-24 bg-foreground text-background hover:bg-primary hover:text-white rounded-[3rem] font-black text-2xl italic tracking-tighter uppercase shadow-5xl transition-all border-none gap-6 active:scale-95 group/check"
                            >
                                DESPACHAR COMANDA <ArrowRight className="w-8 h-8 group-hover/check:translate-x-3 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
