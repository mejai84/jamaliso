"use server"

import { createClient } from "@/lib/supabase/server"

export async function saveDemoLead(data: {
    name: string;
    email: string;
    type: string;
    challenge: string;
}) {
    const supabase = await createClient()

    // Intentar insertar en una tabla de leads (la crearemos si no existe)
    // Por ahora, lo manejamos de forma segura para no romper el flujo
    try {
        const { error } = await supabase
            .from('demo_leads')
            .insert([
                {
                    full_name: data.name,
                    email: data.email,
                    business_type: data.type,
                    main_challenge: data.challenge,
                    metadata: {
                        source: 'wizard_demo',
                        created_at: new Date().toISOString()
                    }
                }
            ])

        if (error) {
            console.error("Error saving lead:", error)
            // No bloqueamos al usuario si falla el guardado de marketing
        }

        return { success: true }
    } catch (err) {
        console.error("Critical error saving lead:", err)
        return { success: false }
    }
}
