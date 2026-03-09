import { redirect } from 'next/navigation';

export default function GlobalKioskRedirect() {
    // Para simplificar, redirigimos a una página de ingreso de PIN o listado de restaurantes,
    // o pedimos que se escanee un código QR de configuración.
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-8">
            <div className="w-24 h-24 bg-rose-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-rose-600/50 rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
            </div>
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">Configuración de Kiosco</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm max-w-md mx-auto leading-relaxed">
                    Por favor, ingresa al Kiosco utilizando la URL específica de tu restaurante configurada en el panel de administrador.
                </p>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-rose-400 text-xs">
                    Ejemplo: jamaliso.com/kiosk/mi-restaurante
                </div>
            </div>
        </div>
    );
}
