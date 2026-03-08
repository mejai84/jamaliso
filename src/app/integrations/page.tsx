import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";

export default function IntegrationsPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/20 selection:text-orange-900 pb-20">
            <PublicNavbar />
            <div className="max-w-4xl mx-auto px-6 pt-32">
                <Link href="/landing" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4" /> Volver a
                    <Image src="/images/jamali-os-transparent.png" alt="JAMALI OS" width={160} height={40} className="h-6 w-auto object-contain ml-2 group-hover:opacity-80 transition-opacity" />
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Integraciones</h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                    Conecta tu ecosistema gastronómico. JAMALI OS se integra con las herramientas que ya utilizas para potenciar la eficiencia de tu restaurante.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Placeholder Integrations */}
                    {[
                        { title: "Pasarelas de Pago", desc: "Sincronización fluida con Stripe, MercadoPago, y terminales locales de tarjeta de crédito." },
                        { title: "Apps de Reseñas", desc: "Integración de métricas de Google My Business y TripAdvisor en tu panel." },
                        { title: "Software Contable", desc: "Exportación y cálculo directo de facturación a Xero, QuickBooks o Siigo." },
                        { title: "Delivery Apps", desc: "Recibe comandas de UberEats, Rappi y PedidosYa directamente en el POS." },
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-orange-200 transition-colors">
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
