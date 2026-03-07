"use client"

import { Bike, Phone, Award, Briefcase, Truck, ChevronRight, Ban, CheckCircle, Settings, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Driver } from "@/app/admin/drivers/types"

interface DriversGridProps {
    drivers: Driver[]
    loading: boolean
    onToggleStatus: (driverId: string, currentStatus: boolean) => void
}

export function DriversGrid({ drivers, loading, onToggleStatus }: DriversGridProps) {
    if (loading) return (
        <div className="py-32 flex flex-col items-center justify-center gap-8 font-sans">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic animate-pulse">Sincronizando Estado de Flota...</p>
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 font-sans">
            {drivers.map(driver => (
                <div key={driver.id} className="bg-card border border-border rounded-[4.5rem] p-12 shadow-3xl hover:border-primary/40 transition-all duration-700 group relative overflow-hidden active:scale-[0.98]">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-1000">
                        <Bike className="w-48 h-48" />
                    </div>

                    {/* STATUS INDICATOR */}
                    <div className="absolute top-10 left-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/40 border border-border/50 text-[8px] font-black uppercase italic tracking-widest relative z-10">
                        <div className={cn("w-2 h-2 rounded-full", driver.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                        {driver.is_active ? "SERVICIO ACTIVO" : "FUERA DE ÓRBITA"}
                    </div>

                    <div className="mt-12 flex items-center gap-8 relative z-10">
                        <div className="relative group/avatar">
                            <div className="absolute inset-0 bg-primary blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                            <div className="w-24 h-24 rounded-[2rem] bg-muted border-4 border-card flex items-center justify-center shadow-2xl overflow-hidden relative z-10">
                                <Bike className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors leading-none">{driver.full_name}</h3>
                            <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">
                                <Phone className="w-3.5 h-3.5" /> {driver.phone}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-12 relative z-10">
                        <div className="p-6 bg-muted/20 border border-border/50 rounded-[2rem] flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-colors">
                            <Award className="w-6 h-6 text-amber-500" />
                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">Rating</p>
                            <p className="text-xl font-black italic text-foreground tracking-tighter leading-none">{driver.rating || 5.0}</p>
                        </div>
                        <div className="p-6 bg-muted/20 border border-border/50 rounded-[2rem] flex flex-col items-center justify-center gap-2 group-hover:bg-primary/5 transition-colors">
                            <Briefcase className="w-6 h-6 text-primary" />
                            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic leading-none">Entregas</p>
                            <p className="text-xl font-black italic text-foreground tracking-tighter leading-none">{driver.total_deliveries}</p>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-foreground rounded-[2rem] shadow-2xl relative overflow-hidden group/pre">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/pre:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <Truck className="w-6 h-6 text-primary" />
                                <div className="text-left">
                                    <p className="font-black italic text-background uppercase tracking-tight leading-none text-xs">{driver.vehicle_type === 'motorcycle' ? 'MOTO' : driver.vehicle_type.toUpperCase()}</p>
                                    <p className="text-[8px] font-black text-background/30 uppercase tracking-[0.2em] italic">PLACA: {driver.license_plate || 'SIN ASIGNAR'}</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                                <ChevronRight className="w-4 h-4 text-white/40" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4 relative z-10">
                        <Button
                            variant="outline"
                            className={cn(
                                "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase italic tracking-[0.3em] transition-all active:scale-95",
                                driver.is_active ? "border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" : "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                            )}
                            onClick={() => onToggleStatus(driver.id, driver.is_active)}
                        >
                            {driver.is_active ? (
                                <>
                                    <Ban className="w-4 h-4 mr-3" /> SUSPENDER
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-3" /> ACTIVAR
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-muted border border-border/50 hover:bg-primary hover:text-white transition-all">
                            <Settings className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            ))}

            {drivers.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center gap-8 bg-card/40 rounded-[4.5rem] border-4 border-dashed border-border/50">
                    <Search className="w-20 h-20 text-muted-foreground/10" />
                    <div className="text-center space-y-3">
                        <p className="text-3xl font-black italic uppercase tracking-tighter text-muted-foreground/40">Sin Registros en Cluster</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">LA BÚSQUEDA NO HA PRODUCIDO RESULTADOS EN LA FLOTA.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
