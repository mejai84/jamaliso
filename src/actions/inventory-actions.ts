'use server'

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

/**
 * Descuenta ingredientes del inventario basados en la receta de los productos de una orden.
 */
export async function deductInventoryFromOrder(orderId: string, restaurantId: string) {
    if (!orderId || !restaurantId) return { success: false, error: 'Order ID and Restaurant ID are required' }

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

                // 3. Descontar del stock actual
                await client.query(
                    'UPDATE ingredients SET current_stock = current_stock - $1 WHERE id = $2 AND restaurant_id = $3',
                    [amountToDeduct, ingredient.ingredient_id, restaurantId]
                )

                // 4. Registrar movimiento (si existe tabla de movimientos)
                // Omitido por ahora para simplificar, pero se puede añadir luego
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
