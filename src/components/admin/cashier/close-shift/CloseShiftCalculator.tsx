import { Calculator, Banknote, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"
import { DENOMINATIONS } from "./types"

interface CloseShiftCalculatorProps {
    counts: Record<number, number>
    handleCountChange: (denom: number, qty: string) => void
    calculatedTotal: number
}

export function CloseShiftCalculator({ counts, handleCountChange, calculatedTotal }: CloseShiftCalculatorProps) {
    return (
        <div className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <Calculator className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black uppercase italic tracking-wide text-foreground">Conteo de Efectivo</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Billetes */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Banknote className="w-4 h-4" /> Billetes
                    </h3>
                    {DENOMINATIONS.filter(d => d.type === 'bill').map((d) => (
                        <div key={d.value} className="flex items-center gap-4">
                            <div className="w-24 text-right font-bold text-muted-foreground text-sm">{d.label}</div>
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">x</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-8 text-right font-mono font-bold bg-muted border-border h-12 rounded-xl focus:ring-primary/20"
                                    value={counts[d.value] || ''}
                                    onChange={(e) => handleCountChange(d.value, e.target.value)}
                                />
                            </div>
                            <div className="w-24 text-right font-bold text-foreground font-mono text-sm">
                                {formatPrice(d.value * (counts[d.value] || 0)).replace('$ ', '')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Monedas */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <Coins className="w-4 h-4" /> Monedas
                    </h3>
                    {DENOMINATIONS.filter(d => d.type === 'coin').map((d) => (
                        <div key={d.value} className="flex items-center gap-4">
                            <div className="w-24 text-right font-bold text-muted-foreground text-sm">{d.label}</div>
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">x</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-8 text-right font-mono font-bold bg-muted border-border h-12 rounded-xl focus:ring-primary/20"
                                    value={counts[d.value] || ''}
                                    onChange={(e) => handleCountChange(d.value, e.target.value)}
                                />
                            </div>
                            <div className="w-24 text-right font-bold text-foreground font-mono text-sm">
                                {formatPrice(d.value * (counts[d.value] || 0)).replace('$ ', '')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center bg-muted/50 p-6 rounded-2xl">
                <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Contado</span>
                <span className="text-4xl font-black text-foreground tracking-tighter">{formatPrice(calculatedTotal)}</span>
            </div>
        </div>
    )
}
