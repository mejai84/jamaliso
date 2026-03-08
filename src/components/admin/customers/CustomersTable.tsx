import { MessageCircle, MoreHorizontal, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Customer } from "./types"
import { toast } from "sonner"

interface CustomersTableProps {
    filtered: Customer[]
    view: 'database' | 'loyalty' | 'notifications'
    setView: (view: 'database' | 'loyalty' | 'notifications') => void
}

export function CustomersTable({ filtered, view, setView }: CustomersTableProps) {
    if (view !== 'database') {
        return (
            <div className="p-20 text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <Sparkles className="w-20 h-20 text-orange-500 opacity-20" />
                <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Módulo {view.toUpperCase()} en proceso</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sincronizando con el motor de inteligencia Jamali OS</p>
                </div>
                <Button
                    onClick={() => setView('database')}
                    variant="ghost"
                    className="text-orange-500 font-black italic uppercase text-[10px] tracking-widest"
                >
                    VOLVER A DATABASE
                </Button>
            </div>
        )
    }

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50">
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Perfil_Cliente</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">LTV_Metric (Ventas)</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Puntos_Loyalty</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-center">Status_Tag</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-right">Command</th>
                </tr>
            </thead>
            <tbody>
                {filtered.map((cust, i) => (
                    <tr key={i} className="border-b-2 border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <td className="p-8">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center font-black text-slate-400 italic shadow-sm group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-500">
                                    {cust.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-lg font-black italic tracking-tighter text-slate-900 group-hover:text-orange-600 transition-colors uppercase leading-none">{cust.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{cust.phone}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-8">
                            <p className="text-2xl font-black italic text-slate-900 tracking-tighter">{formatPrice(cust.totalSpent)}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{cust.totalOrders} órdenes_liquidadas</p>
                        </td>
                        <td className="p-8">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-4 h-4 text-orange-600" />
                                <span className="text-lg font-black italic tracking-tighter text-slate-900">{cust.points}</span>
                            </div>
                        </td>
                        <td className="p-8">
                            <div className="flex justify-center">
                                <span className={cn(
                                    "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic",
                                    cust.totalSpent > 500000 ? "bg-amber-100 text-amber-600 border-2 border-amber-200 shadow-sm" : "bg-slate-100 text-slate-500 border-2 border-slate-200"
                                )}>
                                    {cust.totalSpent > 500000 ? '⭐ ELITE VIP' : 'REGULAR_STATUS'}
                                </span>
                            </div>
                        </td>
                        <td className="p-8 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast.success(`INICIANDO MENSAJE PARA: ${cust.name}`)
                                    }}
                                    className="w-12 h-12 rounded-xl bg-orange-600 text-white hover:bg-orange-500 transition-all flex items-center justify-center shadow-lg shadow-orange-600/20"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info(`DETALLES DE CLIENTE: ${cust.name}`)
                                    }}
                                    className="w-12 h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center shadow-lg shadow-slate-900/20"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
