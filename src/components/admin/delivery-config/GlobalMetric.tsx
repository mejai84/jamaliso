"use client"

import { Activity } from "lucide-react"

export function GlobalMetric() {
    return (
        <div className="p-10 bg-foreground rounded-[4rem] text-background flex flex-col md:flex-row items-center justify-between shadow-3xl group/metric relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/metric:opacity-100 transition-opacity" />
            <div className="flex items-center gap-10 relative z-10">
                <div className="w-20 h-20 rounded-[2rem] bg-background/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl group-hover/metric:rotate-12 transition-transform duration-500">
                    <Activity className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,77,0,0.6)]" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-primary leading-none">Master Dispatch Status</h4>
                    <p className="text-[10px] text-background/40 font-black uppercase tracking-[0.4em] italic leading-none">
                        SYSTEM v8.42 • KERNEL OPTIMIZED FOR LOW LATENCY DISPATCH
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-12 mt-8 md:mt-0 relative z-10">
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-1 italic">Throughput</p>
                    <p className="text-2xl font-black italic tracking-tighter text-emerald-500 leading-none">99.8% STABLE</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mb-1 italic">Node Region</p>
                    <p className="text-2xl font-black italic tracking-tighter text-white leading-none">US-EAST_G1</p>
                </div>
            </div>
        </div>
    )
}
