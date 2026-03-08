import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/20 selection:text-orange-900 pb-20">
            <PublicNavbar />
            <div className="max-w-3xl mx-auto px-6 pt-32">
                <Link href="/landing" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4" /> Volver a
                    <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={160} height={40} className="h-6 w-auto object-contain ml-2 group-hover:opacity-80 transition-opacity" />
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Contacto Institucional</h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Escríbenos para conversar sobre demostraciones, alianzas para nuestra plataforma, oportunidades corporativas o soporte a nivel de franquicias.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <Mail className="w-8 h-8 text-orange-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Mesa de Soporte</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            <a href="mailto:contact@jamalios.com" className="hover:text-orange-500">contact@jamalios.com</a>
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <MapPin className="w-8 h-8 text-orange-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Oficina de Desarrollo</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Latinoamérica<br />Bogotá, Colombia 🇨🇴
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
