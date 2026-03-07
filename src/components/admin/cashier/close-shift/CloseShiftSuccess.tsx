import { CheckCircle2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface CloseShiftSuccessProps {
    cashSales: number
    cardSales: number
    transferSales: number
    creditSales: number
    difference: number
}

export function CloseShiftSuccess({ cashSales, cardSales, transferSales, creditSales, difference }: CloseShiftSuccessProps) {
    return (
        <div className="h-screen flex items-center justify-center bg-muted p-6">
            <div className="bg-card rounded-[3rem] p-12 text-center max-w-lg w-full shadow-2xl space-y-8 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-foreground mb-2">¡TURNO CERRADO!</h1>
                    <p className="text-muted-foreground font-medium">Todo ha quedado registrado correctamente.</p>
                </div>

                <div className="bg-muted/50 rounded-3xl p-8 border border-border space-y-4 text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 italic">Resumen de Recaudación</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Efectivo (Cash)</p>
                            <p className="font-black text-foreground">{formatPrice(cashSales)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Tarjetas</p>
                            <p className="font-black text-foreground">{formatPrice(cardSales)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Transferencias</p>
                            <p className="font-black text-foreground">{formatPrice(transferSales)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Ventas Crédito</p>
                            <p className="font-black text-foreground">{formatPrice(creditSales)}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                        <span className="font-black text-sm uppercase italic">Diferencia Final</span>
                        <span className={cn("text-xl font-black italic", difference === 0 ? "text-emerald-500" : difference > 0 ? "text-blue-500" : "text-rose-500")}>
                            {difference > 0 ? '+' : ''}{formatPrice(difference)}
                        </span>
                    </div>
                </div>

                <Button onClick={() => window.location.href = '/login'} className="w-full h-16 text-xl font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90">
                    <LogOut className="w-6 h-6 mr-2" /> Salir del Sistema
                </Button>
            </div>
        </div>
    )
}
