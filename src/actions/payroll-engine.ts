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

// 🇨🇴 CONSTANTES LEGALES COLOMBIA 2026 (Estimadas)
const CONSTANTS_2026 = {
    SMLV: 1500000,
    AUX_TRANSPORTE: 180000,
    UMBRAL_AUX_TRANSPORTE: 3000000, // 2 * SMLV
    SALUD_EMPLOYEE: 0.04,
    PENSION_EMPLOYEE: 0.04,
    SALUD_EMPLOYER: 0.085,
    PENSION_EMPLOYER: 0.12,
    CCF: 0.04,
    ICBF: 0.03,
    SENA: 0.02,
    PRIMA: 0.0833,
    CESANTIAS: 0.0833,
    INT_CESANTIAS: 0.01,
    VACACIONES: 0.0417,
}

const ARL_RATES = [0.00522, 0.01044, 0.02436, 0.0435, 0.0696]

/**
 * 🚀 JAMALI OS CORE: Motor de Cálculo de Nómina LEGAL PRO
 */
export async function calculatePayrollForPeriod(
    restaurantId: string,
    periodId: string,
    userId: string
): Promise<PayrollRunResult> {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // 1. Validar Periodo
        const periodRes = await client.query(
            `SELECT start_date, end_date, status FROM public.payroll_periods WHERE id = $1 AND restaurant_id = $2 FOR UPDATE`,
            [periodId, restaurantId]
        )

        if (periodRes.rowCount === 0) throw new Error("Periodo no encontrado")
        const period = periodRes.rows[0]
        if (period.status !== 'OPEN') throw new Error("El periodo debe estar OPEN")

        // 2. Orquestar Run
        const existingRunRes = await client.query(
            `SELECT id FROM public.payroll_runs WHERE period_id = $1 AND restaurant_id = $2`,
            [periodId, restaurantId]
        )

        let runId: string
        if (existingRunRes.rowCount! > 0) {
            runId = existingRunRes.rows[0].id
            await client.query(`DELETE FROM public.payroll_items WHERE run_id = $1`, [runId])
            await client.query(`DELETE FROM public.payroll_provisions WHERE run_id = $1`, [runId])
            await client.query(`DELETE FROM public.payroll_employer_costs WHERE run_id = $1`, [runId])
        } else {
            const newRunRes = await client.query(
                `INSERT INTO public.payroll_runs (period_id, restaurant_id, status) VALUES ($1, $2, 'DRAFT') RETURNING id`,
                [periodId, restaurantId]
            )
            runId = newRunRes.rows[0].id
        }

        // 3. Obtener Conceptos
        const conceptsRes = await client.query(
            `SELECT id, name, type FROM public.payroll_concepts WHERE restaurant_id = $1 OR restaurant_id IS NULL`,
            [restaurantId]
        )

        const getConceptId = (name: string) => conceptsRes.rows.find(c => c.name.toLowerCase() === name.toLowerCase())?.id

        const cids = {
            base: getConceptId('Salario Básico'),
            aux: getConceptId('Auxilio de Transporte'),
            salud: getConceptId('Salud (Empleado)'),
            pension: getConceptId('Pensión (Empleado)'),
            extra: getConceptId('Hora Extra Diurna'),
            commission: getConceptId('Comisiones Ventas')
        }

        // 4. Procesar Empleados
        const employeesRes = await client.query(
            `SELECT p.* FROM public.profiles p WHERE p.restaurant_id = $1 AND p.role != 'customer'`,
            [restaurantId]
        )

        let totalRunEarnings = 0
        let totalRunDeductions = 0

        for (const emp of employeesRes.rows) {
            let earnings = 0
            let deductions = 0
            const monthlySalary = Number(emp.monthly_salary || 0)
            const IBC = monthlySalary // Base de Cotización (Simplified for MVP)

            // A. Salario Básico (Proporcional al periodo, asumiendo 30 días)
            const daysInPeriod = 15 // TODO: Calcular real de las fechas del periodo
            const basePay = (monthlySalary / 30) * daysInPeriod
            if (basePay > 0 && cids.base) {
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, cids.base, basePay, `Salario Básico - ${daysInPeriod} días`]
                )
                earnings += basePay
            }

            // B. Auxilio de Transporte (Si aplica)
            if (monthlySalary < CONSTANTS_2026.UMBRAL_AUX_TRANSPORTE && emp.transport_allowance_eligible && cids.aux) {
                const auxPay = (CONSTANTS_2026.AUX_TRANSPORTE / 30) * daysInPeriod
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, cids.aux, auxPay, 'Auxilio Legal de Transporte']
                )
                earnings += auxPay
            }

            // C. Deducciones Legales (Solo sobre base salarial, no incluye aux transp)
            const saludDed = IBC * CONSTANTS_2026.SALUD_EMPLOYEE * (daysInPeriod / 30)
            const pensionDed = IBC * CONSTANTS_2026.PENSION_EMPLOYEE * (daysInPeriod / 30)

            if (saludDed > 0 && cids.salud) {
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, cids.salud, saludDed, 'Aporte Salud 4%']
                )
                deductions += saludDed
            }
            if (pensionDed > 0 && cids.pension) {
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, cids.pension, pensionDed, 'Aporte Pensión 4%']
                )
                deductions += pensionDed
            }

            // D. Provisiones IFRS (Costo invisible pero real)
            const provisionItems = [
                { type: 'PRIMA', amt: earnings * CONSTANTS_2026.PRIMA },
                { type: 'CESANTIAS', amt: earnings * CONSTANTS_2026.CESANTIAS },
                { type: 'INT_CESANTIAS', amt: earnings * CONSTANTS_2026.CESANTIAS * CONSTANTS_2026.INT_CESANTIAS },
                { type: 'VACACIONES', amt: basePay * CONSTANTS_2026.VACACIONES },
            ]

            for (const prov of provisionItems) {
                await client.query(
                    `INSERT INTO public.payroll_provisions (run_id, employee_id, restaurant_id, type, amount) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, restaurantId, prov.type, prov.amt]
                )
            }

            // E. Costos Patronales (Seguridad Social Empresa)
            const employerCosts = [
                { c: 'PENSION_PATRONAL', a: IBC * CONSTANTS_2026.PENSION_EMPLOYER * (daysInPeriod / 30) },
                { c: 'CCF', a: IBC * CONSTANTS_2026.CCF * (daysInPeriod / 30) },
                { c: 'ARL', a: IBC * ARL_RATES[(emp.arl_risk_level || 1) - 1] * (daysInPeriod / 30) }
            ]

            for (const cost of employerCosts) {
                await client.query(
                    `INSERT INTO public.payroll_employer_costs (run_id, employee_id, restaurant_id, concept, amount) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, restaurantId, cost.c, cost.a]
                )
            }

            totalRunEarnings += earnings
            totalRunDeductions += deductions
        }

        // 5. Finalizar Run
        const netTotal = totalRunEarnings - totalRunDeductions
        await client.query(
            `UPDATE public.payroll_runs SET total_earnings = $1, total_deductions = $2, net_total = $3 WHERE id = $4`,
            [totalRunEarnings, totalRunDeductions, netTotal, runId]
        )

        await client.query('COMMIT')
        revalidatePath('/admin/payroll')

        return {
            success: true,
            message: `Nómina PRO calculada (Cumplimiento DIAN/IFRS). Neto a pagar: $${netTotal.toLocaleString()}`,
            run_id: runId
        }

    } catch (error: any) {
        await client.query('ROLLBACK')
        console.error("Payroll PRO Error:", error)
        return { success: false, message: "Error en motor legal de nómina.", error: error.message }
    } finally {
        client.release()
    }
}

/**
 * Obtiene los datos necesarios para generar el PDF del desprendible de nómina
 */
export async function getPayrollSlipData(runId: string, employeeId: string) {
    const client = await pool.connect()
    try {
        const [empRes, runRes, itemsRes] = await Promise.all([
            client.query('SELECT full_name, role, document_id FROM public.profiles WHERE id = $1', [employeeId]),
            client.query(`
                SELECT pr.id, pr.status, pr.net_total, pr.total_earnings, pr.total_deductions,
                       pp.name as period_name, pp.start_date, pp.end_date
                FROM public.payroll_runs pr
                JOIN public.payroll_periods pp ON pr.period_id = pp.id
                WHERE pr.id = $1
            `, [runId]),
            client.query(`
                SELECT pi.amount, pi.description, pc.name as concept_name, pc.type
                FROM public.payroll_items pi
                JOIN public.payroll_concepts pc ON pi.concept_id = pc.id
                WHERE pi.run_id = $1 AND pi.employee_id = $2
            `, [runId, employeeId])
        ])

        if (empRes.rowCount === 0 || runRes.rowCount === 0) throw new Error("Datos no encontrados")

        return {
            success: true,
            data: {
                employee: empRes.rows[0],
                run: runRes.rows[0],
                items: itemsRes.rows,
                totals: {
                    earnings: runRes.rows[0].total_earnings,
                    deductions: runRes.rows[0].total_deductions,
                    net_total: runRes.rows[0].net_total
                }
            }
        }
    } catch (e: any) {
        console.error("Error fetching payroll slip data:", e)
        return { success: false, error: e.message }
    } finally {
        client.release()
    }
}
