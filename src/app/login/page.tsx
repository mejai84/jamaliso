"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react"
import { useRestaurant } from "@/providers/RestaurantProvider"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function LoginPage() {
    const { restaurant } = useRestaurant()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
            if (authErr) throw authErr

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, restaurant_id')
                .eq('id', data.user.id)
                .maybeSingle()

            if (profile) {
                const { data: userRestaurant } = await supabase
                    .from('restaurants')
                    .select('slug, subdomain')
                    .eq('id', profile.restaurant_id)
                    .maybeSingle()

                const slug = userRestaurant?.slug || userRestaurant?.subdomain

                switch (profile.role) {
                    case 'admin':
                    case 'super_admin':
                    case 'owner':
                        router.push('/admin')
                        break
                    case 'waiter':
                    case 'mesero':
                        router.push('/admin/waiter')
                        break
                    case 'kitchen':
                    case 'cocinero':
                        router.push('/admin/kitchen')
                        break
                    case 'cashier':
                    case 'cajero':
                        router.push('/admin/pos')
                        break
                    default:
                        router.push(slug ? `/${slug}/menu` : '/')
                }
            } else {
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Blobs */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full -z-0" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full -z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
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
                        Acceso al Sistema Operativo
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Bienvenido
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {restaurant?.name
                                ? `Accede al panel de ${restaurant.name}`
                                : "Ingresa tus credenciales para continuar."
                            }
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Email Corporativo</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="tu@negocio.com"
                                    className="w-full h-15 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 focus:outline-none transition-all"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full h-15 pl-14 pr-14 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 focus:outline-none transition-all"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2"
                            >
                                <XCircleIcon className="w-4 h-4" />
                                {error}
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
                                    Entrar al Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link href="/demo" className="text-xs font-bold text-orange-500 hover:underline">
                            Solicitar Demo
                        </Link>
                        <Link href="/register" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">
                            ¿No tienes cuenta? Regístrate
                        </Link>
                    </div>
                </div>

                {/* Trust / Badge */}
                <div className="mt-12 flex items-center justify-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>JAMALI OS Enterprise Security Verified</span>
                </div>
            </motion.div>
        </div>
    )
}

function XCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    )
}
