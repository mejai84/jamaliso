import { ArrowLeft, Server, Globe, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function InfrastructureHeader() {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 border-b border-border/50 pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                <Link href="/admin/settings">
                    <Button variant="ghost" size="icon" className="h-20 w-20 rounded-[2.5rem] bg-card border border-border shadow-3xl hover:bg-muted active:scale-90 transition-all group overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ArrowLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform relative z-10" />
                    </Button>
                </Link>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-6xl md:text-7xl font-black italic tracking-[0.02em] uppercase leading-none text-foreground">CORE <span className="text-primary italic">INFRA</span></h1>
                        <div className="px-5 py-2 bg-primary/10 border-2 border-primary/20 rounded-[1.5rem] text-[11px] font-black text-primary tracking-[0.3em] italic uppercase shadow-xl animate-pulse flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            ELITE SaaS NODE ACTIVE
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.5em] italic flex items-center gap-4 opacity-60">
                            <Server className="w-5 h-5 text-primary" /> Diagnostics & Master Storage Protocol Hub
                        </p>
                        <div className="w-2 h-2 rounded-full bg-border" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.3em] italic">System v8.4.12-EST</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 bg-card border border-border p-6 rounded-[3rem] shadow-3xl">
                <div className="flex flex-col items-end px-10 border-r border-border/50 group/region">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic mb-1 group-hover/region:text-primary transition-colors">Cluster Region</p>
                    <p className="text-lg font-black italic text-foreground uppercase tracking-tighter flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary group-hover/region:rotate-12 transition-transform" /> AWS-US-EAST_G1
                    </p>
                </div>
                <div className="flex flex-col items-end group/uptime">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic mb-1 group-hover/uptime:text-emerald-500 transition-colors">Operational Uptime</p>
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <p className="text-lg font-black italic text-emerald-500 uppercase tracking-tighter">99.98% REAL-TIME</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
