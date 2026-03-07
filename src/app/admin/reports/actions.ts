'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReportEmail(email: string, reportData: any) {
    try {
        if (!process.env.RESEND_API_KEY) {
            // Mock success for development if no key is present, but warn user
            console.log('Simulating email send (No API Key found):', { email, reportData })
            return { success: false, error: 'Falta la API Key de Resend (RESEND_API_KEY)' }
        }

        const { data, error } = await resend.emails.send({
            from: 'JAMALI SO Reports <onboarding@resend.dev>',
            to: [email],
            subject: `Reporte del Restaurante - ${new Date().toLocaleDateString('es-ES')}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Reporte de Rendimiento</h1>
                    <p style="color: #666;">Resumen generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
                    
                    <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <div style="margin-bottom: 10px;">
                            <strong>Ingresos Totales:</strong> 
                            <span style="font-size: 1.2em; color: #16a34a;">${reportData.totalRevenue.toFixed(2)}€</span>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong>Total Pedidos:</strong> ${reportData.totalOrders}
                        </div>
                        <div>
                            <strong>Ticket Promedio:</strong> ${reportData.averageOrderValue.toFixed(2)}€
                        </div>
                    </div>

                    <h3>Top 5 Productos</h3>
                    <ul style="line-height: 1.6;">
                        ${reportData.topProducts.slice(0, 5).map((p: any) => `
                            <li>
                                <strong>${p.name}</strong> 
                                <span style="color: #666;">(${p.sales} ventas)</span> - 
                                ${p.revenue.toFixed(2)}€
                            </li>
                        `).join('')}
                    </ul>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 0.8em; color: #999; text-align: center;">JAMALI SO Admin System &middot; Powered by Antigravity</p>
                </div>
            `
        })

        if (error) {
            console.error('Resend Error:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Email Action Error:', error)
        return { success: false, error: 'Error inesperado al enviar el email' }
    }
}
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function getBusinessIntelligenceData(restaurantId: string) {
    if (!restaurantId) return { success: false, error: 'Restaurant ID is required' }

    const client = await pool.connect()
    try {
        // 1. KPIs del mes actual
        const kpiQuery = `
            SELECT 
                COALESCE(SUM(total), 0) as total_revenue,
                COUNT(id) as total_orders,
                COALESCE(AVG(total), 0) as avg_ticket,
                COUNT(DISTINCT customer_id) as total_customers
            FROM orders 
            WHERE restaurant_id = $1 
            AND status != 'cancelled'
            AND created_at >= date_trunc('month', current_date)
        `
        const kpiRes = await client.query(kpiQuery, [restaurantId])

        // 2. Ventas diarias (últimos 7 días)
        const dailyQuery = `
            WITH RECURSIVE days AS (
                SELECT current_date - interval '6 days' as day
                UNION ALL
                SELECT day + interval '1 day'
                FROM days
                WHERE day < current_date
            )
            SELECT 
                to_char(days.day, 'Dy') as day_label,
                COALESCE(SUM(o.total), 0) as total_sales,
                COUNT(o.id) as order_count
            FROM days
            LEFT JOIN orders o ON date_trunc('day', o.created_at) = days.day 
                AND o.restaurant_id = $1 
                AND o.status != 'cancelled'
            GROUP BY days.day
            ORDER BY days.day
        `
        const dailyRes = await client.query(dailyQuery, [restaurantId])

        // 3. Top Productos con Margen de Contribución
        const topQuery = `
            SELECT 
                p.name as product_name,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.subtotal) as total_revenue,
                COALESCE((
                    SELECT SUM(i.cost_per_unit * ri.quantity)
                    FROM recipes_new r
                    JOIN recipe_items ri ON r.id = ri.recipe_id
                    JOIN ingredients i ON ri.ingredient_id = i.id
                    WHERE r.product_id = p.id
                ), 0) as unit_cost
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.restaurant_id = $1 
            AND o.status != 'cancelled'
            GROUP BY p.id, p.name
            ORDER BY total_revenue DESC
            LIMIT 5
        `
        const topRes = await client.query(topQuery, [restaurantId])

        // 4. Merma Semanal (Waste)
        const wasteQuery = `
            SELECT 
                to_char(created_at, 'Dy') as day_label,
                SUM(quantity * cost_at_waste) as total_waste
            FROM waste_reports
            WHERE restaurant_id = $1
            AND created_at >= current_date - interval '7 days'
            GROUP BY date_trunc('day', created_at), day_label
            ORDER BY date_trunc('day', created_at)
        `
        const wasteRes = await client.query(wasteQuery, [restaurantId])

        // 5. Conciliación de Caja en Tiempo Real
        const cashQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN movement_type IN ('OPENING', 'SALE', 'DEPOSIT') THEN amount ELSE -amount END), 0) as current_balance
            FROM cash_movements
            WHERE restaurant_id = $1
            AND cashbox_session_id IN (
                SELECT id FROM cashbox_sessions WHERE status = 'OPEN' AND restaurant_id = $1
            )
        `
        const cashRes = await client.query(cashQuery, [restaurantId])

        return {
            success: true,
            data: {
                kpis: {
                    total_revenue_month: parseFloat(kpiRes.rows[0].total_revenue),
                    total_orders_month: parseInt(kpiRes.rows[0].total_orders),
                    avg_ticket: parseFloat(kpiRes.rows[0].avg_ticket),
                    total_customers: parseInt(kpiRes.rows[0].total_customers),
                    current_cash_balance: parseFloat(cashRes.rows[0].current_balance)
                },
                dailySales: dailyRes.rows.map((r: any) => ({
                    day: r.day_label,
                    total_sales: parseFloat(r.total_sales),
                    order_count: parseInt(r.order_count)
                })),
                topProducts: topRes.rows.map((r: any) => ({
                    product_name: r.product_name,
                    total_quantity: parseFloat(r.total_quantity),
                    total_revenue: parseFloat(r.total_revenue),
                    contribution_margin: parseFloat(r.total_revenue) - (parseFloat(r.unit_cost) * parseFloat(r.total_quantity))
                })),
                weeklyWaste: wasteRes.rows.map((r: any) => ({
                    day: r.day_label,
                    amount: parseFloat(r.total_waste)
                }))
            }
        }
    } catch (error: any) {
        console.error('BI Query Error:', error)
        return { success: false, error: error.message }
    } finally {
        client.release()
    }
}
