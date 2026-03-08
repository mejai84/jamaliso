import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function ChangelogPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/20 selection:text-orange-900 pb-20">
            <PublicNavbar />
            <div className="max-w-3xl mx-auto px-6 pt-32">
                <Link href="/landing" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4" /> Volver a
                    <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={160} height={40} className="h-6 w-auto object-contain ml-2 group-hover:opacity-80 transition-opacity" />
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-12">Novedades y Actualizaciones</h1>

                <div className="space-y-12">
                    <div className="relative pl-8 border-l-2 border-orange-200">
                        <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-orange-500 border-4 border-slate-50" />
                        <span className="text-sm font-bold text-slate-400 mb-2 block">Marzo 2026</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Lanzamiento de JAMALI OS 2.0</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-4">
                            Introducimos la nueva etapa de nuestro sistema operativo, rediseñado completamente con herramientas Inteligencia Artificial y un "Light Theme Premium" de clase mundial.
                        </p>
                        <ul className="list-disc list-inside text-slate-500 space-y-2 pl-2">
                            <li>Nuevo panel corporativo y reportes AI.</li>
                            <li>Velocidad en KDS aumentada en un 300%.</li>
                            <li>Generación de posts para redes impulsada por IA.</li>
                        </ul>
                    </div>

                    <div className="relative pl-8 border-l-2 border-slate-200">
                        <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-slate-200 border-4 border-slate-50" />
                        <span className="text-sm font-bold text-slate-400 mb-2 block">Febrero 2026</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Módulo de Integración de Empleados</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Agregamos reportes de nómina exactos con permisos y seguridad robusta en los perfiles y RLS tables.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
