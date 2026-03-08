"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export function BillingChart({ data }: { data: { name: string, total: number, fiscal: number }[] }) {
    return (
        <div className="h-[400px] w-full bg-card/10 backdrop-blur-xl border border-border/10 rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black italic uppercase text-foreground tracking-tighter">Tendencia Fiscal</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Reporte de Sincronización Semanal</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#EA580C]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Ventas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white border-2 border-[#EA580C] border-dashed" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reportado DIAN</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EA580C" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFiscal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            fontSize: '10px',
                            fontWeight: 900,
                            color: '#fff'
                        }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="fiscal" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorFiscal)" strokeDasharray="5 5" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
