"use client"

import { Button } from "@/components/ui/button"
import { Users, UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EmployeesHeaderProps {
    onAddOpen: () => void
}

export function EmployeesHeader({ onAddOpen }: EmployeesHeaderProps) {
    return (
        <div className="relative z-30 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 bg-white/60 backdrop-blur-3xl shrink-0 shadow-sm font-sans">
            <div className="flex items-center gap-4 md:gap-8">
                <Link href="/admin/hub">
                    <Button variant="ghost" size="icon" className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-[1.5rem] bg-white border border-slate-200 hover:bg-orange-600 hover:text-white transition-all group shadow-sm">
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                </Link>
                <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-orange-500 italic">Intelligence & Talent</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Equipo <span className="text-orange-500">Core</span></h1>
                </div>
            </div>

            <Button
                onClick={onAddOpen}
                className="h-14 md:h-16 px-8 md:px-12 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[10px] md:text-xs italic tracking-widest rounded-xl md:rounded-2xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all gap-4 w-full md:w-auto"
            >
                <UserPlus className="w-5 h-5 md:w-6 md:h-6" /> Expandir Nómina
            </Button>
        </div>
    )
}
