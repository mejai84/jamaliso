import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const startTime = Date.now();
    let supabaseStatus = 'disconnected';
    let dbLatency = 0;

    try {
        const supabase = await createClient();

        // Simple ping to database
        const { error } = await supabase.from('restaurants').select('id').limit(1);

        if (!error) {
            supabaseStatus = 'connected';
            dbLatency = Date.now() - startTime;
        } else {
            console.error("Health check DB error:", error.message);
        }
    } catch (e) {
        console.error("Health check exception:", e);
    }

    const payload = {
        status: supabaseStatus === 'connected' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        services: {
            database: {
                status: supabaseStatus,
                latency_ms: dbLatency
            },
            api: {
                status: 'connected',
                uptime: process.uptime()
            }
        }
    };

    return NextResponse.json(payload, {
        status: payload.status === 'healthy' ? 200 : 503,
        headers: {
            'Cache-Control': 'no-store, max-age=0'
        }
    });
}
