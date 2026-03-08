import { jsPDF } from "jspdf"
import { formatPrice } from "./utils"

/**
 * Genera un PDF de Pre-cuenta (Pro-forma) para el restaurante.
 */
export const generatePreBillPDF = (restaurant: any, table: any) => {
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 200] // Formato ticket r80
    })

    const margin = 10
    const width = 80
    let y = 15

    // Estilos Base
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)

    // Header
    doc.text(restaurant?.name?.toUpperCase() || "JAMALI OS", width / 2, y, { align: "center" })
    y += 8

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("PRE-CUENTA / BORRADOR", width / 2, y, { align: "center" })
    y += 10

    // Info Mesa
    doc.setFont("helvetica", "bold")
    doc.text(`MESA: ${table?.table_name || 'MOSTRADOR'}`, margin, y)
    y += 5
    doc.setFont("helvetica", "normal")
    doc.text(`FECHA: ${new Date().toLocaleString()}`, margin, y)
    y += 8

    // Divisor
    doc.setLineDashPattern([1, 1], 0)
    doc.line(margin, y, width - margin, y)
    y += 8

    // Items
    doc.setFont("helvetica", "bold")
    doc.text("QTY", margin, y)
    doc.text("PRODUCTO", margin + 10, y)
    doc.text("TOTAL", width - margin, y, { align: "right" })
    y += 6
    doc.setFont("helvetica", "normal")

    const items = table?.active_order?.items || table?.items || []

    items.forEach((item: any) => {
        const name = (item.products?.name || item.name || "Producto").substring(0, 20)
        doc.text(`${item.quantity}x`, margin, y)
        doc.text(name.toUpperCase(), margin + 10, y)
        doc.text(formatPrice(item.subtotal), width - margin, y, { align: "right" })
        y += 5
    })

    y += 5
    doc.line(margin, y, width - margin, y)
    y += 8

    // Totales
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    const total = table?.active_order?.total || 0
    doc.text("TOTAL A PAGAR:", margin, y)
    doc.text(formatPrice(total), width - margin, y, { align: "right" })

    y += 15
    doc.setFontSize(7)
    doc.setFont("helvetica", "italic")
    doc.text("Documento Informativo sin Valor Fiscal", width / 2, y, { align: "center" })

    // Descargar
    doc.save(`CUENTA_MESA_${table?.table_name || 'POS'}.pdf`)
}

/**
 * Genera un PDF de Comprobante de Nómina (Payroll Slip).
 */
export const generatePayrollPDF = (restaurant: any, employee: any, period: any, items: any[], totals: any) => {
    const doc = new jsPDF()
    let y = 20

    // Header Empresa
    doc.setFontSize(20)
    doc.setTextColor(255, 0, 117) // Jamali Pink
    doc.text(restaurant?.name?.toUpperCase() || "JAMALI OS", 20, y)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("COMPROBANTE DE PAGO DE NÓMINA", 140, y)
    y += 15

    doc.setDrawColor(230)
    doc.line(20, y, 190, y)
    y += 10

    // Info Empleado
    doc.setTextColor(0)
    doc.setFont("helvetica", "bold")
    doc.text("EMPLEADO:", 20, y)
    doc.setFont("helvetica", "normal")
    doc.text(employee?.full_name || "N/A", 60, y)

    doc.setFont("helvetica", "bold")
    doc.text("PERIODO:", 120, y)
    doc.setFont("helvetica", "normal")
    doc.text(`${period?.start_date} al ${period?.end_date}`, 150, y)
    y += 8

    doc.setFont("helvetica", "bold")
    doc.text("CARGO:", 20, y)
    doc.setFont("helvetica", "normal")
    doc.text(employee?.role?.toUpperCase() || "PERSONAL", 60, y)
    y += 15

    // Tabla de Conceptos
    doc.setFillColor(245, 245, 247)
    doc.rect(20, y, 170, 8, 'F')
    doc.setFont("helvetica", "bold")
    doc.text("CONCEPTO", 25, y + 6)
    doc.text("TIPO", 100, y + 6)
    doc.text("VALOR", 185, y + 6, { align: "right" })
    y += 15

    items.forEach(item => {
        doc.setFont("helvetica", "normal")
        doc.text(item.name || item.concept_name, 25, y)
        doc.text(item.type === 'earning' ? 'DEVENGADO' : 'DEDUCCIÓN', 100, y)
        doc.text(formatPrice(item.amount), 185, y, { align: "right" })
        y += 8
    })

    y += 10
    doc.line(20, y, 190, y)
    y += 10

    // Totales
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("NETO PAGADO:", 120, y)
    doc.setTextColor(0, 200, 100) // Success Green
    doc.text(formatPrice(totals.net_total), 185, y, { align: "right" })

    y += 30
    doc.setTextColor(150)
    doc.setFontSize(8)
    doc.text("Firma del Empleado: _________________________", 20, y)
    doc.text("Firma del Pagador: _________________________", 120, y)

    doc.save(`NOMINA_${employee?.full_name?.replace(' ', '_')}_${period?.name}.pdf`)
}
