import { Database, Signal, HardDrive, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { SystemHealth } from "./types"

interface InfrastructureVitalSignsProps {
    health: SystemHealth
}

export function InfrastructureVitalSigns({ health }: InfrastructureVitalSignsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
                { label: 'Cloud Engine', value: 'OPTIMIZED', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'POSTGRES MASTER' },
                { label: 'Edge Latency', value: `${health.latency}ms`, icon: Signal, color: 'text-primary', bg: 'bg-primary/10', sub: 'LOW-LATENCY NÓD' },
                { label: 'Storage Mesh', value: '1.2 GB DISP', icon: HardDrive, color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'NVME VECTOR' },
                { label: 'Encryption Protocol', value: 'AES-256', icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10', sub: 'FIPS 140-2 READY' },
            ].map((sign, i) => (
                <div key={i} className="bg-card p-12 rounded-[4rem] border border-border shadow-3xl space-y-8 group hover:border-primary/40 transition-all duration-700 relative overflow-hidden active:scale-[0.98]">
                    <div className={cn("absolute -top-10 -right-10 p-12 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000", sign.color)}>
                        <sign.icon className="w-48 h-48" />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                        <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:bg-current group-hover:text-background", sign.bg, sign.color)}>
                            <sign.icon className="w-10 h-10" />
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 mb-1 block italic">{sign.sub}</span>
                            {i === 0 && <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] ml-auto" />}
                        </div>
                    </div>
                    <div className="relative z-10 space-y-2">
                        <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] italic leading-none">{sign.label}</p>
                        <p className={cn("text-4xl font-black italic uppercase tracking-tighter leading-none whitespace-nowrap drop-shadow-sm", sign.color)}>
                            {sign.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
