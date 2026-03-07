'use server'

import { Pool } from 'pg'
import { revalidatePath } from 'next/cache'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

export interface PayrollRunResult {
    success: boolean
    message: string
    run_id?: string
    error?: string
}

/**
 * 🚀 JAMALI OS CORE: Motor de Cálculo de Nómina
 * Ejecuta el cálculo completo para un periodo específico utilizando transacciones ACID
 * en PostgreSQL para total seguridad financiera.
 */
export async function calculatePayrollForPeriod(
    restaurantId: string,
    periodId: string,
    userId: string
): Promise<PayrollRunResult> {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 1. Validar que el periodo exista y esté abierto
        const periodRes = await client.query(
            `SELECT start_date, end_date, status FROM public.payroll_periods WHERE id = $1 AND restaurant_id = $2 FOR UPDATE`,
            [periodId, restaurantId]
        )

        if (periodRes.rowCount === 0) {
            throw new Error("Periodo no encontrado o no pertenece al restaurante activo")
        }

        const period = periodRes.rows[0]
        if (period.status !== 'OPEN') {
            throw new Error("El periodo debe estar OPEN para generar cálculos")
        }

        // 2. Revisar si ya hay un DRAFT de este run
        const existingRunRes = await client.query(
            `SELECT id FROM public.payroll_runs WHERE period_id = $1 AND restaurant_id = $2`,
            [periodId, restaurantId]
        )

        let runId: string

        if (existingRunRes.rowCount! > 0) {
            runId = existingRunRes.rows[0].id
            // Limpiar items anteriores para re-calcular
            await client.query(`DELETE FROM public.payroll_items WHERE run_id = $1`, [runId])
        } else {
            // Crear nuevo Run
            const newRunRes = await client.query(
                `INSERT INTO public.payroll_runs (period_id, restaurant_id, status) VALUES ($1, $2, 'DRAFT') RETURNING id`,
                [periodId, restaurantId]
            )
            runId = newRunRes.rows[0].id
        }

        // 3. Obtener Conceptos Clave (Salario Base, Horas Extras, Comisiones)
        const conceptsRes = await client.query(
            `SELECT id, name, type FROM public.payroll_concepts WHERE restaurant_id = $1`,
            [restaurantId]
        )

        const getConcept = (name: string, type: 'EARNING' | 'DEDUCTION') => {
            let concept = conceptsRes.rows.find(c => c.name === name)
            if (!concept) {
                // Return null si no existe, se debería manejar en base o crear a mano.
                // En un setup maduro, esto viene pre-cargado.
                return null
            }
            return concept.id
        }

        // Conceptos básicos comunes (se asumen creados en seed o UI)
        const conceptBaseId = getConcept('Salario Básico', 'EARNING')
        const conceptOvertimeId = getConcept('Horas Extras', 'EARNING')
        const conceptCommissionId = getConcept('Comisiones Ventas', 'EARNING')

        let totalRunEarnings = 0
        let totalRunDeductions = 0

        // 4. Obtener Empleados Activos con su tarifa y turnos en el periodo
        // Consultamos turnos (shifts) de los empleados dentro de rango de fechas
        const employeesRes = await client.query(
            `SELECT 
                p.id as employee_id, 
                p.hourly_rate,
                COALESCE(SUM(s.regular_hours), 0) as total_regular,
                COALESCE(SUM(s.overtime_hours), 0) as total_overtime,
                COALESCE(SUM(s.total_payment), 0) as shifts_total_payment
             FROM public.profiles p
             LEFT JOIN public.shifts s ON 
                s.user_id = p.id AND 
                s.restaurant_id = p.restaurant_id AND
                s.started_at >= $1 AND s.started_at <= $2 AND
                s.status = 'CLOSED'
             WHERE p.restaurant_id = $3 AND p.role IN ('waiter', 'kitchen', 'cashier', 'manager')
             GROUP BY p.id, p.hourly_rate`,
            [period.start_date, period.end_date, restaurantId]
        )

        for (const emp of employeesRes.rows) {
            let employeeEarnings = 0

            // A. Salario Base por horas
            const baseAmount = Number(emp.total_regular) * Number(emp.hourly_rate || 0)
            if (baseAmount > 0) {
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.employee_id, conceptBaseId, baseAmount, `Horas Regulares: ${emp.total_regular}`]
                )
                employeeEarnings += baseAmount
            }

            // B. Horas Extras
            const overtimeAmount = Number(emp.total_overtime) * (Number(emp.hourly_rate || 0) * 1.5) // 50% recargo por defecto
            if (overtimeAmount > 0) {
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.employee_id, conceptOvertimeId, overtimeAmount, `Horas Extras: ${emp.total_overtime}`]
                )
                employeeEarnings += overtimeAmount
            }

            // C. Comisiones por ventas POS (Ej: Meseros)
            const salesRes = await client.query(
                `SELECT COALESCE(SUM(total_amount), 0) as total_sales 
                 FROM public.pos_sales 
                 WHERE user_id = $1 AND restaurant_id = $2 
                 AND created_at >= $3 AND created_at <= $4`,
                [emp.employee_id, restaurantId, period.start_date, period.end_date]
            )

            const totalSales = Number(salesRes.rows[0].total_sales)
            if (totalSales > 0) {
                const commissionRate = 0.01 // Ej: 1% de comisión para probar el motor
                const commissionAmount = totalSales * commissionRate
                if (commissionAmount > 0 && conceptCommissionId) {
                    await client.query(
                        `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                        [runId, emp.employee_id, conceptCommissionId, commissionAmount, `Comisión Ventas (1%)`]
                    )
                    employeeEarnings += commissionAmount
                }
            }

            // D. Novedades (Novelties: Incapacidades, Bonos extra, Deducciones prestamos manuales)
            const noveltiesRes = await client.query(
                `SELECT id, type, amount, notes FROM public.payroll_novelties 
                 WHERE employee_id = $1 AND status = 'APPROVED'
                 AND start_date >= $2 AND end_date <= $3`,
                [emp.employee_id, period.start_date, period.end_date]
            )

            let employeeDeductions = 0

            for (const nov of noveltiesRes.rows) {
                // Aqui habria un mapeo de type a concept
                const isEarning = nov.type.includes('BONUS')
                if (isEarning) {
                    employeeEarnings += Number(nov.amount)
                    // Insertariamos el item...
                } else {
                    employeeDeductions += Number(nov.amount)
                    // Insertariamos el item...
                }
            }

            totalRunEarnings += employeeEarnings
            totalRunDeductions += employeeDeductions
        }

        // 5. Actualizar el Total del Run
        const netTotal = totalRunEarnings - totalRunDeductions

        await client.query(
            `UPDATE public.payroll_runs 
             SET total_earnings = $1, total_deductions = $2, net_total = $3
             WHERE id = $4`,
            [totalRunEarnings, totalRunDeductions, netTotal, runId]
        )

        // 6. Auditoria
        await client.query(
            `INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, restaurant_id) 
            VALUES ($1, 'CALCULATE', 'payroll_run', $2, $3)`,
            [userId, runId, restaurantId]
        )

        await client.query('COMMIT')

        revalidatePath('/admin/payroll')

        return {
            success: true,
            message: `Nómina calculada exitosamente. Total Neto: $${netTotal}`,
            run_id: runId
        }

    } catch (error: any) {
        await client.query('ROLLBACK')
        console.error("Payroll Error:", error)
        return {
            success: false,
            message: "Fallo crí­tico en motor de nómina.",
            error: error.message
        }
    } finally {
        client.release()
    }
}
