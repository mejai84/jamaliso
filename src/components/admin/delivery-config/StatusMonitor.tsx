"use client"

import { Truck, MapPin, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { DeliverySettings } from "@/app/admin/delivery-config/types"

interface StatusMonitorProps {
    settings: DeliverySettings
    onUpdate: (key: keyof DeliverySettings, value: any) => void
}

export function StatusMonitor({ settings, onUpdate }: StatusMonitorProps) {
    return (
        <div className="bg-card border border-border rounded-[4.5rem] p-12 md:p-16 shadow-3xl relative overflow-hidden group/mod font-sans">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/mod:scale-110 transition-all duration-1000">
                <Package className="w-[500px] h-[500px]" />
            </div>

            <div className="flex items-center gap-6 mb-16 border-l-8 border-primary px-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl">
                    <Truck className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Nodos de Servicio</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">ACTIVE CHANNELS MONITOR</p>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {[
                    { id: 'delivery_active', label: 'Protocolo de Domicilios', sub: 'DESCRIPCIÓN: ENTREGAS EXTERNAS VÍA MOTORIZADOS', icon: Truck },
                    { id: 'pickup_active', label: 'Protocolo de Recogida', sub: 'DESCRIPCIÓN: CLIENTE RETIRA EN PUNTO DE VENTA', icon: MapPin },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => onUpdate(item.id as any, !settings[item.id as keyof DeliverySettings])}
                        className={cn(
                            "w-full p-10 rounded-[3rem] border-4 flex items-center justify-between transition-all group/switch shadow-xl relative overflow-hidden",
                            settings[item.id as keyof DeliverySettings]
                                ? "bg-primary/5 border-primary text-primary"
                                : "bg-muted/40 border-border/50 text-muted-foreground/30"
                        )}
                    >
                        <div className="flex items-center gap-8 relative z-10">
                            <div className={cn(
                                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl group-hover/switch:scale-110 group-hover/switch:rotate-6",
                                settings[item.id as keyof DeliverySettings] ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                            )}>
                                <item.icon className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <span className="text-xl font-black uppercase tracking-tighter italic block leading-none mb-2 transition-colors group-hover/switch:text-foreground">{item.label}</span>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{item.sub}</p>
                            </div>
                        </div>
                        <div className={cn(
                            "w-16 h-8 rounded-full relative transition-all border-2 border-transparent relative z-10",
                            settings[item.id as keyof DeliverySettings] ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted-foreground/10"
                        )}>
                            <div className={cn(
                                "w-6 h-6 rounded-full bg-white absolute top-0.5 shadow-xl transition-all duration-500",
                                settings[item.id as keyof DeliverySettings] ? "translate-x-9" : "translate-x-1"
                            )} />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-current opacity-5" />
                    </button>
                ))}
            </div>
        </div>
    )
}
