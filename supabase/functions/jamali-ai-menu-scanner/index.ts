import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Se asume el uso del SDK oficial o fetch directo a OpenAI API para usar el modelo de visión (gpt-4-vision-preview o gpt-4o)
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const VISION_SYSTEM_PROMPT = `
Eres un asistente experto en digitalización de restaurantes para JAMALI OS.
Tu tarea es analizar la imagen proporcionada (una foto de un menú físico o un documento escaneado) y extraer toda la información de los productos y categorías disponibles.

REGLAS DE EXTRACCIÓN:
1. Extrae el nombre del producto, descripción (si existe), precio y categoría.
2. Agrupa los productos en las categorías lógicas evidentes (ej: Entradas, Platos Fuertes, Bebidas, Postres).
3. Asegúrate de que el precio sea estrictamente un NÚMERO entero y omite símbolos de moneda como '$'.
4. Si un producto no tiene descripción, devuelve una cadena vacía "".
5. Devuelve EXCLUSIVAMENTE un archivo JSON válido.

ESTRUCTURA JSON REQUERIDA:
{
  "categorias_detectadas": ["Entradas", "Bebidas"],
  "productos": [
    {
      "nombre": "Empanadas de Carne",
      "descripcion": "Ración de 3 unidades con ají casero",
      "precio": 12000,
      "categoria": "Entradas"
    }
  ]
}
No devuelvas ningún texto introductorio, formato markdown o explicación.
`;

serve(async (req) => {
    // Solo permitir método POST
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        const { image_base64, restaurant_id } = await req.json()

        if (!image_base64 || !restaurant_id) {
            return new Response(JSON.stringify({ error: 'image_base64 and restaurant_id are required' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            })
        }

        console.log(`[JAMALI ONBOARDING] Iniciando escaneo mágico para restaurante: ${restaurant_id}`)

        // Llamada a la API de OpenAI Vision
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o", // Modelo multimodal recomendado
                messages: [
                    {
                        role: "system",
                        content: VISION_SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Por favor, extrae los ítems de este menú en formato JSON." },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${image_base64}`,
                                    detail: "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 4000,
                temperature: 0.1 // Baja temperatura para precisión en extracción de datos
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`OpenAI Error: ${json.stringify(errData)}`);
        }

        const data = await response.json();
        const rawContent = data.choices[0].message.content;

        // Limpieza básica (a veces OpenAI devuelve el JSON envuelto en markdown ```json ... ```)
        const cleanJsonString = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

        let extractedMenu;
        try {
            extractedMenu = JSON.parse(cleanJsonString);
        } catch (e) {
            throw new Error(`Error parsing AI response to JSON: ${cleanJsonString}`);
        }

        console.log(`[JAMALI ONBOARDING] Menú extraído exitosamente. Categorías:`, extractedMenu.categorias_detectadas)

        // OPCIONAL: Insertar directamente en la base de datos (Supabase)
        // En una implementación real de "Golden Path", aquí crearíamos las categorías 
        // y luego iteraríamos los 'productos' insertándolos a la tabla de base de datos
        // asociados al 'restaurant_id'.

        // Retornamos el JSON para que el frontend del Onboarding muestre la pre-visualización y el 
        // usuario pueda editar/confirmar en un paso final antes de guardar en BD.
        return new Response(JSON.stringify({
            success: true,
            menu: extractedMenu,
            message: "Menú analizado con IA"
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error("[JAMALI ONBOARDING ERROR]", error)
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
