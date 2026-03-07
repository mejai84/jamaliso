"use client"

import { Button } from "@/components/ui/button"
import { QrCode, ArrowLeftRight, Edit, Trash2, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table } from "@/app/admin/tables/types"

interface TableListViewProps {
    tables: Table[]
    onGenerateQR: (t: Table) => void
    onTransfer: (t: Table) => void
    onEdit: (t: Table) => void
    onDelete: (t: Table) => void
}

export function TableListView({ tables, onGenerateQR, onTransfer, onEdit, onDelete }: TableListViewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 animate-in fade-in duration-1000">
            {tables.map(table => (
                <div key={table.id} className="bg-card border-4 border-border/40 rounded-[4.5rem] p-12 space-y-10 hover:border-primary/40 transition-all group/card relative overflow-hidden shadow-3xl active:scale-[0.98]">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-primary group-hover/card:scale-150 group-hover/card:rotate-12 transition-all duration-1000 pointer-events-none">
                        <QrCode className="w-32 h-32" />
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-foreground leading-none group-hover/card:text-primary transition-colors">{table.table_name}</h3>
                            <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] italic flex items-center gap-3"><MapPin className="w-4 h-4 text-primary" /> {table.location.toUpperCase()}</p>
                        </div>
                        <div className={cn(
                            "px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] border-2 italic transition-all shadow-xl",
                            table.status === 'available' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                        )}>
                            {table.status.toUpperCase()}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-xl font-black text-foreground/80 uppercase tracking-tighter italic border-b-2 border-border/20 pb-8 relative z-10">
                        <Users className="w-7 h-7 text-primary" />
                        {table.capacity} <span className="text-[10px] text-muted-foreground tracking-[0.4em] ml-2">COMENSALES_MAX</span>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        <Button onClick={() => onGenerateQR(table)} variant="ghost" className="flex-1 h-20 bg-muted/40 border-2 border-border/40 text-[10px] font-black uppercase tracking-[0.3em] italic rounded-[2rem] hover:bg-foreground hover:text-white transition-all gap-4 shadow-xl group/btn active:scale-95">
                            <QrCode className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> QR INTEGRAL
                        </Button>
                        {(table.status !== 'available') && (
                            <Button onClick={() => onTransfer(table)} variant="ghost" className="w-20 h-20 bg-blue-500/10 border-2 border-blue-500/20 rounded-[2rem] text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center shadow-xl active:scale-75">
                                <ArrowLeftRight className="w-7 h-7" />
                            </Button>
                        )}
                        <Button onClick={() => onEdit(table)} variant="ghost" className="w-20 h-20 bg-muted/40 border-2 border-border/40 rounded-[2rem] hover:bg-primary hover:text-black transition-all flex items-center justify-center shadow-xl active:scale-75">
                            <Edit className="w-7 h-7" />
                        </Button>
                        <Button onClick={() => onDelete(table)} variant="ghost" className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/20 rounded-[2rem] text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-xl active:scale-75">
                            <Trash2 className="w-7 h-7" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
