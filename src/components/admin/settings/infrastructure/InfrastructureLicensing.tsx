import { Cpu as Processor, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InfrastructureLicensingProps {
    version: string
}

export function InfrastructureLicensing({ version }: InfrastructureLicensingProps) {
    return (
        <div className="bg-card border border-border rounded-[3.5rem] p-10 flex flex-col sm:flex-row items-center justify-between shadow-3xl group hover:border-primary/20 transition-all duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-8 relative z-10">
                <div className="w-18 h-18 rounded-2xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-700 shadow-xl group-hover:rotate-12">
                    <Processor className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">Enterprise Architecture</p>
                        <div className="px-3 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[8px] font-black text-primary">ELITE</div>
                    </div>
                    <p className="text-xl font-black italic text-foreground uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">{version}</p>
                </div>
            </div>
            <Button variant="ghost" className="h-14 bg-muted/20 text-[10px] font-black uppercase italic tracking-[0.4em] text-primary border-2 border-primary/10 rounded-2xl px-10 hover:bg-primary hover:text-white transition-all shadow-2xl mt-6 sm:mt-0 active:scale-95 group/release">
                <RefreshCcw className="w-4 h-4 mr-3 group-hover/release:rotate-180 transition-transform" /> RELEASE UPDATES
            </Button>
        </div>
    )
}
