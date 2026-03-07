"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Lock, Eye, EyeOff, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SlugLoginPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params?.slug as string

    const [restaurant, setRestaurant] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (slug) loadRestaurant()
    }, [slug])

    const loadRestaurant = async () => {
        const { data } = await supabase
            .from('restaurants')
            .select('id, name, logo_url, primary_color, slug, subdomain')
            .or(`slug.eq.${slug},subdomain.eq.${slug}`)
            .maybeSingle()

        if (data) setRestaurant(data)
        setLoading(false)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
            if (authErr) throw authErr

            // Obtener perfil con rol
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, restaurant_id')
                .eq('id', data.user.id)
                .maybeSingle()

            if (!profile) {
                setError("Perfil de usuario no encontrado")
                return
            }

            // Verificar que pertenece a este restaurante
            if (restaurant && profile.restaurant_id !== restaurant.id) {
                setError("Tu cuenta no pertenece a este restaurante")
                await supabase.auth.signOut()
                return
            }

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
                    router.push(`/${slug}/menu`)
            }
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4 p-8">
                    <h1 className="text-2xl font-black text-slate-900">Restaurante no encontrado</h1>
                    <p className="text-slate-500 text-sm">La URL <code className="bg-slate-100 px-2 py-1 rounded text-xs">/{slug}</code> no es válida.</p>
                </div>
            </div>
        )
    }

    const brandColor = restaurant.primary_color || '#ea580c'

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6">
            <div className="w-full max-w-md space-y-8">
                {/* BRANDING */}
                <div className="text-center space-y-4">
                    {restaurant.logo_url ? (
                        <img src={restaurant.logo_url} alt={restaurant.name} className="w-20 h-20 rounded-3xl object-cover mx-auto shadow-xl" />
                    ) : (
                        <div
                            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl"
                            style={{ backgroundColor: brandColor }}
                        >
                            <ChefHat className="w-10 h-10 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                            {restaurant.name}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Ingresa a tu panel de gestión</p>
                    </div>
                </div>

                {/* LOGIN FORM */}
                <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                className="w-full h-12 pl-11 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-orange-400 focus:outline-none transition-all"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={submitting}
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
                                className="w-full h-12 pl-11 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-orange-400 focus:outline-none transition-all"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                disabled={submitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-14 font-black uppercase text-sm tracking-wider rounded-2xl shadow-lg transition-all"
                        style={{ backgroundColor: brandColor }}
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "INICIAR SESIÓN"
                        )}
                    </Button>
                </form>

                <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Powered by JAMALI OS · Antigravity
                </p>
            </div>
        </div>
    )
}
