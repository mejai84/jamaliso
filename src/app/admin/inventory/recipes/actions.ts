'use server'

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function getRecipes(restaurantId: string) {
    if (!restaurantId) return { success: false, error: 'Restaurant ID is required' }

    try {
        const query = `
            SELECT 
                r.id,
                p.name as name,
                p.id as product_id,
                COALESCE(SUM(i.cost_per_unit * ri.quantity), 0) as total_cost,
                COUNT(ri.id) as components_count
            FROM recipes_new r
            JOIN products p ON r.product_id = p.id
            LEFT JOIN recipe_items ri ON r.id = ri.recipe_id
            LEFT JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE r.restaurant_id = $1
            GROUP BY r.id, p.id, p.name
        `
        const res = await pool.query(query, [restaurantId])
        return { success: true, data: res.rows }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getIngredients(restaurantId: string) {
    try {
        const res = await pool.query('SELECT id, name, unit, cost_per_unit FROM ingredients WHERE restaurant_id = $1', [restaurantId])
        return { success: true, data: res.rows }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function saveRecipe(restaurantId: string, productId: string, items: { ingredient_id: string, quantity: number }[]) {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // 1. Crear o buscar cabecera de receta (recipes_new)
        let recipeHeader = await client.query(
            'SELECT id FROM recipes_new WHERE product_id = $1 AND restaurant_id = $2',
            [productId, restaurantId]
        )

        let recipeId;
        if (recipeHeader.rows.length === 0) {
            const insertHeader = await client.query(
                'INSERT INTO recipes_new (product_id, restaurant_id, name) VALUES ($1, $2, (SELECT name FROM products WHERE id = $1)) RETURNING id',
                [productId, restaurantId]
            )
            recipeId = insertHeader.rows[0].id
        } else {
            recipeId = recipeHeader.rows[0].id
        }

        // 2. Limpiar items anteriores
        await client.query('DELETE FROM recipe_items WHERE recipe_id = $1', [recipeId])

        // 3. Insertar nuevos items
        for (const item of items) {
            await client.query(
                'INSERT INTO recipe_items (recipe_id, ingredient_id, quantity) VALUES ($1, $2, $3)',
                [recipeId, item.ingredient_id, item.quantity]
            )
        }

        await client.query('COMMIT')
        return { success: true }
    } catch (error: any) {
        await client.query('ROLLBACK')
        return { success: false, error: error.message }
    } finally {
        client.release()
    }
}
