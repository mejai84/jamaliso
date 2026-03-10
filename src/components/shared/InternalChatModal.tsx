"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import {
    sendInternalMessage,
    getInternalMessages,
    markMessagesAsRead,
    type InternalMessage,
} from "@/actions/internal-chat"
import { AREA_LABELS, type AreaType } from "@/lib/constants/chat"
import {
    X,
    Send,
    MessageSquare,
    Megaphone,
    ChefHat,
    Banknote,
    Shield,
    Wine,
    Zap,
    Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ──────────────────────────────────────────────
// ÁREA ICONS
// ──────────────────────────────────────────────
const AREA_ICONS: Record<AreaType, React.ReactNode> = {
    waiter: <Zap className="w-4 h-4" />,
    kitchen: <ChefHat className="w-4 h-4" />,
    cashier: <Banknote className="w-4 h-4" />,
    admin: <Shield className="w-4 h-4" />,
    bar: <Wine className="w-4 h-4" />,
    all: <Megaphone className="w-4 h-4" />,
}

// ──────────────────────────────────────────────
// WEB AUDIO - Sonido de alerta sin archivos externos
// ──────────────────────────────────────────────
function playNotificationSound(type: 'receive' | 'send' | 'urgent' = 'receive') {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

        const configs = {
            receive: [
                { freq: 523.25, time: 0, dur: 0.12 },
                { freq: 659.25, time: 0.13, dur: 0.12 },
                { freq: 783.99, time: 0.26, dur: 0.18 },
            ],
            send: [
                { freq: 440, time: 0, dur: 0.08 },
                { freq: 550, time: 0.1, dur: 0.08 },
            ],
            urgent: [
                { freq: 880, time: 0, dur: 0.12 },
                { freq: 440, time: 0.14, dur: 0.12 },
                { freq: 880, time: 0.28, dur: 0.12 },
                { freq: 440, time: 0.42, dur: 0.18 },
            ],
        }

        configs[type].forEach(({ freq, time, dur }) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = freq
            osc.type = 'sine'
            gain.gain.setValueAtTime(0.35, ctx.currentTime + time)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur)
            osc.start(ctx.currentTime + time)
            osc.stop(ctx.currentTime + time + dur + 0.05)
        })
    } catch (e) {
        // Silently fail if Audio API is blocked
    }
}

// ──────────────────────────────────────────────
// PROPS
// ──────────────────────────────────────────────
interface InternalChatModalProps {
    isOpen: boolean
    onClose: () => void
    restaurantId: string
    myArea: AreaType
    myName: string
    unreadCount?: number
}

// ──────────────────────────────────────────────
// MENSAJE RAPIDO PRE-DEFINIDOS POR ÁREA DESTINATARIA
// ──────────────────────────────────────────────
const QUICK_MESSAGES: Partial<Record<AreaType, string[]>> = {
    kitchen: ["⚡ URGENTE a cocina", "🍽️ Mesa lista para servir", "🔁 Repetir bebidas", "❗ Alergia - revisar pedido", "🕐 Cliente espera mucho"],
    cashier: ["💳 Mesa pide la cuenta", "🔄 Cambio de método de pago", "🎁 Mesa pide descuento", "❓ Consultar precio especial"],
    waiter: ["✅ Pedido LISTO para entregar", "⏳ En preparación - 5 min más", "🚫 Producto agotado hoy", "🔔 Llamar a caja inmediatamente"],
    admin: ["⚠️ Incidente en sala", "🙋 Necesito autorización", "📦 Falta de insumos urgente"],
    all: ["🔔 REUNIÓN BREVE - todos a caja", "🚨 EMERGENCIA en sala", "☕ Descanso en 5 minutos"],
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────
export function InternalChatModal({
    isOpen,
    onClose,
    restaurantId,
    myArea,
    myName,
    unreadCount = 0,
}: InternalChatModalProps) {
    const [messages, setMessages] = useState<InternalMessage[]>([])
    const [newMsg, setNewMsg] = useState("")
    const [toArea, setToArea] = useState<AreaType>("all")
    const [msgType, setMsgType] = useState<"text" | "alert" | "urgent">("text")
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isMuted, setIsMuted] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const prevMsgCount = useRef(0)

    // ── Cargar mensajes
    const loadMessages = useCallback(async () => {
        if (!restaurantId) return
        const result = await getInternalMessages(restaurantId, myArea, 60)
        if (result.success && result.data) {
            setMessages(result.data)
        }
        setLoading(false)
    }, [restaurantId, myArea])

    // ── Suscripción Realtime
    useEffect(() => {
        if (!isOpen || !restaurantId) return

        loadMessages()
        markMessagesAsRead(restaurantId, myArea)

        const channel = supabase
            .channel(`internal-chat-${restaurantId}-${myArea}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'internal_messages',
                    filter: `restaurant_id=eq.${restaurantId}`,
                },
                (payload) => {
                    const msg = payload.new as InternalMessage
                    // Solo mostrar mensajes dirigidos a mí o broadcast
                    if (msg.to_area === myArea || msg.to_area === 'all' || msg.from_area === myArea) {
                        setMessages(prev => {
                            const exists = prev.find(m => m.id === msg.id)
                            if (exists) return prev
                            // Sonar alerta si es un mensaje entrante (no el mío)
                            if (msg.from_area !== myArea && !isMuted) {
                                const soundType = msg.message_type === 'urgent' ? 'urgent' : 'receive'
                                playNotificationSound(soundType)
                            }
                            return [...prev, msg]
                        })
                        // Marcar como leído si el modal está abierto
                        if (msg.from_area !== myArea) {
                            markMessagesAsRead(restaurantId, myArea)
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [isOpen, restaurantId, myArea, loadMessages, isMuted])

    // ── Scroll al fondo cuando hay mensajes nuevos
    useEffect(() => {
        if (messages.length > prevMsgCount.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            prevMsgCount.current = messages.length
        }
    }, [messages])

    // ── Foco en el input al abrir
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [isOpen])

    if (!isOpen) return null

    // ── Enviar mensaje
    const handleSend = async () => {
        if (!newMsg.trim() || sending) return
        setSending(true)
        try {
            const result = await sendInternalMessage({
                restaurantId,
                fromArea: myArea,
                fromName: myName,
                toArea,
                message: newMsg.trim(),
                messageType: msgType,
            })
            if (result.success) {
                setNewMsg("")
                if (!isMuted) playNotificationSound('send')
            } else {
                toast.error("Error al enviar: " + result.error)
            }
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // ── Relación de mensajes: agrupar por fecha
    const groupedMessages = messages.reduce<{ date: string; msgs: InternalMessage[] }[]>((acc, msg) => {
        const date = new Date(msg.created_at).toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long'
        })
        const group = acc.find(g => g.date === date)
        if (group) group.msgs.push(msg)
        else acc.push({ date, msgs: [msg] })
        return acc
    }, [])

    const quickMsgs = QUICK_MESSAGES[toArea] || QUICK_MESSAGES.all || []
    const myLabel = AREA_LABELS[myArea]
    const toLabel = AREA_LABELS[toArea]

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Panel principal */}
            <div className="relative w-full max-w-2xl h-[90vh] max-h-[650px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-300">

                {/* ── HEADER ── */}
                <div className="flex-shrink-0 bg-slate-900 text-white px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-inner"
                                style={{ backgroundColor: myLabel.color + '33', border: `2px solid ${myLabel.color}` }}
                            >
                                {AREA_ICONS[myArea]}
                            </div>
                            <div>
                                <h2 className="text-base font-black uppercase tracking-tighter leading-none">
                                    Chat <span style={{ color: myLabel.color }}>Interno</span>
                                </h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                    {myLabel.emoji} {myLabel.label} · Mensaje en tiempo real
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMuted(m => !m)}
                                className={cn(
                                    "p-2 rounded-xl transition-all text-xs font-black",
                                    isMuted ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-slate-300 hover:bg-white/20"
                                )}
                                title={isMuted ? "Activar sonido" : "Silenciar"}
                            >
                                <Bell className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Selector de área destino ── */}
                    <div className="flex gap-1.5 flex-wrap">
                        {(Object.keys(AREA_LABELS) as AreaType[])
                            .filter(area => area !== myArea)
                            .map(area => {
                                const info = AREA_LABELS[area]
                                const isSelected = toArea === area
                                return (
                                    <button
                                        key={area}
                                        onClick={() => setToArea(area)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                            isSelected
                                                ? "text-white border-transparent"
                                                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/15"
                                        )}
                                        style={isSelected ? { backgroundColor: info.color, borderColor: info.color } : {}}
                                    >
                                        {info.emoji} {info.label}
                                    </button>
                                )
                            })}
                    </div>
                </div>

                {/* ── MENSAJES ── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-slate-300">
                            <div className="text-center space-y-2">
                                <MessageSquare className="w-10 h-10 mx-auto animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Cargando chat...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-300">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto">
                                    <MessageSquare className="w-8 h-8 text-slate-200" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                    Empieza la conversación
                                </p>
                            </div>
                        </div>
                    ) : (
                        groupedMessages.map(group => (
                            <div key={group.date}>
                                {/* Separador de fecha */}
                                <div className="flex items-center gap-3 my-4">
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        {group.date}
                                    </span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>

                                <div className="space-y-2">
                                    {group.msgs.map(msg => {
                                        const isMe = msg.from_area === myArea
                                        const senderInfo = AREA_LABELS[msg.from_area]
                                        const time = new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                            hour: '2-digit', minute: '2-digit'
                                        })

                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex flex-col gap-1",
                                                    isMe ? "items-end" : "items-start"
                                                )}
                                            >
                                                {/* Sender label */}
                                                <div className={cn("flex items-center gap-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                                                    <div
                                                        className="w-5 h-5 rounded-lg flex items-center justify-center text-white"
                                                        style={{ backgroundColor: senderInfo.color }}
                                                    >
                                                        <span className="text-[8px]">{AREA_ICONS[msg.from_area]}</span>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-300">
                                                        {isMe ? 'Tú' : `${senderInfo.label} · ${msg.from_name.split('@')[0]}`}
                                                    </span>
                                                    <span className="text-[7px] text-slate-200">{time}</span>
                                                </div>

                                                {/* Burbuja del mensaje */}
                                                <div
                                                    className={cn(
                                                        "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed break-words shadow-sm",
                                                        isMe
                                                            ? "text-white rounded-tr-sm"
                                                            : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm",
                                                        msg.message_type === 'urgent' && !isMe && "ring-2 ring-rose-400 bg-rose-50 border-rose-100",
                                                        msg.message_type === 'alert' && !isMe && "ring-2 ring-amber-400 bg-amber-50 border-amber-100",
                                                    )}
                                                    style={isMe ? { backgroundColor: senderInfo.color } : {}}
                                                >
                                                    {msg.message_type === 'urgent' && (
                                                        <span className="block text-[8px] font-black uppercase tracking-widest mb-1 text-rose-600">
                                                            🚨 URGENTE
                                                        </span>
                                                    )}
                                                    {msg.message}
                                                    {msg.to_area === 'all' && (
                                                        <span className="block text-[7px] mt-1 opacity-60">
                                                            📢 Enviado a todos
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* ── MENSAJES RÁPIDOS ── */}
                {quickMsgs.length > 0 && (
                    <div className="flex-shrink-0 px-4 py-2 bg-white border-t border-slate-50 overflow-x-auto">
                        <div className="flex gap-2 w-max">
                            {quickMsgs.map(qm => (
                                <button
                                    key={qm}
                                    onClick={() => setNewMsg(qm)}
                                    className="flex-shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 transition-all whitespace-nowrap"
                                >
                                    {qm}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── ÁREA DE ESCRITURA ── */}
                <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100">
                    {/* Tipo de mensaje */}
                    <div className="flex gap-2 mb-3">
                        {(['text', 'alert', 'urgent'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setMsgType(type)}
                                className={cn(
                                    "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all",
                                    msgType === type
                                        ? type === 'urgent' ? "bg-rose-600 text-white border-rose-600"
                                            : type === 'alert' ? "bg-amber-500 text-white border-amber-500"
                                                : "bg-slate-900 text-white border-slate-900"
                                        : "bg-slate-50 text-slate-300 border-slate-100 hover:text-slate-500"
                                )}
                            >
                                {type === 'text' ? '💬 Normal' : type === 'alert' ? '⚠️ Alerta' : '🚨 Urgente'}
                            </button>
                        ))}
                        <div className="ml-auto text-[9px] text-slate-300 font-bold self-center">
                            Para: <span style={{ color: toLabel.color }} className="font-black">{toLabel.emoji} {toLabel.label}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 items-end">
                        <textarea
                            ref={inputRef}
                            value={newMsg}
                            onChange={e => setNewMsg(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Mensaje para ${toLabel.label}... (Enter para enviar)`}
                            rows={2}
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ '--tw-ring-color': toLabel.color } as any}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!newMsg.trim() || sending}
                            className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black transition-all flex-shrink-0",
                                newMsg.trim()
                                    ? "hover:scale-105 active:scale-95 shadow-lg"
                                    : "opacity-30 cursor-not-allowed"
                            )}
                            style={{ backgroundColor: newMsg.trim() ? toLabel.color : '#e2e8f0' }}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
