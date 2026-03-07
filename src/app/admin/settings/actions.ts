'use server'

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function updateRestaurantBranding(restaurantId: string, data: { name?: string, logo_url?: string, primary_color?: string }) {
    if (!restaurantId) return { success: false, error: 'Restaurant ID is required' }

    try {
        const { name, logo_url, primary_color } = data
        const query = `
            UPDATE restaurants 
            SET 
                name = COALESCE($1, name),
                logo_url = COALESCE($2, logo_url),
                primary_color = COALESCE($3, primary_color),
                updated_at = NOW()
            WHERE id = $4
        `
        await pool.query(query, [name, logo_url, primary_color, restaurantId])

        return { success: true }
    } catch (error: any) {
        console.error('Update Branding Error:', error)
        return { success: false, error: error.message }
    }
}
