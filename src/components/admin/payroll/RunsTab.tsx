import { Wallet, Loader2, ShieldCheck, Send, CheckCircle2, Landmark, FileStack, Mail, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Employee } from "@/app/admin/payroll/types"
import { formatPrice } from "@/lib/utils"

interface RunsTabProps {
    employees: Employee[]
    isCalculating: boolean
    onCalculatePayroll: () => void
    recentRuns?: any[]
    onEmitDIAN?: (runId: string) => void
    onDownloadBank?: (runId: string) => void
    onDownloadParafiscal?: (runId: string) => void
    onExportAccounting?: (runId: string, format: 'SIIGO' | 'HELISA') => void
    onEmitReceipts?: (runId: string) => void
    isEmitting?: boolean
}

export function RunsTab({
    employees,
    isCalculating,
    onCalculatePayroll,
    recentRuns = [],
    onEmitDIAN,
    onDownloadBank,
    onDownloadParafiscal,
    onExportAccounting,
    onEmitReceipts,
    isEmitting
}: RunsTabProps) {
    return (
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in zoom-in-95 duration-500 font-sans">
            {/* IZQUIERDA: ACCIÓN PRINCIPAL */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
                <div className="max-w-xl w-full text-center space-y-8 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-600 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
                        <Wallet className="w-24 h-24 md:w-32 md:h-32 text-orange-500 mx-auto relative z-10 drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-slate-900">EJECUTAR <span className="text-orange-500">LIQUIDACIÓN</span></h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] italic">PROCESO MAESTRO DE NÓMINA - PERIODO ACTUAL</p>
                    </div>
                    <div className="p-8 md:p-10 bg-white/60 border border-slate-200 rounded-[2rem] md:rounded-[3rem] space-y-6 shadow-sm">
                        <div className="flex justify-between text-left">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Colaboradores</p>
                                <p className="text-2xl md:text-3xl font-black italic uppercase">{employees.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Carga Prestacional (Est.)</p>
                                <p className="text-2xl md:text-3xl font-black italic uppercase text-orange-500">21.8%</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                console.log("CALCULATE PAYROLL BUTTON CLICKED")
                                onCalculatePayroll()
                            }}
                            disabled={isCalculating}
                            type="button"
                            className="w-full h-16 md:h-20 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-sm md:text-base italic tracking-widest rounded-2xl md:rounded-3xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                        >
                            {isCalculating ? (
                                <><Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-3 animate-spin" /> PROCESANDO NÓMINA...</>
                            ) : (
                                "EJECUTAR CÁLCULO PRO"
                            )}
                        </Button>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">SYNC_DIAN_READY</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">IFRS_COMPLIANT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DERECHA: HISTORIAL Y TRANSMISIÓN DIAN */}
            <div className="lg:col-span-7 flex flex-col space-y-4 overflow-hidden py-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic shrink-0">Historial de Liquidaciones</h2>
                <div className="flex-1 bg-white/40 border border-slate-200 rounded-[2.5rem] p-6 overflow-y-auto custom-scrollbar shadow-sm backdrop-blur-sm">
                    {recentRuns.length > 0 ? (
                        <div className="space-y-4">
                            {recentRuns.map((run, i) => (
                                <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between group hover:border-orange-500/30 transition-all">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-black italic uppercase text-slate-900">{run.payroll_periods?.name || 'Periodo Desconocido'}</p>
                                            {run.dian_status === 'SENT' ? (
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase rounded-md border border-emerald-100 flex items-center gap-1">
                                                    <CheckCircle2 className="w-2 h-2" /> DIAN_SENT
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[7px] font-black uppercase rounded-md border border-amber-100">
                                                    PENDIENTE_DIAN
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Neto: {formatPrice(run.net_total)} • {new Date(run.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {run.dian_status !== 'SENT' ? (
                                            <Button
                                                onClick={() => onEmitDIAN?.(run.id)}
                                                disabled={isEmitting}
                                                className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2"
                                            >
                                                {isEmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3 text-orange-500" /> Transmitir DIAN</>}
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onDownloadBank?.(run.id)}
                                                    className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                    title="Archivo Dispersión Bancaria"
                                                >
                                                    <Landmark className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDownloadParafiscal?.(run.id)}
                                                    className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                    title="Reporte Parafiscales (PILA)"
                                                >
                                                    <FileStack className="w-4 h-4" />
                                                </button>

                                                <div className="h-10 w-px bg-slate-100 mx-2" />

                                                <button
                                                    onClick={() => onExportAccounting?.(run.id, 'SIIGO')}
                                                    className="h-10 px-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white flex items-center gap-2 text-[8px] font-black uppercase transition-all shadow-sm italic"
                                                    title="Exportar a SIIGO"
                                                >
                                                    <Download className="w-3 h-3" /> SIIGO
                                                </button>

                                                <button
                                                    onClick={() => onExportAccounting?.(run.id, 'HELISA')}
                                                    className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center gap-2 text-[8px] font-black uppercase transition-all shadow-sm italic"
                                                    title="Exportar a HELISA"
                                                >
                                                    <Download className="w-3 h-3" /> HELISA
                                                </button>

                                                <div className="h-10 w-px bg-slate-100 mx-2" />

                                                <Button
                                                    onClick={() => onEmitReceipts?.(run.id)}
                                                    className="h-10 px-4 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[8px] font-black uppercase italic tracking-widest flex items-center gap-2"
                                                >
                                                    <Mail className="w-3 h-3 text-orange-500" /> Notificar Recibos
                                                </Button>

                                                <div className="text-right ml-4">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic whitespace-nowrap">CUNE: {run.cune_uuid?.substring(0, 10)}...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                            <p className="text-[10px] font-black uppercase tracking-widest italic">No hay ejecuciones registradas</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
