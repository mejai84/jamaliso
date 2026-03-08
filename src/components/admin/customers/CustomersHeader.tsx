import { Users, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Trophy, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomersHeaderProps {
    view: 'database' | 'loyalty' | 'notifications'
    setView: (view: 'database' | 'loyalty' | 'notifications') => void
}

export function CustomersHeader({ view, setView }: CustomersHeaderProps) {
    return (
        <div className="relative z-30 p-10 flex items-center justify-between border-b-2 border-slate-100 bg-white shadow-sm shrink-0">
            <div className="flex items-center gap-10">
                <Link href="/admin/hub">
                    <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 hover:bg-slate-900 hover:text-white transition-all group shadow-sm">
                        <ArrowLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-orange-600 italic">Core_Client_Matrix</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Elite <span className="text-orange-600">Database</span></h1>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex bg-slate-50 p-2 rounded-[2rem] border-2 border-slate-200 shadow-inner">
                    {[
                        { id: 'database', label: 'DATABASE', icon: Users },
                        { id: 'loyalty', label: 'LOYALTY', icon: Trophy },
                        { id: 'notifications', label: 'CHANNELS', icon: MessageCircle }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setView(t.id as any)}
                            className={cn(
                                "px-10 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] italic transition-all duration-500 relative overflow-hidden group",
                                view === t.id ? "bg-slate-900 text-white shadow-2xl" : "text-slate-400 hover:text-slate-900 hover:bg-white"
                            )}
                        >
                            <t.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", view === t.id ? "text-orange-500" : "opacity-40")} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
