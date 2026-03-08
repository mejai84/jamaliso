import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/20 selection:text-orange-900 pb-20">
            <PublicNavbar />
            <div className="max-w-3xl mx-auto px-6 pt-32">
                <Link href="/landing" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4" /> Volver a
                    <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={160} height={40} className="h-6 w-auto object-contain ml-2 group-hover:opacity-80 transition-opacity" />
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Aviso de Privacidad</h1>

                <div className="prose prose-slate max-w-none text-slate-500 font-medium leading-relaxed space-y-6">
                    <p>Última actualización: <strong>Marzo de 2026</strong></p>
                    <p>
                        En JAMALI OS, priorizamos la privacidad de tus datos corporativos. Toda la información administrada bajo los Tenants y Locales de los restaurantes es preservada bajo políticas estrictas de seguridad de "Zero Trust", bases de datos PostgreSQL con políticas a nivel de fila (Row Level Security - RLS).
                    </p>

                    <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Recopilación de Datos</h3>
                    <p>
                        Los datos recabados en la plataforma, tanto para dueños, mánagers como empleados, incluyen atributos de perfil básico y registros de ventas operativas exclusivamente utilizados para facilitar la lógica de JAMALI OS.
                    </p>

                    <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Protección de la Información</h3>
                    <p>
                        Los sistemas utilizan cifrado en reposo y en traslado bajo estándares bancarios modernos. La arquitectura asegura la separación perimetral cruzada para que cada Restaurante posea absoluta autoridad exclusiva sobre si y cómo procesará su información.
                    </p>
                </div>
            </div>
        </div>
    );
}
