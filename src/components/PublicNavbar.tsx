"use client"

import Link from "next/link"
import Image from "next/image"

export default function PublicNavbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/landing" className="flex items-center gap-2 group">
                        <Image
                            src="/images/jamali-os-transparent.png"
                            alt="JAMALI OS Logo"
                            width={180}
                            height={60}
                            className="h-12 w-auto object-contain"
                        />
                    </Link>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/landing#product" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Producto</Link>
                        <Link href="/landing#features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Funciones</Link>
                        <Link href="/landing#pricing" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Precios</Link>
                        <Link href="/landing#demo" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Demo</Link>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Entrar</Link>
                    <Link href="/register/wizard" className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-orange-500 transition-all shadow-sm">
                        Solicitar Demo
                    </Link>
                </div>
            </div>
        </nav>
    )
}
