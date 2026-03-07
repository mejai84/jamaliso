"use client"

import { DeliverySettings } from "@/app/admin/delivery-config/types"
import { Truck, Navigation, Settings2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Props {
    settings: DeliverySettings
    onUpdate: (key: keyof DeliverySettings, value: any) => void
}

export function LogisticsProvider({ settings, onUpdate }: Props) {
    const isJamaliFleet = !settings.active_provider || settings.active_provider === 'JAMALI_FLEET'
    const isRappi = settings.active_provider === 'RAPPI'
    const isUber = settings.active_provider === 'UBER_EATS'

    return (
        <div className="bg-card border border-border p-10 xl:p-12 rounded-[3.5rem] space-y-10 relative overflow-hidden group shadow-2xl">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-colors duration-700 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                    <Truck className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">
                        Operador Logístico
                    </h2>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1">
                        Fleet Propia vs Plataformas
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <button
                        onClick={() => onUpdate('active_provider', 'JAMALI_FLEET')}
                        className={`p-6 rounded-3xl border text-left transition-all ${isJamaliFleet
                            ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10'
                            : 'bg-muted/30 border-border hover:bg-muted/50'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${isJamaliFleet ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                <Navigation className="w-6 h-6" />
                            </div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${isJamaliFleet ? 'text-primary' : 'text-foreground'}`}>
                                Flota Propia
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Usa tu propio equipo de repartidores registrados en JAMALI OS. Tú controlas rutas y tiempos.
                        </p>
                    </button>

                    <button
                        onClick={() => onUpdate('active_provider', 'RAPPI')}
                        className={`p-6 rounded-3xl border text-left transition-all ${isRappi
                            ? 'bg-[#FF441F]/5 border-[#FF441F] shadow-lg shadow-[#FF441F]/10'
                            : 'bg-muted/30 border-border hover:bg-muted/50'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${isRappi ? 'bg-[#FF441F] text-white' : 'bg-muted text-muted-foreground'}`}>
                                <Settings2 className="w-6 h-6" />
                            </div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${isRappi ? 'text-[#FF441F]' : 'text-foreground'}`}>
                                Rappi
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Conexión vía API con Partners de Rappi. Requiere Store ID autorizado por Rappi Latam.
                        </p>
                    </button>

                    <button
                        onClick={() => onUpdate('active_provider', 'UBER_EATS')}
                        className={`p-6 rounded-3xl border text-left transition-all ${isUber
                            ? 'bg-[#06C167]/5 border-[#06C167] shadow-lg shadow-[#06C167]/10'
                            : 'bg-muted/30 border-border hover:bg-muted/50'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${isUber ? 'bg-[#06C167] text-white' : 'bg-muted text-muted-foreground'}`}>
                                <Settings2 className="w-6 h-6" />
                            </div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${isUber ? 'text-[#06C167]' : 'text-foreground'}`}>
                                Uber Eats
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Integración con Uber Direct o Uber Eats API. Las tarifas dinámicas son calculadas por el operador.
                        </p>
                    </button>
                </div>

                {isRappi && (
                    <div className="p-8 bg-[#FF441F]/5 border border-[#FF441F]/20 rounded-3xl space-y-6 animate-in slide-in-from-top-4 fade-in">
                        <h4 className="font-black text-[#FF441F] text-sm uppercase tracking-widest">Credenciales Rappi REST API</h4>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Store ID (Rappi)</label>
                            <Input
                                value={settings.rappi_store_id || ""}
                                onChange={(e) => onUpdate('rappi_store_id', e.target.value)}
                                placeholder="Ej: store_COL_bog_12345"
                                className="mt-2 h-14 bg-background border-border rounded-2xl px-6 font-mono text-sm focus-visible:ring-[#FF441F]"
                            />
                        </div>
                    </div>
                )}

                {isUber && (
                    <div className="p-8 bg-[#06C167]/5 border border-[#06C167]/20 rounded-3xl space-y-6 animate-in slide-in-from-top-4 fade-in">
                        <h4 className="font-black text-[#06C167] text-sm uppercase tracking-widest">Credenciales Uber Eats API</h4>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Store UUID (Uber)</label>
                            <Input
                                value={settings.uber_store_id || ""}
                                onChange={(e) => onUpdate('uber_store_id', e.target.value)}
                                placeholder="Ej: d8a7b9c1-4e2a-4bcd-89f0-..."
                                className="mt-2 h-14 bg-background border-border rounded-2xl px-6 font-mono text-sm focus-visible:ring-[#06C167]"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
