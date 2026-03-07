"use client"

import { Activity, ShieldCheck } from "lucide-react"

export function GlobalMetric() {
    return (
        <div className="p-12 bg-foreground rounded-[4.5rem] text-background flex flex-col xl:flex-row items-center justify-between shadow-3xl group/metric relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/metric:opacity-100 transition-opacity" />
            <div className="flex items-center gap-12 relative z-10">
                <div className="w-24 h-24 rounded-[2.5rem] bg-background/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-3xl group-hover/metric:rotate-12 transition-transform duration-500">
                    <Activity className="w-12 h-12 text-primary drop-shadow-[0_0_20px_rgba(255,77,0,0.6)]" />
                </div>
                <div className="space-y-3 text-center xl:text-left">
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Master Fleet Status</h4>
                    <p className="text-[11px] text-background/40 font-black uppercase tracking-[0.5em] italic leading-none">
                        SYSTEM v8.42 • KERNEL OPTIMIZED FOR REAL-TIME LOGISTICS TRACKING
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-16 mt-12 xl:mt-0 relative z-10">
                <div className="text-center xl:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-1 italic">Fleet Utilization</p>
                    <p className="text-3xl font-black italic tracking-tighter text-emerald-500">94.2% ACTIVE</p>
                </div>
                <div className="text-center xl:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-1 italic">Avg. Delivery</p>
                    <p className="text-3xl font-black italic tracking-tighter text-white">28.4 MINS</p>
                </div>
                <div className="text-center xl:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 mb-1 italic">Security Hub</p>
                    <p className="text-3xl font-black italic tracking-tighter text-primary flex items-center gap-4">
                        AES-256 <ShieldCheck className="w-8 h-8" />
                    </p>
                </div>
            </div>
        </div>
    )
}
