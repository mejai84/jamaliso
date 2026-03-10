import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

// --- Tipos de Datos ---
interface RestaurantContext {
    restaurante: string
    fecha_actual: string
    contexto_externo: {
        clima: string
        evento_cercano: string
    }
    historico_ventas_reciente: {
        dia: string
        total_ventas: number
        plato_top: string
    }[]
    inventario_critico: {
        item: string
        cantidad_actual: number
        unidad: string
        promedio_uso_diario: number
    }[]
}

// Inicialización de Supabase con credenciales de entorno (Edge Function env vars)
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Inicialización de OpenAI
const configuration = new Configuration({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
})
const openai = new OpenAIApi(configuration)

const SYSTEM_PROMPT = `
Actúa como un experto consultor de operaciones gastronómicas hiper-optimizado.
Tu objetivo es analizar el JSON de datos del restaurante que se te proporciona y devolver una Hoja de Ruta Predictiva crítica.

Debes identificar:
1. Riesgo de Quiebre: Ingredientes que probablemente se agotarán antes del próximo cierre (usa los días de histórico para calcular el flujo).
2. Sugerencia de Compra: Cantidades exactas a pedir hoy para cubrir la demanda proyectada de mañana (considerando eventos externos como el clima o partidos que impactan la afluencia).
3. Estrategia de Venta Corto Plazo: Sugiere al dueño qué plato promocionar HOY para aprovechar inventario o combatir baja afluencia.

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO CON ESTA ESTRUCTURA EXACTA:
{
  "alertas_criticas": [{ "mensaje": "..." }],
  "prediccion_ventas": "...",
  "sugerencias_compra": [{ "item": "...", "cantidad": "...", "motivo": "..." }],
  "estrategia_margen": "..."
}
NO AGREGUES TEXTO FUERA DEL JSON.
`

serve(async (req) => {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const { restaurant_id } = await req.json()

        if (!restaurant_id) {
            return new Response(JSON.stringify({ error: 'restaurant_id required' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            })
        }

        console.log(`[JAMALI AI] Analizando predicción para restaurante: ${restaurant_id}`)

        // 1. Recolección de Datos (Data Sourcing)
        // Obtener datos del restaurante
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('name')
            .eq('id', restaurant_id)
            .single()

        // Obtener ventas de los últimos 7 días (Simplificado para el ejemplo)
        // En producción se realizarían cálculos complejos sobre 'orders' o 'tickets'
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        const { data: salesData } = await supabase
            .from('orders')
            .select('created_at, total')
            .eq('restaurant_id', restaurant_id)
            .gte('created_at', lastWeek.toISOString())

        // Obtener inventario crítico (insumos por debajo del nivel de alerta)
        const { data: criticalInventory } = await supabase
            .from('inventory_items')
            .select('name, current_stock, unit, daily_usage_avg, min_stock_alert')
            .eq('restaurant_id', restaurant_id)
            .lt('current_stock', 50) // Umbral de ejemplo, idealmente comparar vs min_stock_alert
            .limit(10)

        // Agregación de ventas por día (Mockeado para estructura)
        const ventasMockeadas = [
            { dia: "Ayer", total_ventas: salesData?.length || 150, plato_top: "Hamburguesa Jamali" },
            { dia: "Hace 2 días", total_ventas: 130, plato_top: "Alitas BBQ" }
        ]

        // 2. Empaquetar el Objecto JSON
        const payload: RestaurantContext = {
            restaurante: restaurant?.name || "Restaurante Demo",
            fecha_actual: new Date().toISOString().split('T')[0],
            contexto_externo: {
                clima: "Lluvia leve", // Idealmente consumido de una API como OpenWeatherMap
                evento_cercano: "Fin de semana (Quincena)" // Calculado por calendario
            },
            historico_ventas_reciente: ventasMockeadas,
            inventario_critico: criticalInventory?.map(i => ({
                item: i.name,
                cantidad_actual: i.current_stock,
                unidad: i.unit,
                promedio_uso_diario: i.daily_usage_avg || 10
            })) || []
        }

        console.log(`[JAMALI AI] Payload generado:`, payload)

        // 3. Consulta a la IA (OpenAI)
        const chatCompletion = await openai.createChatCompletion({
            model: "gpt-4", // Se usa GPT-4 para mayor capacidad de análisis lógico
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: JSON.stringify(payload) }
            ],
            temperature: 0.3, // Temperatura baja para respuestas analíticas y predecibles
        })

        const iaResponseText = chatCompletion.data.choices[0].message?.content || "{}"

        let iaAnalysis;
        try {
            iaAnalysis = JSON.parse(iaResponseText)
        } catch (e) {
            console.error("Failed to parse AI response as JSON", iaResponseText)
            iaAnalysis = { error: "Formateo incorrecto por parte del modelo." }
        }

        console.log(`[JAMALI AI] Análisis completado con éxito.`)

        // 4. Guardar resultado para que el Frontend lo consuma
        // Insertamos en notificaciones IA
        await supabase.from('ai_consultant_logs').insert({
            restaurant_id: restaurant_id,
            analysis_data: iaAnalysis,
            raw_payload: payload,
            created_at: new Date().toISOString()
        })

        return new Response(JSON.stringify(iaAnalysis), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error("[JAMALI AI ERROR]", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
