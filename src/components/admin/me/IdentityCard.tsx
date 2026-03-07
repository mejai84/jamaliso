"use client"

import { User, ShieldCheck, History, Zap } from "lucide-react"

interface IdentityCardProps {
    fullName?: string
    role?: string
    id?: string
}

export function IdentityCard({ fullName, role, id }: IdentityCardProps) {
    return (
        <div className="relative overflow-hidden rounded-[4rem] bg-card border border-border p-10 md:p-14 shadow-3xl group transition-all duration-700 hover:border-primary/20 font-sans">
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/5 via-primary/[0.02] to-transparent pointer-events-none group-hover:from-primary/10 transition-all duration-1000" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                <div className="relative group/avatar">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-0 group-hover/avatar:scale-110 transition-transform duration-700" />
                    <div className="w-32 h-32 rounded-full bg-card border-[6px] border-primary/20 shadow-2xl flex items-center justify-center text-5xl font-black text-primary italic relative z-10 overflow-hidden group-hover/avatar:border-primary transition-all duration-500">
                        {fullName?.charAt(0) || <User className="w-12 h-12" />}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-card flex items-center justify-center text-background shadow-xl scale-0 group-hover/avatar:scale-100 transition-transform duration-500 delay-100">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground italic leading-none group-hover:text-primary transition-colors">
                                {fullName || 'Operador Central'}
                            </h1>
                            <span className="px-5 py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/20 italic">
                                {role || 'K-USER'}
                            </span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3 opacity-40">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] font-mono italic">NODE-ID: {id?.slice(0, 12).toUpperCase() || 'UNKNOWN'}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="bg-muted px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter text-muted-foreground italic border border-border/50 flex items-center gap-2">
                            <History className="w-3.5 h-3.5" />
                            ÚLTIMA CONEXIÓN: <span className="text-foreground">HOY, ONLINE</span>
                        </div>
                        <div className="bg-muted px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter text-muted-foreground italic border border-border/50 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                            STATUS: <span className="text-emerald-500">OPERATIVO ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
