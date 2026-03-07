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
        <div className="relative z-30 p-10 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-3xl shrink-0">
            <div className="flex items-center gap-8">
                <Link href="/admin/hub">
                    <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-orange-600 hover:text-black transition-all group">
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">User Intelligence Network</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Elite <span className="text-orange-500">Database</span></h1>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex bg-white/[0.03] p-2 rounded-[1.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
                    {[
                        { id: 'database', label: 'DATABASE', icon: Users },
                        { id: 'loyalty', label: 'LOYALTY', icon: Trophy },
                        { id: 'notifications', label: 'CHANNELS', icon: MessageCircle }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setView(t.id as any)}
                            className={cn(
                                "px-8 py-3 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] italic transition-all duration-500 relative overflow-hidden group",
                                view === t.id ? "bg-orange-600 text-black shadow-3xl shadow-orange-600/20" : "text-slate-500 hover:text-white"
                            )}
                        >
                            <t.icon className={cn("w-4 h-4", view === t.id ? "animate-pulse" : "opacity-40")} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
