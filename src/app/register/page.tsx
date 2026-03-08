"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Loader2, Mail, Lock, User, Phone, MapPin, Calendar, Home, CheckCircle2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [addressReference, setAddressReference] = useState("")
    const [birthDate, setBirthDate] = useState("")
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [privacyAccepted, setPrivacyAccepted] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        if (!termsAccepted || !privacyAccepted) {
            setMessage({ type: 'error', text: 'Debes aceptar los términos y políticas.' })
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            })

            if (error) throw error

            if (data.user) {
                const now = new Date().toISOString()
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        phone: phone || null,
                        address: address || null,
                        city: city || null,
                        address_reference: addressReference || null,
                        birth_date: birthDate || null,
                        role: 'user',
                        terms_accepted: termsAccepted,
                        privacy_accepted: privacyAccepted,
                        terms_accepted_at: termsAccepted ? now : null,
                        privacy_accepted_at: privacyAccepted ? now : null
                    })

                if (profileError) console.error("Error creating profile:", profileError)
            }

            setMessage({
                type: 'success',
                text: '¡Cuenta creada con éxito! Redirigiendo...'
            })

            setTimeout(() => router.push('/login'), 2000)

        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Ocurrió un error al registrarse.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 py-20 relative overflow-hidden font-sans">
            {/* Background Blobs */}
            <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-orange-500/5 blur-[150px] rounded-full -z-0" />
            <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full -z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative z-10"
            >
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <Link href="/landing" className="inline-block group">
                        <Image
                            src="/images/jamali-os-transparent.png"
                            alt="JAMALI OS"
                            width={220}
                            height={70}
                            className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
                            priority
                        />
                    </Link>
                    <p className="mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Crea tu Entorno de Gestión
                    </p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Crear Cuenta
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Únete a la red de restaurantes inteligentes de JAMALI OS.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-orange-100 rounded-full" /> Datos de Acceso
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ej. Juan Pérez"
                                            className="w-full h-15 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Teléfono</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+57 300..."
                                            className="w-full h-15 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Email Corporativo</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        placeholder="tu@negocio.com"
                                        className="w-full h-15 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full h-15 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Legal */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    required
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 rounded-lg border-2 border-slate-200 text-orange-500 focus:ring-orange-500/20 transition-all pointer-events-auto"
                                />
                                <span className="text-xs font-bold text-slate-500 leading-tight">
                                    Acepto los <span className="text-slate-900 underline">Términos y Condiciones</span> del servicio.
                                </span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    required
                                    checked={privacyAccepted}
                                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 rounded-lg border-2 border-slate-200 text-orange-500 focus:ring-orange-500/20 transition-all pointer-events-auto"
                                />
                                <span className="text-xs font-bold text-slate-500 leading-tight">
                                    Acepto la <span className="text-slate-900 underline">Política de Tratamiento de Datos</span>.
                                </span>
                            </label>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-5 rounded-2xl font-bold text-sm text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Crear mi Cuenta
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-400 font-medium">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="text-orange-500 font-bold hover:underline">
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em]">
                    JAMALI OS Enterprise · 2026
                </p>
            </motion.div>
        </div>
    )
}
