"use client"

interface EmptyStateProps {
    label: string
    sub: string
    icon: React.ReactNode
}

export function EmptyState({ label, sub, icon }: EmptyStateProps) {
    return (
        <div className="py-24 border-4 border-dashed border-border/20 rounded-[4rem] flex flex-col items-center justify-center gap-8 text-center opacity-20">
            <div className="text-primary">{icon}</div>
            <div className="space-y-2">
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">{label}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic px-10">{sub}</p>
            </div>
        </div>
    )
}
