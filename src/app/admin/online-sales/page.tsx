"use client"

import { useState, useEffect } from "react"
import {
    Globe,
    Smartphone,
    MousePointer2,
    Truck,
    ShoppingBag,
    Instagram,
    Facebook,
    Search,
    CheckCircle2,
    Zap,
    ExternalLink,
    ArrowRight,
    Camera,
    Palette,
    Youtube,
    Music2,
    Pin,
    MessageCircle,
    Megaphone,
    MapPin,
    Clock,
    Sparkles,
    Video,
    Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

export default function OnlineSalesPage() {
    const { restaurant, refreshRestaurant } = useRestaurant()
    const [isActive, setIsActive] = useState(false)
    const [webMode, setWebMode] = useState<'menu' | 'ecommerce'>('menu')
    const [allowPickup, setAllowPickup] = useState(true)
    const [allowDelivery, setAllowDelivery] = useState(true)
    const [showSEOModal, setShowSEOModal] = useState(false)
    const [showHoursModal, setShowHoursModal] = useState(false)
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile')
    const [activeTab, setActiveTab] = useState<'config' | 'identity' | 'landing'>('config')
    const [mockupProducts, setMockupProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (restaurant) {
            setIsActive(restaurant.is_web_active || false)
            setWebMode(restaurant.web_mode || 'menu')
            setAllowPickup(restaurant.allow_pickup ?? true)
            setAllowDelivery(restaurant.allow_delivery ?? true)
            loadMockupData()
        }
    }, [restaurant])

    const loadMockupData = async () => {
        if (!restaurant?.id) return
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .limit(3)
        if (data) setMockupProducts(data)
    }

    const updateRestaurant = async (updates: Partial<any>) => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('restaurants')
                .update(updates)
                .eq('id', restaurant?.id)

            if (error) throw error
            await refreshRestaurant()
            toast.success("AJUSTES ACTUALIZADOS")
        } catch (e: any) {
            toast.error(`Error: ${e.message || "No se pudieron guardar los cambios"}`)
            console.error("Supabase Error:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleWeb = (checked: boolean) => {
        setIsActive(checked)
        updateRestaurant({ is_web_active: checked })
    }

    const handleModeChange = (mode: 'menu' | 'ecommerce') => {
        setWebMode(mode)
        updateRestaurant({ web_mode: mode })
    }

    const handleTogglePickup = (checked: boolean) => {
        setAllowPickup(checked)
        updateRestaurant({ allow_pickup: checked })
    }

    const handleToggleDelivery = (checked: boolean) => {
        setAllowDelivery(checked)
        updateRestaurant({ allow_delivery: checked })
    }

    const publicUrl = `https://${restaurant?.subdomain || restaurant?.slug || 'restaurante'}.jamaliso.com`
    const localUrl = `/${restaurant?.slug}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicUrl)
        toast.success("LINK COPIADO AL PORTAPAPELES")
    }

    const openPreview = () => {
        window.open(localUrl, '_blank')
    }

    const detectLogoColor = async (url: string) => {
        if (!url) return;
        setLoading(true);
        try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height).data;
            if (!imageData) return;

            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < imageData.length; i += 4) {
                if (imageData[i + 3] < 50) continue;
                if (imageData[i] > 240 && imageData[i + 1] > 240 && imageData[i + 2] > 240) continue;
                r += imageData[i];
                g += imageData[i + 1];
                b += imageData[i + 2];
                count++;
            }

            if (count > 0) {
                const hex = `#${((1 << 24) + (Math.round(r / count) << 16) + (Math.round(g / count) << 8) + Math.round(b / count)).toString(16).slice(1)}`;
                await updateRestaurant({ primary_color: hex });
                toast.success(`COLOR DETECTADO: ${hex.toUpperCase()}`);
            }
        } catch (e) {
            toast.error("Error al analizar la imagen");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-slate-900 font-sans relative overflow-hidden flex flex-col">
            {/* 🖼️ FONDO PREMIUM PIXORA (Sincronizado con Dashboard) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-700">

                {/* 🛰️ HEADER DEL MÓDULO */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Ecosistema Digital</h2>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                            Central de <span className="text-orange-600">Ventas Online</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-[2rem] border-2 border-slate-100 shadow-xl">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Global</p>
                            <p className={cn("text-xs font-black italic uppercase", isActive ? "text-emerald-600" : "text-rose-600")}>
                                {isActive ? "● Web Pública Activa" : "○ Web Desactivada"}
                            </p>
                        </div>
                        <Switch
                            checked={isActive}
                            onCheckedChange={handleToggleWeb}
                            className="scale-125 data-[state=checked]:bg-emerald-500"
                        />
                    </div>
                </div>

                {/* 🧭 TABS DE NAVEGACIÓN INTERNA */}
                <div className="flex items-center gap-1 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border-2 border-slate-100 max-w-fit shadow-lg">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all",
                            activeTab === 'config' ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        CONFIGURACIÓN
                    </button>
                    <button
                        onClick={() => setActiveTab('identity')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all",
                            activeTab === 'identity' ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        IDENTIDAD VISUAL
                    </button>
                    <button
                        onClick={() => setActiveTab('landing')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all",
                            activeTab === 'landing' ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        ARQUITECTURA LANDING
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* 🎮 PANEL DE CONTROL (COL-8) */}
                    <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-left-4 duration-500">

                        {activeTab === 'config' && (
                            <div className="space-y-8">
                                {/* 🔗 URL CARD */}
                                <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-all group-hover:scale-125">
                                        <Globe className="w-64 h-64 text-slate-900" />
                                    </div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="space-y-4 text-center md:text-left flex-1">
                                            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">Tu vitrina al mundo</h3>
                                            <div className="flex flex-col md:flex-row items-center gap-4">
                                                <div className="px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-sm font-bold text-slate-400 shadow-inner">
                                                    {restaurant?.subdomain || 'restaurante'}.jamaliso.com
                                                </div>
                                                <Button
                                                    onClick={openPreview}
                                                    variant="ghost"
                                                    className="text-orange-600 font-black italic uppercase text-[10px] tracking-widest gap-2 hover:bg-orange-50"
                                                >
                                                    <ExternalLink className="w-4 h-4" /> VER MI WEB
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={copyToClipboard}
                                            className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-black italic uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95 shrink-0"
                                        >
                                            COPIAR LINK PÁGINA
                                        </Button>
                                    </div>
                                </div>

                                {/* 🛠️ CONFIG GRID */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* MODO DE VENTA */}
                                    <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm hover:border-slate-900 transition-all group">
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Modo Operativo</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Modelo de Negocio</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">¿Cómo quieres vender? <span className="text-slate-900 font-bold">Venta Total</span> permite domicilios y también pedidos en mesa por QR.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleModeChange('menu')}
                                                className={cn(
                                                    "flex-1 h-12 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all",
                                                    webMode === 'menu' ? "bg-slate-900 text-white shadow-xl" : "bg-white border-2 border-slate-100 text-slate-400 hover:bg-slate-50"
                                                )}
                                            >
                                                SOLO MENÚ (MESA)
                                            </Button>
                                            <Button
                                                onClick={() => handleModeChange('ecommerce')}
                                                className={cn(
                                                    "flex-1 h-12 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all",
                                                    webMode === 'ecommerce' ? "bg-orange-600 text-white shadow-xl" : "bg-white border-2 border-slate-100 text-slate-400 hover:bg-slate-50"
                                                )}
                                            >
                                                <Zap className="w-3 h-3 mr-1" /> VENTA TOTAL (HÍBRIDO)
                                            </Button>
                                        </div>
                                    </div>

                                    {/* LOGISTICA */}
                                    <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm hover:border-slate-900 transition-all group">
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <Truck className="w-6 h-6" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Opciones Logísticas</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <Smartphone className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-[10px] font-black italic uppercase">Recojo en Local</p>
                                                </div>
                                                <Switch
                                                    checked={allowPickup}
                                                    onCheckedChange={handleTogglePickup}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                        <Truck className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-[10px] font-black italic uppercase">Servicio Domicilio</p>
                                                </div>
                                                <Switch
                                                    checked={allowDelivery}
                                                    onCheckedChange={handleToggleDelivery}
                                                    className="data-[state=checked]:bg-orange-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* 🚀 POWER-UPS DE MARKETING & UBICACIÓN */}
                                <div className="bg-white/40 backdrop-blur-md border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-sm space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* WHATSAPP & PROMOS */}
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Herramientas de Conversión</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">IMPULSA TUS VENTAS</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="p-6 bg-emerald-50/30 border-2 border-dashed border-emerald-100 rounded-3xl space-y-4 hover:bg-white transition-all group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-all">
                                                                <MessageCircle className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase italic">Flotante WhatsApp</p>
                                                                <p className="text-[8px] text-slate-400 font-bold">Chat directo con clientes</p>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={restaurant?.whatsapp_float_enabled ?? true}
                                                            onCheckedChange={(val) => updateRestaurant({ whatsapp_float_enabled: val })}
                                                            className="data-[state=checked]:bg-emerald-500"
                                                        />
                                                    </div>
                                                    <input
                                                        placeholder="Mensaje automático (Ej: ¡Hola! Tengo una duda...)"
                                                        defaultValue={restaurant?.whatsapp_custom_message || ''}
                                                        onBlur={(e) => updateRestaurant({ whatsapp_custom_message: e.target.value })}
                                                        className="w-full bg-white/50 border border-emerald-50 rounded-xl py-3 px-4 text-[11px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                                    />
                                                </div>

                                                <div className="p-6 bg-orange-50/30 border-2 border-dashed border-orange-100 rounded-3xl space-y-4 hover:bg-white transition-all group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 group-hover:scale-110 transition-all">
                                                                <Megaphone className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase italic">Anuncio Superior</p>
                                                                <p className="text-[8px] text-slate-400 font-bold">Banner de promoción web</p>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={restaurant?.promo_banner_enabled ?? false}
                                                            onCheckedChange={(val) => updateRestaurant({ promo_banner_enabled: val })}
                                                            className="data-[state=checked]:bg-orange-500"
                                                        />
                                                    </div>
                                                    <input
                                                        placeholder="Ej: ¡2x1 en Hamburguesas hoy!"
                                                        defaultValue={restaurant?.promo_banner_text || ''}
                                                        onBlur={(e) => updateRestaurant({ promo_banner_text: e.target.value })}
                                                        className="w-full bg-white/50 border border-orange-50 rounded-xl py-3 px-4 text-[11px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-orange-500 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* UBICACION & MAPA */}
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Ubicación & Contacto</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">DÓNDE ENCONTRARTE</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl p-1.5 hover:border-slate-900 hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl items-center">
                                                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 group-hover/input:text-slate-900 transition-all shrink-0 mr-1">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        placeholder="Dirección Física (Ej: Calle 123 #45-67)"
                                                        defaultValue={restaurant?.address_text || ''}
                                                        onBlur={(e) => updateRestaurant({ address_text: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 pr-6 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                    />
                                                </div>
                                                <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl p-1.5 hover:border-blue-500 hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl items-center">
                                                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 group-hover/input:text-blue-600 transition-all shrink-0 mr-1">
                                                        <Globe className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        placeholder="Link Google Maps (Iframe o URL)"
                                                        defaultValue={restaurant?.google_maps_link || ''}
                                                        onBlur={(e) => updateRestaurant({ google_maps_link: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 pr-6 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => setShowHoursModal(true)}
                                                    variant="ghost"
                                                    className="w-full border-2 border-dashed border-slate-200 rounded-2xl h-14 text-[9px] font-black uppercase text-slate-400 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all gap-3"
                                                >
                                                    <Clock className="w-4 h-4" /> CONFIGURAR HORARIOS ONLINE
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SOCIAL & SEO */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Redes Sociales</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">CONECTA TUS CANALES DE VENTA</p>
                                            </div>
                                            <div className="space-y-4">
                                                {/* INSTAGRAM */}
                                                <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-1.5 hover:border-orange-500 hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 items-center">
                                                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 group-hover/input:text-orange-600 transition-all group-hover/input:scale-110 group-hover/input:rotate-3 shrink-0 mr-1">
                                                        <Instagram className="w-6 h-6" />
                                                    </div>
                                                    <input
                                                        placeholder="@tu_restaurante"
                                                        defaultValue={restaurant?.instagram_url || ''}
                                                        onBlur={(e) => updateRestaurant({ instagram_url: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 pr-6 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                    />
                                                </div>

                                                {/* FACEBOOK */}
                                                <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-1.5 hover:border-blue-500 hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 items-center">
                                                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 group-hover/input:text-blue-600 transition-all group-hover/input:scale-110 group-hover/input:-rotate-3 shrink-0 mr-1">
                                                        <Facebook className="w-6 h-6" />
                                                    </div>
                                                    <input
                                                        placeholder="facebook.com/restaurante"
                                                        defaultValue={restaurant?.facebook_url || ''}
                                                        onBlur={(e) => updateRestaurant({ facebook_url: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 pr-6 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                    />
                                                </div>

                                                {/* TIKTOK */}
                                                <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-1.5 hover:border-slate-900 hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 items-center">
                                                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 group-hover/input:text-slate-900 transition-all group-hover/input:scale-110 group-hover/input:rotate-3 shrink-0 mr-1">
                                                        <Music2 className="w-6 h-6" />
                                                    </div>
                                                    <input
                                                        placeholder="tiktok.com/@restaurante"
                                                        defaultValue={restaurant?.tiktok_url || ''}
                                                        onBlur={(e) => updateRestaurant({ tiktok_url: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 pr-6 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* YOUTUBE */}
                                                    <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-1.5 hover:border-red-500 hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 items-center">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-400 group-hover/input:text-red-600 transition-all group-hover/input:scale-110 shrink-0 mr-1">
                                                            <Youtube className="w-5 h-5" />
                                                        </div>
                                                        <input
                                                            placeholder="YouTube"
                                                            defaultValue={restaurant?.youtube_url || ''}
                                                            onBlur={(e) => updateRestaurant({ youtube_url: e.target.value })}
                                                            className="flex-1 bg-transparent py-4 pr-4 text-xs font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                        />
                                                    </div>

                                                    {/* PINTEREST */}
                                                    <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-1.5 hover:border-red-700 hover:bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-700/5 items-center">
                                                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-400 group-hover/input:text-red-700 transition-all group-hover/input:scale-110 shrink-0 mr-1">
                                                            <Pin className="w-5 h-5" />
                                                        </div>
                                                        <input
                                                            placeholder="Pinterest"
                                                            defaultValue={restaurant?.pinterest_url || ''}
                                                            onBlur={(e) => updateRestaurant({ pinterest_url: e.target.value })}
                                                            className="flex-1 bg-transparent py-4 pr-4 text-xs font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Posicionamiento SEO</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">CÓMO TE VE GOOGLE</p>
                                            </div>
                                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-inner space-y-2">
                                                <p className="text-sm font-bold text-blue-600 underline">{(restaurant as any)?.custom_seo_title || `Menú Digital | ${restaurant?.name || 'JAMALI RESTAURANTE'}`}</p>
                                                <p className="text-[10px] text-slate-500 line-clamp-2">{(restaurant as any)?.custom_seo_description || 'Explora nuestra carta gastronómica con ingredientes frescos y lo mejor de la cocina local...'}</p>
                                            </div>
                                            <Button
                                                onClick={() => setShowSEOModal(true)}
                                                variant="ghost"
                                                className="w-full border-2 border-dashed border-slate-200 rounded-2xl h-12 text-[9px] font-black uppercase text-slate-400 hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 transition-all"
                                            >
                                                EDITAR META-TAGS
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'identity' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* COLORES */}
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Paleta de Colores</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">PERSONALIZA TU MOOD</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase text-slate-400">Color Primario</label>
                                                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100">
                                                        <input
                                                            type="color"
                                                            defaultValue={restaurant?.primary_color || '#ea580c'}
                                                            onBlur={(e) => updateRestaurant({ primary_color: e.target.value })}
                                                            className="w-10 h-10 border-none rounded-lg cursor-pointer bg-transparent"
                                                        />
                                                        <span className="text-[10px] font-bold font-mono tracking-widest uppercase">{restaurant?.primary_color || '#ea580c'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 opacity-50">
                                                    <label className="text-[9px] font-black uppercase text-slate-400">Secundario (Próximamente)</label>
                                                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-200" />
                                                        <span className="text-[10px] font-bold font-mono">AUTOMÁTICO</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ASSETS */}
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Logotipo & Icono</h4>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">IDENTIDAD DE MARCA</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="relative group/input flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl p-1.5 hover:border-slate-900 items-center">
                                                    <div className="relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-slate-400 shrink-0 mr-1 overflow-hidden">
                                                        {restaurant?.logo_url ? <img src={restaurant.logo_url} className="w-full h-full object-contain p-2" /> : <Camera className="w-5 h-5" />}
                                                    </div>
                                                    <input
                                                        placeholder="URL del Logo (1:1 recomendado)"
                                                        defaultValue={restaurant?.logo_url || ''}
                                                        onBlur={(e) => updateRestaurant({ logo_url: e.target.value })}
                                                        className="flex-1 bg-transparent py-4 pr-6 text-[10px] font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
                                                    />
                                                    <Button
                                                        onClick={() => detectLogoColor(restaurant?.logo_url || '')}
                                                        size="sm"
                                                        className="mr-2 bg-slate-900 text-white hover:bg-orange-600 rounded-xl text-[8px] font-black uppercase italic tracking-widest gap-2"
                                                    >
                                                        <Palette className="w-3 h-3" />
                                                        Extraer Color
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'landing' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

                                {/* SLOT 1: EL ALMA (HERO SETUP) */}
                                <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 space-y-10 shadow-sm group hover:border-orange-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20 rotate-3">
                                            <Sparkles className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter font-sans">Slot 1. <span className="text-orange-600">El Alma</span></h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">CONFIGURACIÓN DEL HERO SECTION</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Título de Bienvenida (Línea 1)</label>
                                                <input
                                                    placeholder="Ej: Sabores que"
                                                    defaultValue={restaurant?.landing_page_config?.hero?.title_part1 || ''}
                                                    onBlur={(e) => {
                                                        const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, title_part1: e.target.value } }
                                                        updateRestaurant({ landing_page_config: conf })
                                                    }}
                                                    className="w-full h-16 bg-white border-2 border-slate-100 rounded-2xl px-6 text-lg font-black uppercase italic tracking-tighter focus:border-orange-500 outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Título de Bienvenida (Línea 2)</label>
                                                <input
                                                    placeholder="Ej: Enamoran"
                                                    defaultValue={restaurant?.landing_page_config?.hero?.title_part2 || ''}
                                                    onBlur={(e) => {
                                                        const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, title_part2: e.target.value } }
                                                        updateRestaurant({ landing_page_config: conf })
                                                    }}
                                                    className="w-full h-16 bg-white border-2 border-slate-100 rounded-2xl px-6 text-lg font-black uppercase italic tracking-tighter focus:border-orange-500 outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Eslogan / Frase de Impacto</label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Cuenta la esencia de tu lugar en una frase corta..."
                                                    defaultValue={restaurant?.landing_page_config?.hero?.tagline || ''}
                                                    onBlur={(e) => {
                                                        const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, tagline: e.target.value } }
                                                        updateRestaurant({ landing_page_config: conf })
                                                    }}
                                                    className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium text-slate-600 focus:border-orange-500 outline-none transition-all shadow-inner resize-none italic"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Atmósfera Visual (Background)</h5>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase italic">RECOMENDADO: SHORT VIDEO DE 10-15s O IMAGEN 4K</p>
                                            </div>
                                            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                                <button
                                                    onClick={() => {
                                                        const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, media_type: 'image' } }
                                                        updateRestaurant({ landing_page_config: conf })
                                                    }}
                                                    className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase italic transition-all", restaurant?.landing_page_config?.hero?.media_type !== 'video' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}
                                                >IMAGEN</button>
                                                <button
                                                    onClick={() => {
                                                        const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, media_type: 'video' } }
                                                        updateRestaurant({ landing_page_config: conf })
                                                    }}
                                                    className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase italic transition-all", restaurant?.landing_page_config?.hero?.media_type === 'video' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}
                                                >VIDEO</button>
                                            </div>
                                        </div>

                                        <div className="relative group/input flex items-center bg-white border-2 border-dashed border-slate-200 rounded-3xl p-1.5 hover:border-orange-500 transition-all">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover/input:text-orange-500 transition-all shrink-0">
                                                <Camera className="w-6 h-6" />
                                            </div>
                                            <input
                                                placeholder="Pega aquí el link directo de tu imagen o video (Mp4, WebM)"
                                                defaultValue={restaurant?.landing_page_config?.hero?.image_url || ''}
                                                onBlur={(e) => {
                                                    const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, image_url: e.target.value } }
                                                    updateRestaurant({ landing_page_config: conf })
                                                }}
                                                className="flex-1 bg-transparent py-4 px-6 text-xs font-bold text-slate-400 focus:outline-none"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Opacidad del Filtro (Dark Overlay)</label>
                                                <span className="text-xs font-black italic text-orange-600">{Math.round((restaurant?.landing_page_config?.hero?.overlay_opacity || 0.4) * 100)}%</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="1" step="0.1"
                                                defaultValue={restaurant?.landing_page_config?.hero?.overlay_opacity || 0.4}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value)
                                                    const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, overlay_opacity: val } }
                                                    updateRestaurant({ landing_page_config: conf })
                                                }}
                                                className="w-full accent-orange-600 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SLOT 2: MOOD DE MARCA (ESTILO) */}
                                <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 space-y-10 shadow-sm group hover:border-slate-900/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20 rotate-[-3deg]">
                                            <Palette className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter font-sans">Slot 2. <span className="text-slate-900">Mood de Marca</span></h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">ESTILO, TIPOGRAFÍA Y ATMÓSFERA</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { id: 'noir', name: 'Noir', desc: 'Minimalismo oscuro y elegante', class: 'bg-slate-950 text-white' },
                                            { id: 'clean', name: 'Clean White', desc: 'Pureza, luz y minimalismo', class: 'bg-white border-2 border-slate-100 text-slate-900' },
                                            { id: 'gold', name: 'Gold & Black', desc: 'Lujo sutil y exclusividad', class: 'bg-slate-900 text-amber-400' },
                                            { id: 'neon', name: 'Neon Night', desc: 'Impacto visual moderno', class: 'bg-slate-900 text-emerald-400' }
                                        ].map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => {
                                                    const conf = { ...restaurant.landing_page_config, brand_mood: { ...restaurant.landing_page_config?.brand_mood, style: style.id } }
                                                    updateRestaurant({ landing_page_config: conf })
                                                }}
                                                className={cn(
                                                    "group relative p-6 rounded-[2rem] text-left transition-all hover:scale-105 active:scale-95",
                                                    style.class,
                                                    restaurant?.landing_page_config?.brand_mood?.style === style.id ? "ring-4 ring-orange-500 shadow-2xl" : "opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h6 className="font-black italic uppercase text-xs tracking-tighter">{style.name}</h6>
                                                    {restaurant?.landing_page_config?.brand_mood?.style === style.id && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                                                </div>
                                                <p className="text-[9px] font-bold uppercase leading-tight opacity-40">{style.desc}</p>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Combinación Tipográfica</label>
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { id: 'modern', name: 'Serif Modern', preview: 'The Essence of Food' },
                                                    { id: 'minimal', name: 'Sans Minimal', preview: 'ULTRA MODERN VIBE' }
                                                ].map((typo) => (
                                                    <button
                                                        key={typo.id}
                                                        onClick={() => {
                                                            const conf = { ...restaurant.landing_page_config, brand_mood: { ...restaurant.landing_page_config?.brand_mood, typography: typo.id } }
                                                            updateRestaurant({ landing_page_config: conf })
                                                        }}
                                                        className={cn(
                                                            "flex items-center justify-between p-5 rounded-2xl border-2 transition-all",
                                                            restaurant?.landing_page_config?.brand_mood?.typography === typo.id ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                                                        )}
                                                    >
                                                        <span className="text-[10px] font-black uppercase italic">{typo.name}</span>
                                                        <span className={cn("text-xs font-bold", typo.id === 'modern' ? "font-serif" : "font-sans uppercase")}>{typo.preview}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-orange-50/50 rounded-[2.5rem] p-8 flex items-center justify-between border-2 border-orange-100/50">
                                            <div className="space-y-1">
                                                <h6 className="text-xs font-black italic uppercase text-orange-600">Glassmorphism Effect</h6>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase italic">Capas de cristal para profundidad</p>
                                            </div>
                                            <Switch
                                                checked={restaurant?.landing_page_config?.brand_mood?.glassmorphism ?? true}
                                                onCheckedChange={(val) => {
                                                    const conf = { ...restaurant.landing_page_config, brand_mood: { ...restaurant.landing_page_config?.brand_mood, glassmorphism: val } }
                                                    updateRestaurant({ landing_page_config: conf })
                                                }}
                                                className="data-[state=checked]:bg-orange-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SLOT 3: CTAs (ACTIVADORES DE VENTA) */}
                                <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 space-y-10 shadow-sm group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 rotate-3">
                                            <MousePointer2 className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black italic uppercase tracking-tighter font-sans">Slot 3. <span className="text-emerald-600">Activadores de Venta</span></h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">BOTONES DE LLAMADO A LA ACCIÓN (CTAs)</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* BOTÓN PRIMARIO */}
                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-black uppercase text-orange-500 tracking-widest italic">Botón de Impacto</span>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                </div>
                                                <div className="space-y-3">
                                                    <input
                                                        placeholder="Texto del Boton (Ej: VER LA CARTA)"
                                                        defaultValue={restaurant?.landing_page_config?.ctas?.primary?.text || 'VER CARTA DIGITAL'}
                                                        onBlur={(e) => {
                                                            const conf = {
                                                                ...restaurant.landing_page_config,
                                                                ctas: {
                                                                    ...restaurant.landing_page_config?.ctas,
                                                                    primary: { ...restaurant.landing_page_config?.ctas?.primary, text: e.target.value }
                                                                }
                                                            }
                                                            updateRestaurant({ landing_page_config: conf })
                                                        }}
                                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-6 text-sm font-black italic uppercase tracking-widest text-center focus:bg-orange-600 focus:border-orange-600 transition-all outline-none"
                                                    />
                                                    <div className="flex items-center gap-2 bg-black/20 rounded-xl px-4 py-2 border border-white/5">
                                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                                        <input
                                                            placeholder="URL de destino (Opcional)"
                                                            defaultValue={restaurant?.landing_page_config?.ctas?.primary?.url || ''}
                                                            onBlur={(e) => {
                                                                const conf = {
                                                                    ...restaurant.landing_page_config,
                                                                    ctas: {
                                                                        ...restaurant.landing_page_config?.ctas,
                                                                        primary: { ...restaurant.landing_page_config?.ctas?.primary, url: e.target.value }
                                                                    }
                                                                }
                                                                updateRestaurant({ landing_page_config: conf })
                                                            }}
                                                            className="flex-1 bg-transparent text-[9px] font-bold text-slate-400 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BOTÓN SECUNDARIO */}
                                        <div className="space-y-6">
                                            <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl space-y-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Botón Secundario</span>
                                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                </div>
                                                <div className="space-y-3">
                                                    <input
                                                        placeholder="Texto del Boton (Ej: RESERVAR MESA)"
                                                        defaultValue={restaurant?.landing_page_config?.ctas?.secondary?.text || 'RESERVAR MESA'}
                                                        onBlur={(e) => {
                                                            const conf = {
                                                                ...restaurant.landing_page_config,
                                                                ctas: {
                                                                    ...restaurant.landing_page_config?.ctas,
                                                                    secondary: { ...restaurant.landing_page_config?.ctas?.secondary, text: e.target.value }
                                                                }
                                                            }
                                                            updateRestaurant({ landing_page_config: conf })
                                                        }}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-black italic uppercase tracking-widest text-center focus:bg-white focus:border-slate-900 transition-all outline-none"
                                                    />
                                                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
                                                        <ExternalLink className="w-3 h-3 text-slate-300" />
                                                        <input
                                                            placeholder="URL de destino (Opcional)"
                                                            defaultValue={restaurant?.landing_page_config?.ctas?.secondary?.url || ''}
                                                            onBlur={(e) => {
                                                                const conf = {
                                                                    ...restaurant.landing_page_config,
                                                                    ctas: {
                                                                        ...restaurant.landing_page_config?.ctas,
                                                                        secondary: { ...restaurant.landing_page_config?.ctas?.secondary, url: e.target.value }
                                                                    }
                                                                }
                                                                updateRestaurant({ landing_page_config: conf })
                                                            }}
                                                            className="flex-1 bg-transparent text-[9px] font-bold text-slate-500 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* 📱 LIVE PREVIEW (COL-4) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between px-8 py-4 bg-white/40 backdrop-blur-md rounded-[2rem] border-2 border-slate-100 shadow-xl">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">VISTA PREVIA</h3>
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                                <button
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                        previewDevice === 'mobile' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Smartphone className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                        previewDevice === 'desktop' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Globe className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className={cn(
                            "relative mx-auto transition-all duration-700 ease-in-out group",
                            previewDevice === 'mobile'
                                ? "bg-slate-900 rounded-[4rem] p-4 shadow-2xl aspect-[9/19] max-w-[320px] border-[10px] border-slate-800"
                                : "bg-slate-900 rounded-[3rem] p-3 shadow-2xl w-full aspect-[4/3] border-[10px] border-slate-800"
                        )}>
                            {/* SPEAKER & CAMERA (Mobile only) */}
                            {previewDevice === 'mobile' && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-30" />
                            )}

                            {/* BROWSER BAR (Desktop only) */}
                            {previewDevice === 'desktop' && (
                                <div className="absolute top-0 left-0 w-full h-8 flex items-center px-6 gap-2 bg-slate-800 rounded-t-[2rem] z-30">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                    </div>
                                    <div className="flex-1 max-w-sm h-4 bg-slate-900/50 rounded-full mx-auto" />
                                </div>
                            )}

                            {/* SCREEN CONTENT */}
                            <div className={cn(
                                "h-full overflow-hidden flex flex-col relative z-20 transition-all no-scrollbar overflow-y-auto",
                                previewDevice === 'mobile' ? "rounded-[2.5rem]" : "rounded-[2rem] pt-6",
                                restaurant?.landing_page_config?.brand_mood?.style === 'noir' ? "bg-slate-950 text-white" :
                                    restaurant?.landing_page_config?.brand_mood?.style === 'gold' ? "bg-slate-900 text-amber-400" :
                                        restaurant?.landing_page_config?.brand_mood?.style === 'neon' ? "bg-slate-950 text-emerald-400" : "bg-white text-slate-900",
                                restaurant?.landing_page_config?.brand_mood?.typography === 'modern' ? "font-serif" : "font-sans"
                            )}>
                                {/* HEADER PREVIEW */}
                                <header className={cn(
                                    "sticky top-0 z-50 border-b px-4 py-2 flex items-center justify-between shrink-0 transition-colors bg-opacity-80",
                                    (restaurant?.landing_page_config?.brand_mood?.glassmorphism ?? true) ? "backdrop-blur-md" : "",
                                    restaurant?.landing_page_config?.brand_mood?.style === 'noir' ? "bg-slate-950 border-white/5" :
                                        restaurant?.landing_page_config?.brand_mood?.style === 'gold' ? "bg-slate-900 border-amber-900/20" :
                                            restaurant?.landing_page_config?.brand_mood?.style === 'neon' ? "bg-slate-950 border-emerald-900/20" : "bg-white border-slate-50"
                                )}>
                                    <div className="flex items-center gap-2">
                                        {restaurant?.logo_url ? (
                                            <img src={restaurant.logo_url} className="w-6 h-6 rounded-lg object-contain" alt="logo" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-lg bg-orange-600 font-black text-white text-[8px] flex items-center justify-center">R</div>
                                        )}
                                        <p className="text-[9px] font-black italic uppercase">{restaurant?.name || 'JAMALI'}</p>
                                    </div>
                                    <div className="flex gap-1.5 opacity-50">
                                        <Instagram className="w-3 h-3" />
                                        <Facebook className="w-3 h-3" />
                                    </div>
                                </header>

                                {/* HERO PREVIEW */}
                                <div className={cn(
                                    "relative flex flex-col items-center justify-center text-center p-8 shrink-0 overflow-hidden group/hero",
                                    previewDevice === 'mobile' ? "min-h-[200px]" : "min-h-[300px]",
                                    restaurant?.landing_page_config?.brand_mood?.style === 'noir' ? "bg-slate-950" : "bg-slate-900"
                                )}>
                                    {/* Background Media with Parallax micro-interaction */}
                                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                                        <img
                                            src={restaurant?.landing_page_config?.hero?.media_url || restaurant?.landing_page_config?.hero?.image_url || "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800"}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover/hero:scale-110 group-hover/hero:rotate-2"
                                            alt="hero"
                                        />
                                        <div
                                            className="absolute inset-0 bg-black"
                                            style={{ opacity: restaurant?.landing_page_config?.hero?.overlay_opacity ?? 0.4 }}
                                        />
                                        {restaurant?.landing_page_config?.hero?.media_type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                                                    <Video className="w-3 h-3 text-white opacity-50" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10 space-y-2">
                                        <div className="space-y-0.5">
                                            <h5 className={cn(
                                                "font-black italic text-white uppercase tracking-tighter leading-none",
                                                previewDevice === 'mobile' ? "text-2xl" : "text-4xl"
                                            )}>
                                                {restaurant?.landing_page_config?.hero?.title_part1 || (restaurant?.name?.split(' ')[0] || 'BIENVENIDO')}
                                                <br />
                                                <span className="text-orange-500">
                                                    {restaurant?.landing_page_config?.hero?.title_part2 || (restaurant?.name?.split(' ')[1] || '')}
                                                </span>
                                            </h5>
                                            <p className="text-[7px] font-black text-white/60 uppercase tracking-[0.4em] italic leading-none mt-2">
                                                {restaurant?.landing_page_config?.hero?.tagline || 'GASTRONOMÍA PREMIUM'}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                className="h-7 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[7px] font-black uppercase italic tracking-widest transition-all"
                                            >
                                                {restaurant?.landing_page_config?.ctas?.primary?.text || 'VER CARTA DIGITAL'}
                                            </button>
                                            <button
                                                className="h-7 px-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg text-[7px] font-black uppercase italic tracking-widest transition-all"
                                            >
                                                {restaurant?.landing_page_config?.ctas?.secondary?.text || 'RESERVAR MESA'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* CONTENT PREVIEW */}
                                <div className="flex-1 p-6 space-y-6">
                                    <div className={cn(
                                        "flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b",
                                        restaurant?.landing_page_config?.brand_mood?.style === 'noir' ? "border-white/5" : "border-slate-50"
                                    )}>
                                        <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[7px] font-black italic uppercase shrink-0">Todos</div>
                                        <div className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-[7px] font-black italic uppercase shrink-0">Entradas</div>
                                        <div className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-[7px] font-black italic uppercase shrink-0">Fuertes</div>
                                    </div>

                                    <div className={cn(
                                        "grid gap-4",
                                        previewDevice === 'desktop' ? "grid-cols-2" : "grid-cols-1"
                                    )}>
                                        {(mockupProducts.length > 0 ? mockupProducts : [1, 2]).map((p: any, i: number) => (
                                            <div key={i} className={cn(
                                                "rounded-2xl overflow-hidden shadow-sm group/card transition-all",
                                                restaurant?.landing_page_config?.brand_mood?.style === 'noir' ? "bg-white/5 border border-white/5" : "bg-white border border-slate-100"
                                            )}>
                                                <div className="h-24 bg-slate-50 relative">
                                                    {p.image_url ? (
                                                        <img src={p.image_url} className="w-full h-full object-cover" alt="prod" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center opacity-20"><ShoppingBag className="w-6 h-6" /></div>
                                                    )}
                                                </div>
                                                <div className="p-3 space-y-1">
                                                    <p className="text-[9px] font-black uppercase italic">{p.name || `Plato de Ejemplo ${i + 1}`}</p>
                                                    <div className="flex justify-between items-center pt-1">
                                                        <p className="text-[10px] font-black italic text-orange-600">$ {p.price || '45,000'}</p>
                                                        <div className="w-6 h-6 bg-slate-900/10 rounded-lg flex items-center justify-center transition-all group-hover/card:bg-slate-900 group-hover/card:text-white">
                                                            <ArrowRight className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* FOOTER PREVIEW */}
                                <div className={cn(
                                    "p-6 text-center space-y-2 border-t",
                                    restaurant?.landing_page_config?.brand_mood?.style === 'noir' ? "bg-slate-950 border-white/5" : "bg-slate-50 border-slate-100"
                                )}>
                                    <p className="text-[6px] font-black uppercase tracking-[0.4em] text-slate-300">Powered by JAMALI OS</p>
                                </div>

                                {/* 💬 WHATSAPP BUTTON (MOCKUP) */}
                                {restaurant?.whatsapp_float_enabled && (
                                    <div className="fixed bottom-24 right-10 md:right-auto md:absolute md:bottom-24 md:right-8 z-[60] w-10 h-10 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center text-white premium-whatsapp-pulse">
                                        <MessageCircle className="w-5 h-5 fill-current" />
                                    </div>
                                )}

                                {!isActive && (
                                    <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                                            <Globe className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-sm font-black italic uppercase tracking-tighter leading-none mb-1 text-slate-900">MODO MANTENIMIENTO</h4>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Publique su página web usando el switch global de la parte superior.</p>
                                    </div>
                                )}
                            </div>


                            {/* HOVER GLOW EFFECT */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-orange-500/0 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40" />
                        </div>
                    </div>

                </div>

            </div>

            {/* 🔍 MODAL SEO */}
            {showSEOModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSEOModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Configuración <span className="text-orange-600">Google SEO</span></h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Optimiza cómo te encuentran</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Título de la Página</label>
                                <input
                                    defaultValue={(restaurant as any)?.custom_seo_title || ''}
                                    onBlur={(e) => updateRestaurant({ custom_seo_title: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all"
                                    placeholder="Ej: El mejor Sushi de la Ciudad | Sushi Roll"
                                />
                                <p className="text-[9px] text-slate-400 italic">Recomendado: 50-60 caracteres.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción Meta</label>
                                <textarea
                                    rows={4}
                                    defaultValue={(restaurant as any)?.custom_seo_description || ''}
                                    onBlur={(e) => updateRestaurant({ custom_seo_description: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all resize-none"
                                    placeholder="Describe tu restaurante y especialidades..."
                                />
                                <p className="text-[9px] text-slate-400 italic">Recomendado: 120-155 caracteres.</p>
                            </div>
                            <Button
                                onClick={() => setShowSEOModal(false)}
                                className="w-full bg-slate-900 h-14 rounded-2xl text-white font-black italic uppercase text-xs tracking-widest hover:bg-orange-600 transition-all shadow-xl"
                            >
                                LISTO
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🕒 MODAL HORARIOS ONLINE */}
            {showHoursModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHoursModal(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Horarios de <span className="text-blue-600">Venta Online</span></h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Define cuándo recibes pedidos web</p>
                            </div>
                            <Button variant="ghost" className="rounded-full w-10 h-10 p-0" onClick={() => setShowHoursModal(false)}>✕</Button>
                        </div>
                        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'].map((day) => {
                                const config = (restaurant as any)?.online_hours_config?.[day] || { is_open: true, open_time: '08:00', close_time: '22:00' };
                                return (
                                    <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-all">
                                        <div className="flex items-center gap-4 w-32">
                                            <Switch
                                                checked={config.is_open}
                                                onCheckedChange={(val) => {
                                                    const newConfig = { ...(restaurant as any)?.online_hours_config, [day]: { ...config, is_open: val } };
                                                    updateRestaurant({ online_hours_config: newConfig });
                                                }}
                                                className="data-[state=checked]:bg-blue-600"
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{day}</span>
                                        </div>

                                        {config.is_open ? (
                                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                                                <input
                                                    type="time"
                                                    value={config.open_time}
                                                    onChange={(e) => {
                                                        const newConfig = { ...(restaurant as any)?.online_hours_config, [day]: { ...config, open_time: e.target.value } };
                                                        updateRestaurant({ online_hours_config: newConfig });
                                                    }}
                                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                                                />
                                                <span className="text-[9px] font-black text-slate-300 uppercase">A</span>
                                                <input
                                                    type="time"
                                                    value={config.close_time}
                                                    onChange={(e) => {
                                                        const newConfig = { ...(restaurant as any)?.online_hours_config, [day]: { ...config, close_time: e.target.value } };
                                                        updateRestaurant({ online_hours_config: newConfig });
                                                    }}
                                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-[10px] font-black italic text-rose-500 uppercase tracking-[0.2em] animate-in fade-in duration-300">Cerrado para Web</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-8 pt-0">
                            <Button
                                onClick={() => setShowHoursModal(false)}
                                className="w-full bg-slate-900 h-14 rounded-2xl text-white font-black italic uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                            >
                                GUARDAR HORARIOS
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes premium-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); transform: scale(1); }
                    70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); transform: scale(1.1); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); transform: scale(1); }
                }
                .premium-whatsapp-pulse {
                    animation: premium-pulse 2s infinite ease-in-out;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div >
    )
}
