import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/20 selection:text-orange-900 pb-20">
            <PublicNavbar />
            <div className="max-w-3xl mx-auto px-6 pt-32">
                <Link href="/landing" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4" /> Volver a
                    <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={160} height={40} className="h-6 w-auto object-contain ml-2 group-hover:opacity-80 transition-opacity" />
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Términos de Servicio</h1>

                <div className="prose prose-slate max-w-none text-slate-500 font-medium leading-relaxed space-y-6">
                    <p>Última actualización: <strong>Marzo de 2026</strong></p>
                    <p>
                        Al registrarte para obtener los servicios de JAMALI OS e interactuar con nuestros componentes, te ciñes a directivas empresariales destinadas a ofrecer una experiencia premium inter-equipo.
                    </p>

                    <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Uso de la Cuenta SaaS Corporativa</h3>
                    <p>
                        Al establecer un "Tenant", o un ecosistema principal (Dueño de Restaurante), prometes facilitar perfiles fidedignos y cumplir a cabalidad las regulaciones locales, legales de registro e informes tributarios a los que aplica de forma soberana el uso del software por tu parte.
                    </p>

                    <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Propiedad y Plataforma Cloud</h3>
                    <p>
                        La arquitectura fundamental, el código fuente y las características cognitivas integradas por la infraestructura en IA continúan siendo propiedad intelectual y derechos patentes de la estructura matriz de desarrollo. El Cliente preservará la potestad integral sobre los menús, logotipos, imágenes y métricas corporativas vertidas con y por propósitos de su ejecución.
                    </p>
                </div>
            </div>
        </div>
    );
}
