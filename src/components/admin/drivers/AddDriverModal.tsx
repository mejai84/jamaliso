"use client"

import { UserPlus, X, Signal, ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PotentialDriver, Driver } from "@/app/admin/drivers/types"

interface AddDriverModalProps {
    users: PotentialDriver[]
    newDriver: Partial<Driver>
    setNewDriver: (driver: Partial<Driver>) => void
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
}

export function AddDriverModal({ users, newDriver, setNewDriver, onClose, onSubmit }: AddDriverModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300 font-sans">
            <div className="bg-card border-4 border-primary/20 rounded-[4rem] w-full max-w-2xl p-16 shadow-[0_0_100px_rgba(255,77,0,0.1)] relative overflow-hidden group/modal animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none -mr-16 -mt-16 group-hover/modal:scale-110 transition-transform duration-1000 rotate-12">
                    <UserPlus className="w-[400px] h-[400px]" />
                </div>

                <div className="flex justify-between items-start mb-16 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-3xl">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-foreground">Alta de <span className="text-primary italic">Repartidor</span></h2>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic pl-20">ESTABLECER NUEVO NODO DE DISTRIBUCIÓN</p>
                    </div>
                    <Button variant="ghost" className="h-16 w-16 rounded-[1.5rem] bg-muted/40 hover:bg-primary hover:text-white transition-all active:scale-90" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>
                </div>

                <form onSubmit={onSubmit} className="space-y-10 relative z-10">
                    <div className="space-y-4 group/input">
                        <label className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.5em] ml-10 italic flex items-center gap-3">
                            <Signal className="w-4 h-4 text-primary" /> VINCULAR PERFIL DE USUARIO
                        </label>
                        <div className="relative group/sel">
                            <select
                                className="w-full h-20 bg-muted/30 border-4 border-border rounded-[2.5rem] px-10 outline-none focus:border-primary transition-all font-black text-lg italic text-foreground uppercase tracking-tighter appearance-none shadow-inner cursor-pointer"
                                onChange={(e) => {
                                    const user = users.find(u => u.id === e.target.value)
                                    if (user) {
                                        setNewDriver({
                                            ...newDriver,
                                            user_id: user.id,
                                            full_name: user.full_name,
                                            phone: user.phone || ''
                                        })
                                    }
                                }}
                            >
                                <option value="">-- SELECCIONAR DEL CLUSTER --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name} ({u.email?.split('@')[0]})</option>
                                ))}
                            </select>
                            <ArrowLeft className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 rotate-90 opacity-20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 group/input">
                            <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic">IDENTIFICADOR NOMINAL</label>
                            <input
                                className="w-full h-18 bg-muted/30 border-4 border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-xl italic text-foreground tracking-tighter shadow-inner uppercase"
                                required
                                value={newDriver.full_name || ''}
                                onChange={(e) => setNewDriver({ ...newDriver, full_name: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="space-y-4 group/input">
                            <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic">TERMINAL MÓVIL (LINK)</label>
                            <input
                                className="w-full h-18 bg-muted/30 border-4 border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-xl italic text-foreground tracking-tighter shadow-inner"
                                required
                                value={newDriver.phone || ''}
                                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                                placeholder="+57 300 000 0000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 group/input">
                            <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic">CATEGORÍA VEHÍCULO</label>
                            <div className="relative group/sel">
                                <select
                                    className="w-full h-18 bg-muted/30 border-4 border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-lg italic text-foreground uppercase tracking-tighter appearance-none shadow-inner cursor-pointer"
                                    value={newDriver.vehicle_type || 'motorcycle'}
                                    onChange={(e) => setNewDriver({ ...newDriver, vehicle_type: e.target.value })}
                                >
                                    <option value="motorcycle">MOTOCICLETA</option>
                                    <option value="bike">BICICLETA / E-BIKE</option>
                                    <option value="car">VECTOR AUTOMOTRIZ</option>
                                    <option value="foot">NODO PEATONAL</option>
                                </select>
                                <ArrowLeft className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 rotate-90 opacity-20" />
                            </div>
                        </div>
                        <div className="space-y-4 group/input">
                            <label className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] ml-10 italic">IDENTIFICADOR PLACA</label>
                            <input
                                className="w-full h-18 bg-muted/30 border-4 border-border rounded-[2rem] px-10 outline-none focus:border-primary transition-all font-black text-xl italic text-foreground tracking-tighter shadow-inner uppercase"
                                value={newDriver.license_plate || ''}
                                onChange={(e) => setNewDriver({ ...newDriver, license_plate: e.target.value.toUpperCase() })}
                                placeholder="HEX-000"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-24 bg-foreground text-background hover:bg-primary hover:text-white transition-all text-xl font-black uppercase tracking-[0.5em] italic rounded-[3rem] shadow-3xl group/btn overflow-hidden relative active:scale-95">
                        <div className="absolute inset-x-0 bottom-0 h-2 bg-primary/20" />
                        <Save className="w-8 h-8 mr-6 group-hover/btn:translate-y-1 transition-transform" /> AUTORIZAR REPARTIDOR
                    </Button>
                </form>
            </div>
        </div>
    )
}
