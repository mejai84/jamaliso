import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Zap } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/20 selection:text-orange-900 pb-20">
            <PublicNavbar />
            <div className="max-w-3xl mx-auto px-6 pt-32">
                <Link href="/landing" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4" /> Volver a
                    <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={160} height={40} className="h-6 w-auto object-contain ml-2 group-hover:opacity-80 transition-opacity" />
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Sobre JAMALI OS</h1>

                <div className="prose prose-slate prose-lg max-w-none text-slate-500 font-medium leading-relaxed">
                    <p>
                        Bienvenido a <strong>JAMALI OS</strong>. Nacimos con una misión clara: redefinir cómo operan y crecen los restaurantes y marcas gastronómicas
                        en el entorno digital moderno. En la industria de restaurantes de hoy en día, depender de hojas de cálculo aisladas y herramientas desconectadas te frena.
                    </p>
                    <p className="mt-6">
                        Desarrollamos una plataforma integral unificada — impulsada por Inteligencia Artificial y una infraestructura enfocada en desempeño —
                        para centralizar desde ventas e inventario, hasta analítica y automatización de marketing.
                        No es solamente un Punto de Venta (POS); es el ecosistema sobre el cual puedes escalar desde una sola ubicación hasta una franquicia global.
                    </p>

                    <div className="mt-12 p-12 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-center">
                        <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={120} height={120} className="w-32 h-auto mx-auto mb-8" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Construyendo el Futuro de SaaS Gastronómico</h3>
                        <p className="text-slate-500 text-sm">Nuestro equipo trabaja a la vanguardia de las tecnologías de Nube Inteligente.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
