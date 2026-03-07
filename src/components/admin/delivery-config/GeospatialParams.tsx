"use client"

import { MapPin, Navigation, Activity, Briefcase, Phone } from "lucide-react"
import { DeliverySettings } from "@/app/admin/delivery-config/types"

interface GeospatialParamsProps {
    settings: DeliverySettings
    onUpdate: (key: keyof DeliverySettings, value: any) => void
}

export function GeospatialParams({ settings, onUpdate }: GeospatialParamsProps) {
    return (
        <div className="bg-card border border-border rounded-[4.5rem] p-12 md:p-16 shadow-3xl relative overflow-hidden group/geo transition-all hover:border-primary/20 font-sans">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/geo:scale-110 transition-all duration-1000">
                <Navigation className="w-[500px] h-[500px]" />
            </div>

            <div className="flex items-center gap-6 mb-16 border-l-8 border-primary px-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-xl">
                    <MapPin className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Parámetros Geo</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">GEOSPATIAL SPHERE CONTROL</p>
                </div>
            </div>

            <div className="space-y-12 relative z-10">
                <div className="space-y-6 group/input">
                    <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3 leading-none">
                        <Activity className="w-4 h-4 text-blue-500" /> RADIO MÁXIMO DE OPERACIÓN (KM)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            value={settings.max_delivery_radius_km}
                            onChange={(e) => onUpdate('max_delivery_radius_km', parseFloat(e.target.value) || 3)}
                            className="w-full h-24 bg-muted/30 border-4 border-blue-500/10 rounded-[3rem] px-12 outline-none focus:border-blue-500 transition-all font-black text-6xl italic text-blue-500 text-center shadow-inner tracking-tighter"
                            placeholder="0"
                        />
                        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-500/20 italic">KM</span>
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] text-center italic">EL SISTEMA RECHAZARÁ AUTOMÁTICAMENTE ENTREGAS FUERA DE ESTA ÓRBITA GEOGRÁFICA.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic leading-none flex items-center gap-3">
                            <Briefcase className="w-4 h-4" /> DIRECCIÓN CORE HUB
                        </label>
                        <input
                            type="text"
                            value={settings.restaurant_address}
                            onChange={(e) => onUpdate('restaurant_address', e.target.value)}
                            className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-semibold text-sm italic text-foreground tracking-tight shadow-inner"
                            placeholder="ESTABLECIMIENTO FÍSICO"
                        />
                    </div>

                    <div className="space-y-4 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic leading-none flex items-center gap-3">
                            <Phone className="w-4 h-4" /> CONTACTO LOGÍSTICA
                        </label>
                        <input
                            type="tel"
                            value={settings.restaurant_phone}
                            onChange={(e) => onUpdate('restaurant_phone', e.target.value)}
                            className="w-full h-18 bg-muted/30 border border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-xl italic text-foreground tracking-tighter shadow-inner"
                            placeholder="+57 300 000 0000"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
