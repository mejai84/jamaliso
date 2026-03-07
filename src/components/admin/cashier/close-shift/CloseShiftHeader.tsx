import { Lock } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface CloseShiftHeaderProps {
    systemTotal: number
}

export function CloseShiftHeader({ systemTotal }: CloseShiftHeaderProps) {
    return (
        <div className="bg-card text-foreground p-8 rounded-b-[2.5rem] shadow-xl pt-12 pb-16 relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center max-w-4xl mx-auto">
                <div>
                    <div className="flex items-center gap-2 text-primary/80 mb-1">
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cierre Seguro</span>
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">ARQUEO DE CAJA</h1>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Esperado en Caja</p>
                    <p className="text-2xl font-black text-foreground font-mono">{formatPrice(systemTotal)}</p>
                </div>
            </div>
        </div>
    )
}
