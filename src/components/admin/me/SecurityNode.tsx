"use client"

import { Calendar, Fingerprint, Lock, Loader2, ChevronRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SecurityNodeProps {
    newPin: string
    setNewPin: (pin: string) => void
    updatingPin: boolean
    hasPin: boolean
    onUpdatePin: () => void
    onSignOut: () => void
}

export function SecurityNode({ newPin, setNewPin, updatingPin, hasPin, onUpdatePin, onSignOut }: SecurityNodeProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-sans">
            {/* SCHEDULE NODE */}
            <div className="p-10 rounded-[4rem] bg-card border border-border space-y-8 shadow-2xl relative overflow-hidden group/sched">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -mr-12 -mt-12 group-hover/sched:scale-110 transition-transform duration-1000">
                    <Calendar className="w-32 h-32" />
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-6 relative z-10">
                    <h3 className="text-sm font-black uppercase tracking-[0.5em] text-foreground flex items-center gap-3 italic">
                        <Calendar className="w-5 h-5 text-primary" /> Cronología Operativa
                    </h3>
                    <div className="px-4 py-1.5 bg-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary italic border border-primary/20">Semana Current</div>
                </div>
                <div className="space-y-4 relative z-10">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-muted/40 border border-border/50 hover:bg-card hover:border-primary/20 transition-all duration-300 group/day shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className="font-black text-foreground text-3xl italic tracking-tighter opacity-20 group-hover/day:opacity-100 group-hover/day:text-primary transition-all">0{i + 15}</div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">FEBRERO</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase italic tracking-widest leading-none">MIÉRCOLES — OPERACIÓN BASE</div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-card border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] italic shadow-inner group-hover/day:border-primary/20 group-hover/day:text-primary transition-all">
                                14:00 • 22:00
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECURITY PROTOCOL NODE */}
            <div className="p-10 rounded-[4rem] bg-foreground text-background space-y-8 shadow-3xl relative overflow-hidden group/sec">
                <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none -mr-20 -mt-20 group-hover/sec:scale-110 transition-transform duration-1000">
                    <Fingerprint className="w-48 h-48" />
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 text-primary">
                        <Lock className="w-5 h-5" />
                        <h3 className="text-sm font-black uppercase tracking-[0.5em] italic">Protocolo de Seguridad</h3>
                    </div>
                    <p className="text-xs text-background/60 font-medium leading-relaxed italic uppercase tracking-tight max-w-[80%]">
                        GESTIÓN DE CREDENCIALES NIVEL 4. EL PIN DE ACCESO ES REQUERIDO PARA LA VALIDACIÓN DE OPERATIVOS EN SISTEMA POS.
                    </p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 ml-6 italic">PIN de Operador (4 DIGIT)</label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="text"
                                    name="jamali-waiter-pin-secure"
                                    maxLength={4}
                                    placeholder={hasPin ? "••••" : "VACIO"}
                                    autoComplete="off"
                                    style={{ WebkitTextSecurity: 'disc' } as any}
                                    className="w-full h-18 bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 outline-none focus:border-primary transition-all font-black text-center text-3xl italic tracking-[0.8em] text-white shadow-inner placeholder:text-white/10"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                            <Button
                                disabled={updatingPin || newPin.length !== 4}
                                onClick={onUpdatePin}
                                className="h-18 px-10 bg-primary text-primary-foreground rounded-[2rem] font-black uppercase italic text-[11px] tracking-[0.2em] border-none shadow-3xl hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-20"
                            >
                                {updatingPin ? <Loader2 className="w-6 h-6 animate-spin" /> : 'INDEXAR'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="ghost" className="h-16 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase italic tracking-[0.2em] text-[10px] rounded-2xl transition-all gap-4">
                            MODIFICAR PASS <ChevronRight className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-16 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase italic tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-rose-900/20 group/out gap-4"
                            onClick={onSignOut}
                        >
                            ABORTAR SESIÓN <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
