import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, cn } from "@/lib/utils"

interface CloseShiftSummaryProps {
    systemTotal: number
    difference: number
    calculatedTotal: number
    handleCloseShift: () => void
}

export function CloseShiftSummary({ systemTotal, difference, calculatedTotal, handleCloseShift }: CloseShiftSummaryProps) {
    return (
        <div className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border animate-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-muted/50 border border-border">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Esperado (Sistema)</span>
                        <span className="font-bold text-foreground">{formatPrice(systemTotal)}</span>
                    </div>
                    <div className={cn(
                        "flex justify-between items-center p-4 rounded-xl border",
                        difference === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                            difference > 0 ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-rose-50 border-rose-100 text-rose-700"
                    )}>
                        <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            {difference === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            Diferencia
                        </span>
                        <span className="font-black text-lg">{formatPrice(difference)}</span>
                    </div>
                </div>

                <div className="w-full md:w-auto">
                    <Button
                        onClick={handleCloseShift}
                        disabled={calculatedTotal === 0}
                        className={cn(
                            "h-20 px-12 rounded-2xl text-lg font-black uppercase tracking-widest italic shadow-xl transition-all w-full md:w-auto",
                            difference === 0 ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" :
                                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                        )}
                    >
                        {difference === 0 ? 'Confirmar Cierre Perfecto' : 'Cerrar Turno con Diferencia'} <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
