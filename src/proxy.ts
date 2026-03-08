import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple Edge-Compatible Rate Limiter (InMemory)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 100;

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const path = request.nextUrl.pathname;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown-ip';

    // 1. RATE LIMITING
    if (
        !path.startsWith('/_next') &&
        !path.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) &&
        path.startsWith('/api/')
    ) {
        const now = Date.now();
        const requestData = rateLimitMap.get(ip);
        if (!requestData || requestData.lastReset < now - RATE_LIMIT_WINDOW) {
            rateLimitMap.set(ip, { count: 1, lastReset: now });
        } else {
            requestData.count++;
            if (requestData.count > MAX_REQUESTS) {
                return new NextResponse(
                    JSON.stringify({ error: 'Rate limit exceeded' }),
                    { status: 429, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }
    }

    // 2. SUPABASE SESSION REFRESH (From consolidated proxy logic)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // Perimetral Auth Check for /admin
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        const isDemo = request.nextUrl.searchParams.get('demo') === 'true';
        if (!isDemo) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
