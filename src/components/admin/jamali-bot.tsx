"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
    Send,
    X,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    Users,
    DollarSign,
    Loader2,
    Minus,
    Zap,
    Wallet,
    GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Message {
    role: 'user' | 'assistant'
    content: string
    type?: 'stat' | 'alert' | 'info' | 'text'
    data?: any
}

// JAMALI Logo Component
function JamaliLogo({ size = 32, className = "", src }: { size?: number; className?: string; src?: string }) {
    const [imgSrc, setImgSrc] = useState<string | null>(src || "/images/jamali-logo.png")
    const [retryCount, setRetryCount] = useState(0)

    const fallbacks = ["/images/jamali-logo.png", "/images/jamali-os-logo.png", "/images/jamali-os-transparent.png"]

    const handleError = () => {
        if (retryCount < fallbacks.length) {
            setImgSrc(fallbacks[retryCount])
            setRetryCount(retryCount + 1)
        } else {
            setImgSrc(null)
        }
    }

    if (imgSrc) {
        return (
            <img
                src={imgSrc}
                alt="JAMALI OS"
                style={{ width: size, height: size }}
                className={cn("object-contain transition-all duration-500", className)}
                onError={handleError}
            />
        )
    }

    return (
        <div
            style={{ width: size, height: size }}
            className={cn("relative flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden shadow-xl", className)}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-transparent to-slate-900" />
            <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 48 48" fill="none" className="relative z-10">
                <path d="M24 8V12M24 36V40M8 24H12M36 24H40M35.3 12.7L32.5 15.5M15.5 32.5L12.7 35.3M35.3 35.3L32.5 32.5M15.5 15.5L12.7 12.7" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
                <circle cx="24" cy="24" r="6" fill="#fbbf24" />
                <path d="M24 14C18.5 14 14 18.5 14 24C14 29.5 18.5 34 24 34C29.5 34 34 29.5 34 24" stroke="#fbbf24" strokeWidth="2" strokeDasharray="2 4" />
            </svg>
        </div>
    )
}

export function JamaliBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "¡Hola! Soy Jamali AI, tu analista inteligente. Pregúntame sobre ventas, stock o rendimiento de hoy.",
            type: 'text'
        }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const [logoUrl, setLogoUrl] = useState("")

    // --- DRAG STATE ---
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDraggingBtn, setIsDraggingBtn] = useState(false)
    const [isDraggingPanel, setIsDraggingPanel] = useState(false)
    const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const startPosRef = useRef({ x: 0, y: 0 })
    const dragStartClient = useRef({ x: 0, y: 0 })

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('settings').select('value').eq('key', 'business_info').single()
            if (data?.value?.logo_url) setLogoUrl(data.value.logo_url)
        }
        fetchSettings()
    }, [])

    // --- BUTTON DRAG ---
    useEffect(() => {
        if (!isDraggingBtn) return
        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStartClient.current.x
            const dy = e.clientY - dragStartClient.current.y
            dragStartClient.current = { x: e.clientX, y: e.clientY }
            setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        }
        const handleMouseUp = () => setIsDraggingBtn(false)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDraggingBtn])

    // --- PANEL DRAG ---
    useEffect(() => {
        if (!isDraggingPanel) return
        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStartClient.current.x
            const dy = e.clientY - dragStartClient.current.y
            dragStartClient.current = { x: e.clientX, y: e.clientY }
            setPanelOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        }
        const handleMouseUp = () => setIsDraggingPanel(false)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDraggingPanel])

    const handleBtnMouseDown = (e: React.MouseEvent) => {
        if (isOpen) return
        e.preventDefault()
        setIsDraggingBtn(true)
        dragStartClient.current = { x: e.clientX, y: e.clientY }
        startPosRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleBtnClick = (e: React.MouseEvent) => {
        const dist = Math.hypot(
            e.clientX - startPosRef.current.x,
            e.clientY - startPosRef.current.y
        )
        if (dist < 5) {
            setIsOpen(!isOpen)
            setIsMinimized(false)
        }
    }

    const handlePanelDragStart = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDraggingPanel(true)
        dragStartClient.current = { x: e.clientX, y: e.clientY }
    }

    const processQuery = async (query: string) => {
        setLoading(true)
        const q = query.toLowerCase()
        let response: Message = {
            role: 'assistant',
            content: "Aún estoy aprendiendo ese dato. Prueba: 'ventas hoy', 'top productos', 'alertas stock', 'ticket promedio', 'mesero estrella', 'predicción' o 'balance semana'.",
            type: 'text'
        }

        try {
            if (q.includes('venta') || q.includes('hoy') || q.includes('dinero')) {
                const today = new Date(); today.setHours(0, 0, 0, 0)
                const { data } = await supabase.from('orders').select('total').gte('created_at', today.toISOString())
                const total = data?.reduce((acc, o) => acc + (o.total || 0), 0) || 0
                response = { role: 'assistant', content: `Hoy: ${data?.length || 0} pedidos · Total ${formatPrice(total)}.`, type: 'stat', data: { icon: DollarSign, label: 'Ventas de hoy', value: formatPrice(total) } }
            }
            else if (q.includes('predic') || q.includes('futuro') || q.includes('proyeccion')) {
                const d = new Date(); d.setDate(d.getDate() - 7)
                const { data } = await supabase.from('orders').select('total').gte('created_at', d.toISOString())
                const avg = (data?.reduce((acc, o) => acc + (o.total || 0), 0) || 0) / 7
                response = { role: 'assistant', content: `Proyección para mañana: ~${formatPrice(avg * 1.1)} (basada en promedio diario de 7 días + 10% tendencia).`, type: 'stat', data: { icon: Sparkles, label: 'Predicción Mañana', value: formatPrice(avg * 1.1) } }
            }
            else if (q.includes('producto') || q.includes('vende') || q.includes('top') || q.includes('mejor')) {
                const { data } = await supabase.from('order_items').select('quantity, products(name)').limit(200)
                const counts: any = {}
                data?.forEach((item: any) => { const name = item.products?.name || 'Varios'; counts[name] = (counts[name] || 0) + item.quantity })
                const top = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0]
                response = { role: 'assistant', content: `Estrella: "${top[0]}" con ${top[1]} unidades.`, type: 'stat', data: { icon: TrendingUp, label: 'Producto Estrella', value: String(top[0]) } }
            }
            else if (q.includes('mesero') || q.includes('camarero') || q.includes('staff')) {
                const { data } = await supabase.from('orders').select('waiter_id, profiles(full_name)').limit(100)
                const counts: any = {}
                data?.forEach((o: any) => { const name = o.profiles?.full_name || 'N/A'; counts[name] = (counts[name] || 0) + 1 })
                const top = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0]
                response = { role: 'assistant', content: `MVP: ${top[0]} con ${top[1]} comandas.`, type: 'stat', data: { icon: Users, label: 'MVP del Día', value: String(top[0]) } }
            }
            else if (q.includes('ticket') || q.includes('promedio') || q.includes('gasto')) {
                const { data } = await supabase.from('orders').select('total')
                const avg = (data?.reduce((acc, o) => acc + (o.total || 0), 0) || 0) / (data?.length || 1)
                response = { role: 'assistant', content: `Ticket promedio: ${formatPrice(avg)}.`, type: 'stat', data: { icon: Wallet, label: 'Ticket Promedio', value: formatPrice(avg) } }
            }
            else if (q.includes('semana') || q.includes('7 dias') || q.includes('balance')) {
                const d = new Date(); d.setDate(d.getDate() - 7)
                const { data } = await supabase.from('orders').select('total').gte('created_at', d.toISOString())
                const total = data?.reduce((acc, o) => acc + (o.total || 0), 0) || 0
                response = { role: 'assistant', content: `Últimos 7 días: ${formatPrice(total)} en ${data?.length || 0} pedidos.`, type: 'stat', data: { icon: TrendingUp, label: 'Balance Semanal', value: formatPrice(total) } }
            }
            else if (q.includes('menos') || q.includes('peor') || q.includes('flop')) {
                const { data } = await supabase.from('order_items').select('quantity, products(name)').limit(500)
                const counts: any = {}
                data?.forEach((item: any) => { const name = item.products?.name; if (name) counts[name] = (counts[name] || 0) + item.quantity })
                const sorted = Object.entries(counts).sort((a: any, b: any) => a[1] - b[1])
                const flop = sorted[0]
                response = flop
                    ? { role: 'assistant', content: `El menos vendido es "${flop[0]}" con ${flop[1]} unidades. Considera una promo.`, type: 'text' }
                    : { role: 'assistant', content: "Aún no hay suficientes datos.", type: 'text' }
            }
            else if (q.includes('ayuda') || q.includes('que puedes') || q.includes('comando')) {
                response = { role: 'assistant', content: "📊 Comandos disponibles:\n• Ventas hoy / Balance semana\n• Top productos / Menos vendidos\n• Predicción de ventas\n• Alertas de stock\n• Ticket promedio\n• Mejor mesero", type: 'text' }
            }
            else if (q.includes('stock') || q.includes('inventario') || q.includes('falta')) {
                const { data } = await supabase.from('ingredients').select('name, current_stock, min_stock').lte('current_stock', 'min_stock')
                if (data && data.length > 0) {
                    response = { role: 'assistant', content: `⚠️ ${data.length} insumos en crítico: ${data.map(i => i.name).join(', ')}.`, type: 'alert', data: { items: data.map(i => ({ name: i.name, stock: i.current_stock })) } }
                } else {
                    response = { role: 'assistant', content: "✅ Inventario bajo control. Sin alertas críticas.", type: 'info' }
                }
            }
        } catch (e) {
            response = { role: 'assistant', content: "Error de conexión. Intenta de nuevo.", type: 'text' }
        }

        setMessages(prev => [...prev, response])
        setLoading(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return
        const userMsg: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        const currentInput = input
        setInput("")
        processQuery(currentInput)
    }

    return (
        <>
            {/* ── Floating Trigger Button ── */}
            <button
                ref={buttonRef}
                onMouseDown={handleBtnMouseDown}
                onClick={handleBtnClick}
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                className={cn(
                    "fixed bottom-10 right-10 w-16 h-16 rounded-[1.75rem] flex items-center justify-center shadow-2xl transition-all z-[100] group border-[3px] border-white select-none",
                    isOpen
                        ? "bg-slate-900 text-white border-slate-900 rotate-[15deg]"
                        : "bg-amber-400 text-slate-900 hover:scale-110 hover:bg-amber-300",
                    isDraggingBtn && "cursor-grabbing scale-105"
                )}
            >
                {isOpen
                    ? <X className="w-7 h-7" />
                    : <JamaliLogo size={32} src={logoUrl || "/images/jamali-os-logo.png"} className="bg-transparent" />
                }
                {!isOpen && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full border-2 border-white animate-bounce flex items-center justify-center shadow-sm">
                        <span className="text-[8px] font-black text-white">AI</span>
                    </div>
                )}
            </button>

            {/* ── AI Assistant Panel ── */}
            {isOpen && (
                <div
                    ref={panelRef}
                    style={{ transform: `translate(${panelOffset.x}px, ${panelOffset.y}px)` }}
                    className={cn(
                        "fixed bottom-0 right-0 sm:bottom-28 sm:right-10 w-full sm:w-[440px] bg-white border-t sm:border border-slate-100 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl z-[99] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-400",
                        isMinimized ? "h-auto" : "h-full sm:h-[640px] sm:max-h-[calc(100vh-160px)]"
                    )}
                >
                    {/* Header — arrastrable */}
                    <div
                        onMouseDown={handlePanelDragStart}
                        className={cn(
                            "p-6 bg-slate-900 flex items-center justify-between select-none",
                            "cursor-grab active:cursor-grabbing",
                            isMinimized ? "rounded-[3rem]" : "rounded-t-[3rem]"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                                {logoUrl
                                    ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-2xl" />
                                    : <JamaliLogo size={22} className="text-slate-900" />
                                }
                            </div>
                            <div>
                                <h3 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">
                                    JAMALI <span className="text-amber-400">AI</span>
                                </h3>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Insight Engine · Activo</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-slate-600 mr-1" />
                            <button
                                onMouseDown={e => e.stopPropagation()}
                                onClick={() => setIsMinimized(m => !m)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                                title={isMinimized ? "Expandir" : "Minimizar"}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onMouseDown={e => e.stopPropagation()}
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Body - solo visible cuando no está minimizado */}
                    {!isMinimized && (
                        <>
                            {/* Chat Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white custom-scrollbar">
                                {messages.map((msg, i) => (
                                    <div key={i} className={cn("flex flex-col max-w-[88%]", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                                        <div className={cn(
                                            "p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-slate-900 text-white rounded-tr-none"
                                                : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none"
                                        )}>
                                            {msg.content.split('\n').map((line, li) => <span key={li}>{line}<br /></span>)}
                                        </div>

                                        {msg.type === 'stat' && (
                                            <div className="mt-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl w-full animate-in zoom-in-95">
                                                <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">{msg.data.label}</p>
                                                <h4 className="text-xl font-black italic text-slate-900">{msg.data.value}</h4>
                                            </div>
                                        )}
                                        {msg.type === 'alert' && (
                                            <div className="mt-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl w-full animate-in zoom-in-95">
                                                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <AlertTriangle className="w-3 h-3" /> STOCK CRÍTICO
                                                </p>
                                                <div className="space-y-1.5">
                                                    {msg.data.items.slice(0, 4).map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-rose-100">
                                                            <span className="text-[10px] font-bold text-slate-700">{item.name}</span>
                                                            <span className="text-[10px] font-black text-rose-500">{item.stock}u</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {msg.type === 'info' && (
                                            <div className="mt-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl w-full text-[10px] font-bold text-emerald-700">
                                                ✅ {msg.content}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-1.5 p-3 bg-slate-50 rounded-2xl w-16 border border-slate-100">
                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSubmit} className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-[3rem]">
                                <div className="relative">
                                    <input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder="Escribe un comando analítico..."
                                        className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-5 pr-14 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-xs font-bold text-slate-900 transition-all placeholder:text-slate-300"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center hover:bg-amber-300 transition-all active:scale-90"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {['Ventas hoy', 'Top productos', 'Alertas stock', 'Ticket promedio', 'Predicción'].map(chip => (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => { setMessages(p => [...p, { role: 'user', content: chip }]); processQuery(chip) }}
                                            className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-amber-300 transition-all"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 10px; }
            `}</style>
        </>
    )
}
