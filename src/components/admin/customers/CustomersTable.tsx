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
                <tr className="bg-white/[0.01]">
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Perfil_Cliente</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">LTV_Metric (Ventas)</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Puntos_Loyalty</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center">Status_Tag</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-right">Command</th>
                </tr>
            </thead>
            <tbody>
                {filtered.map((cust, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                        <td className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/5 font-black text-slate-500 italic">
                                    {cust.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{cust.name}</p>
                                    <p className="text-[10px] font-medium text-slate-500">{cust.phone}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-6">
                            <p className="font-black italic text-white tracking-tighter">{formatPrice(cust.totalSpent)}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cust.totalOrders} órdenes</p>
                        </td>
                        <td className="p-6">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-3.5 h-3.5 text-orange-500" />
                                <span className="text-sm font-black italic">{cust.points}</span>
                            </div>
                        </td>
                        <td className="p-6">
                            <div className="flex justify-center">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                    cust.totalSpent > 500000 ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "bg-slate-800 text-slate-500 border border-white/5"
                                )}>
                                    {cust.totalSpent > 500000 ? '⭐ ELITE VIP' : 'REGULAR'}
                                </span>
                            </div>
                        </td>
                        <td className="p-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast.success(`INICIANDO MENSAJE PARA: ${cust.name}`)
                                    }}
                                    className="p-2.5 rounded-xl bg-orange-600/10 text-orange-500 hover:bg-orange-600 hover:text-black border border-orange-500/20 transition-all text-xs"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast.info(`DETALLES DE CLIENTE: ${cust.name}`)
                                    }}
                                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all text-xs"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
