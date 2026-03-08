"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useOrderNotifications } from "@/hooks/use-order-notifications"
import { Toaster } from "sonner"
import { useRestaurant } from "@/providers/RestaurantProvider"
import { JamaliBot } from "@/components/admin/jamali-bot"
import { IncomingOrderAlert } from "@/components/admin/incoming-order-alert"
import { ShiftGuard } from "@/components/admin/shift-guard"
import Image from "next/image"

// Components
import { Sidebar } from "@/components/admin/layout/Sidebar"
import { MobileHeader } from "@/components/admin/layout/MobileHeader"
import { MobileSidebar } from "@/components/admin/layout/MobileSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { restaurant, loading: restaurantLoading } = useRestaurant()

    // Auth & UI State
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [userRole, setUserRole] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Activar Notificaciones Real-Time Globales
    useOrderNotifications()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    router.push("/login")
                    return
                }

                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, full_name')
                    .eq('id', session.user.id)
                    .maybeSingle()

                if (profileError) throw profileError

                const allowedRoles = ['admin', 'staff', 'manager', 'cashier', 'waiter', 'cook', 'chef', 'cleaner', 'host', 'driver']

                if (!data || !allowedRoles.includes(data.role)) {
                    router.push("/")
                    return
                }

                setUserRole(data.role)
                setUserName(data.full_name || "Admin")
                setAuthorized(true)
            } catch (err) {
                console.error("Auth check failed:", err)
                router.push("/")
            } finally {
                setLoading(false)
            }
        }

        if (!restaurantLoading) {
            checkAuth()
        }
    }, [router, restaurantLoading])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-sans">
                <div className="flex flex-col items-center gap-8">
                    <div className="relative w-40 h-16 animate-pulse opacity-20">
                        <Image
                            src="/images/jamali-os-logo.png"
                            alt="JAMALI OS"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (!authorized) return null

    return (
        <ShiftGuard>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    ${restaurant?.primary_color ? `--primary: ${restaurant.primary_color} !important;` : ''}
                    ${restaurant?.primary_color ? `--accent: ${restaurant.primary_color} !important;` : ''}
                }
            `}} />
            <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 transition-colors duration-300 selection:bg-primary selection:text-white font-sans">

                <Sidebar
                    restaurant={restaurant}
                    userRole={userRole}
                    userName={userName}
                />

                <main className="flex-1 flex flex-col min-w-0">
                    <MobileHeader
                        restaurant={restaurant}
                        onMenuOpen={() => setIsMobileMenuOpen(true)}
                    />

                    <MobileSidebar
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                        userRole={userRole}
                    />

                    <div className="flex-1 relative overflow-y-auto custom-scrollbar">
                        {children}
                    </div>

                    <JamaliBot />
                    <IncomingOrderAlert />
                    <Toaster position="top-right" richColors />
                </main>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { 
                        background: rgba(0, 0, 0, 0.1); 
                        border-radius: 10px; 
                    }
                `}</style>
            </div>
        </ShiftGuard>
    )
}
