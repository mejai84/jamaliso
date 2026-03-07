"use client"

import { Clock } from "lucide-react"
import { DeliverySettings } from "@/app/admin/delivery-config/types"

interface ChronosMatrixProps {
    settings: DeliverySettings
    onUpdate: (key: keyof DeliverySettings, value: any) => void
}

export function ChronosMatrix({ settings, onUpdate }: ChronosMatrixProps) {
    return (
        <div className="bg-card border border-border rounded-[4.5rem] p-12 md:p-16 shadow-3xl relative overflow-hidden group/clock transition-all hover:border-primary/20 font-sans">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/clock:scale-110 transition-all duration-1000 -rotate-90">
                <Clock className="w-[500px] h-[500px]" />
            </div>

            <div className="flex items-center gap-6 mb-16 border-l-8 border-primary px-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl">
                    <Clock className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Matriz Chronos</h3>
                    <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic">ESTIMATED DISPATCH TIMES</p>
                </div>
            </div>

            <div className="space-y-12 relative z-10">
                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic leading-none">MÍNIMO (MIN)</label>
                        <input
                            type="number"
                            value={settings.estimated_delivery_time_min}
                            onChange={(e) => onUpdate('estimated_delivery_time_min', parseInt(e.target.value) || 30)}
                            className="w-full h-32 bg-muted/30 border-4 border-primary/10 rounded-[3rem] px-10 outline-none focus:border-primary transition-all font-black text-6xl italic text-foreground text-center shadow-inner tracking-tighter leading-none"
                        />
                    </div>
                    <div className="space-y-4 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic leading-none">MÁXIMO (MIN)</label>
                        <input
                            type="number"
                            value={settings.estimated_delivery_time_max}
                            onChange={(e) => onUpdate('estimated_delivery_time_max', parseInt(e.target.value) || 45)}
                            className="w-full h-32 bg-muted/30 border-4 border-primary/10 rounded-[3rem] px-10 outline-none focus:border-primary transition-all font-black text-6xl italic text-primary text-center shadow-inner tracking-tighter leading-none"
                        />
                    </div>
                </div>
                <div className="bg-primary/5 border-2 border-primary/20 rounded-[3rem] p-12 relative overflow-hidden group/precl">
                    <div className="absolute inset-0 bg-primary/[0.02] animate-pulse" />
                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-primary text-primary-foreground flex items-center justify-center shadow-2xl group-hover/precl:scale-110 transition-transform">
                            <Clock className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">PREVISUALIZACIÓN AL CLIENTE</p>
                            <p className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                {settings.estimated_delivery_time_min} - {settings.estimated_delivery_time_max} MINS
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
