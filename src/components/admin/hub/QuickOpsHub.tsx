import { ChefHat, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { adminTranslations } from "@/lib/i18n/admin"

interface QuickOpsHubProps {
    lang: 'en' | 'es'
}

export function QuickOpsHub({ lang }: QuickOpsHubProps) {
    const t = adminTranslations[lang].hub

    return (
        <div className="bg-white text-black rounded-[4rem] p-10 shadow-3xl flex items-center justify-between relative overflow-hidden group/ops animate-pulse-slow font-sans">
            <div className="absolute inset-x-0 bottom-0 h-2 bg-orange-600" />
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none -mr-10 -mt-10 group-hover/ops:scale-110 transition-transform duration-1000">
                <ChefHat className="w-48 h-48 text-orange-600" />
            </div>

            <div className="flex items-center gap-8 relative z-10">
                <div className="w-18 h-18 rounded-[1.5rem] bg-black border border-black/10 flex items-center justify-center text-orange-500 shadow-2xl group-hover/ops:rotate-12 transition-all">
                    <ChefHat className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600 italic leading-none animate-pulse">{t.ops_core}</p>
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{t.kitchen_control}</h4>
                </div>
            </div>
            <Link href="/admin/kitchen">
                <Button className="h-16 w-16 rounded-[1.5rem] bg-orange-600 text-black hover:bg-black hover:text-orange-500 transition-all shadow-3xl active:scale-90 border-none group/action">
                    <ChevronRight className="w-8 h-8 group-hover/action:translate-x-1 transition-transform" />
                </Button>
            </Link>
            <style jsx global>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.95; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
