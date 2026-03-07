import { Download, Wifi, BarChart3, Database, Layers, Loader2, Cpu as Processor, Lock, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InfrastructureBackupCenterProps {
    exporting: string | null
    handleExport: (id: string) => void
}

export function InfrastructureBackupCenter({ exporting, handleExport }: InfrastructureBackupCenterProps) {
    return (
        <div className="space-y-12 animate-in slide-in-from-left-12 duration-1000">
            <div className="flex items-center justify-between px-10">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground italic flex items-center gap-6">
                        <Download className="w-10 h-10 text-primary" /> Auditoría <span className="text-primary italic">Maestra</span>
                    </h2>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic pl-16">EXTRACCIÓN DE ACTIVOS CRÍTICOS (JSON)</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase italic">Linked</span>
                </div>
            </div>

            <div className="bg-card border border-border rounded-[4.5rem] overflow-hidden shadow-3xl relative group/node">
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/node:scale-110 transition-transform duration-1000 rotate-45">
                    <BarChart3 className="w-64 h-64" />
                </div>

                <div className="p-12 border-b border-border/50 bg-muted/20 relative z-10">
                    <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Database className="w-6 h-6" />
                        </div>
                        <p className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.3em] leading-loose italic">
                            PROTOCOLO DE RESPALDO: GENERA INSTANCIAS DE SEGURIDAD PARA LA PORTABILIDAD DE DATOS Y ANÁLISIS FORENSE OFF-SITE.
                        </p>
                    </div>
                </div>
                <div className="divide-y divide-border/50 relative z-10">
                    {[
                        { id: 'orders', label: 'Ventas y Transacciones Core', icon: Layers, capacity: '4.2 MB', color: 'text-primary' },
                        { id: 'products', label: 'Maestro de Inventario & Menú', icon: Processor, capacity: '1.8 MB', color: 'text-blue-500' },
                        { id: 'profiles', label: 'Directorio de Staff & Access', icon: Lock, capacity: '0.9 MB', color: 'text-amber-500' },
                        { id: 'inventory_movements', label: 'Historial de Logística (KMS)', icon: Activity, capacity: '12.4 MB', color: 'text-emerald-500' },
                    ].map(item => (
                        <div key={item.id} className="p-10 flex items-center justify-between hover:bg-muted/40 transition-all duration-500 group/item relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 w-1.5 bg-primary/0 group-hover/item:bg-primary transition-all" />
                            <div className="flex items-center gap-8">
                                <div className={cn(
                                    "w-16 h-16 rounded-[1.25rem] bg-muted border border-border/50 flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 shadow-inner",
                                    "group-hover/item:bg-background group-hover/item:text-primary"
                                )}>
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-lg font-black italic uppercase tracking-tighter text-foreground group-hover/item:text-primary transition-colors leading-none">{item.label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-muted rounded-lg text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">{item.id.toUpperCase()}</span>
                                        <div className="w-1 h-1 rounded-full bg-border" />
                                        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">{item.capacity} INDEXADOS • JSON MASTER</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-16 px-10 rounded-[1.5rem] border-border bg-background font-black text-[10px] uppercase italic tracking-[0.3em] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all gap-5 active:scale-90 shadow-2xl group/btn overflow-hidden relative"
                                onClick={() => handleExport(item.id)}
                                disabled={exporting === item.id}
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20" />
                                {exporting === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" />}
                                EXPORTAR
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-black/5 text-center">
                    <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.8em] italic">Jamali Infrastructure v8.1</p>
                </div>
            </div>
        </div>
    )
}
