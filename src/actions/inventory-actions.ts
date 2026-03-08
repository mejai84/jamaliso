'use server'

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

import { validateUserRestaurant } from '@/lib/security'

/**
 * Descuenta ingredientes del inventario basados en la receta de los productos de una orden.
 */
export async function deductInventoryFromOrder(orderId: string, restaurantId: string) {
    if (!orderId || !restaurantId) return { success: false, error: 'Order ID and Restaurant ID are required' }

    // 🛡️ Security Check
    try {
        await validateUserRestaurant(restaurantId)
    } catch (e: any) {
        return { success: false, error: e.message }
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // 1. Obtener items de la orden
        const itemsRes = await client.query(
            'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
            [orderId]
        )

        for (const item of itemsRes.rows) {
            // 2. Buscar receta del producto usando las tablas correctas (recipes_new y recipe_items)
            const recipeRes = await client.query(
                `SELECT 
                   ri.ingredient_id, 
                   ri.quantity as ingredient_qty 
                 FROM recipes_new r
                 JOIN recipe_items ri ON r.id = ri.recipe_id
                 WHERE r.product_id = $1 AND r.restaurant_id = $2`,
                [item.product_id, restaurantId]
            )

            for (const ingredient of recipeRes.rows) {
                const amountToDeduct = ingredient.ingredient_qty * item.quantity

                // 3. Obtener stock previo para el log
                const { rows: [ingData] } = await client.query('SELECT current_stock, name FROM ingredients WHERE id = $1', [ingredient.ingredient_id])

                // 4. Descontar del stock actual
                await client.query(
                    'UPDATE ingredients SET current_stock = current_stock - $1 WHERE id = $2 AND restaurant_id = $3',
                    [amountToDeduct, ingredient.ingredient_id, restaurantId]
                )

                // 5. Registrar movimiento de inventario para trazabilidad total (Food Cost & Robo Hormiga)
                await client.query(`
                    INSERT INTO inventory_movements (
                        ingredient_id, restaurant_id, movement_type, quantity, 
                        previous_stock, new_stock, reference_id, reference_type, notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    ingredient.ingredient_id,
                    restaurantId,
                    'SALE_DEDUCTION',
                    amountToDeduct,
                    ingData.current_stock,
                    ingData.current_stock - amountToDeduct,
                    orderId,
                    'order',
                    `Descuento automático por venta de producto (ID: ${item.product_id})`
                ])
            }
        }

        await client.query('COMMIT')
        return { success: true }
    } catch (error: any) {
        await client.query('ROLLBACK')
        console.error('Inventory Deduction Error:', error)
        return { success: false, error: error.message }
    } finally {
        client.release()
    }
}
