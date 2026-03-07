"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, Eye, EyeOff, Zap, ChefHat, ShieldCheck, Wallet, User as UserIcon } from "lucide-react"
import { useRestaurant } from "@/providers/RestaurantProvider"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

            // Obtener perfil con rol para redirección inteligente
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, restaurant_id')
                .eq('id', data.user.id)
                .maybeSingle()

            if (profile) {
                // Obtener slug del restaurante del usuario
                const { data: userRestaurant } = await supabase
                    .from('restaurants')
                    .select('slug, subdomain')
                    .eq('id', profile.restaurant_id)
                    .maybeSingle()

                const slug = userRestaurant?.slug || userRestaurant?.subdomain

                // Redirigir según rol
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

    const fillDemo = (demoEmail: string, demoPass: string) => {
        setEmail(demoEmail)
        setPassword(demoPass)
    }

    const demoUsers = [
        { email: "admin.demo@jamali-os.com", pass: "password123", role: "Administrador", icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-50" },
        { email: "clara.caja@jamali-os.com", pass: "password123", role: "Cajera", icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50" },
        { email: "marcos.mesero@jamali-os.com", pass: "password123", role: "Mesero", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-50" },
        { email: "carlos.chef@jamali-os.com", pass: "password123", role: "Chef / Cocina", icon: ChefHat, color: "text-red-500", bg: "bg-red-50" },
    ]

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* LEFT — BRANDING PANEL */}
            <div className="hidden lg:flex lg:w-[45%] bg-slate-900 relative flex-col items-center justify-center p-12 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 text-center space-y-8 max-w-md">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-sm">
                        <Zap className="w-10 h-10 text-orange-500 fill-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                            JAMALI <span className="text-orange-500">OS</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-3 font-medium">
                            Sistema operativo para restaurantes
                        </p>
                    </div>
                    <div className="space-y-4 pt-4">
                        {[
                            "KDS en tiempo real para cocina",
                            "Portal de meseros móvil",
                            "Carta digital con QR por mesa",
                            "Reportes y control de operación"
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                                <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                    <Zap className="w-3 h-3 text-orange-500" />
                                </div>
                                {f}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest pt-8">
                        Antigravity Platform · Colombia 🇨🇴
                    </p>
                </div>
            </div>

            {/* RIGHT — LOGIN FORM */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile brand */}
                    <div className="lg:hidden text-center space-y-3">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto">
                            <Zap className="w-7 h-7 text-orange-500 fill-orange-500" />
                        </div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                            JAMALI <span className="text-orange-500">OS</span>
                        </h1>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                            Iniciar Sesión
                        </h2>
                        <p className="text-sm text-slate-400">
                            Ingresa a tu panel de gestión {restaurant?.name ? `· ${restaurant.name}` : ''}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="w-full h-13 pl-11 pr-4 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all shadow-sm"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Tu contraseña"
                                    className="w-full h-13 pl-11 pr-11 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none transition-all shadow-sm"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-slate-900 text-white font-black uppercase text-sm tracking-wider rounded-2xl hover:bg-orange-500 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
                        </button>
                    </form>

                    {/* Register link */}
                    <div className="text-center">
                        <p className="text-sm text-slate-400">
                            ¿Aún no tienes cuenta?{" "}
                            <Link href="/register" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}
