import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BillingMetrics } from './BillingMetrics'
import { ElectronicInvoice } from './types'

describe('BillingMetrics Component', () => {
    const mockInvoices: ElectronicInvoice[] = [
        { id: '1', order_id: 'O-1', customer_name: 'A', customer_nit: '1', amount: 100, status: 'emitida', provider: 'DIAN', created_at: '2026-01-01T12:00:00Z', cufe_uuid: 'abc' },
        { id: '2', order_id: 'O-2', customer_name: 'B', customer_nit: '2', amount: 200, status: 'emitida', provider: 'DIAN', created_at: '2026-01-01T12:00:00Z', cufe_uuid: 'def' },
        { id: '3', order_id: 'O-3', customer_name: 'C', customer_nit: '3', amount: 300, status: 'pendiente', provider: 'DIAN', created_at: '2026-01-01T12:00:00Z' },
        { id: '4', order_id: 'O-4', customer_name: 'D', customer_nit: '4', amount: 400, status: 'error', provider: 'DIAN', created_at: '2026-01-01T12:00:00Z' },
    ]

    it('renders correctly with 0 invoices', () => {
        render(<BillingMetrics invoices={[]} />)

        // Todos los contadores deben estar en 0
        const zeroElements = screen.getAllByText('0')
        expect(zeroElements).toHaveLength(3) // 3 tarjetas: Emitidas, Pendientes, Errores
    })

    it('calculates invoice statuses correctly', () => {
        render(<BillingMetrics invoices={mockInvoices} />)

        // Basado en mockInvoices, debemos tener:
        // - 2 Emitidas
        // - 1 Pendiente
        // - 1 Con Error

        expect(screen.getByText('2')).toBeInTheDocument() // Emitidas

        // Como '1' puede coincidir múltiples veces, buscamos con precisión el contenedor si fuera necesario
        // Pero en esta prueba UI directa validamos que existen los textos en pantalla
        const ones = screen.getAllByText('1')
        expect(ones.length).toBeGreaterThanOrEqual(2) // Al menos 2 '1' en pantalla (Pendiente y Error)

        // Validamos que existan las etiquetas de negocio
        expect(screen.getByText(/Facturas Emitidas/i)).toBeInTheDocument()
        expect(screen.getByText(/Pendientes Sincro/i)).toBeInTheDocument()
        expect(screen.getByText(/Con Errores DIAN/i)).toBeInTheDocument()
    })
})
