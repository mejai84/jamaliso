"use client"

import { useState, useEffect, useMemo } from "react"
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
    RefreshCcw,
    Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import { updateRestaurantProfile, clearRestaurantCache } from "@/actions/restaurant-actions"

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
        if (!restaurant?.id) return
        setLoading(true)
        try {
            const res = await updateRestaurantProfile(restaurant.id, updates)
            if (!res.success) throw new Error(res.error)

            await refreshRestaurant()
            toast.success("AJUSTES ACTUALIZADOS", {
                description: "Los cambios se han guardado y sincronizado con tu web pública."
            })
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

    const publicUrl = useMemo(() => `https://${restaurant?.subdomain || restaurant?.slug || 'restaurante'}.jamaliso.com`, [restaurant])
    const localUrl = useMemo(() => `/${restaurant?.slug}`, [restaurant])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicUrl)
        toast.success("LINK COPIADO AL PORTAPAPELES")
    }

    const openPreview = () => {
        if (!restaurant?.slug) {
            toast.error("Configura un SLUG para ver la web")
            return
        }
        window.open(localUrl, '_blank')
    }

    const forceSync = async () => {
        setLoading(true)
        const res = await clearRestaurantCache()
        if (res.success) {
            toast.success("SINCROCINACIÓN FORZADA", { description: "La caché de tu web ha sido reiniciada." })
        } else {
            toast.error("Error al sincronizar")
        }
        setLoading(false)
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
            {/* 🖼️ FONDO PREMIUM PIXORA */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center scale-105 pointer-events-none opacity-20" />
            <div className="fixed inset-0 backdrop-blur-[100px] bg-white/80 pointer-events-none" />

            <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-700">

                {/* 🛰️ HEADER */}
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

                {/* 🧭 TABS */}
                <div className="flex items-center gap-1 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border-2 border-slate-100 max-w-fit shadow-lg">
                    {['config', 'identity', 'landing'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all",
                                activeTab === tab ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            {tab === 'config' ? 'CONFIGURACIÓN' : tab === 'identity' ? 'IDENTIDAD VISUAL' : 'ARQUITECTURA LANDING'}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
                    <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-left-4 duration-500">

                        {activeTab === 'config' && (
                            <div className="space-y-8">
                                <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-all group-hover:scale-125">
                                        <Globe className="w-64 h-64 text-slate-900" />
                                    </div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="space-y-4 text-center md:text-left flex-1">
                                            <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">Tu vitrina al mundo</h3>
                                            <div className="flex flex-col md:flex-row items-center gap-4">
                                                <div className="px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-sm font-bold text-slate-400 shadow-inner">
                                                    {restaurant?.name || "RESTAURANTE"}.jamaliso.com
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={copyToClipboard} variant="ghost" className="h-12 px-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:scale-105 transition-all text-slate-400 hover:text-slate-900 gap-2 uppercase font-black text-[10px] italic tracking-widest">
                                                        <Smartphone className="w-4 h-4" /> COMPARTIR
                                                    </Button>
                                                    <Button onClick={openPreview} className="bg-slate-900 text-white rounded-2xl px-6 h-12 text-[10px] font-black uppercase italic tracking-widest gap-2 shadow-xl hover:scale-105 transition-all">
                                                        VER MI WEB <ExternalLink className="w-3 h-3" />
                                                    </Button>
                                                    <Button onClick={forceSync} variant="outline" className="border-slate-200 text-slate-400 rounded-2xl px-6 h-12 text-[10px] font-black uppercase italic tracking-widest gap-2 hover:bg-slate-50">
                                                        <RefreshCcw className={cn("w-3 h-3", loading && "animate-spin")} /> SYNC
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                        <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm hover:border-slate-900 transition-all group">
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <ShoppingBag className="w-6 h-6" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Modo Operativo</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Modelo de Negocio</h4>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">¿Cómo quieres vender? <span className="text-slate-900 font-bold">Venta Total</span> permite domicilios y pedidos en mesa.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleModeChange('menu')} className={cn("flex-1 h-12 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all", webMode === 'menu' ? "bg-slate-900 text-white" : "bg-white border-2 border-slate-100 text-slate-400")}>MENU</Button>
                                                <Button onClick={() => handleModeChange('ecommerce')} className={cn("flex-1 h-12 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all", webMode === 'ecommerce' ? "bg-orange-600 text-white" : "bg-white border-2 border-slate-100 text-slate-400")}>TRANSACCIONAL</Button>
                                            </div>
                                        </div>

                                        <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm hover:border-slate-900 transition-all group">
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <Truck className="w-6 h-6" />
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Logística</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-slate-50">
                                                    <p className="text-[10px] font-black italic uppercase">Recojo Local</p>
                                                    <Switch checked={allowPickup} onCheckedChange={handleTogglePickup} />
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-slate-50">
                                                    <p className="text-[10px] font-black italic uppercase">Domicilio</p>
                                                    <Switch checked={allowDelivery} onCheckedChange={handleToggleDelivery} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-md border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-sm space-y-12 mt-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-8">
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Herramientas</h4>
                                                <div className="space-y-4">
                                                    <div className="p-6 bg-emerald-50/30 border-2 border-dashed border-emerald-100 rounded-3xl space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-[10px] font-black uppercase italic">WhatsApp Flotante</p>
                                                            <Switch checked={restaurant?.whatsapp_float_enabled ?? true} onCheckedChange={(val) => updateRestaurant({ whatsapp_float_enabled: val })} />
                                                        </div>
                                                        <input defaultValue={restaurant?.whatsapp_custom_message || ''} onBlur={(e) => updateRestaurant({ whatsapp_custom_message: e.target.value })} className="w-full bg-white/50 border rounded-xl p-3 text-xs" placeholder="Mensaje..." />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Ubicación</h4>
                                                <div className="space-y-4">
                                                    <input defaultValue={restaurant?.address_text || ''} onBlur={(e) => updateRestaurant({ address_text: e.target.value })} className="w-full bg-slate-50 border rounded-2xl p-4 text-sm" placeholder="Dirección..." />
                                                    <Button onClick={() => setShowHoursModal(true)} variant="outline" className="w-full rounded-2xl h-14 uppercase font-black text-[10px]">Configurar Horarios</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'identity' && (
                            <div className="space-y-8">
                                <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Paleta de Colores</h4>
                                            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100">
                                                <input type="color" defaultValue={restaurant?.primary_color || '#ea580c'} onBlur={(e) => updateRestaurant({ primary_color: e.target.value })} className="w-10 h-10 border-none rounded-lg cursor-pointer bg-transparent" />
                                                <span className="text-[10px] font-bold font-mono tracking-widest uppercase">{restaurant?.primary_color || '#ea580c'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1 font-sans">Logotipo</h4>
                                            <div className="flex items-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl p-1.5 hover:border-slate-900 transition-all">
                                                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm mr-2">
                                                    {restaurant?.logo_url ? <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-contain p-2" /> : <Camera className="w-5 h-5" />}
                                                </div>
                                                <input placeholder="URL del Logo" defaultValue={restaurant?.logo_url || ''} onBlur={(e) => updateRestaurant({ logo_url: e.target.value })} className="flex-1 bg-transparent py-4 text-[10px] font-black focus:outline-none" />
                                                <Button onClick={() => detectLogoColor(restaurant?.logo_url || '')} size="sm" className="mr-2 bg-slate-900 text-white rounded-xl text-[8px] font-black">EXTRAER COLOR</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'landing' && (
                            <div className="space-y-8 pb-20">
                                <div className="bg-white/60 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-8 md:p-12 space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><Sparkles className="w-6 h-6" /></div>
                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter">Slot 1. <span className="text-orange-600">El Alma</span> (Hero Section)</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <input placeholder="Título Línea 1" defaultValue={restaurant?.landing_page_config?.hero?.title_part1 || ''} onBlur={(e) => { const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, title_part1: e.target.value } }; updateRestaurant({ landing_page_config: conf }) }} className="w-full h-16 bg-white border-2 border-slate-100 rounded-2xl px-6 text-lg font-black uppercase italic tracking-tighter outline-none focus:border-orange-500 transition-all" />
                                        <input placeholder="Título Línea 2" defaultValue={restaurant?.landing_page_config?.hero?.title_part2 || ''} onBlur={(e) => { const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, title_part2: e.target.value } }; updateRestaurant({ landing_page_config: conf }) }} className="w-full h-16 bg-white border-2 border-slate-100 rounded-2xl px-6 text-lg font-black uppercase italic tracking-tighter outline-none focus:border-orange-500 transition-all" />
                                    </div>
                                    <textarea rows={3} placeholder="Eslogan..." defaultValue={restaurant?.landing_page_config?.hero?.tagline || ''} onBlur={(e) => { const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, tagline: e.target.value } }; updateRestaurant({ landing_page_config: conf }) }} className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium outline-none focus:border-orange-500 transition-all italic" />

                                    <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] space-y-6">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest">Atmósfera Visual</p>
                                            <div className="flex bg-white p-1 rounded-xl border">
                                                <button onClick={() => { const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, media_type: 'image' } }; updateRestaurant({ landing_page_config: conf }) }} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase italic transition-all", restaurant?.landing_page_config?.hero?.media_type !== 'video' ? "bg-slate-900 text-white" : "text-slate-400")}>IMAGEN</button>
                                                <button onClick={() => { const conf = { ...restaurant.landing_page_config, hero: { ...restaurant.landing_page_config.hero, media_type: 'video' } }; updateRestaurant({ landing_page_config: conf }) }} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase italic transition-all", restaurant?.landing_page_config?.hero?.media_type === 'video' ? "bg-slate-900 text-white" : "text-slate-400")}>VIDEO</button>
                                            </div>
                                        </div>
                                        <input placeholder="Link de imagen/video..." defaultValue={restaurant?.landing_page_config?.hero?.image_url || ''} onBlur={(e) => { const currentConfig = restaurant.landing_page_config || {}; const hero = currentConfig.hero || {}; const conf = { ...currentConfig, hero: { ...hero, image_url: e.target.value } }; updateRestaurant({ landing_page_config: conf }) }} className="w-full bg-white border-2 border-dashed rounded-3xl p-4 text-xs font-bold focus:border-orange-500 transition-all outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between px-8 py-4 bg-white/40 backdrop-blur-md rounded-[2rem] border-2 border-slate-100 shadow-xl">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Live Preview</h3>
                            <div className="flex bg-slate-100 p-1 rounded-2xl gap-2">
                                <button onClick={() => setPreviewDevice('mobile')} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", previewDevice === 'mobile' ? "bg-white text-slate-900 shadow-md" : "text-slate-400")}><Smartphone className="w-5 h-5" /></button>
                                <button onClick={() => setPreviewDevice('desktop')} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", previewDevice === 'desktop' ? "bg-white text-slate-900 shadow-md" : "text-slate-400")}><Globe className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className={cn("relative mx-auto transition-all duration-700 ease-in-out group", previewDevice === 'mobile' ? "bg-slate-900 rounded-[3rem] p-4 shadow-2xl aspect-[9/19] max-w-[320px] border-[10px] border-slate-800" : "bg-slate-900 rounded-[2rem] p-3 shadow-2xl w-full aspect-[4/3] border-[10px] border-slate-800")}>
                            {previewDevice === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-30" />}
                            <div className={cn("h-full overflow-hidden flex flex-col relative z-20 rounded-[2rem] no-scrollbar overflow-y-auto", restaurant?.landing_page_config?.brand_mood?.style === 'noir' ? "bg-slate-950 text-white" : "bg-white text-slate-900")}>
                                <div className="p-8 space-y-4">
                                    <p className="text-[10px] font-black text-white uppercase italic tracking-tighter leading-none">{restaurant?.name || 'JAMALI OS'}</p>
                                    <h5 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{restaurant?.landing_page_config?.hero?.title_part1 || 'SABORES'} <br /><span className="text-orange-600">{restaurant?.landing_page_config?.hero?.title_part2 || 'PREMIUM'}</span></h5>
                                    <p className="text-[7px] font-black text-white/50 uppercase tracking-[0.3em] italic mb-1">/{restaurant?.subdomain || 'local'}</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{restaurant?.landing_page_config?.hero?.tagline || 'GASTRONOMIA CON ALMA'}</p>
                                    <div className="flex gap-2 pt-4">
                                        <button className="h-10 px-6 bg-orange-600 text-white rounded-xl text-[8px] font-black uppercase italic tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-600/20">VER CARTA</button>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 gap-4 opacity-30">
                                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODALS */}
                {showSEOModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSEOModal(false)} />
                        <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Google <span className="text-orange-600">SEO</span></h3>
                            <div className="space-y-6">
                                <input placeholder="Título SEO" defaultValue={(restaurant as any)?.custom_seo_title} onBlur={(e) => updateRestaurant({ custom_seo_title: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-4 text-sm font-bold" />
                                <textarea placeholder="Descripción SEO" defaultValue={(restaurant as any)?.custom_seo_description} onBlur={(e) => updateRestaurant({ custom_seo_description: e.target.value })} rows={4} className="w-full bg-slate-50 border rounded-xl p-4 text-sm font-bold resize-none" />
                                <Button onClick={() => setShowSEOModal(false)} className="w-full h-14 bg-slate-900 rounded-2xl font-black italic tracking-widest text-xs">GUARDAR Y CERRAR</Button>
                            </div>
                        </div>
                    </div>
                )}

                {showHoursModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHoursModal(false)} />
                        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Horarios <span className="text-blue-600">Online</span></h3>
                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
                                {['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'].map((day) => {
                                    const config = (restaurant as any)?.online_hours_config?.[day] || { is_open: true, open_time: '08:00', close_time: '22:00' };
                                    return (
                                        <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <Switch checked={config.is_open} onCheckedChange={(val) => { const newConfig = { ...(restaurant as any)?.online_hours_config, [day]: { ...config, is_open: val } }; updateRestaurant({ online_hours_config: newConfig }); }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{day}</span>
                                            </div>
                                            {config.is_open && (
                                                <div className="flex items-center gap-2">
                                                    <input type="time" value={config.open_time} onChange={(e) => { const newConfig = { ...(restaurant as any)?.online_hours_config, [day]: { ...config, open_time: e.target.value } }; updateRestaurant({ online_hours_config: newConfig }); }} className="bg-white border rounded-xl px-3 py-2 text-[10px] font-bold" />
                                                    <span className="text-[8px] font-black text-slate-300">A</span>
                                                    <input type="time" value={config.close_time} onChange={(e) => { const newConfig = { ...(restaurant as any)?.online_hours_config, [day]: { ...config, close_time: e.target.value } }; updateRestaurant({ online_hours_config: newConfig }); }} className="bg-white border rounded-xl px-3 py-2 text-[10px] font-bold" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <Button onClick={() => setShowHoursModal(false)} className="w-full h-14 bg-slate-900 rounded-2xl mt-6 font-black italic tracking-widest text-xs">LISTO</Button>
                        </div>
                    </div>
                )}

            </div>

            <style jsx global>{`
                @keyframes premium-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); transform: scale(1); }
                    70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); transform: scale(1.1); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); transform: scale(1); }
                }
                .premium-whatsapp-pulse { animation: premium-pulse 2s infinite ease-in-out; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
