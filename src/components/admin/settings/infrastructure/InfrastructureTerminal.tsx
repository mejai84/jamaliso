import { Terminal, RefreshCcw, Activity, AlertCircle, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function InfrastructureTerminal() {
    return (
        <>
            <div className="flex items-center justify-between px-10">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground italic flex items-center gap-6">
                        <Terminal className="w-10 h-10 text-primary" /> Kernel <span className="text-primary italic">Runtime</span>
                    </h2>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic pl-16">MONITOR DE BAJO NIVEL (SYSTEM LOGS)</p>
                </div>
                <Button variant="ghost" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary">
                    <RefreshCcw className="w-5 h-5 active:rotate-180 transition-transform" />
                </Button>
            </div>

            <div className="bg-[#0a0a0b] rounded-[4.5rem] p-12 text-emerald-500 font-mono text-[11px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group/term min-h-[650px] flex flex-col mt-12 mb-12">
                <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover/term:scale-110 transition-transform duration-1000 rotate-12">
                    <Activity className="w-[500px] h-[500px] text-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-6 relative z-10 selection:bg-emerald-500/20 selection:text-emerald-400 flex-1">
                    <div className="flex items-center justify-between pb-6 border-b border-emerald-500/10">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                            <div className="space-y-0.5">
                                <span className="text-emerald-500 font-black italic tracking-widest text-[12px] block">JAMALI-OS_MASTER_NOD_01</span>
                                <span className="text-[8px] font-black text-emerald-500/30 uppercase tracking-[0.4em]">Secure Shell v9.42.1</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-emerald-500/40 uppercase font-black italic tracking-[0.2em] text-[10px] px-4 py-1.5 border border-emerald-500/20 rounded-full">ENCRYPTED_STREAMING</span>
                        </div>
                    </div>

                    <div className="space-y-5 pt-8 custom-scrollbar max-h-[400px] overflow-y-auto pr-6">
                        {[
                            { tag: 'CORE_KERNEL', msg: 'Sincronización exitosa con HSM Vault', status: 'OK', color: 'text-emerald-500' },
                            { tag: 'RLS_WATCHER', msg: 'Postgres Policies (RBAC) activas', status: 'SYNCD', color: 'text-emerald-500' },
                            { tag: 'EDGE_HUB', msg: 'Buffer de eventos maestros procesado', status: 'CLEAN', color: 'text-emerald-500' },
                            { tag: 'AUTH_NATIVE', msg: 'Verificación de sesión JWT_GLOBAL', status: 'VALID', color: 'text-blue-500' },
                            { tag: 'G_COLLECTOR', msg: 'Garbage collect on Table(orders) completed', status: 'DONE', color: 'text-emerald-500' },
                            { tag: 'NET_WORKER', msg: 'Optimizando throughput de red (US-EAST)', status: 'FAST', color: 'text-emerald-500' },
                            { tag: 'LOG_DISPATCH', msg: 'Transmitiendo logs a cluster de análisis', status: 'LIVE', color: 'text-primary' },
                            { tag: 'SYSTEM_VM', msg: 'Memory usage within elite parameters (12%)', status: 'ICE', color: 'text-emerald-400' },
                        ].map((log, lidx) => (
                            <div key={lidx} className="flex justify-between items-center group/log animate-in slide-in-from-bottom-2" style={{ animationDelay: `${lidx * 100}ms` }}>
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-500/20 font-black">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                    <span className="text-emerald-500/40 font-black">[{log.tag}]</span>
                                    <span className="text-emerald-500/80 font-bold group-hover/log:text-emerald-400 transition-colors uppercase tracking-tight">{log.msg}</span>
                                </div>
                                <span className={cn("font-black italic tracking-widest text-[10px] px-3 py-0.5 rounded-lg border",
                                    log.color === 'text-primary' ? "bg-primary/10 border-primary text-primary" : "bg-emerald-500/10 border-emerald-500/20"
                                )}>{log.status}</span>
                            </div>
                        ))}

                        <div className="pt-10 mt-10 border-t border-emerald-500/10">
                            <div className="bg-primary/5 rounded-[3rem] p-10 border-2 border-dashed border-primary/20 relative group/alert transition-all hover:bg-primary/10 overflow-hidden">
                                <div className="absolute inset-0 bg-primary/[0.02] animate-pulse" />
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
                                            <AlertCircle className="w-7 h-7" />
                                        </div>
                                        <p className="text-primary font-black italic text-sm uppercase tracking-[0.4em] leading-none">
                                            Protocolo de Alerta <span className="opacity-40">#S4412</span>
                                        </p>
                                    </div>
                                    <ShieldAlert className="w-8 h-8 text-primary opacity-20" />
                                </div>
                                <p className="text-primary/70 leading-relaxed italic uppercase font-black text-[11px] tracking-tight relative z-10">
                                    DETECCIÓN DE LATENCIA ANÓMALA EN NODO <span className="text-white bg-primary px-2 rounded">DB_POSTGRES_MASTER</span>.
                                    EL KERNEL HA INICIADO PROTOCOLO DE RE-APROVISIONAMIENTO DE CONEXIONES.
                                    SISTEMA ESTABLE BAJO CARGA ARTIFICIAL.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 border-t border-white/5 pt-8 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                    <span>Root Access: AUTHORIZED</span>
                    <div className="flex items-center gap-4">
                        <span className="animate-pulse">STREAMING_LIVE</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </div>
                </div>
            </div>
        </>
    )
}
