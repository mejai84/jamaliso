"use client"

import { useState, useMemo } from "react"
import {
    X, Upload, CheckCircle2, AlertCircle,
    Table, Database, ArrowRight, Loader2,
    FileSpreadsheet, HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { DataFlow } from "@/lib/data-flow"

interface ImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any[]) => Promise<void>;
    moduleName: string;
    requiredFields: { key: string; label: string; description?: string }[];
}

export function DataImportWizard({
    isOpen,
    onClose,
    onConfirm,
    moduleName,
    requiredFields
}: ImportWizardProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Mapping/Preview, 3: Success
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mapping, setMapping] = useState<Record<string, string>>({});

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await DataFlow.parseCSV(file);
            if (data.length === 0) return toast.error("El archivo está vacío");

            setRawFile(file);
            setParsedData(data);

            // Auto-mapping attempt
            const headers = Object.keys(data[0]);
            const newMapping: Record<string, string> = {};
            requiredFields.forEach(field => {
                const match = headers.find(h =>
                    h.toLowerCase() === field.key.toLowerCase() ||
                    h.toLowerCase() === field.label.toLowerCase()
                );
                if (match) newMapping[field.key] = match;
            });

            setMapping(newMapping);
            setStep(2);
        } catch (err) {
            toast.error("Error al leer el archivo");
        }
    };

    const isMappingComplete = useMemo(() => {
        return requiredFields.every(f => mapping[f.key]);
    }, [mapping, requiredFields]);

    const handleProcessImport = async () => {
        setIsProcessing(true);
        try {
            const finalData = parsedData.map(row => {
                const obj: any = {};
                Object.entries(mapping).forEach(([target, source]) => {
                    obj[target] = row[source];
                });
                return obj;
            });

            await onConfirm(finalData);
            setStep(3);
        } catch (err: any) {
            toast.error(err.message || "Error al importar los datos");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-500 font-sans">

                {/* 🛡️ Header Pixora */}
                <div className="p-8 border-b-2 border-slate-50 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-orange-500 shadow-lg">
                            <Database className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                                Import <span className="text-orange-600">Protocol</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">
                                Module: {moduleName} • Data Ingestion v4.2
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 🏔️ Content */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">

                    {/* STEP 1: UPLOAD */}
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-10 animate-in fade-in slide-in-from-bottom-5">
                            <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center group-hover:border-orange-500 transition-all">
                                <Upload className="w-12 h-12 text-slate-300 animate-bounce" />
                            </div>
                            <div className="text-center space-y-4 max-w-sm">
                                <h3 className="text-xl font-black italic uppercase text-slate-900">Protocolo de Carga</h3>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed italic">
                                    Selecciona un archivo CSV para iniciar el proceso de sincronización masiva de {moduleName}.
                                </p>
                            </div>
                            <label className="cursor-pointer group">
                                <input type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
                                <div className="h-16 px-12 bg-slate-900 text-white font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl hover:bg-orange-600 transition-all flex items-center gap-4 group-active:scale-95">
                                    <FileSpreadsheet className="w-5 h-5" /> EXAMINAR EQUIPO
                                </div>
                            </label>
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 w-full flex items-center gap-6">
                                <HelpCircle className="w-8 h-8 text-orange-400 shrink-0" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                    Asegúrate de que el archivo esté separado por comas (,) y contenga una fila de encabezados en la parte superior.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: MAPPING & PREVIEW */}
                    {step === 2 && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5">
                            <div className="bg-orange-50 border border-orange-100 p-8 rounded-3xl flex items-center justify-between">
                                <div className="space-y-2">
                                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-[0.4em] italic">Mapeo de Atalayas</h4>
                                    <p className="text-sm font-bold text-slate-700 italic">Vincula las columnas de tu archivo con los campos requeridos por el sistema.</p>
                                </div>
                                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-orange-100">
                                    <Table className="w-5 h-5 text-orange-500" />
                                    <span className="text-xs font-black italic uppercase tracking-tighter text-slate-900">{parsedData.length} registros detectados</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 pb-3">Campos de Mapeo</h5>
                                    {requiredFields.map(field => (
                                        <div key={field.key} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black uppercase italic tracking-wider text-slate-900">{field.label}</label>
                                                {mapping[field.key] ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                                                )}
                                            </div>
                                            <select
                                                value={mapping[field.key] || ""}
                                                onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Seleccionar columna del CSV...</option>
                                                {Object.keys(parsedData[0]).map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-b border-slate-100 pb-3">Previsualización (Top 3)</h5>
                                    <div className="space-y-4">
                                        {parsedData.slice(0, 3).map((row, i) => (
                                            <div key={i} className="p-6 bg-white border-2 border-slate-50 rounded-2xl space-y-3 opacity-60 hover:opacity-100 transition-opacity">
                                                <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase italic">ENTRY_ROW_0{i + 1}</span>
                                                </div>
                                                {requiredFields.map(f => (
                                                    <div key={f.key} className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-slate-400 uppercase tracking-tighter">{f.label}:</span>
                                                        <span className="text-slate-900 italic max-w-[150px] truncate">{mapping[f.key] ? row[mapping[f.key]] : '---'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-10 animate-in zoom-in duration-700">
                            <div className="w-32 h-32 bg-emerald-50 rounded-[4rem] flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                                <CheckCircle2 className="w-16 h-16" />
                            </div>
                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Protocolo Exitoso</h3>
                                <p className="text-sm font-bold text-slate-400 italic">Los datos se han sincronizado correctamente con el Kernel de JAMALI OS.</p>
                            </div>
                            <Button onClick={onClose} className="h-16 px-16 bg-slate-900 text-white font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl hover:bg-orange-600 transition-all active:scale-95">
                                CERRAR TERMINAL
                            </Button>
                        </div>
                    )}

                </div>

                {/* 🛡️ Footer Pixora Actions */}
                {step === 2 && (
                    <div className="p-8 border-t-2 border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                        <Button variant="ghost" onClick={() => setStep(1)} className="font-black italic uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900">
                            Reiniciar Carga
                        </Button>
                        <div className="flex items-center gap-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest pr-6 border-r border-slate-200">
                                {isMappingComplete ? 'PROTOCOLO VERIFICADO' : 'CUIDADO: Faltan campos por vincular'}
                            </p>
                            <Button
                                disabled={!isMappingComplete || isProcessing}
                                onClick={handleProcessImport}
                                className="h-16 px-12 bg-orange-600 text-white font-black uppercase text-xs italic tracking-widest rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-500 disabled:opacity-50 transition-all flex items-center gap-4 active:scale-95"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> PROCESANDO...
                                    </>
                                ) : (
                                    <>
                                        EJECUTAR IMPORTACIÓN <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}
