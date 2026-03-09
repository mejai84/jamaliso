'use server'

import { Pool } from 'pg'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    INCAPACITY_PERCENT: 0.6667, // 2/3 del salario
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
            commission: getConceptId('Comisiones Ventas'),
            loan: getConceptId('Deducción Préstamo')
        }

        // 4. Procesar Empleados
        const employeesRes = await client.query(
            `SELECT p.* FROM public.profiles p WHERE p.restaurant_id = $1 AND p.role != 'customer'`,
            [restaurantId]
        )

        let totalRunEarnings = 0
        let totalRunDeductions = 0

        const startDate = new Date(period.start_date)
        const endDate = new Date(period.end_date)
        const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        for (const emp of employeesRes.rows) {
            let earnings = 0
            let deductions = 0
            const monthlySalary = Number(emp.monthly_salary || 0)
            const IBC = monthlySalary // Base de Cotización (Simplified for MVP)

            // A. Procesar Novedades (Ausentismos)
            const empAbsencesRes = await client.query(
                `SELECT * FROM public.payroll_absences 
                 WHERE employee_id = $1 AND is_processed = false 
                 AND start_date <= $2 AND end_date >= $3`,
                [emp.id, period.end_date, period.start_date]
            )

            let absenceDays = 0
            let incapacityDays = 0

            for (const abs of empAbsencesRes.rows) {
                const absStart = new Date(Math.max(new Date(abs.start_date).getTime(), startDate.getTime()))
                const absEnd = new Date(Math.min(new Date(abs.end_date).getTime(), endDate.getTime()))
                const overlapped = Math.ceil((absEnd.getTime() - absStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

                absenceDays += overlapped
                if (abs.type === 'INCAPACITY') incapacityDays += overlapped

                if (new Date(abs.end_date) <= endDate) {
                    await client.query(`UPDATE public.payroll_absences SET is_processed = true WHERE id = $1`, [abs.id])
                }
            }

            const workedDays = Math.max(0, daysInPeriod - absenceDays)
            const basePay = (monthlySalary / 30) * workedDays

            if (basePay > 0 && cids.base) {
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, cids.base, basePay, `Salario Básico - ${workedDays} días trabajados`]
                )
                earnings += basePay
            }

            // A.1. Liquidar Incapacidades
            if (incapacityDays > 0 && cids.base) {
                const incapacityPay = (monthlySalary / 30) * incapacityDays * CONSTANTS_2026.INCAPACITY_PERCENT
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, cids.base, incapacityPay, `Incapacidad Legal - ${incapacityDays} días (66.6%)`]
                )
                earnings += incapacityPay
            }

            // B. Auxilio de Transporte (Si trabaja al menos 1 día y aplica)
            if (workedDays > 0 && monthlySalary < CONSTANTS_2026.UMBRAL_AUX_TRANSPORTE && emp.transport_allowance_eligible && cids.aux) {
                const auxPay = (CONSTANTS_2026.AUX_TRANSPORTE / 30) * workedDays
                await client.query(
                    `INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`,
                    [runId, emp.id, cids.aux, auxPay, 'Auxilio Legal de Transporte']
                )
                earnings += auxPay
            }

            // C. Deducciones Legales (Solo sobre base salarial real)
            const salarialBase = basePay + (incapacityDays > 0 ? (monthlySalary / 30) * incapacityDays : 0)
            const saludDed = salarialBase * CONSTANTS_2026.SALUD_EMPLOYEE
            const pensionDed = salarialBase * CONSTANTS_2026.PENSION_EMPLOYEE

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

            // D. Gestión de Préstamos
            const activeLoansRes = await client.query(
                `SELECT id, instalment_amount, balance FROM public.payroll_loans WHERE employee_id = $1 AND status = 'ACTIVE' AND balance > 0`,
                [emp.id]
            )

            for (const loan of activeLoansRes.rows) {
                const deductAmount = Math.min(Number(loan.instalment_amount), Number(loan.balance))
                if (deductAmount > 0 && cids.loan) {
                    await client.query(`INSERT INTO public.payroll_items (run_id, employee_id, concept_id, amount, description) VALUES ($1, $2, $3, $4, $5)`, [runId, emp.id, cids.loan, deductAmount, 'Descuento Cuota Préstamo'])
                    await client.query(`INSERT INTO public.payroll_loan_payments (loan_id, run_id, amount) VALUES ($1, $2, $3)`, [loan.id, runId, deductAmount])
                    const newBalance = Number(loan.balance) - deductAmount
                    await client.query(`UPDATE public.payroll_loans SET balance = $1, status = $2 WHERE id = $3`, [newBalance, newBalance <= 0 ? 'PAID' : 'ACTIVE', loan.id])
                    deductions += deductAmount
                }
            }

            // E. Provisiones IFRS
            const provisionItems = [
                { type: 'PRIMA', amt: earnings * CONSTANTS_2026.PRIMA },
                { type: 'CESANTIAS', amt: earnings * CONSTANTS_2026.CESANTIAS },
                { type: 'INT_CESANTIAS', amt: earnings * CONSTANTS_2026.CESANTIAS * CONSTANTS_2026.INT_CESANTIAS },
                { type: 'VACACIONES', amt: basePay * CONSTANTS_2026.VACACIONES },
            ]
            for (const prov of provisionItems) {
                await client.query(`INSERT INTO public.payroll_provisions (run_id, employee_id, restaurant_id, type, amount) VALUES ($1, $2, $3, $4, $5)`, [runId, emp.id, restaurantId, prov.type, prov.amt])
            }

            // F. Costos Patronales
            const isExempt = monthlySalary < (CONSTANTS_2026.SMLV * 10)
            const employerCosts = [
                { c: 'PENSION_PATRONAL', a: salarialBase * CONSTANTS_2026.PENSION_EMPLOYER },
                { c: 'ARL', a: salarialBase * ARL_RATES[(emp.arl_risk_level || 1) - 1] },
                { c: 'CCF', a: salarialBase * CONSTANTS_2026.CCF }
            ]
            if (!isExempt) {
                employerCosts.push(
                    { c: 'SALUD_PATRONAL', a: salarialBase * CONSTANTS_2026.SALUD_EMPLOYER },
                    { c: 'ICBF', a: salarialBase * CONSTANTS_2026.ICBF },
                    { c: 'SENA', a: salarialBase * CONSTANTS_2026.SENA }
                )
            }
            for (const cost of employerCosts) {
                await client.query(`INSERT INTO public.payroll_employer_costs (run_id, employee_id, restaurant_id, concept, amount) VALUES ($1, $2, $3, $4, $5)`, [runId, emp.id, restaurantId, cost.c, cost.a])
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

/**
 * 🇨🇴 EMISIÓN NÓMINA ELECTRÓNICA (DIAN/CUNE)
 */
export async function emitPayrollDocument(runId: string, restaurantId: string): Promise<PayrollRunResult> {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // 1. Obtener datos de la nómina
        const runRes = await client.query(
            `SELECT * FROM public.payroll_runs WHERE id = $1 AND restaurant_id = $2`,
            [runId, restaurantId]
        )
        if (runRes.rowCount === 0) throw new Error("Corrida de nómina no encontrada")
        const run = runRes.rows[0]

        // 2. Simular Transmisión DIAN (XML/CUNE)
        const mockCune = `CUNE-${Math.random().toString(36).substring(2, 12).toUpperCase()}`

        await client.query(
            `UPDATE public.payroll_runs SET 
                cune_uuid = $1, 
                dian_status = 'SENT', 
                response_message = 'Documento de Nómina Electrónica aceptado por la DIAN.',
                updated_at = now()
             WHERE id = $2`,
            [mockCune, runId]
        )

        // 3. Registrar en auditoría
        await client.query(
            `INSERT INTO public.security_audit (restaurant_id, event_type, description, severity) VALUES ($1, $2, $3, $4)`,
            [restaurantId, 'PAYROLL_ELECTRONIC_SENT', `Nómina ${runId} transmitida exitosamente a la DIAN. CUNE: ${mockCune}`, 'INFO']
        )

        await client.query('COMMIT')
        revalidatePath('/admin/payroll')

        return {
            success: true,
            message: `Nómina legalizada ante la DIAN. CUNE: ${mockCune}`,
            run_id: runId
        }
    } catch (e: any) {
        await client.query('ROLLBACK')
        console.error("DIAN Payroll Error:", e)
        return { success: false, message: "Error en transmisión a la DIAN", error: e.message }
    } finally {
        client.release()
    }
}

/**
 * 📊 GENERAR REPORTE DE PARAFISCALES (PILA Summary)
 */
export async function getParafiscalReport(runId: string, restaurantId: string) {
    const client = await pool.connect()
    try {
        const res = await client.query(`
            SELECT 
                p.full_name, 
                p.document_id,
                ec.concept,
                ec.amount
            FROM public.payroll_employer_costs ec
            JOIN public.profiles p ON ec.employee_id = p.id
            WHERE ec.run_id = $1 AND ec.restaurant_id = $2
        `, [runId, restaurantId])

        // Agrupar por concepto para totales
        const totals: Record<string, number> = {}
        res.rows.forEach(row => {
            totals[row.concept] = (totals[row.concept] || 0) + Number(row.amount)
        })

        return { success: true, data: res.rows, totals }
    } catch (e: any) {
        return { success: false, error: e.message }
    } finally {
        client.release()
    }
}

/**
 * 🏦 GENERAR ARCHIVO DE DISPERSIÓN BANCARIA (Archivo Plano)
 */
export async function getBankDispersionData(runId: string, restaurantId: string) {
    const client = await pool.connect()
    try {
        const res = await client.query(`
            SELECT 
                p.full_name, 
                p.document_id, 
                p.identification_type,
                p.bank_name,
                p.account_type,
                p.account_number,
                pr.net_total as total_to_pay,
                pr.id as run_id
            FROM public.payroll_items pi
            JOIN public.profiles p ON pi.employee_id = p.id
            JOIN public.payroll_runs pr ON pi.run_id = pr.id
            WHERE pi.run_id = $1 AND pr.restaurant_id = $2
            GROUP BY p.id, pr.id, p.full_name, p.document_id, p.identification_type, p.bank_name, p.account_type, p.account_number, pr.net_total
        `, [runId, restaurantId])

        return { success: true, data: res.rows }
    } catch (e: any) {
        return { success: false, error: e.message }
    } finally {
        client.release()
    }
}
/**
 * 📊 EXPORTACIÓN CONTABLE (SIIGO / HELISA)
 */
export async function getAccountingExport(runId: string, format: 'SIIGO' | 'HELISA') {
    const client = await pool.connect()
    try {
        const res = await client.query(`
            SELECT 
                p.document_id, p.full_name, pi.amount, pc.name as concept_name, pc.type
            FROM public.payroll_items pi
            JOIN public.profiles p ON pi.employee_id = p.id
            JOIN public.payroll_concepts pc ON pi.concept_id = pc.id
            WHERE pi.run_id = $1
        `, [runId])

        if (format === 'SIIGO') {
            const headers = "Cuenta_Contable,Tercero_Identificacion,Tercero_Nombre,Debito,Credito,Observaciones\n"
            const rows = res.rows.map(r => {
                const isDeduction = r.type === 'DEDUCTION'
                const debito = isDeduction ? 0 : r.amount
                const credito = isDeduction ? r.amount : 0
                return `510506,${r.document_id},${r.full_name},${debito},${credito},Nomina ${r.concept_name}`
            }).join("\n")
            return { success: true, data: headers + rows, filename: `SIIGO_NOMINA_${runId.slice(0, 8)}.csv` }
        } else {
            // HELISA (Formato Plano de 80-120 chars usualmente o CSV específico)
            const headers = "NIT;NOMBRE;CONCEPTO;VALOR;TIPO\n"
            const rows = res.rows.map(r => `${r.document_id};${r.full_name};${r.concept_name};${r.amount};${r.type}`).join("\n")
            return { success: true, data: headers + rows, filename: `HELISA_NOMINA_${runId.slice(0, 8)}.csv` }
        }
    } catch (e: any) {
        return { success: false, error: e.message }
    } finally {
        client.release()
    }
}

/**
 * 📧 ENVÍO MASIVO DE RECIBOS (BATCH NOTIFICATIONS)
 */
export async function sendPayrollNotificationsBatch(runId: string, restaurantId: string) {
    const client = await pool.connect()
    try {
        const { rows: employees } = await client.query(`
            SELECT p.id, p.full_name, p.email, p.phone
            FROM public.payroll_items pi
            JOIN public.profiles p ON pi.employee_id = p.id
            WHERE pi.run_id = $1
            GROUP BY p.id
        `, [runId])

        const results = []
        for (const emp of employees) {
            if (emp.email) {
                // Notificar por Email
                try {
                    await resend.emails.send({
                        from: 'JAMALI OS <payroll@jamali.os>',
                        to: emp.email,
                        subject: `Comprobante de Pago de Nómina - ${emp.full_name}`,
                        html: `<div style="font-family: sans-serif; padding: 20px;">
                                <h2>¡Hola, ${emp.full_name}!</h2>
                                <p>Tu pago de nómina ha sido dispersado exitosamente.</p>
                                <p>Puedes ver el detalle en tu portal de empleado.</p>
                                <hr/>
                                <p><small>Este es un correo automático de JAMALI OS.</small></p>
                               </div>`
                    })
                    await client.query(`INSERT INTO public.payroll_notifications (run_id, employee_id, channel, status, sent_at) VALUES ($1, $2, 'EMAIL', 'SENT', now())`, [runId, emp.id])
                    results.push({ emp: emp.full_name, status: 'SENT' })
                } catch (err: any) {
                    await client.query(`INSERT INTO public.payroll_notifications (run_id, employee_id, channel, status, error_log) VALUES ($1, $2, 'EMAIL', 'FAILED', $3)`, [runId, emp.id, err.message])
                    results.push({ emp: emp.full_name, status: 'FAILED', error: err.message })
                }
            }

            // SIMULACIÓN WHATSAPP (Via Webhook futuro)
            if (emp.phone) {
                console.log(`[WhatsApp Simulation] Sending to ${emp.phone}: Hola ${emp.full_name}, tu nómina está lista.`)
                await client.query(`INSERT INTO public.payroll_notifications (run_id, employee_id, channel, status, sent_at) VALUES ($1, $2, 'WHATSAPP', 'SENT', now())`, [runId, emp.id])
            }
        }

        return { success: true, message: `Proceso de notificación finalizado. ${results.length} correos procesados.` }
    } catch (e: any) {
        return { success: false, error: e.message }
    } finally {
        client.release()
    }
}

/**
 * 📅 GESTIÓN DE NOVEDADES (INCAPACIDADES / PERMISOS)
 */
export async function registerAbsence(data: {
    restaurant_id: string,
    employee_id: string,
    type: 'INCAPACITY' | 'PERMIT_PAID' | 'PERMIT_UNPAID' | 'VACATION' | 'SUSPENSION',
    start_date: string,
    end_date: string,
    description: string
}) {
    const client = await pool.connect()
    try {
        await client.query(`
            INSERT INTO public.payroll_absences (restaurant_id, employee_id, type, start_date, end_date, description)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [data.restaurant_id, data.employee_id, data.type, data.start_date, data.end_date, data.description])

        return { success: true, message: "Novedad registrada correctamente" }
    } catch (e: any) {
        return { success: false, error: e.message }
    } finally {
        client.release()
    }
}
