import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple Edge-Compatible Rate Limiter (InMemory)
// Para producción masiva se recomienda conectarlo a Redis (Upstash)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 100; // 100 peticiones por minuto por IP

export async function middleware(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown-ip';
    const path = req.nextUrl.pathname;

    // 1. RATE LIMITING ASÍNCRONO
    // Excluimos rutas estáticas y del sistema para no consumir límites innecesarios
    if (
        !path.startsWith('/_next') &&
        !path.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) &&
        path.startsWith('/api/')
    ) {
        const now = Date.now();
        const windowStart = now - RATE_LIMIT_WINDOW;

        let requestData = rateLimitMap.get(ip);

        // Si no existe o caducó la ventana de tiempo, reiniciamos el contador
        if (!requestData || requestData.lastReset < windowStart) {
            requestData = { count: 0, lastReset: now };
        }

        requestData.count++;
        rateLimitMap.set(ip, requestData);

        if (requestData.count > MAX_REQUESTS) {
            console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip} on path: ${path}`);
            return new NextResponse(
                JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: 'Demasiadas solicitudes detectadas. Intente de nuevo más tarde.'
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60'
                    }
                }
            );
        }
    }

    // 2. VALIDACIÓN ESTRICTA DE JWT Y SESIÓN
    // Si están intentando entrar al panel administrador, verificamos la cookie
    // Nota: La validación fuerte ocurre en Supabase, esto es protección perimetral
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        // Supabase Auth maneja sus cookies con este prefijo por defecto en SSR
        const hasSession = req.cookies.getAll().some(c => c.name.includes('-auth-token'));

        if (!hasSession) {
            // Intento de acceso sin token vigente
            const redirectUrl = new URL('/login', req.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
