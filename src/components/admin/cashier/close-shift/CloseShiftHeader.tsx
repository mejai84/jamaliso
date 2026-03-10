import { Lock, ArrowLeft } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

interface CloseShiftHeaderProps {
    systemTotal: number
}

export function CloseShiftHeader({ systemTotal }: CloseShiftHeaderProps) {
    return (
        <div className="bg-slate-900 text-white p-8 rounded-b-[2.5rem] shadow-xl pt-12 pb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <Lock className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex justify-between items-center max-w-4xl mx-auto">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin/cashier"
                        className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 text-orange-400 mb-1">
                            <Lock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Cierre de Jornada</span>
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">ARQUEO DE CAJA</h1>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic">Esperado en Sistema</p>
                    <p className="text-3xl font-black text-orange-500 font-mono tracking-tighter">{formatPrice(systemTotal)}</p>
                </div>
            </div>
        </div>
    )
}
