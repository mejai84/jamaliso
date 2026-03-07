"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

/**
 * /[slug]/admin → Detecta el restaurante por slug y redirige al panel admin.
 * El RestaurantProvider resolverá el restaurante por slug automáticamente.
 */
export default function SlugAdminRedirect() {
    const params = useParams()
    const router = useRouter()
    const slug = params?.slug as string
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const init = async () => {
            // Verificar que el restaurante existe
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id, name, slug')
                .or(`slug.eq.${slug},subdomain.eq.${slug}`)
                .maybeSingle()

            if (!restaurant) {
                setError(`Restaurante "${slug}" no encontrado`)
                return
            }

            // Verificar sesión del usuario
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.replace(`/${slug}/login`)
                return
            }

            // Obtener perfil del usuario con su rol
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, restaurant_id')
                .eq('id', session.user.id)
                .maybeSingle()

            if (!profile) {
                router.replace(`/${slug}/login`)
                return
            }

            // Verificar que el usuario pertenece a ESTE restaurante
            if (profile.restaurant_id !== restaurant.id) {
                setError("No tienes acceso a este restaurante")
                return
            }

            // Redirigir según rol
            switch (profile.role) {
                case 'admin':
                case 'super_admin':
                case 'owner':
                    router.replace('/admin')
                    break
                case 'waiter':
                case 'mesero':
                    router.replace('/admin/waiter')
                    break
                case 'kitchen':
                case 'cocinero':
                    router.replace('/admin/kitchen')
                    break
                case 'cashier':
                case 'cajero':
                    router.replace('/admin/pos')
                    break
                default:
                    router.replace(`/${slug}/menu`)
            }
        }

        if (slug) init()
    }, [slug])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
                        <span className="text-3xl">🚫</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">{error}</h1>
                    <p className="text-slate-500 text-sm">Verifica que la URL sea correcta.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
                    >
                        IR AL INICIO
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Accediendo al panel...</p>
            </div>
        </div>
    )
}
